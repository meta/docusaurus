/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import _ from 'lodash';
import logger from '@docusaurus/logger';
import {
  parseMarkdownFile,
  normalizeUrl,
  aliasedSitePath,
  getEditUrl,
  getFolderContainingFile,
  posixPath,
  groupTaggedItems,
  getTagVisibility,
  getContentPathList,
  isUnlisted,
  isDraft,
  readLastUpdateData,
  normalizeTags,
  aliasedSitePathToRelativePath,
} from '@docusaurus/utils';
import {glob} from '@docusaurus/glob';

import {fs, pathExists} from '@docusaurus/fs';
import {validateBlogPostFrontMatter} from './frontMatter';
import {getBlogPostAuthors} from './authors';
import {reportAuthorsProblems} from './authorsProblems';
import {calculateReadingTime} from './readingTime';
import type {TagsFile} from '@docusaurus/utils';
import type {LoadContext, ParseFrontMatter, VcsConfig} from '@docusaurus/types';
import type {
  AuthorsMap,
  PluginOptions,
  ReadingTimeFunction,
  BlogPost,
  BlogTags,
  BlogPaginated,
} from '@docusaurus/plugin-content-blog';
import type {BlogContentPaths} from './types';

export function truncate(fileString: string, truncateMarker: RegExp): string {
  return fileString.split(truncateMarker, 1).shift()!;
}

// Matches the destination of a Markdown inline link/image pointing to a bare
// in-page anchor, e.g. the "#anchor" in "[text](#anchor)" (an optional title or
// surrounding <> may follow). Other relative links (./x, ../x, x.md) are
// intentionally excluded: they are resolved elsewhere in the MDX pipeline.
const AnchorLinkTargetRegex = /(?<before>\]\(\s*<?)(?<hash>#[^\s)>]+)/g;

/**
 * In blog paginated list views (tags, authors, "/blog"...), a truncated post
 * preview is rendered under the list page URL, not under the post permalink.
 * A relative in-page anchor link such as `[jump](#section)` would then resolve
 * against the list page (e.g. `/blog#section`) and lead nowhere.
 *
 * This rebases bare `#anchor` link targets found in a truncated preview to the
 * post's own permalink, so those anchors keep pointing at the post in list
 * views. Only bare anchors are rewritten; other relative links are handled by
 * the regular MDX link-resolution plugins and are left untouched here.
 *
 * Note: like other string-level Markdown transforms in Docusaurus, this is a
 * best-effort pass and does not skip anchors written inside code spans/blocks.
 *
 * See https://github.com/facebook/docusaurus/issues/9731
 */
export function resolveTruncatedAnchorLinks(
  fileString: string,
  permalink: string,
): string {
  return fileString.replace(
    AnchorLinkTargetRegex,
    (match, before: string, hash: string) => `${before}${permalink}${hash}`,
  );
}

export function reportUntruncatedBlogPosts({
  blogPosts,
  onUntruncatedBlogPosts,
}: {
  blogPosts: BlogPost[];
  onUntruncatedBlogPosts: PluginOptions['onUntruncatedBlogPosts'];
}): void {
  const untruncatedBlogPosts = blogPosts.filter(
    (p) => !p.metadata.hasTruncateMarker,
  );
  if (onUntruncatedBlogPosts !== 'ignore' && untruncatedBlogPosts.length > 0) {
    const message = logger.interpolate`Docusaurus found blog posts without truncation markers:
- ${untruncatedBlogPosts
      .map((p) => logger.path(aliasedSitePathToRelativePath(p.metadata.source)))
      .join('\n- ')}

We recommend using truncation markers (code=${`<!-- truncate -->`} or code=${`{/* truncate */}`}) in blog posts to create shorter previews on blog paginated lists.
Tip: turn this security off with the code=${`onUntruncatedBlogPosts: 'ignore'`} blog plugin option.`;
    logger.report(onUntruncatedBlogPosts)(message);
  }
}

export function paginateBlogPosts({
  blogPosts,
  basePageUrl,
  blogTitle,
  blogDescription,
  postsPerPageOption,
  pageBasePath,
}: {
  blogPosts: BlogPost[];
  basePageUrl: string;
  blogTitle: string;
  blogDescription: string;
  postsPerPageOption: number | 'ALL';
  pageBasePath: string;
}): BlogPaginated[] {
  const totalCount = blogPosts.length;
  const postsPerPage =
    postsPerPageOption === 'ALL' ? totalCount : postsPerPageOption;
  const numberOfPages = Math.max(1, Math.ceil(totalCount / postsPerPage));

  const pages: BlogPaginated[] = [];

  function permalink(page: number) {
    return page > 0
      ? normalizeUrl([basePageUrl, pageBasePath, `${page + 1}`])
      : basePageUrl;
  }

  for (let page = 0; page < numberOfPages; page += 1) {
    pages.push({
      items: blogPosts
        .slice(page * postsPerPage, (page + 1) * postsPerPage)
        .map((item) => item.id),
      metadata: {
        permalink: permalink(page),
        page: page + 1,
        postsPerPage,
        totalPages: numberOfPages,
        totalCount,
        previousPage: page !== 0 ? permalink(page - 1) : undefined,
        nextPage: page < numberOfPages - 1 ? permalink(page + 1) : undefined,
        blogDescription,
        blogTitle,
      },
    });
  }

  return pages;
}

export function shouldBeListed(blogPost: BlogPost): boolean {
  return !blogPost.metadata.unlisted;
}

export function getBlogTags({
  blogPosts,
  ...params
}: {
  blogPosts: BlogPost[];
  blogTitle: string;
  blogDescription: string;
  postsPerPageOption: number | 'ALL';
  pageBasePath: string;
}): BlogTags {
  const groups = groupTaggedItems(
    blogPosts,
    (blogPost) => blogPost.metadata.tags,
  );
  return _.mapValues(groups, ({tag, items: tagBlogPosts}) => {
    const tagVisibility = getTagVisibility({
      items: tagBlogPosts,
      isUnlisted: (item) => item.metadata.unlisted,
    });
    return {
      inline: tag.inline,
      label: tag.label,
      permalink: tag.permalink,
      description: tag.description,
      items: tagVisibility.listedItems.map((item) => item.id),
      pages: paginateBlogPosts({
        blogPosts: tagVisibility.listedItems,
        basePageUrl: tag.permalink,
        ...params,
      }),
      unlisted: tagVisibility.unlisted,
    };
  });
}

const DATE_FILENAME_REGEX =
  /^(?<folder>.*)(?<date>\d{4}[-/]\d{1,2}[-/]\d{1,2})[-/]?(?<text>.*?)(?:\/index)?.mdx?$/;

type ParsedBlogFileName = {
  date: Date | undefined;
  text: string;
  slug: string;
};

export function parseBlogFileName(
  blogSourceRelative: string,
): ParsedBlogFileName {
  const dateFilenameMatch = blogSourceRelative.match(DATE_FILENAME_REGEX);
  if (dateFilenameMatch) {
    const {folder, text, date: dateString} = dateFilenameMatch.groups!;
    // Always treat dates as UTC by adding the `Z`
    const date = new Date(`${dateString!}Z`);
    const slugDate = dateString!.replace(/-/g, '/');
    const slug = `/${slugDate}/${folder!}${text!}`;
    return {date, text: text!, slug};
  }
  const text = blogSourceRelative.replace(/(?:\/index)?\.mdx?$/, '');
  const slug = `/${text}`;
  return {date: undefined, text, slug};
}

export function parseFrontMatterDate(date: string | Date): Date {
  if (typeof date === 'string') {
    const dateString = date.trim();
    // Detect a timezone suffix in the time portion, not the date's day/year.
    // YAML timestamps allow tabs and short offsets; also accept ISO +/-HHMM.
    // https://yaml.org/type/timestamp.html
    // This detects a timezone, not date validity (already checked by Joi).
    const hasTimeZone = /[t \t]\d.*(?:z|[+-]\d{1,2}(?::?\d{2})?)$/i.test(
      dateString,
    );
    // Treat dates without an explicit timezone as UTC.
    return new Date(hasTimeZone ? dateString : `${dateString}Z`);
  }
  // Custom front matter parsers can still return Date objects.
  return date;
}

export async function getBlogPostDate({
  frontMatterDate,
  filenameDate,
  filePath,
  vcs,
}: {
  frontMatterDate?: string | Date;
  filenameDate?: Date;
  filePath: string;
  vcs: VcsConfig;
}): Promise<Date> {
  // Prefer front matter, then the filename, then the file creation date.
  if (frontMatterDate) {
    return parseFrontMatterDate(frontMatterDate);
  } else if (filenameDate) {
    return filenameDate;
  }

  const result = await vcs.getFileCreationInfo(filePath);
  if (result == null) {
    return (await fs.stat(filePath)).birthtime;
  }
  return new Date(result.timestamp);
}

async function parseBlogPostMarkdownFile({
  filePath,
  parseFrontMatter,
}: {
  filePath: string;
  parseFrontMatter: ParseFrontMatter;
}) {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  try {
    const result = await parseMarkdownFile({
      filePath,
      fileContent,
      parseFrontMatter,
      removeContentTitle: true,
    });
    return {
      ...result,
      frontMatter: validateBlogPostFrontMatter(result.frontMatter),
    };
  } catch (err) {
    logger.error`Error while parsing blog post file path=${filePath}.`;
    throw err;
  }
}

const defaultReadingTime: ReadingTimeFunction = ({content, locale, options}) =>
  calculateReadingTime(content, locale, options);

async function processBlogSourceFile(
  blogSourceRelative: string,
  contentPaths: BlogContentPaths,
  context: LoadContext,
  options: PluginOptions,
  tagsFile: TagsFile | null,
  authorsMap?: AuthorsMap,
): Promise<BlogPost | undefined> {
  const {
    siteConfig: {
      baseUrl,
      markdown: {parseFrontMatter},
      vcs,
    },
    siteDir,
    i18n,
  } = context;
  const {
    routeBasePath,
    tagsBasePath: tagsRouteBasePath,
    truncateMarker,
    showReadingTime,
    editUrl,
  } = options;

  // Lookup in localized folder in priority
  const blogDirPath = await getFolderContainingFile(
    getContentPathList(contentPaths),
    blogSourceRelative,
  );

  const blogSourceAbsolute = path.join(blogDirPath, blogSourceRelative);

  const {frontMatter, content, contentTitle, excerpt} =
    await parseBlogPostMarkdownFile({
      filePath: blogSourceAbsolute,
      parseFrontMatter,
    });

  const aliasedSource = aliasedSitePath(blogSourceAbsolute, siteDir);

  const lastUpdate = await readLastUpdateData(
    blogSourceAbsolute,
    options,
    frontMatter.last_update,
    vcs,
  );

  const draft = isDraft({frontMatter});
  const unlisted = isUnlisted({frontMatter});

  if (draft) {
    return undefined;
  }

  const parsedBlogFileName = parseBlogFileName(blogSourceRelative);

  const date = await getBlogPostDate({
    frontMatterDate: frontMatter.date,
    filenameDate: parsedBlogFileName.date,
    filePath: blogSourceAbsolute,
    vcs,
  });

  const title = frontMatter.title ?? contentTitle ?? parsedBlogFileName.text;
  const description = frontMatter.description ?? excerpt ?? '';

  const slug = frontMatter.slug ?? parsedBlogFileName.slug;

  const permalink = normalizeUrl([baseUrl, routeBasePath, slug]);

  function getBlogEditUrl() {
    const blogPathRelative = path.relative(
      blogDirPath,
      path.resolve(blogSourceAbsolute),
    );

    if (typeof editUrl === 'function') {
      return editUrl({
        blogDirPath: posixPath(path.relative(siteDir, blogDirPath)),
        blogPath: posixPath(blogPathRelative),
        permalink,
        locale: i18n.currentLocale,
      });
    } else if (typeof editUrl === 'string') {
      const isLocalized = blogDirPath === contentPaths.contentPathLocalized;
      const fileContentPath =
        isLocalized &&
        options.editLocalizedFiles &&
        contentPaths.contentPathLocalized
          ? contentPaths.contentPathLocalized
          : contentPaths.contentPath;

      const contentPathEditUrl = normalizeUrl([
        editUrl,
        posixPath(path.relative(siteDir, fileContentPath)),
      ]);

      return getEditUrl(blogPathRelative, contentPathEditUrl);
    }
    return undefined;
  }

  const tagsBaseRoutePath = normalizeUrl([
    baseUrl,
    routeBasePath,
    tagsRouteBasePath,
  ]);

  const authors = getBlogPostAuthors({authorsMap, frontMatter, baseUrl});
  reportAuthorsProblems({
    authors,
    blogSourceRelative,
    options,
  });

  const tags = normalizeTags({
    options,
    source: blogSourceRelative,
    frontMatterTags: frontMatter.tags,
    tagsBaseRoutePath,
    tagsFile,
  });

  return {
    id: slug,
    metadata: {
      permalink,
      editUrl: getBlogEditUrl(),
      source: aliasedSource,
      title,
      description,
      date,
      tags,
      readingTime: showReadingTime
        ? options.readingTime({
            content,
            frontMatter,
            defaultReadingTime,
            locale: i18n.currentLocale,
          })
        : undefined,
      hasTruncateMarker: truncateMarker.test(content),
      authors,
      frontMatter,
      unlisted,
      lastUpdatedAt: lastUpdate.lastUpdatedAt,
      lastUpdatedBy: lastUpdate.lastUpdatedBy,
    },
    content,
  };
}

export async function generateBlogPosts(
  contentPaths: BlogContentPaths,
  context: LoadContext,
  options: PluginOptions,
  tagsFile: TagsFile | null,
  authorsMap?: AuthorsMap,
): Promise<BlogPost[]> {
  const {include, exclude} = options;

  if (!(await pathExists(contentPaths.contentPath))) {
    return [];
  }

  const blogSourceFiles = await glob(include, {
    cwd: contentPaths.contentPath,
    ignore: exclude,
  });

  async function doProcessBlogSourceFile(blogSourceFile: string) {
    try {
      return await processBlogSourceFile(
        blogSourceFile,
        contentPaths,
        context,
        options,
        tagsFile,
        authorsMap,
      );
    } catch (err) {
      throw new Error(
        `Processing of blog source file path=${blogSourceFile} failed.`,
        {cause: err},
      );
    }
  }

  const blogPosts = (
    await Promise.all(blogSourceFiles.map(doProcessBlogSourceFile))
  ).filter(Boolean) as BlogPost[];

  blogPosts.sort(
    (a, b) => b.metadata.date.getTime() - a.metadata.date.getTime(),
  );

  if (options.sortPosts === 'ascending') {
    return blogPosts.reverse();
  }
  return blogPosts;
}

export async function applyProcessBlogPosts({
  blogPosts,
  processBlogPosts,
}: {
  blogPosts: BlogPost[];
  processBlogPosts: PluginOptions['processBlogPosts'];
}): Promise<BlogPost[]> {
  const processedBlogPosts = await processBlogPosts({blogPosts});

  if (Array.isArray(processedBlogPosts)) {
    return processedBlogPosts;
  }

  return blogPosts;
}
