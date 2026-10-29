/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import type {TagsListItem} from '@docusaurus/utils';

export const translateTagsPageTitle = (): string =>
  translate({
    id: 'theme.tags.tagsPageTitle',
    message: 'Tags',
    description: 'The title of the tag list page',
  });

export function TagsPageLinkLabel(): ReactNode {
  return (
    <Translate
      id="theme.tags.tagsPageLink"
      description="The label of the link targeting the tag list page">
      View all tags
    </Translate>
  );
}

export type TagLetterEntry = {letter: string; tags: TagsListItem[]};

function getTagLetter(tag: string): string {
  return tag[0]!.toUpperCase();
}

/**
 * Takes a list of tags (as provided by the content plugins), and groups them by
 * their initials.
 */
export function listTagsByLetters(
  tags: readonly TagsListItem[],
): TagLetterEntry[] {
  const groups: {[initial: string]: TagsListItem[]} = {};
  Object.values(tags).forEach((tag) => {
    const initial = getTagLetter(tag.label);
    groups[initial] ??= [];
    groups[initial]!.push(tag);
  });

  return (
    Object.entries(groups)
      // Sort letters
      .sort(([letter1], [letter2]) => letter1.localeCompare(letter2))
      .map(([letter, letterTags]) => {
        // Sort tags inside a letter
        const sortedTags = letterTags.sort((tag1, tag2) =>
          tag1.label.localeCompare(tag2.label),
        );
        return {letter, tags: sortedTags};
      })
  );
}
