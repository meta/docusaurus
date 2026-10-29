/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {CSSProperties, ReactNode} from 'react';
import {createContext, useContext, useMemo} from 'react';
import clsx from 'clsx';
import rangeParser from 'parse-numeric-range';
import {ReactContextError} from './reactUtils';
import type {PrismTheme, PrismThemeEntry} from 'prism-react-renderer';
import type {WordWrap} from '../hooks/useCodeWordWrap';

const codeBlockTitleRegex = /title=(?<quote>["'])(?<title>.*?)\1/;
const metastringLinesRangeRegex = /\{(?<range>[\d,-]+)\}/;

// Supported types of highlight comments
const popularCommentPatterns = {
  js: {start: '\\/\\/', end: ''},
  jsBlock: {start: '\\/\\*', end: '\\*\\/'},
  jsx: {start: '\\{\\s*\\/\\*', end: '\\*\\/\\s*\\}'},
  bash: {start: '#', end: ''},
  html: {start: '<!--', end: '-->'},
} as const;

const commentPatterns = {
  ...popularCommentPatterns, // shallow copy is sufficient
  // minor comment styles
  lua: {start: '--', end: ''},
  wasm: {start: '\\;\\;', end: ''},
  tex: {start: '%', end: ''},
  vb: {start: "['‘’]", end: ''},
  vbnet: {start: "(?:_\\s*)?['‘’]", end: ''}, // Visual Studio 2019 or later
  rem: {start: '[Rr][Ee][Mm]\\b', end: ''},
  f90: {start: '!', end: ''}, // Free format only
  ml: {start: '\\(\\*', end: '\\*\\)'},
  cobol: {start: '\\*>', end: ''}, // Free format only
} as const;

type CommentType = keyof typeof commentPatterns;
const popularCommentTypes = Object.keys(
  popularCommentPatterns,
) as CommentType[];

export type MagicCommentConfig = {
  className: string;
  line?: string;
  block?: {start: string; end: string};
};

function getCommentPattern(
  languages: CommentType[],
  magicCommentDirectives: MagicCommentConfig[],
) {
  // To be more reliable, the opening and closing comment must match
  const commentPattern = languages
    .map((lang) => {
      const {start, end} = commentPatterns[lang];
      return `(?:${start}\\s*(${magicCommentDirectives
        .flatMap((d) => [d.line, d.block?.start, d.block?.end].filter(Boolean))
        .join('|')})\\s*${end})`;
    })
    .join('|');
  // White space is allowed, but otherwise it should be on it's own line
  return new RegExp(`^\\s*(?:${commentPattern})\\s*$`);
}

/**
 * Select comment styles based on language
 */
function getAllMagicCommentDirectiveStyles(
  lang: string,
  magicCommentDirectives: MagicCommentConfig[],
) {
  switch (lang) {
    case 'js':
    case 'javascript':
    case 'ts':
    case 'typescript':
      return getCommentPattern(['js', 'jsBlock'], magicCommentDirectives);

    case 'jsx':
    case 'tsx':
      return getCommentPattern(
        ['js', 'jsBlock', 'jsx'],
        magicCommentDirectives,
      );

    case 'html':
      return getCommentPattern(
        ['js', 'jsBlock', 'html'],
        magicCommentDirectives,
      );

    case 'python':
    case 'py':
    case 'bash':
      return getCommentPattern(['bash'], magicCommentDirectives);

    case 'markdown':
    case 'md':
      // Text uses HTML, front matter uses bash
      return getCommentPattern(['html', 'jsx', 'bash'], magicCommentDirectives);

    case 'tex':
    case 'latex':
    case 'matlab':
      return getCommentPattern(['tex'], magicCommentDirectives);

    case 'lua':
    case 'haskell':
      return getCommentPattern(['lua'], magicCommentDirectives);

    case 'sql':
      return getCommentPattern(['lua', 'jsBlock'], magicCommentDirectives);

    case 'wasm':
      return getCommentPattern(['wasm'], magicCommentDirectives);

    case 'vb':
    case 'vba':
    case 'visual-basic':
      return getCommentPattern(['vb', 'rem'], magicCommentDirectives);
    case 'vbnet':
      return getCommentPattern(['vbnet', 'rem'], magicCommentDirectives);

    case 'batch':
      return getCommentPattern(['rem'], magicCommentDirectives);

    case 'basic': // https://github.com/PrismJS/prism/blob/master/components/prism-basic.js#L3
      return getCommentPattern(['rem', 'f90'], magicCommentDirectives);

    case 'fsharp':
      return getCommentPattern(['js', 'ml'], magicCommentDirectives);

    case 'ocaml':
    case 'sml':
      return getCommentPattern(['ml'], magicCommentDirectives);

    case 'fortran':
      return getCommentPattern(['f90'], magicCommentDirectives);

    case 'cobol':
      return getCommentPattern(['cobol'], magicCommentDirectives);

    default:
      // All popular comment types
      return getCommentPattern(popularCommentTypes, magicCommentDirectives);
  }
}

export function parseCodeBlockTitle(metastring?: string): string {
  return metastring?.match(codeBlockTitleRegex)?.groups!.title ?? '';
}

function getMetaLineNumbersStart(metastring?: string): number | undefined {
  const showLineNumbersMeta = metastring
    ?.split(' ')
    .find((str) => str.startsWith('showLineNumbers'));

  if (showLineNumbersMeta) {
    if (showLineNumbersMeta.startsWith('showLineNumbers=')) {
      const value = showLineNumbersMeta.replace('showLineNumbers=', '');
      return parseInt(value, 10);
    }
    return 1;
  }

  return undefined;
}

export function getLineNumbersStart({
  showLineNumbers,
  metastring,
}: {
  showLineNumbers: boolean | number | undefined;
  metastring: string | undefined;
}): number | undefined {
  const defaultStart = 1;
  if (typeof showLineNumbers === 'boolean') {
    return showLineNumbers ? defaultStart : undefined;
  }
  if (typeof showLineNumbers === 'number') {
    return showLineNumbers;
  }
  return getMetaLineNumbersStart(metastring);
}

type ParseCodeLinesParam = {
  /**
   * The full metastring, as received from MDX. Line ranges declared here
   * start at 1.
   */
  metastring: string | undefined;
  /**
   * Language of the code block, used to determine which kinds of magic
   * comment styles to enable.
   */
  language: string | undefined;
  /**
   * Magic comment types that we should try to parse. Each entry would
   * correspond to one class name to apply to each line.
   */
  magicComments: MagicCommentConfig[];
};

/**
 * The highlighted lines, 0-indexed. e.g. `{ 0: ["highlight", "sample"] }`
 * means the 1st line should have `highlight` and `sample` as class names.
 */
type CodeLineClassNames = {[lineIndex: number]: string[]};

/**
 * Code lines after applying magic comments or metastring highlight ranges
 */
type ParsedCodeLines = {
  code: string;
  lineClassNames: CodeLineClassNames;
};

function parseCodeLinesFromMetastring(
  code: string,
  {metastring, magicComments}: ParseCodeLinesParam,
): ParsedCodeLines | null {
  // Highlighted lines specified in props: don't parse the content
  if (metastring && metastringLinesRangeRegex.test(metastring)) {
    const linesRange = metastring.match(metastringLinesRangeRegex)!.groups!
      .range!;
    if (magicComments.length === 0) {
      throw new Error(
        `A highlight range has been given in code block's metastring (\`\`\` ${metastring}), but no magic comment config is available. Docusaurus applies the first magic comment entry's className for metastring ranges.`,
      );
    }
    const metastringRangeClassName = magicComments[0]!.className;
    const lines = rangeParser(linesRange)
      .filter((n) => n > 0)
      .map((n) => [n - 1, [metastringRangeClassName]] as [number, string[]]);
    return {lineClassNames: Object.fromEntries(lines), code};
  }
  return null;
}

function parseCodeLinesFromContent(
  code: string,
  params: ParseCodeLinesParam,
): ParsedCodeLines {
  const {language, magicComments} = params;
  if (language === undefined) {
    return {lineClassNames: {}, code};
  }
  const directiveRegex = getAllMagicCommentDirectiveStyles(
    language,
    magicComments,
  );
  // Go through line by line
  const lines = code.split(/\r?\n/);
  const blocks = Object.fromEntries(
    magicComments.map((d) => [d.className, {start: 0, range: ''}]),
  );
  const lineToClassName: {[comment: string]: string} = Object.fromEntries(
    magicComments
      .filter((d) => d.line)
      .map(({className, line}) => [line!, className] as [string, string]),
  );
  const blockStartToClassName: {[comment: string]: string} = Object.fromEntries(
    magicComments
      .filter((d) => d.block)
      .map(({className, block}) => [block!.start, className]),
  );
  const blockEndToClassName: {[comment: string]: string} = Object.fromEntries(
    magicComments
      .filter((d) => d.block)
      .map(({className, block}) => [block!.end, className]),
  );
  for (let lineNumber = 0; lineNumber < lines.length;) {
    const line = lines[lineNumber]!;
    const match = line.match(directiveRegex);
    if (!match) {
      // Lines without directives are unchanged
      lineNumber += 1;
      continue;
    }
    const directive = match
      .slice(1)
      .find((item: string | undefined) => item !== undefined)!;
    if (lineToClassName[directive]) {
      blocks[lineToClassName[directive]!]!.range += `${lineNumber},`;
    } else if (blockStartToClassName[directive]) {
      blocks[blockStartToClassName[directive]!]!.start = lineNumber;
    } else if (blockEndToClassName[directive]) {
      blocks[blockEndToClassName[directive]!]!.range += `${
        blocks[blockEndToClassName[directive]!]!.start
      }-${lineNumber - 1},`;
    }
    lines.splice(lineNumber, 1);
  }

  const lineClassNames: {[lineIndex: number]: string[]} = {};
  Object.entries(blocks).forEach(([className, {range}]) => {
    rangeParser(range).forEach((l) => {
      lineClassNames[l] ??= [];
      lineClassNames[l]!.push(className);
    });
  });

  return {code: lines.join('\n'), lineClassNames};
}

/**
 * Parses the code content, strips away any magic comments, and returns the
 * clean content and the highlighted lines marked by the comments or metastring.
 *
 * If the metastring contains a range, the `content` will be returned as-is
 * without any parsing. The returned `lineClassNames` will be a map from that
 * number range to the first magic comment config entry (which _should_ be for
 * line highlight directives.)
 */
export function parseLines(
  code: string,
  params: ParseCodeLinesParam,
): ParsedCodeLines {
  // Historical behavior: we remove last line break
  const newCode = code.replace(/\r?\n$/, '');
  // Historical behavior: we try one strategy after the other
  // we don't support mixing metastring ranges + magic comments
  return (
    parseCodeLinesFromMetastring(newCode, {...params}) ??
    parseCodeLinesFromContent(newCode, {...params})
  );
}

/**
 * Gets the language name from the class name (set by MDX).
 * e.g. `"language-javascript"` => `"javascript"`.
 * Returns undefined if there is no language class name.
 */
export function parseClassNameLanguage(
  className: string | undefined,
): string | undefined {
  if (!className) {
    return undefined;
  }
  const languageClassName = className
    .split(' ')
    .find((str) => str.startsWith('language-'));
  return languageClassName?.replace(/language-/, '');
}

// Prism languages are always lowercase
// We want to fail-safe and allow both "php" and "PHP"
// See https://github.com/facebook/docusaurus/issues/9012
function normalizeLanguage(language: string | undefined): string | undefined {
  return language?.toLowerCase();
}

function getLanguage(params: {
  language: string | undefined;
  className: string | undefined;
  defaultLanguage: string | undefined;
}): string {
  return (
    normalizeLanguage(
      params.language ??
        parseClassNameLanguage(params.className) ??
        params.defaultLanguage,
    ) ?? 'text'
  ); // There's always a language, required by Prism;
}

/**
 * This ensures that we always have the code block language as className
 * For MDX code blocks this is provided automatically by MDX
 * For JSX code blocks, the language gets added by this function
 * This ensures both cases lead to a consistent HTML output
 */
function ensureLanguageClassName({
  className,
  language,
}: {
  className: string | undefined;
  language: string;
}): string {
  return clsx(
    className,
    language &&
      !className?.includes(`language-${language}`) &&
      `language-${language}`,
  );
}

export interface CodeBlockMetadata {
  codeInput: string; // Including magic comments
  code: string; // Rendered code, excluding magic comments
  className: string; // There's always a "language-<lang>" className
  language: string;
  title: ReactNode;
  lineNumbersStart: number | undefined;
  lineClassNames: CodeLineClassNames;
}

export function createCodeBlockMetadata(params: {
  code: string;
  className: string | undefined;
  language: string | undefined;
  defaultLanguage: string | undefined;
  metastring: string | undefined;
  magicComments: MagicCommentConfig[];
  title: ReactNode;
  showLineNumbers: boolean | number | undefined;
}): CodeBlockMetadata {
  const language = getLanguage({
    language: params.language,
    defaultLanguage: params.defaultLanguage,
    className: params.className,
  });

  const {lineClassNames, code} = parseLines(params.code, {
    metastring: params.metastring,
    magicComments: params.magicComments,
    language,
  });

  const className = ensureLanguageClassName({
    className: params.className,
    language,
  });

  const title = parseCodeBlockTitle(params.metastring) || params.title;

  const lineNumbersStart = getLineNumbersStart({
    showLineNumbers: params.showLineNumbers,
    metastring: params.metastring,
  });

  return {
    codeInput: params.code,
    code,
    className,
    language,
    title,
    lineNumbersStart,
    lineClassNames,
  };
}

export function getPrismCssVariables(prismTheme: PrismTheme): CSSProperties {
  const mapping: PrismThemeEntry = {
    color: '--prism-color',
    backgroundColor: '--prism-background-color',
  };

  const properties: {[key: string]: string} = {};
  Object.entries(prismTheme.plain).forEach(([key, value]) => {
    const varName = mapping[key as keyof PrismThemeEntry];
    if (varName && typeof value === 'string') {
      properties[varName] = value;
    }
  });
  return properties;
}

type CodeBlockContextValue = {
  metadata: CodeBlockMetadata;
  wordWrap: WordWrap;
};

const CodeBlockContext = createContext<CodeBlockContextValue | null>(null);

export function CodeBlockContextProvider({
  metadata,
  wordWrap,
  children,
}: {
  metadata: CodeBlockMetadata;
  wordWrap: WordWrap;
  children: ReactNode;
}): ReactNode {
  // Should we optimize this in 2 contexts?
  // Unlike metadata, wordWrap is stateful and likely to trigger re-renders
  const value: CodeBlockContextValue = useMemo(() => {
    return {metadata, wordWrap};
  }, [metadata, wordWrap]);
  return <CodeBlockContext value={value}>{children}</CodeBlockContext>;
}

export function useCodeBlockContext(): CodeBlockContextValue {
  const value = useContext(CodeBlockContext);
  if (value === null) {
    throw new ReactContextError('CodeBlockContextProvider');
  }
  return value;
}
