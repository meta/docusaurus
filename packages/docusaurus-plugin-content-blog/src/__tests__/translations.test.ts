/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {updateTranslationFileMessages} from '@docusaurus/utils';
import {fromPartial} from '@total-typescript/shoehorn';
import {getTranslationFiles, translateContent} from '../translations';
import {DEFAULT_OPTIONS} from '../options';
import type {
  PluginOptions,
  BlogPost,
  BlogContent,
} from '@docusaurus/plugin-content-blog';

const sampleBlogOptions: PluginOptions = {
  ...DEFAULT_OPTIONS,
  blogTitle: 'My blog',
  blogDescription: "Someone's random blog",
  blogSidebarTitle: 'All my posts',
};

const sampleBlogPosts: BlogPost[] = [
  fromPartial({
    id: 'hello',
    metadata: {
      permalink: '/blog/2021/06/19/hello',
      source: '/blog/2021/06/19/hello',
      description: '/blog/2021/06/19/hello',
      date: new Date(2021, 6, 19),
      tags: [],
      title: 'Hello',
      hasTruncateMarker: true,
      authors: [],
      frontMatter: {},
      unlisted: false,
    },
    content: '',
  }),
];

const sampleBlogContent: BlogContent = {
  blogTitle: sampleBlogOptions.blogTitle,
  blogDescription: sampleBlogOptions.blogDescription,
  blogSidebarTitle: sampleBlogOptions.blogSidebarTitle,
  blogPosts: sampleBlogPosts,
  blogTags: {},
  blogTagsListPath: '/tags',
};

function getSampleTranslationFiles() {
  return getTranslationFiles(sampleBlogOptions);
}
function getSampleTranslationFilesTranslated() {
  const translationFiles = getSampleTranslationFiles();
  return translationFiles.map((translationFile) =>
    updateTranslationFileMessages(
      translationFile,
      (message) => `${message} (translated)`,
    ),
  );
}

describe('getContentTranslationFiles', () => {
  it('returns translation files matching snapshot', () => {
    expect(getSampleTranslationFiles()).toMatchSnapshot();
  });
});

describe('translateContent', () => {
  it('falls back when translation is incomplete', () => {
    expect(
      translateContent(sampleBlogContent, [{path: 'foo', content: {}}]),
    ).toMatchSnapshot();
  });

  it('does not translate anything if translation files are untranslated', () => {
    const translationFiles = getSampleTranslationFiles();
    expect(translateContent(sampleBlogContent, translationFiles)).toEqual(
      sampleBlogContent,
    );
  });

  it('returns translated loaded', () => {
    const translationFiles = getSampleTranslationFilesTranslated();
    expect(
      translateContent(sampleBlogContent, translationFiles),
    ).toMatchSnapshot();
  });
});
