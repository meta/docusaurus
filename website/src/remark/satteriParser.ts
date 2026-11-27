/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Parser, tokTypes} from 'acorn';
import acornJsx from 'acorn-jsx';
import remarkMath from 'remark-math';
import {markdownToMdast, mdxToMdast} from 'satteri';
import type {
  Comment,
  Node as AcornNode,
  Options as AcornParseOptions,
} from 'acorn';
import type {MarkdownParser} from '@docusaurus/types';
import type {Root, Nodes} from 'mdast';
import type {MdxjsEsm} from 'mdast-util-mdx';
import type {Processor} from 'unified';

type Program = NonNullable<NonNullable<MdxjsEsm['data']>['estree']>;

const AcornJsxParser = Parser.extend(acornJsx());

// Docusaurus parses MDX ESM as ES2025, MDX defaults to ES2024
const AcornOptions: AcornParseOptions = {
  ecmaVersion: 2025,
  sourceType: 'module',
};

type Format = 'md' | 'mdx';

// Sätteri ignores micromark syntax extensions: we enable its own features for
// the remark plugins we use
function satteriParser(this: Processor, {format}: {format: Format}) {
  const usesRemarkMath = this.attachers.some(
    ([plugin]) => plugin === remarkMath,
  );
  const features = {
    gfm: true,
    frontmatter: true,
    directive: true,
    math: usesRemarkMath,
  };
  const toMdast = format === 'mdx' ? mdxToMdast : markdownToMdast;
  this.parser = (document: string): Root => {
    const tree = toMdast(document, {features});
    const toPoint = createPointResolver(document);
    walk(tree, (node) => {
      if (usesRemarkMath) {
        addMathHastData(node);
      }
      if (format === 'mdx') {
        addEstreePrograms(node, toPoint);
      }
    });
    return tree;
  };
}

export const parser: MarkdownParser = ({format}) => [satteriParser, {format}];

// unist-util-visit takes most of the parse time on large trees: we recurse
function walk(node: Nodes, callback: (node: Nodes) => void) {
  callback(node);
  if ('children' in node) {
    for (const child of node.children) {
      walk(child, callback);
    }
  }
}

// remark-math (mdast-util-math) adds these hast hints, rehype-katex needs them
function addMathHastData(node: Nodes) {
  if (node.type === 'math') {
    node.data = {
      hName: 'pre',
      hChildren: [
        {
          type: 'element',
          tagName: 'code',
          properties: {className: ['language-math', 'math-display']},
          children: [{type: 'text', value: node.value}],
        },
      ],
    };
  } else if (node.type === 'inlineMath') {
    node.data = {
      hName: 'code',
      hProperties: {className: ['language-math', 'math-inline']},
      hChildren: [{type: 'text', value: node.value}],
    };
  }
}

// Sätteri doesn't return the acorn programs (`data.estree`) that @mdx-js/mdx
// compiles, like micromark-extension-mdxjs does
function addEstreePrograms(node: Nodes, toPoint: PointResolver) {
  switch (node.type) {
    case 'mdxjsEsm':
      node.data = {
        ...node.data,
        estree: parseProgram(node.value, startOffset(node), toPoint),
      };
      break;
    case 'mdxFlowExpression':
    case 'mdxTextExpression':
      node.data = {
        ...node.data,
        estree: parseExpression(node.value, startOffset(node) + 1, toPoint),
      };
      break;
    case 'mdxJsxFlowElement':
    case 'mdxJsxTextElement':
      for (const attribute of node.attributes) {
        if (attribute.type === 'mdxJsxExpressionAttribute') {
          // A spread is an object expression for @mdx-js/mdx: `{...props}`
          attribute.data = {
            ...attribute.data,
            estree: parseExpression(`{${attribute.value}}`, -1, toPoint),
          };
        } else if (typeof attribute.value === 'object' && attribute.value) {
          attribute.value.data = {
            ...attribute.value.data,
            estree: parseExpression(attribute.value.value, -1, toPoint),
          };
        }
      }
      break;
    default:
  }
}

function startOffset(node: Nodes): number {
  return node.position?.start.offset ?? 0;
}

type PointResolver = (offset: number) => {
  line: number;
  column: number;
  offset: number;
};

// Acorn points: 1-based lines, 0-based columns. Lazy: most documents have no
// expression to locate
function createPointResolver(document: string): PointResolver {
  let lineStarts: number[] | undefined;
  return (offset) => {
    lineStarts ??= getLineStarts(document);
    // Binary search of the last line starting at or before offset
    let low = 0;
    let high = lineStarts.length - 1;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (lineStarts[middle]! <= offset) {
        low = middle;
      } else {
        high = middle - 1;
      }
    }
    return {line: low + 1, column: offset - lineStarts[low]!, offset};
  };
}

function getLineStarts(document: string): number[] {
  const lineStarts = [0];
  let index = document.indexOf('\n');
  while (index !== -1) {
    lineStarts.push(index + 1);
    index = document.indexOf('\n', index + 1);
  }
  return lineStarts;
}

function parseProgram(
  code: string,
  offset: number,
  toPoint: PointResolver,
): Program {
  const comments: Comment[] = [];
  const program = AcornJsxParser.parse(code, {
    ...AcornOptions,
    onComment: comments,
  });
  return locateProgram(program, comments, offset, toPoint);
}

// An expression, a comment, or nothing: `{}` and `{/* note */}` are valid
function parseExpression(
  code: string,
  offset: number,
  toPoint: PointResolver,
): Program {
  const comments: Comment[] = [];
  const options = {...AcornOptions, onComment: comments};
  const isEmpty =
    AcornJsxParser.tokenizer(code, options).getToken().type === tokTypes.eof;
  if (!isEmpty) {
    // parseExpressionAt collects the comments again
    comments.length = 0;
  }
  const body = isEmpty
    ? []
    : [
        {
          type: 'ExpressionStatement',
          expression: AcornJsxParser.parseExpressionAt(code, 0, options),
          start: 0,
          end: code.length,
        },
      ];
  const program = {
    type: 'Program',
    body,
    sourceType: 'module',
    start: 0,
    end: code.length,
  } as unknown as AcornNode;
  return locateProgram(program, comments, offset, toPoint);
}

// Maps the acorn offsets to the document, with `loc` and `range` like
// micromark-extension-mdxjs. Spread and attribute expressions have no
// position in Sätteri (offset -1): we skip them
function locateProgram(
  program: AcornNode,
  comments: Comment[],
  offset: number,
  toPoint: PointResolver,
): Program {
  const locatedProgram = {...program, comments} as unknown as Program;
  if (offset >= 0) {
    visitAcornNodes(locatedProgram, (node) => {
      node.start += offset;
      node.end += offset;
      node.range = [node.start, node.end];
      node.loc = {start: toPoint(node.start), end: toPoint(node.end)};
    });
  }
  return locatedProgram;
}

type LocatedNode = {
  start: number;
  end: number;
  range?: [number, number];
  loc?: {start: unknown; end: unknown};
};

function visitAcornNodes(
  value: unknown,
  callback: (node: LocatedNode) => void,
): void {
  if (Array.isArray(value)) {
    value.forEach((item) => visitAcornNodes(item, callback));
  } else if (value && typeof value === 'object') {
    const node = value as Partial<LocatedNode>;
    if ('type' in node && typeof node.start === 'number') {
      callback(node as LocatedNode);
    }
    for (const [key, child] of Object.entries(value)) {
      if (key !== 'loc' && key !== 'range') {
        visitAcornNodes(child, callback);
      }
    }
  }
}
