/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import _ from 'lodash';
import {aliasedSitePathToRelativePath, createSlugger} from '@docusaurus/utils';
import {getTagsFile} from '@docusaurus/utils-validation';
import logger from '@docusaurus/logger';
import {
  createDocsByIdIndex,
  type DocEnv,
  processDocMetadata,
  readVersionDocs,
} from '../docs';
import {loadSidebars} from '../sidebars';
import {createSidebarsUtils} from '../sidebars/utils';
import type {TagsFile} from '@docusaurus/utils';
import type {
  DocMetadataBase,
  LoadedVersion,
  PluginOptions,
  VersionMetadata,
} from '@docusaurus/plugin-content-docs';
import type {DocFile} from '../types';
import type {LoadContext} from '@docusaurus/types';

type LoadVersionParams = {
  context: LoadContext;
  options: PluginOptions;
  versionMetadata: VersionMetadata;
  env: DocEnv;
};

function ensureNoDuplicateDocId(docs: DocMetadataBase[]): void {
  const duplicatesById = _.chain(docs)
    .sort((d1, d2) => {
      // Need to sort because glob order is non-deterministic
      // TODO maybe we should create a deterministic glob utils?
      //  see https://github.com/sindresorhus/globby/issues/131
      return d1.source.localeCompare(d2.source);
    })
    .groupBy((d) => d.id)
    .pickBy((group) => group.length > 1)
    .value();

  const duplicateIdEntries = Object.entries(duplicatesById);

  if (duplicateIdEntries.length) {
    const idMessages = duplicateIdEntries
      .map(([id, duplicateDocs]) => {
        return logger.interpolate`- code=${id} found in number=${
          duplicateDocs.length
        } docs:
  - ${duplicateDocs
    .map((d) => aliasedSitePathToRelativePath(d.source))
    .join('\n  - ')}`;
      })
      .join('\n\n');

    const message = `The docs plugin found docs sharing the same id:
\n${idMessages}\n
Docs should have distinct ids.
In case of conflict, you can rename the docs file, or use the ${logger.code(
      'id',
    )} front matter to assign an explicit distinct id to each doc.
    `;

    throw new Error(message);
  }
}

function ensureNoDuplicateSlug(docs: DocMetadataBase[]): void {
  const duplicatesBySlug = _.chain(docs)
    .groupBy((d) => d.slug)
    .pickBy((group) => group.length > 1)
    .value();

  const duplicateSlugEntries = Object.entries(duplicatesBySlug);

  if (duplicateSlugEntries.length) {
    const slugMessages = duplicateSlugEntries
      .map(([slug, duplicateDocs]) => {
        return logger.interpolate`- url=${slug} found in number=${
          duplicateDocs.length
        } docs:
  - ${duplicateDocs
    .map((d) => aliasedSitePathToRelativePath(d.source))
    .join('\n  - ')}`;
      })
      .join('\n\n');

    const message = `The docs plugin found docs sharing the same slug:
\n${slugMessages}\n
Docs should have distinct slugs.
In case of conflict, you can use the ${logger.code(
      'slug',
    )} front matter to assign an explicit distinct slug to each doc.
    `;

    throw new Error(message);
  }
}

async function loadVersionDocsBase({
  tagsFile,
  context,
  options,
  versionMetadata,
  env,
}: LoadVersionParams & {
  tagsFile: TagsFile | null;
}): Promise<DocMetadataBase[]> {
  const docFiles = await readVersionDocs(versionMetadata, options);
  if (docFiles.length === 0) {
    throw new Error(
      `Docs version "${
        versionMetadata.versionName
      }" has no docs! At least one doc should exist at "${path.relative(
        context.siteDir,
        versionMetadata.contentPath,
      )}".`,
    );
  }
  function processVersionDoc(docFile: DocFile) {
    return processDocMetadata({
      docFile,
      versionMetadata,
      context,
      options,
      env,
      tagsFile,
    });
  }
  const docs = await Promise.all(docFiles.map(processVersionDoc));
  ensureNoDuplicateDocId(docs);
  ensureNoDuplicateSlug(docs);
  return docs;
}

async function doLoadVersion({
  context,
  options,
  versionMetadata,
  env,
}: LoadVersionParams): Promise<LoadedVersion> {
  const tagsFile = await getTagsFile({
    contentPaths: versionMetadata,
    tags: options.tags,
  });

  const docsBase: DocMetadataBase[] = await loadVersionDocsBase({
    tagsFile,
    context,
    options,
    versionMetadata,
    env,
  });

  // TODO we only ever need draftIds in further code, not full draft items
  // To simplify and prevent mistakes, avoid exposing draft
  // replace draft=>draftIds in content loaded
  const [drafts, docs] = _.partition(docsBase, (doc) => doc.draft);

  const sidebars = await loadSidebars(versionMetadata.sidebarFilePath, {
    sidebarItemsGenerator: options.sidebarItemsGenerator,
    numberPrefixParser: options.numberPrefixParser,
    docs,
    drafts,
    version: versionMetadata,
    sidebarOptions: {
      sidebarCollapsed: options.sidebarCollapsed,
      sidebarCollapsible: options.sidebarCollapsible,
    },
    categoryLabelSlugger: createSlugger(),
  });

  const sidebarsUtils = createSidebarsUtils(sidebars);

  const docsById = createDocsByIdIndex(docs);
  const allDocIds = Object.keys(docsById);

  sidebarsUtils.checkSidebarsDocIds({
    allDocIds,
    sidebarFilePath: versionMetadata.sidebarFilePath as string,
  });

  return {
    ...versionMetadata,
    docs,
    drafts,
    sidebars,
  };
}

export async function loadVersion(
  params: LoadVersionParams,
): Promise<LoadedVersion> {
  try {
    return await doLoadVersion(params);
  } catch (err) {
    // TODO use error cause (but need to refactor many tests)
    logger.error`Loading of version failed for version name=${params.versionMetadata.versionName}`;
    throw err;
  }
}
