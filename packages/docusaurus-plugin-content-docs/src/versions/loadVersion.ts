/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import _ from 'lodash';
import {
  aliasedSitePathToRelativePath,
  createSlugger,
  normalizeUrl,
  resolvePathname,
} from '@docusaurus/utils';
import {getTagsFile} from '@docusaurus/utils-validation';
import logger from '@docusaurus/logger';
import {
  createDocsByIdIndex,
  isCategoryIndex,
  toCategoryIndexMatcherParam,
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

/**
 * When multiple files in the same directory are all recognized as "category
 * indexes" (index.md, README.md, or <dirname>.md), they all get the same
 * directory slug, making all but one inaccessible. We apply a priority order:
 *   index > readme > <dirname>
 * Lower-priority files that lose the conflict are reassigned a regular
 * (non-category-index) slug so they remain accessible.
 */
function resolvePermalinkConflicts(
  docs: DocMetadataBase[],
  versionPath: string,
): DocMetadataBase[] {
  // Priority: 0 = index, 1 = readme, 2 = <dirname> (lowest)
  function getCategoryIndexPriority(doc: DocMetadataBase): number {
    const param = toCategoryIndexMatcherParam({
      source: doc.source,
      sourceDirName: doc.sourceDirName,
    });
    if (!isCategoryIndex(param)) {
      return -1; // not a category index – shouldn't normally conflict this way
    }
    const name = param.fileName.toLowerCase();
    if (name === 'index') {
      return 0;
    }
    if (name === 'readme') {
      return 1;
    }
    return 2; // dir-name match
  }

  const docsByPermalink = _.groupBy(docs, (d) => d.permalink);

  const updates = new Map<DocMetadataBase, Partial<DocMetadataBase>>();

  for (const group of Object.values(docsByPermalink)) {
    if (group.length <= 1) {
      continue;
    }

    // Sort by priority so the winner (lowest number) is first
    const sorted = [...group].sort(
      (a, b) => getCategoryIndexPriority(a) - getCategoryIndexPriority(b),
    );

    for (const loser of sorted.slice(1)) {
      const priority = getCategoryIndexPriority(loser);
      if (priority === 2) {
        // Dir-name category index lost – give it a regular slug instead.
        // Use the doc's baseID (last segment of id, with number prefix already
        // stripped) to match what a non-category-index slug would look like.
        const {fileName} = toCategoryIndexMatcherParam({
          source: loser.source,
          sourceDirName: loser.sourceDirName,
        });
        const baseID = loser.id.split('/').pop()!;
        // e.g. /demo/ + demo -> /demo/demo
        const newSlug = resolvePathname(baseID, loser.slug);
        const newPermalink = normalizeUrl([versionPath, newSlug]);

        logger.warn`Docs in path=${
          loser.sourceDirName
        } have conflicting slugs. File name=${fileName} is reassigned slug code=${newSlug} because a higher-priority index file (code=${'index'} or code=${'readme'}) exists in the same directory. To avoid this warning, add a slug front matter to one of the files.`;

        updates.set(loser, {slug: newSlug, permalink: newPermalink});
      }
      // If priority < 2 there's still a real conflict (e.g. two index.md files
      // with the same permalink) – caught by ensureNoDuplicatePermalink below.
    }
  }

  if (updates.size === 0) {
    return docs;
  }

  return docs.map((doc) => {
    const update = updates.get(doc);
    return update ? {...doc, ...update} : doc;
  });
}

function ensureNoDuplicatePermalink(docs: DocMetadataBase[]): void {
  const duplicatesByPermalink = _.chain(docs)
    .groupBy((d) => d.permalink)
    .pickBy((group) => group.length > 1)
    .value();

  const duplicateEntries = Object.entries(duplicatesByPermalink);
  if (!duplicateEntries.length) {
    return;
  }

  const messages = duplicateEntries
    .map(([permalink, duplicateDocs]) => {
      return logger.interpolate`- code=${permalink} found in number=${
        duplicateDocs.length
      } docs:
  - ${duplicateDocs
    .map((d) => aliasedSitePathToRelativePath(d.source))
    .join('\n  - ')}`;
    })
    .join('\n\n');

  throw new Error(
    `The docs plugin found docs sharing the same permalink:\n\n${messages}\n\nDocs should have distinct slugs. In case of conflict, you can rename a docs file or use the ${logger.code(
      'slug',
    )} front matter to assign a custom explicit slug.`,
  );
}

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
  const docsRaw = await Promise.all(docFiles.map(processVersionDoc));
  ensureNoDuplicateDocId(docsRaw);
  const docs = resolvePermalinkConflicts(docsRaw, versionMetadata.path);
  ensureNoDuplicatePermalink(docs);
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
