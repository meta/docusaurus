/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import logger from '@docusaurus/logger';
import {normalizeUrl} from './urlUtils';

export type Tag = {
  /** The display label of a tag */
  label: string;
  /** Permalink to this tag's page, without the `/tags/` base path. */
  permalink: string;
  /** An optional description of the tag */
  description: string | undefined;
};

export type TagsFileInput = Record<string, Partial<Tag> | null>;

export type TagsFile = Record<string, Tag>;

// Tags plugins options shared between docs/blog
export type TagsPluginOptions = {
  // TODO allow option tags later? | TagsFile;
  /** Path to the tags file. */
  tags: string | false | null | undefined;
  /** The behavior of Docusaurus when it finds inline tags. */
  onInlineTags: 'ignore' | 'log' | 'warn' | 'throw';
};

export type TagMetadata = Tag & {
  inline: boolean;
};

/** What the tags list page should know about each tag. */
export type TagsListItem = Tag & {
  /** Number of posts/docs with this tag. */
  count: number;
};

/** What the tag's own page should know about the tag. */
export type TagModule = TagsListItem & {
  /** The tags list page's permalink. */
  // TODO move this global value to a shared docs/blog bundle
  allTagsPath: string;
  /** Is this tag unlisted? (when it only contains unlisted items) */
  unlisted: boolean;
};

// We always apply tagsBaseRoutePath on purpose. For versioned docs, v1/doc.md
// and v2/doc.md tags with custom permalinks don't lead to the same created
// page. tagsBaseRoutePath is different for each doc version
function normalizeTagPermalink({
  tagsBaseRoutePath,
  permalink,
}: {
  tagsBaseRoutePath: string;
  permalink: string;
}): string {
  return normalizeUrl([tagsBaseRoutePath, permalink]);
}

function normalizeInlineTag(
  tagsBaseRoutePath: string,
  tag: string,
): TagMetadata {
  return {
    inline: true,
    label: tag,
    permalink: normalizeTagPermalink({
      permalink: _.kebabCase(tag),
      tagsBaseRoutePath,
    }),
    description: undefined,
  };
}

export function normalizeTag({
  tag,
  tagsFile,
  tagsBaseRoutePath,
}: {
  tag: string;
  tagsBaseRoutePath: string;
  tagsFile: TagsFile | null;
}): TagMetadata {
  const tagDescription = tagsFile?.[tag];
  if (tagDescription) {
    // pre-defined tag from tags.yml
    return {
      inline: false,
      label: tagDescription.label,
      permalink: normalizeTagPermalink({
        permalink: tagDescription.permalink,
        tagsBaseRoutePath,
      }),
      description: tagDescription.description,
    };
  }
  return normalizeInlineTag(tagsBaseRoutePath, tag);
}

export function normalizeTags({
  options,
  source,
  frontMatterTags,
  tagsBaseRoutePath,
  tagsFile,
}: {
  options: TagsPluginOptions;
  source: string;
  frontMatterTags: string[] | undefined;
  tagsBaseRoutePath: string;
  tagsFile: TagsFile | null;
}): TagMetadata[] {
  const tags = (frontMatterTags ?? []).map((tag) =>
    normalizeTag({tag, tagsBaseRoutePath, tagsFile}),
  );
  if (tagsFile !== null) {
    reportInlineTags({tags, source, options});
  }
  return tags;
}

export function reportInlineTags({
  tags,
  source,
  options,
}: {
  tags: TagMetadata[];
  source: string;
  options: TagsPluginOptions;
}): void {
  if (options.onInlineTags === 'ignore') {
    return;
  }
  const inlineTags = tags.filter((tag) => tag.inline);
  if (inlineTags.length > 0) {
    const uniqueUnknownTags = [...new Set(inlineTags.map((tag) => tag.label))];
    const tagListString = uniqueUnknownTags.join(', ');
    logger.report(options.onInlineTags)(
      `Tags [${tagListString}] used in ${source} are not defined in ${
        options.tags ?? 'tags.yml'
      }`,
    );
  }
}

type TaggedItemGroup<Item> = {
  tag: TagMetadata;
  items: Item[];
};

/**
 * Permits to group docs/blog posts by tag (provided by front matter).
 *
 * @returns a map from tag permalink to the items and other relevant tag data.
 * The record is indexed by permalink, because routes must be unique in the end.
 * Labels may vary on 2 MD files but they are normalized. Docs with
 * label='some label' and label='some-label' should end up in the same page.
 */
export function groupTaggedItems<Item>(
  items: readonly Item[],
  /**
   * A callback telling me how to get the tags list of the current item. Usually
   * simply getting it from some metadata of the current item.
   */
  getItemTags: (item: Item) => readonly TagMetadata[],
): {[permalink: string]: TaggedItemGroup<Item>} {
  const result: {[permalink: string]: TaggedItemGroup<Item>} = {};

  items.forEach((item) => {
    getItemTags(item).forEach((tag) => {
      // Init missing tag groups
      // TODO: it's not really clear what should be the behavior if 2 tags have
      // the same permalink but the label is different for each
      // For now, the first tag found wins
      result[tag.permalink] ??= {
        tag,
        items: [],
      };

      // Add item to group
      result[tag.permalink]!.items.push(item);
    });
  });

  // If user add twice the same tag to a md doc (weird but possible),
  // we don't want the item to appear twice in the list...
  Object.values(result).forEach((group) => {
    group.items = _.uniq(group.items);
  });

  return result;
}

/**
 * Permits to get the "tag visibility" (hard to find a better name)
 * IE, is this tag listed or unlisted
 * And which items should be listed when this tag is browsed
 */
export function getTagVisibility<Item>({
  items,
  isUnlisted,
}: {
  items: Item[];
  isUnlisted: (item: Item) => boolean;
}): {
  unlisted: boolean;
  listedItems: Item[];
} {
  const allItemsUnlisted = items.every(isUnlisted);
  // When a tag is full of unlisted items, we display all the items
  // when tag is browsed, but we mark the tag as unlisted
  if (allItemsUnlisted) {
    return {unlisted: true, listedItems: items};
  }
  // When a tag has some listed items, the tag remains listed
  // but we filter its unlisted items
  return {
    unlisted: false,
    listedItems: items.filter((item) => !isUnlisted(item)),
  };
}
