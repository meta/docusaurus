/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
  TagsPageLinkLabel,
  usePluralForm,
} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';
import SearchMetadata from '@theme/SearchMetadata';
import type {Props} from '@theme/DocTagDocListPage';
import Unlisted from '@theme/ContentVisibility/Unlisted';
import Heading from '@theme/Heading';

// Very simple pluralization: probably good enough for now
function useNDocsTaggedPlural() {
  const {selectMessage} = usePluralForm();
  return (count: number) =>
    selectMessage(
      count,
      translate(
        {
          id: 'theme.docs.tagDocListPageTitle.nDocsTagged',
          description:
            'Pluralized label for "{count} docs tagged". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: 'One doc tagged|{count} docs tagged',
        },
        {count},
      ),
    );
}

function usePageTitle(props: Props): string {
  const nDocsTaggedPlural = useNDocsTaggedPlural();
  return translate(
    {
      id: 'theme.docs.tagDocListPageTitle',
      description: 'The title of the page for a docs tag',
      message: '{nDocsTagged} with "{tagName}"',
    },
    {nDocsTagged: nDocsTaggedPlural(props.tag.count), tagName: props.tag.label},
  );
}

function DocItem({doc}: {doc: Props['tag']['items'][number]}): ReactNode {
  return (
    <article className="margin-vert--lg">
      <Link to={doc.permalink}>
        <Heading as="h2">{doc.title}</Heading>
      </Link>
      {doc.description && <p>{doc.description}</p>}
    </article>
  );
}

function DocTagDocListPageMetadata({
  title,
  tag,
}: Props & {title: string}): ReactNode {
  return (
    <>
      <PageMetadata title={title} description={tag.description} />
      <SearchMetadata tag="doc_tag_doc_list" />
    </>
  );
}

function DocTagDocListPageContent({
  tag,
  title,
}: Props & {title: string}): ReactNode {
  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.page.docsTagDocListPage)}>
      <div className="container margin-vert--lg">
        <div className="row">
          <main className="col col--8 col--offset-2">
            {tag.unlisted && <Unlisted />}
            <header className="margin-bottom--xl">
              <Heading as="h1">{title}</Heading>
              {tag.description && <p>{tag.description}</p>}
              <Link href={tag.allTagsPath}>
                <TagsPageLinkLabel />
              </Link>
            </header>
            <section className="margin-vert--lg">
              {tag.items.map((doc) => (
                <DocItem key={doc.id} doc={doc} />
              ))}
            </section>
          </main>
        </div>
      </div>
    </HtmlClassNameProvider>
  );
}

export default function DocTagDocListPage(props: Props): ReactNode {
  const title = usePageTitle(props);
  return (
    <>
      <DocTagDocListPageMetadata {...props} title={title} />
      <DocTagDocListPageContent {...props} title={title} />
    </>
  );
}
