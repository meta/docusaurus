/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {Feed, type Author as FeedAuthor} from 'feed';
import {parseSrcset, stringifySrcset} from 'srcset';
import {
  getDataFilePath,
  normalizeUrl,
  readOutputHTMLFile,
} from '@docusaurus/utils';
import {
  blogPostContainerID,
  applyTrailingSlash,
} from '@docusaurus/utils-common';
import {load as cheerioLoad} from 'cheerio';
import logger from '@docusaurus/logger';
import {fs, pathExists, outputFile} from '@docusaurus/fs';
import type {BlogContentPaths} from './types';
import type {DocusaurusConfig, HtmlTags, LoadContext} from '@docusaurus/types';
import type {
  FeedType,
  PluginOptions,
  Author,
  BlogPost,
  BlogFeedItem,
  FeedOptions,
  FeedXSLTOptions,
} from '@docusaurus/plugin-content-blog';

async function generateBlogFeed({
  blogPosts,
  options,
  siteConfig,
  outDir,
  locale,
}: {
  blogPosts: BlogPost[];
  options: PluginOptions;
  siteConfig: DocusaurusConfig;
  outDir: string;
  locale: string;
}): Promise<Feed | null> {
  if (!blogPosts.length) {
    return null;
  }

  const {feedOptions, routeBasePath} = options;
  const {url: siteUrl, baseUrl, title, favicon, trailingSlash} = siteConfig;
  const blogBaseUrl = applyTrailingSlash(
    normalizeUrl([siteUrl, baseUrl, routeBasePath]),
    {
      trailingSlash,
      baseUrl,
    },
  );

  const blogPostsForFeed =
    feedOptions.limit === false || feedOptions.limit === null
      ? blogPosts
      : blogPosts.slice(0, feedOptions.limit);

  const updated = blogPostsForFeed[0]?.metadata.date;

  const feed = new Feed({
    id: blogBaseUrl,
    title: feedOptions.title ?? `${title} Blog`,
    updated,
    language: feedOptions.language ?? locale,
    link: blogBaseUrl,
    description: feedOptions.description ?? `${siteConfig.title} Blog`,
    favicon: favicon ? normalizeUrl([siteUrl, baseUrl, favicon]) : undefined,
    copyright: feedOptions.copyright,
  });

  const createFeedItems =
    options.feedOptions.createFeedItems ?? defaultCreateFeedItems;

  const feedItems = await createFeedItems({
    blogPosts: blogPostsForFeed,
    siteConfig,
    outDir,
    defaultCreateFeedItems,
  });

  feedItems.forEach((item) => feed.addItem(item));

  return feed;
}

async function defaultCreateFeedItems({
  blogPosts,
  siteConfig,
  outDir,
}: {
  blogPosts: BlogPost[];
  siteConfig: DocusaurusConfig;
  outDir: string;
}): Promise<BlogFeedItem[]> {
  const {url: siteUrl, baseUrl, trailingSlash} = siteConfig;

  return Promise.all(
    blogPosts.map(async (post) => {
      const {
        metadata: {
          title: metadataTitle,
          permalink,
          date,
          description,
          authors,
          tags,
        },
      } = post;

      const content = await readOutputHTMLFile(
        permalink.replace(baseUrl, ''),
        outDir,
        trailingSlash,
      );
      const $ = cheerioLoad(content);

      const blogPostAbsoluteUrl = applyTrailingSlash(
        normalizeUrl([siteUrl, permalink]),
        {
          trailingSlash,
          baseUrl,
        },
      );

      const toAbsoluteUrl = (src: string) =>
        String(new URL(src, blogPostAbsoluteUrl));

      // Make links and image urls absolute
      // See https://github.com/facebook/docusaurus/issues/9136
      $(`div#${blogPostContainerID} a, div#${blogPostContainerID} img`).each(
        (_, elm) => {
          if (elm.tagName === 'a') {
            const {href} = elm.attribs;
            if (href) {
              elm.attribs.href = toAbsoluteUrl(href);
            }
          } else if (elm.tagName === 'img') {
            const {src, srcset: srcsetAttr} = elm.attribs;
            if (src) {
              elm.attribs.src = toAbsoluteUrl(src);
            }
            if (srcsetAttr) {
              elm.attribs.srcset = stringifySrcset(
                parseSrcset(srcsetAttr).map((props) => ({
                  ...props,
                  url: toAbsoluteUrl(props.url),
                })),
              );
            }
          }
        },
      );

      const feedItem: BlogFeedItem = {
        title: metadataTitle,
        id: blogPostAbsoluteUrl,
        link: blogPostAbsoluteUrl,
        date,
        description,
        // Atom feed demands the "term", while other feeds use "name"
        category: tags.map((tag) => ({name: tag.label, term: tag.label})),
        content: $(`#${blogPostContainerID}`).html()!,
      };

      // Author urls can be relative, but the feed lib throws on these
      // Absolute urls are kept as is to preserve the existing feed output
      const toFeedAuthor = (author: Author): FeedAuthor => ({
        name: author.name,
        link:
          author.url && !URL.canParse(author.url)
            ? toAbsoluteUrl(author.url)
            : author.url,
        email: author.email,
      });

      // json1() method takes the first item of authors array
      // it causes an error when authors array is empty
      const feedItemAuthors = authors.map(toFeedAuthor);
      if (feedItemAuthors.length > 0) {
        feedItem.author = feedItemAuthors;
      }

      return feedItem;
    }),
  );
}

async function resolveXsltFilePaths({
  xsltFilePath,
  contentPaths,
}: {
  xsltFilePath: string;
  contentPaths: BlogContentPaths;
}) {
  const xsltAbsolutePath: string = path.isAbsolute(xsltFilePath)
    ? xsltFilePath
    : ((await getDataFilePath({filePath: xsltFilePath, contentPaths})) ??
      path.resolve(contentPaths.contentPath, xsltFilePath));

  if (!(await pathExists(xsltAbsolutePath))) {
    throw new Error(
      logger.interpolate`Blog feed XSLT file not found at path=${path.relative(
        process.cwd(),
        xsltAbsolutePath,
      )}`,
    );
  }

  const parsedPath = path.parse(xsltAbsolutePath);
  const cssAbsolutePath = path.resolve(
    parsedPath.dir,
    `${parsedPath.name}.css`,
  );
  if (!(await pathExists(cssAbsolutePath))) {
    throw new Error(
      logger.interpolate`Blog feed XSLT file was found at path=${path.relative(
        process.cwd(),
        xsltAbsolutePath,
      )}
But its expected co-located CSS file could not be found at path=${path.relative(
        process.cwd(),
        cssAbsolutePath,
      )}
If you want to provide a custom XSLT file, you must provide a CSS file with the exact same name.`,
    );
  }

  return {xsltAbsolutePath, cssAbsolutePath};
}

async function generateXsltFiles({
  xsltFilePath,
  generatePath,
  contentPaths,
}: {
  xsltFilePath: string;
  generatePath: string;
  contentPaths: BlogContentPaths;
}) {
  const {xsltAbsolutePath, cssAbsolutePath} = await resolveXsltFilePaths({
    xsltFilePath,
    contentPaths,
  });
  const xsltOutputPath = path.join(
    generatePath,
    path.basename(xsltAbsolutePath),
  );
  const cssOutputPath = path.join(generatePath, path.basename(cssAbsolutePath));
  await fs.cp(xsltAbsolutePath, xsltOutputPath, {verbatimSymlinks: true});
  await fs.cp(cssAbsolutePath, cssOutputPath, {verbatimSymlinks: true});
}

// This modifies the XML feed content to add a relative href to the XSLT file
// Good enough for now: we probably don't need a full XML parser just for that
// See also https://darekkay.com/blog/rss-styling/
function injectXslt({
  feedContent,
  xsltFilePath,
}: {
  feedContent: string;
  xsltFilePath: string;
}) {
  return feedContent.replace(
    '<?xml version="1.0" encoding="utf-8"?>',
    `<?xml version="1.0" encoding="utf-8"?><?xml-stylesheet type="text/xsl" href="${path.basename(
      xsltFilePath,
    )}"?>`,
  );
}

const FeedConfigs: Record<
  FeedType,
  {
    outputFileName: string;
    getContent: (feed: Feed) => string;
    getXsltFilePath: (xslt: FeedXSLTOptions) => string | null;
  }
> = {
  rss: {
    outputFileName: 'rss.xml',
    getContent: (feed) => feed.rss2(),
    getXsltFilePath: (xslt) => xslt.rss,
  },
  atom: {
    outputFileName: 'atom.xml',
    getContent: (feed) => feed.atom1(),
    getXsltFilePath: (xslt) => xslt.atom,
  },
  json: {
    outputFileName: 'feed.json',
    getContent: (feed) => feed.json1(),
    getXsltFilePath: () => null,
  },
};

async function createBlogFeedFile({
  feed,
  feedType,
  generatePath,
  feedOptions,
  contentPaths,
}: {
  feed: Feed;
  feedType: FeedType;
  generatePath: string;
  feedOptions: FeedOptions;
  contentPaths: BlogContentPaths;
}) {
  try {
    const feedConfig = FeedConfigs[feedType];

    let feedContent = feedConfig.getContent(feed);

    const xsltFilePath = feedConfig.getXsltFilePath(feedOptions.xslt);
    if (xsltFilePath) {
      await generateXsltFiles({xsltFilePath, contentPaths, generatePath});
      feedContent = injectXslt({feedContent, xsltFilePath});
    }

    const outputPath = path.join(generatePath, feedConfig.outputFileName);
    await outputFile(outputPath, feedContent);
  } catch (err) {
    throw new Error(`Generating ${feedType} feed failed.`, {
      cause: err,
    });
  }
}

function shouldBeInFeed(blogPost: BlogPost): boolean {
  const excluded =
    blogPost.metadata.frontMatter.draft ||
    blogPost.metadata.frontMatter.unlisted;
  return !excluded;
}

export async function createBlogFeedFiles({
  blogPosts: allBlogPosts,
  options,
  siteConfig,
  outDir,
  locale,
  contentPaths,
}: {
  blogPosts: BlogPost[];
  options: PluginOptions;
  siteConfig: DocusaurusConfig;
  outDir: string;
  locale: string;
  contentPaths: BlogContentPaths;
}): Promise<void> {
  const blogPosts = allBlogPosts.filter(shouldBeInFeed);

  const feed = await generateBlogFeed({
    blogPosts,
    options,
    siteConfig,
    outDir,
    locale,
  });

  const feedTypes = options.feedOptions.type;
  if (!feed || !feedTypes) {
    return;
  }

  await Promise.all(
    feedTypes.map((feedType) =>
      createBlogFeedFile({
        feed,
        feedType,
        generatePath: path.join(outDir, options.routeBasePath),
        feedOptions: options.feedOptions,
        contentPaths,
      }),
    ),
  );
}

export function createFeedHtmlHeadTags({
  context,
  options,
}: {
  context: LoadContext;
  options: PluginOptions;
}): HtmlTags {
  const feedTypes = options.feedOptions.type;
  if (!feedTypes) {
    return [];
  }
  const feedTitle = options.feedOptions.title ?? context.siteConfig.title;
  const feedsConfig = {
    rss: {
      type: 'application/rss+xml',
      path: 'rss.xml',
      title: `${feedTitle} RSS Feed`,
    },
    atom: {
      type: 'application/atom+xml',
      path: 'atom.xml',
      title: `${feedTitle} Atom Feed`,
    },
    json: {
      type: 'application/json',
      path: 'feed.json',
      title: `${feedTitle} JSON Feed`,
    },
  };
  const headTags: HtmlTags = [];

  feedTypes.forEach((feedType) => {
    const {
      type,
      path: feedConfigPath,
      title: feedConfigTitle,
    } = feedsConfig[feedType];

    headTags.push({
      tagName: 'link',
      attributes: {
        rel: 'alternate',
        type,
        href: normalizeUrl([
          context.siteConfig.baseUrl,
          options.routeBasePath,
          feedConfigPath,
        ]),
        title: feedConfigTitle,
      },
    });
  });

  return headTags;
}
