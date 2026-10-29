/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useBaseUrlUtils, type BaseUrlUtils} from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useBlogMetadata} from '@docusaurus/plugin-content-blog/client';
import {applyTrailingSlash} from '@docusaurus/utils-common';
import type {Props as BlogListPageStructuredDataProps} from '@theme/BlogListPage/StructuredData';
import {useBlogPost} from './contexts';

import type {
  Blog,
  BlogPosting,
  WithContext,
  Person,
  ImageObject,
} from 'schema-dts';
import type {
  Author,
  PropBlogPostContent,
} from '@docusaurus/plugin-content-blog';
import type {DocusaurusConfig} from '@docusaurus/types';

const convertDate = (dateMs: number) => new Date(dateMs).toISOString();

function getAbsoluteUrl(
  permalink: string,
  siteConfig: DocusaurusConfig,
): string {
  const absoluteUrl = `${siteConfig.url}${permalink}`;
  return applyTrailingSlash(absoluteUrl, {
    trailingSlash: siteConfig.trailingSlash,
    baseUrl: siteConfig.baseUrl,
  });
}

function getBlogPost(
  blogPostContent: PropBlogPostContent,
  siteConfig: DocusaurusConfig,
  withBaseUrl: BaseUrlUtils['withBaseUrl'],
): BlogPosting {
  const {assets, frontMatter, metadata} = blogPostContent;
  const {date, title, description, lastUpdatedAt} = metadata;

  const image = assets.image ?? frontMatter.image;
  const keywords = frontMatter.keywords ?? [];

  const blogUrl = getAbsoluteUrl(metadata.permalink, siteConfig);

  const dateModified = lastUpdatedAt ? convertDate(lastUpdatedAt) : undefined;

  return {
    '@type': 'BlogPosting',
    '@id': blogUrl,
    mainEntityOfPage: blogUrl,
    url: blogUrl,
    headline: title,
    name: title,
    description,
    datePublished: date,
    ...(dateModified ? {dateModified} : {}),
    ...getAuthor(metadata.authors),
    ...getImage(image, withBaseUrl, title),
    ...(keywords ? {keywords} : {}),
  };
}

function getAuthor(authors: Author[]) {
  const authorsStructuredData = authors.map(createPersonStructuredData);
  return {
    author:
      authorsStructuredData.length === 1
        ? authorsStructuredData[0]
        : authorsStructuredData,
  };
}

function getImage(
  image: string | undefined,
  withBaseUrl: BaseUrlUtils['withBaseUrl'],
  title: string,
) {
  return image
    ? {
        image: createImageStructuredData({
          imageUrl: withBaseUrl(image, {absolute: true}),
          caption: `title image for the blog post: ${title}`,
        }),
      }
    : {};
}

export function useBlogListPageStructuredData(
  props: BlogListPageStructuredDataProps,
): WithContext<Blog> {
  const {siteConfig} = useDocusaurusContext();
  const {withBaseUrl} = useBaseUrlUtils();

  const {
    metadata: {blogDescription, blogTitle, permalink},
  } = props;

  const url = getAbsoluteUrl(permalink, siteConfig);

  // details on structured data support: https://schema.org/Blog
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': url,
    mainEntityOfPage: url,
    headline: blogTitle,
    description: blogDescription,
    blogPost: props.items.map((blogItem) =>
      getBlogPost(blogItem.content, siteConfig, withBaseUrl),
    ),
  };
}

export function useBlogPostStructuredData(): WithContext<BlogPosting> {
  const blogMetadata = useBlogMetadata();
  const {assets, metadata} = useBlogPost();
  const {siteConfig} = useDocusaurusContext();
  const {withBaseUrl} = useBaseUrlUtils();

  const {date, title, description, frontMatter, lastUpdatedAt} = metadata;

  const image = assets.image ?? frontMatter.image;
  const keywords = frontMatter.keywords ?? [];

  const dateModified = lastUpdatedAt ? convertDate(lastUpdatedAt) : undefined;

  const url = getAbsoluteUrl(metadata.permalink, siteConfig);

  // details on structured data support: https://schema.org/BlogPosting
  // BlogPosting is one of the structured data types that Google explicitly
  // supports: https://developers.google.com/search/docs/appearance/structured-data/article#structured-data-type-definitions
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url,
    mainEntityOfPage: url,
    url,
    headline: title,
    name: title,
    description,
    datePublished: date,
    ...(dateModified ? {dateModified} : {}),
    ...getAuthor(metadata.authors),
    ...getImage(image, withBaseUrl, title),
    ...(keywords ? {keywords} : {}),
    isPartOf: {
      '@type': 'Blog',
      '@id': getAbsoluteUrl(blogMetadata.blogBasePath, siteConfig),
      name: blogMetadata.blogTitle,
    },
  };
}

/** @returns A {@link https://schema.org/Person} constructed from the {@link Author} */
function createPersonStructuredData(author: Author): Person {
  return {
    '@type': 'Person',
    ...(author.name ? {name: author.name} : {}),
    ...(author.title ? {description: author.title} : {}),
    ...(author.url ? {url: author.url} : {}),
    ...(author.email ? {email: author.email} : {}),
    ...(author.imageURL ? {image: author.imageURL} : {}),
  };
}

/** @returns A {@link https://schema.org/ImageObject} */
function createImageStructuredData({
  imageUrl,
  caption,
}: {
  imageUrl: string;
  caption: string;
}): ImageObject {
  return {
    '@type': 'ImageObject',
    '@id': imageUrl,
    url: imageUrl,
    contentUrl: imageUrl,
    caption,
  };
}
