/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import logger from '@docusaurus/logger';
import {
  writeMarkdownHeadingId,
  type WriteHeadingIDOptions,
  type HeadingIdSyntax,
} from '@docusaurus/utils';
import {safeGlob} from '@docusaurus/glob';
import {fs, realpath} from '@docusaurus/fs';
import {loadContext} from '../server/site';
import {initPlugins} from '../server/plugins/init';
import type {LoadContext, MarkdownConfig} from '@docusaurus/types';

export const HeadingIdSyntaxes = [
  'classic',
  'mdx-comment',
] as const satisfies HeadingIdSyntax[];

/**
 * Infer the heading ID syntax that compiles for a given file:
 * - `classic` ({#id}) for files compiled as CommonMark
 * - `mdx-comment` ({/* #id * /}) for files compiled as MDX
 *
 * The front matter `format` is not taken into account, but users can still
 * use the `--syntax` option to target a specific syntax.
 */
function inferFallbackSyntax(
  filepath: string,
  markdownConfig: MarkdownConfig,
): HeadingIdSyntax {
  const isCommonMark =
    markdownConfig.format === 'detect'
      ? path.extname(filepath) === '.md'
      : markdownConfig.format === 'md';
  return isCommonMark ? 'classic' : 'mdx-comment';
}

async function transformMarkdownFile(
  filepath: string,
  markdownConfig: MarkdownConfig,
  options: WriteHeadingIDOptions,
): Promise<string | undefined> {
  const content = await fs.readFile(filepath, 'utf8');

  const syntax =
    options.syntax ?? inferFallbackSyntax(filepath, markdownConfig);
  const updatedContent = writeMarkdownHeadingId(content, {
    ...options,
    syntax,
  });
  if (content !== updatedContent) {
    await fs.writeFile(filepath, updatedContent);
    return filepath;
  }
  return undefined;
}

async function globMarkdownFiles(patterns: string[]): Promise<string[]> {
  const files = await safeGlob(patterns);
  return files.filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));
}

/**
 * We only handle the "paths to watch" because these are the paths where the
 * markdown files are. Also we don't want to transform the site md docs that do
 * not belong to a content plugin. For example ./README.md should not be
 * transformed
 */
async function getPathsToWatch(context: LoadContext): Promise<string[]> {
  const plugins = await initPlugins(context);
  return plugins.flatMap((plugin) => plugin.getPathsToWatch?.() ?? []);
}

// The CLI already validates --syntax, but not the programmatic API
function validateOptions(options: WriteHeadingIDOptions) {
  if (options.syntax && !HeadingIdSyntaxes.includes(options.syntax)) {
    throw new Error(
      `Invalid --syntax value "${
        options.syntax
      }". Valid values: ${HeadingIdSyntaxes.join(', ')}`,
    );
  }
  if (options.overwrite && options.migrate) {
    throw new Error(
      "Options --overwrite and --migrate cannot be used together.\nThe --overwrite already re-generates IDs in the target syntax, so the --migrate option wouldn't have any effect.",
    );
  }
}

export async function writeHeadingIds(
  siteDirParam: string = '.',
  files: string[] = [],
  options: WriteHeadingIDOptions = {},
): Promise<void> {
  validateOptions(options);

  const siteDir = await realpath(siteDirParam);

  const context = await loadContext({siteDir});

  const patterns = files.length ? files : await getPathsToWatch(context);

  const markdownFiles = await globMarkdownFiles(patterns);

  if (markdownFiles.length === 0) {
    logger.warn`No markdown files found in siteDir path=${siteDir} for patterns: ${patterns}`;
    return;
  }

  const result = await Promise.all(
    markdownFiles.map((p) =>
      transformMarkdownFile(p, context.siteConfig.markdown, options),
    ),
  );

  const pathsModified = result.filter(Boolean) as string[];

  if (pathsModified.length) {
    logger.success`Heading ids added to Markdown files (number=${`${pathsModified.length}/${markdownFiles.length}`} files): ${pathsModified}`;
  } else {
    logger.warn`number=${
      markdownFiles.length
    } Markdown files already have explicit heading IDs.
If you intend to overwrite the existing heading IDs, use the code=${'--overwrite'} option.
If you intend to change their heading ID syntax, use the code=${'--migrate'} option.`;
  }
}
