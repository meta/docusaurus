/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {TranslationFile} from '@docusaurus/types';
import type {PluginOptions, BlogContent} from '@docusaurus/plugin-content-blog';

export function getTranslationFiles(options: PluginOptions): TranslationFile[] {
  return [
    {
      path: 'options',
      content: {
        title: {
          message: options.blogTitle,
          description: 'The title for the blog used in SEO',
        },
        description: {
          message: options.blogDescription,
          description: 'The description for the blog used in SEO',
        },
        'sidebar.title': {
          message: options.blogSidebarTitle,
          description: 'The label for the left sidebar',
        },
      },
    },
  ];
}

export function translateContent(
  content: BlogContent,
  translationFiles: TranslationFile[],
): BlogContent {
  const {content: translations} = translationFiles[0]!;
  return {
    ...content,
    blogTitle: translations.title?.message ?? content.blogTitle,
    blogDescription:
      translations.description?.message ?? content.blogDescription,
    blogSidebarTitle:
      translations['sidebar.title']?.message ?? content.blogSidebarTitle,
  };
}
