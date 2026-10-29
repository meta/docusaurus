/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import Head from '@docusaurus/Head';
import useRouteContext from '@docusaurus/useRouteContext';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import {useTitleFormatter} from './titleFormatterUtils';

type PageMetadataProps = {
  readonly title?: string;
  readonly description?: string;
  readonly keywords?: readonly string[] | string;
  readonly image?: string;
  readonly children?: ReactNode;
};

function TitleMetadata({title}: {title: string}) {
  const titleFormatter = useTitleFormatter();
  const formattedTitle = titleFormatter.format(title);
  return (
    <Head>
      <title>{formattedTitle}</title>
      <meta property="og:title" content={formattedTitle} />
    </Head>
  );
}

function DescriptionMetadata({description}: {description: string}) {
  return (
    <Head>
      <meta name="description" content={description} />
      <meta property="og:description" content={description} />
    </Head>
  );
}

function ImageMetadata({image}: {image: string}) {
  const {withBaseUrl} = useBaseUrlUtils();
  const pageImage = withBaseUrl(image, {absolute: true});
  return (
    <Head>
      <meta property="og:image" content={pageImage} />
      <meta name="twitter:image" content={pageImage} />
    </Head>
  );
}

function KeywordsMetadata({
  keywords,
}: {
  keywords: PageMetadataProps['keywords'];
}) {
  return (
    <Head>
      <meta
        name="keywords"
        content={
          // https://github.com/microsoft/TypeScript/issues/17002
          (Array.isArray(keywords) ? keywords.join(',') : keywords) as string
        }
      />
    </Head>
  );
}

/**
 * Helper component to manipulate page metadata and override site defaults.
 * Works in the same way as Helmet.
 */
export function PageMetadata({
  title,
  description,
  keywords,
  image,
  children,
}: PageMetadataProps): ReactNode {
  return (
    <>
      {title && <TitleMetadata title={title} />}
      {description && <DescriptionMetadata description={description} />}
      {keywords && <KeywordsMetadata keywords={keywords} />}
      {image && <ImageMetadata image={image} />}
      {children && <Head>{children}</Head>}
    </>
  );
}

const HtmlClassNameContext = React.createContext<string | undefined>(undefined);

/**
 * Every layer of this provider will append a class name to the HTML element.
 * There's no consumer for this hook: it's side-effect-only. This wrapper is
 * necessary because Helmet does not "merge" classes.
 * @see https://github.com/staylor/react-helmet-async/issues/161
 */
export function HtmlClassNameProvider({
  className: classNameProp,
  children,
}: {
  className: string;
  children: ReactNode;
}): ReactNode {
  const classNameContext = React.useContext(HtmlClassNameContext);
  const className = clsx(classNameContext, classNameProp);
  return (
    <HtmlClassNameContext value={className}>
      <Head>
        <html className={className} />
      </Head>
      {children}
    </HtmlClassNameContext>
  );
}

function pluginNameToClassName(pluginName: string) {
  return `plugin-${pluginName.replace(
    /docusaurus-(?:plugin|theme)-(?:content-)?/gi,
    '',
  )}`;
}

/**
 * A very thin wrapper around `HtmlClassNameProvider` that adds the plugin ID +
 * name to the HTML class name.
 */
export function PluginHtmlClassNameProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const routeContext = useRouteContext();
  const nameClass = pluginNameToClassName(routeContext.plugin.name);
  const idClass = `plugin-id-${routeContext.plugin.id}`;
  return (
    <HtmlClassNameProvider className={clsx(nameClass, idClass)}>
      {children}
    </HtmlClassNameProvider>
  );
}
