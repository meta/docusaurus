/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {visit} from 'unist-util-visit';
import {transformNode} from '../utils';
import type {Transformer, Plugin} from 'unified';
import type {ContainerDirective} from 'mdast-util-directive';
import type {Paragraph, Root} from 'mdast';
import type {MdxJsxFlowElement, MdxJsxTextElement} from 'mdast-util-mdx';

export type AdmonitionOptions = {
  keywords: string[];
  extendDefaults: boolean;
};

export const DefaultAdmonitionOptions: AdmonitionOptions = {
  keywords: ['note', 'tip', 'info', 'warning', 'danger'],
  extendDefaults: true,
};

export function normalizeAdmonitionOptions(
  providedOptions: Partial<AdmonitionOptions> | true,
): AdmonitionOptions {
  if (providedOptions === true) {
    return DefaultAdmonitionOptions;
  }

  const options = {...DefaultAdmonitionOptions, ...providedOptions};

  // By default it makes more sense to append keywords to the default ones
  // Adding custom keywords is more common than disabling existing ones
  if (options.extendDefaults) {
    options.keywords = [
      ...DefaultAdmonitionOptions.keywords,
      ...options.keywords,
    ];
  }

  return options;
}

type DirectiveLabel = Paragraph;
type DirectiveContent = ContainerDirective['children'];

function parseDirective(directive: ContainerDirective): {
  directiveLabel: DirectiveLabel | undefined;
  contentNodes: DirectiveContent;
} {
  const hasDirectiveLabel =
    // @ts-expect-error: fine
    directive.children?.[0]?.data?.directiveLabel === true;
  if (hasDirectiveLabel) {
    const [directiveLabel, ...contentNodes] = directive.children;
    return {directiveLabel: directiveLabel as DirectiveLabel, contentNodes};
  }
  return {directiveLabel: undefined, contentNodes: directive.children};
}

function getTextOnlyTitle(directiveLabel: DirectiveLabel): string | undefined {
  const isTextOnlyTitle =
    directiveLabel?.children?.length === 1 &&
    directiveLabel?.children?.[0]?.type === 'text';
  return isTextOnlyTitle
    ? // @ts-expect-error: todo type
      (directiveLabel?.children?.[0].value as string)
    : undefined;
}

const plugin: Plugin<Partial<AdmonitionOptions>[], Root> = function plugin(
  this,
  optionsInput = {},
): Transformer<Root> {
  const {keywords} = normalizeAdmonitionOptions(optionsInput);

  return (root) => {
    visit(root, (node) => {
      if (node.type === 'containerDirective') {
        const isAdmonition = keywords.includes(node.name);

        if (!isAdmonition) {
          return;
        }

        const {directiveLabel, contentNodes} = parseDirective(node);

        const textOnlyTitle =
          node.attributes?.title ??
          (directiveLabel ? getTextOnlyTitle(directiveLabel) : undefined);

        // Transform the mdast directive node to an <admonition> JSX element
        // Lowercase on purpose: like Markdown elements, it is provided by
        // MDXComponents, and can't be shadowed by an MDX file import
        const properties = {
          ...(textOnlyTitle && {title: textOnlyTitle}),
          ...(node.attributes?.class && {className: node.attributes.class}),
          ...(node.attributes?.id && {id: node.attributes.id}),
          type: node.name,
        };
        const admonition: MdxJsxFlowElement = {
          type: 'mdxJsxFlowElement',
          name: 'admonition',
          attributes: Object.entries(properties).map(([name, value]) => ({
            type: 'mdxJsxAttribute',
            name,
            value,
          })),
          children: contentNodes,
          position: node.position,
        };

        // Rich titles stay in the tree as a JSX fragment, so that other
        // Remark/Rehype plugins can process them (links, images, emojis...)
        // The admonitionTitle Rehype plugin moves them to the title prop
        if (directiveLabel?.children.length && !textOnlyTitle) {
          const complexTitleNode: MdxJsxTextElement = {
            type: 'mdxJsxTextElement',
            name: null,
            attributes: [],
            data: {admonitionTitle: true},
            children: directiveLabel.children,
          };
          // @ts-expect-error: MDX accepts inline JSX here, mdast types don't
          admonition.children.unshift(complexTitleNode);
        }

        transformNode(node, admonition);
      }
    });
  };
};

export default plugin;
