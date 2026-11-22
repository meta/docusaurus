/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {afterEach, describe, expect, it, vi} from 'vitest';
import {render, within} from '@testing-library/react';
import {fromPartial} from '@total-typescript/shoehorn';
import {StaticRouter} from 'react-router-dom';
import {Context} from '@docusaurus/core/src/client/docusaurusContext';
import {RouteContextProvider} from '@docusaurus/core/src/client/routeContext';
import {DocsSidebarProvider} from '@docusaurus/plugin-content-docs/client';
import DocCardList from '@theme/DocCardList';
import type {DocMetadata, PropSidebar} from '@docusaurus/plugin-content-docs';
import type {DocusaurusContext} from '@docusaurus/types';

const overviewId = 'tutorial-extras/index';
const overviewUrl = '/docs/tutorial-extras/';

function doc(
  id: string,
  title: string,
  permalink = `/docs/${id}`,
): DocMetadata {
  return fromPartial({id, title, permalink, frontMatter: {}});
}

const docs = [
  doc('intro', 'Intro'),
  doc('tutorial-basics/create-a-page', 'Create a Page'),
  doc('tutorial-basics/create-a-document', 'Create a Document'),
  doc(overviewId, 'Tutorial Extras', overviewUrl),
  doc('tutorial-extras/manage-docs-versions', 'Manage Docs Versions'),
  doc('tutorial-extras/translate-your-site', 'Translate Your Site'),
];
// Client sidebar props produced by a type: 'doc' sidebar entry.
const docItem = (id: string) => {
  const metadata = docs.find((d) => d.id === id)!;
  return {
    type: 'link' as const,
    docId: id,
    label: metadata.title,
    href: metadata.permalink,
  };
};

describe('DocCardList on the Tutorial Extras overview', () => {
  afterEach(() => vi.unstubAllGlobals());
  const overviewLink = {
    type: 'link' as const,
    label: 'Manage Docs Versions →',
    href: overviewUrl,
  };
  it.each([
    {kind: 'link', entries: [overviewLink]},
    {kind: 'doc', entries: [docItem(overviewId)]},
    {
      kind: 'duplicate docs',
      entries: [docItem(overviewId), docItem(overviewId)],
    },
  ])(
    'renders only Tutorial Extras cards when Tutorial Basics references its overview ($kind)',
    ({entries}) => {
      const sidebar: PropSidebar = [
        docItem('intro'),
        {
          type: 'category',
          label: 'Tutorial Basics',
          collapsible: true,
          collapsed: true,
          items: [
            docItem('tutorial-basics/create-a-page'),
            docItem('tutorial-basics/create-a-document'),
            docItem('tutorial-basics/create-a-page'),
            ...entries,
          ],
        },
        {
          type: 'category',
          label: 'Tutorial Extras',
          collapsible: true,
          collapsed: true,
          href: overviewUrl,
          items: [
            docItem('tutorial-extras/manage-docs-versions'),
            docItem('tutorial-extras/translate-your-site'),
          ],
        },
      ];
      const site = fromPartial<DocusaurusContext>({
        siteConfig: {
          baseUrl: '/',
          future: {},
          themeConfig: {navbar: {}},
        },
      });
      vi.stubGlobal('docusaurus', {prefetch: vi.fn()});
      const view = render(
        <StaticRouter location={overviewUrl}>
          <Context value={site}>
            <RouteContextProvider
              value={{
                plugin: {name: 'docusaurus-plugin-content-docs', id: 'default'},
                data: {
                  docsVersion: {
                    docs: Object.fromEntries(docs.map((d) => [d.id, d])),
                  },
                },
              }}>
              <DocsSidebarProvider name="tutorialSidebar" items={sidebar}>
                <DocCardList />
              </DocsSidebarProvider>
            </RouteContextProvider>
          </Context>
        </StaticRouter>,
      );
      const cards = within(view.container).getAllByRole('article');
      expect(
        cards.map((card) => [
          within(card).getByRole('heading').getAttribute('title'),
          within(card).getByRole('link').getAttribute('href'),
        ]),
      ).toEqual([
        ['Manage Docs Versions', '/docs/tutorial-extras/manage-docs-versions'],
        ['Translate Your Site', '/docs/tutorial-extras/translate-your-site'],
      ]);
    },
  );
});
