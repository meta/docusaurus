/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import _ from 'lodash';
import Joi from 'joi';
import * as YAML from 'js-yaml';
import {getContentPathList, getDataFilePath} from '@docusaurus/utils';
import {fs} from '@docusaurus/fs';
import type {
  ContentPaths,
  TagsFile,
  TagsFileInput,
  TagsPluginOptions,
} from '@docusaurus/utils';

const TagsFileInputSchema = Joi.object<TagsFileInput>().pattern(
  Joi.string(),
  Joi.object({
    label: Joi.string(),
    description: Joi.string(),
    permalink: Joi.string(),
  }).allow(null),
);

export function ensureUniquePermalinks(tags: TagsFile): void {
  const permalinks = new Set<string>();
  const duplicates = new Set<string>();

  for (const [, tag] of Object.entries(tags)) {
    const {permalink} = tag;
    if (permalinks.has(permalink)) {
      duplicates.add(permalink);
    } else {
      permalinks.add(permalink);
    }
  }

  if (duplicates.size > 0) {
    const duplicateList = Array.from(duplicates)
      .map((permalink) => `  - ${permalink}`)
      .join('\n');
    throw new Error(
      `Duplicate permalinks found in tags file:\n${duplicateList}`,
    );
  }
}

export function normalizeTagsFile(data: TagsFileInput): TagsFile {
  return _.mapValues(data, (tag, key) => {
    return {
      label: tag?.label || _.capitalize(key),
      description: tag?.description,
      permalink: tag?.permalink || `/${_.kebabCase(key)}`,
    };
  });
}

type GetTagsFileParams = {
  tags: TagsPluginOptions['tags'];
  contentPaths: ContentPaths;
};

const DefaultTagsFileName = 'tags.yml';

export function getTagsFilePathsToWatch({
  tags,
  contentPaths,
}: GetTagsFileParams): string[] {
  if (tags === false || tags === null) {
    return [];
  }
  const relativeFilePath = tags ?? DefaultTagsFileName;

  return getContentPathList(contentPaths).map((contentPath) =>
    path.posix.join(contentPath, relativeFilePath),
  );
}

export async function getTagsFile({
  tags,
  contentPaths,
}: GetTagsFileParams): Promise<TagsFile | null> {
  if (tags === false || tags === null) {
    return null;
  }

  const relativeFilePath = tags ?? DefaultTagsFileName;

  // if returned path is defined, the file exists (localized or not)
  const yamlFilePath = await getDataFilePath({
    contentPaths,
    filePath: relativeFilePath,
  });

  // If the tags option is undefined, don't throw when the file does not exist
  // Retro-compatible behavior: existing sites do not yet have tags.yml
  if (tags === undefined && !yamlFilePath) {
    return null;
  }
  if (!yamlFilePath) {
    throw new Error(
      `No tags file '${relativeFilePath}' could be found in any of those directories:\n- ${getContentPathList(
        contentPaths,
      ).join('\n- ')}`,
    );
  }

  const tagDefinitionContent = await fs.readFile(yamlFilePath, 'utf-8');
  if (!tagDefinitionContent.trim()) {
    return {};
  }

  const yamlContent = YAML.load(tagDefinitionContent);
  const tagsFileInputResult = TagsFileInputSchema.validate(yamlContent);
  if (tagsFileInputResult.error) {
    throw new Error(
      `There was an error extracting tags from file: ${tagsFileInputResult.error.message}`,
      {cause: tagsFileInputResult},
    );
  }

  const tagsFile = normalizeTagsFile(tagsFileInputResult.value);
  ensureUniquePermalinks(tagsFile);

  return tagsFile;
}
