/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import logger from '@docusaurus/logger';
import type {Author, PluginOptions} from '@docusaurus/plugin-content-blog';

export function reportAuthorsProblems(params: {
  authors: Author[];
  blogSourceRelative: string;
  options: Pick<PluginOptions, 'onInlineAuthors' | 'authorsMapPath'>;
}): void {
  reportInlineAuthors(params);
  reportDuplicateAuthors(params);
}

export function reportInlineAuthors({
  authors,
  blogSourceRelative,
  options: {onInlineAuthors, authorsMapPath},
}: {
  authors: Author[];
  blogSourceRelative: string;
  options: Pick<PluginOptions, 'onInlineAuthors' | 'authorsMapPath'>;
}): void {
  if (onInlineAuthors === 'ignore') {
    return;
  }
  const inlineAuthors = authors.filter((author) => !author.key);
  if (inlineAuthors.length > 0) {
    logger.report(onInlineAuthors)(
      logger.interpolate`Some blog authors used in path=${blogSourceRelative} are not defined in path=${authorsMapPath}:
- ${inlineAuthors.map(authorToString).join('\n- ')}

Note that we recommend to declare authors once in a path=${authorsMapPath} file and reference them by key in blog posts front matter to avoid author info duplication.
But if you want to allow inline blog authors, you can disable this message by setting onInlineAuthors: 'ignore' in your blog plugin options.
More info at url=${'https://docusaurus.io/docs/blog'}
`,
    );
  }
}

export function reportDuplicateAuthors({
  authors,
  blogSourceRelative,
}: {
  authors: Author[];
  blogSourceRelative: string;
}): void {
  const duplicateAuthors = _(authors)
    // for now we only check for predefined authors duplicates
    .filter((author) => !!author.key)
    .groupBy((author) => author.key)
    .pickBy((authorsByKey) => authorsByKey.length > 1)
    // We only keep the "test" of all the duplicate groups
    // The first author of a group is not really a duplicate...
    .flatMap(([, ...rest]) => rest)
    .value();

  if (duplicateAuthors.length > 0) {
    throw new Error(logger.interpolate`Duplicate blog post authors were found in blog post path=${blogSourceRelative} front matter:
- ${duplicateAuthors.map(authorToString).join('\n- ')}`);
  }
}

function authorToString(author: Author) {
  return JSON.stringify(author);
}
