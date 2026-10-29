/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {updateTranslationFileMessages} from '@docusaurus/utils';
import {CURRENT_VERSION_NAME} from '../constants';
import {
  getLoadedContentTranslationFiles,
  translateLoadedContent,
} from '../translations';
import {toFullVersion} from '../versions/version';
import type {
  DocMetadataBase,
  LoadedContent,
  LoadedVersion,
} from '@docusaurus/plugin-content-docs';
import type {Sidebar} from '../sidebars/types';

function createSampleDoc(
  doc: Pick<DocMetadataBase, 'id'> & Partial<DocMetadataBase>,
): DocMetadataBase {
  return {
    sourceDirName: '',
    draft: false,
    unlisted: false,
    tags: [],
    editUrl: 'any',
    lastUpdatedAt: 0,
    lastUpdatedBy: 'any',
    permalink: 'any',
    slug: 'any',
    source: 'any',
    version: 'any',
    title: `${doc.id} title`,
    frontMatter: {
      sidebar_label: `${doc.id} title`,
    },
    description: `${doc.id} description`,
    ...doc,
  };
}

function createSampleVersion(
  version: Pick<LoadedVersion, 'versionName'> & Partial<LoadedVersion>,
): LoadedVersion {
  return {
    label: `${version.versionName} label`,
    path: '/docs/',
    routePriority: undefined,
    sidebarFilePath: 'any',
    isLast: true,
    noIndex: false,
    contentPath: 'any',
    contentPathLocalized: 'any',
    tagsPath: '/tags/',
    banner: null,
    badge: true,
    className: '',
    drafts: [],
    docs: [
      createSampleDoc({id: 'doc1'}),
      createSampleDoc({id: 'doc2'}),
      createSampleDoc({id: 'doc3'}),
      createSampleDoc({id: 'doc4'}),
      createSampleDoc({id: 'doc5'}),
    ],
    sidebars: {
      docs: [
        {
          type: 'category',
          label: 'Getting started',
          collapsed: false,
          collapsible: true,
          link: {
            type: 'generated-index',
            slug: '/category/getting-started-index-slug',
            permalink: '/docs/category/getting-started-index-slug',
            title: 'Getting started index title',
            description: 'Getting started index description',
          },
          items: [
            {
              type: 'doc',
              id: 'doc1',
            },
            {
              type: 'doc',
              id: 'doc2',
              label: 'Second doc translatable',
              translatable: true,
            },
            {
              type: 'link',
              label: 'Link label',
              href: 'https://facebook.com',
            },
            {
              type: 'ref',
              id: 'doc1',
            },
          ],
        },
        {
          type: 'doc',
          id: 'doc3',
        },
      ],
      otherSidebar: [
        {
          type: 'doc',
          id: 'doc4',
        },
        {
          type: 'ref',
          id: 'doc5',
          label: 'Fifth doc translatable',
          translatable: true,
        },
        {
          type: 'category',
          key: 'cat-with-key',
          label: 'Category with key',
          collapsed: false,
          collapsible: true,
          link: {
            type: 'generated-index',
            slug: '/category/cat-with-key-slug',
            permalink: '/docs/category/cat-with-key',
            title: 'Category with key - index title',
            description: 'Category with key - index description',
          },
          items: [],
        },
      ],
    },
    ...version,
  };
}

const SampleLoadedContent: LoadedContent = {
  loadedVersions: [
    createSampleVersion({
      versionName: CURRENT_VERSION_NAME,
    }),
    createSampleVersion({
      versionName: '2.0.0',
    }),
    createSampleVersion({
      versionName: '1.0.0',
    }),
  ],
};

function getSampleTranslationFiles() {
  return getLoadedContentTranslationFiles(SampleLoadedContent);
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

describe('getLoadedContentTranslationFiles', () => {
  it('returns translation files', () => {
    expect(getSampleTranslationFiles()).toMatchSnapshot();
  });

  describe('translation key conflicts', () => {
    function runTest({withUniqueKeys}: {withUniqueKeys: boolean}) {
      const sidebarWithConflicts: Sidebar = [
        {
          type: 'doc',
          id: 'doc4',
          label: 'COMMON LABEL',
          translatable: true,
          ...(withUniqueKeys && {key: 'key-doc4'}),
        },
        {
          type: 'doc',
          id: 'doc5',
          label: 'COMMON LABEL',
          translatable: true,
          ...(withUniqueKeys && {key: 'key-doc5'}),
        },
        {
          type: 'ref',
          id: 'doc4',
          label: 'COMMON LABEL',
          translatable: true,
          ...(withUniqueKeys && {key: 'key-ref4'}),
        },
        {
          type: 'ref',
          id: 'doc5',
          label: 'COMMON LABEL',
          translatable: true,
          ...(withUniqueKeys && {key: 'key-ref5'}),
        },
        {
          type: 'category',
          label: 'COMMON LABEL',
          items: [],
          collapsed: false,
          collapsible: true,
          ...(withUniqueKeys && {key: 'key-cat1'}),
        },
        {
          type: 'category',
          label: 'COMMON LABEL',
          items: [],
          collapsed: false,
          collapsible: true,
          ...(withUniqueKeys && {key: 'key-cat2'}),
        },
        {
          type: 'link',
          href: 'https://example.com',
          label: 'COMMON LABEL',
          ...(withUniqueKeys && {key: 'key-link1'}),
        },
        {
          type: 'link',
          href: 'https://example.com',
          label: 'COMMON LABEL',
          ...(withUniqueKeys && {key: 'key-link2'}),
        },
      ];

      const version = createSampleVersion({
        versionName: CURRENT_VERSION_NAME,
        sidebars: {
          sidebarWithConflicts,
        },
      });
      return getLoadedContentTranslationFiles({
        loadedVersions: [version],
      });
    }

    it('works on sidebar with translation key conflicts resolved by unique sidebar item keys', () => {
      expect(runTest({withUniqueKeys: true})).toMatchInlineSnapshot(`
        [
          {
            "content": {
              "sidebar.sidebarWithConflicts.category.key-cat1": {
                "description": "The label for category 'COMMON LABEL' in sidebar 'sidebarWithConflicts'",
                "message": "COMMON LABEL",
              },
              "sidebar.sidebarWithConflicts.category.key-cat2": {
                "description": "The label for category 'COMMON LABEL' in sidebar 'sidebarWithConflicts'",
                "message": "COMMON LABEL",
              },
              "sidebar.sidebarWithConflicts.doc.key-doc4": {
                "description": "The label for the doc item 'COMMON LABEL' in sidebar 'sidebarWithConflicts', linking to the doc doc4",
                "message": "COMMON LABEL",
              },
              "sidebar.sidebarWithConflicts.doc.key-doc5": {
                "description": "The label for the doc item 'COMMON LABEL' in sidebar 'sidebarWithConflicts', linking to the doc doc5",
                "message": "COMMON LABEL",
              },
              "sidebar.sidebarWithConflicts.doc.key-ref4": {
                "description": "The label for the doc item 'COMMON LABEL' in sidebar 'sidebarWithConflicts', linking to the doc doc4",
                "message": "COMMON LABEL",
              },
              "sidebar.sidebarWithConflicts.doc.key-ref5": {
                "description": "The label for the doc item 'COMMON LABEL' in sidebar 'sidebarWithConflicts', linking to the doc doc5",
                "message": "COMMON LABEL",
              },
              "sidebar.sidebarWithConflicts.link.key-link1": {
                "description": "The label for link 'COMMON LABEL' in sidebar 'sidebarWithConflicts', linking to 'https://example.com'",
                "message": "COMMON LABEL",
              },
              "sidebar.sidebarWithConflicts.link.key-link2": {
                "description": "The label for link 'COMMON LABEL' in sidebar 'sidebarWithConflicts', linking to 'https://example.com'",
                "message": "COMMON LABEL",
              },
              "version.label": {
                "description": "The label for version current",
                "message": "current label",
              },
            },
            "path": "current",
          },
        ]
      `);
    });

    it('throws on sidebar translation key conflicts', () => {
      expect(() => runTest({withUniqueKeys: false}))
        .toThrowErrorMatchingInlineSnapshot(`
          [Error: Multiple docs sidebar items produce the same translation key.
          - \`sidebar.sidebarWithConflicts.category.COMMON LABEL\`: 2 duplicates found:
            - COMMON LABEL (The label for category 'COMMON LABEL' in sidebar 'sidebarWithConflicts')
            - COMMON LABEL (The label for category 'COMMON LABEL' in sidebar 'sidebarWithConflicts')

          - \`sidebar.sidebarWithConflicts.link.COMMON LABEL\`: 2 duplicates found:
            - COMMON LABEL (The label for link 'COMMON LABEL' in sidebar 'sidebarWithConflicts', linking to 'https://example.com')
            - COMMON LABEL (The label for link 'COMMON LABEL' in sidebar 'sidebarWithConflicts', linking to 'https://example.com')

          - \`sidebar.sidebarWithConflicts.doc.COMMON LABEL\`: 4 duplicates found:
            - COMMON LABEL (The label for the doc item 'COMMON LABEL' in sidebar 'sidebarWithConflicts', linking to the doc doc4)
            - COMMON LABEL (The label for the doc item 'COMMON LABEL' in sidebar 'sidebarWithConflicts', linking to the doc doc5)
            - COMMON LABEL (The label for the doc item 'COMMON LABEL' in sidebar 'sidebarWithConflicts', linking to the doc doc4)
            - COMMON LABEL (The label for the doc item 'COMMON LABEL' in sidebar 'sidebarWithConflicts', linking to the doc doc5)

          To avoid translation key conflicts, use the \`key\` attribute on the sidebar items above to uniquely identify them.

          When using autogenerated sidebars, you can provide a unique translation key by adding:
          - the \`key\` attribute to category item metadata (\`_category_.json\` / \`_category_.yml\`)
          - the \`sidebar_key\` attribute to doc item metadata (front matter in \`Category/index.mdx\`)]
        `);
    });
  });
});

describe('translateLoadedContent', () => {
  it('does not translate anything if translation files are untranslated', () => {
    const translationFiles = getSampleTranslationFiles();
    expect(
      translateLoadedContent(SampleLoadedContent, translationFiles),
    ).toEqual(SampleLoadedContent);
  });

  it('returns translated loaded content', () => {
    const translationFiles = getSampleTranslationFilesTranslated();
    expect(
      translateLoadedContent(SampleLoadedContent, translationFiles),
    ).toMatchSnapshot();
  });

  it('derives the docs navigation from the translated sidebars', () => {
    const content: LoadedContent = {
      loadedVersions: [
        createSampleVersion({
          versionName: CURRENT_VERSION_NAME,
          docs: ['doc1', 'doc2', 'doc3', 'doc4', 'doc5'].map((id) =>
            createSampleDoc({id, permalink: `/docs/${id}`, frontMatter: {}}),
          ),
        }),
      ],
    };
    const translationFiles = getLoadedContentTranslationFiles(content).map(
      (translationFile) =>
        updateTranslationFileMessages(
          translationFile,
          (message) => `${message} (translated)`,
        ),
    );

    const translatedContent = translateLoadedContent(content, translationFiles);
    const version = toFullVersion(translatedContent.loadedVersions[0]!);

    // Generated-index category and sidebar doc item labels are translated
    // Doc titles are not, they come from the already translated MDX files
    expect(version.docs.map(({id, previous, next}) => ({id, previous, next})))
      .toMatchInlineSnapshot(`
      [
        {
          "id": "doc1",
          "next": {
            "permalink": "/docs/doc2",
            "title": "Second doc translatable (translated)",
          },
          "previous": {
            "permalink": "/docs/category/getting-started-index-slug",
            "title": "Getting started (translated)",
          },
        },
        {
          "id": "doc2",
          "next": {
            "permalink": "/docs/doc3",
            "title": "doc3 title",
          },
          "previous": {
            "permalink": "/docs/doc1",
            "title": "doc1 title",
          },
        },
        {
          "id": "doc3",
          "next": undefined,
          "previous": {
            "permalink": "/docs/doc2",
            "title": "Second doc translatable (translated)",
          },
        },
        {
          "id": "doc4",
          "next": {
            "permalink": "/docs/category/cat-with-key",
            "title": "Category with key (translated)",
          },
          "previous": undefined,
        },
        {
          "id": "doc5",
          "next": undefined,
          "previous": undefined,
        },
      ]
    `);
  });
});
