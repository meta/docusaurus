/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import fs from 'fs-extra';
import {flattenRoutes, parseMarkdownFile} from '@docusaurus/utils';
import type {ParseFrontMatter, Plugin, RouteConfig} from '@docusaurus/types';

type AgentDocsEntry = {
  routePath: string;
  markdownRoutePath: string;
  markdownUrl: string;
  sourceFilePath: string;
  title: string;
  section: string;
};

type PreparedMarkdown = {
  markdown: string;
  title: string;
};

const SectionOrder = ['Docs', 'Community', 'Blog', 'Changelog', 'Pages'];
const SectionOrderSet = new Set(SectionOrder);
const MarkdownSourcePattern = /\.(?:md|mdx)$/i;

function isSourceBackedRoute(
  route: RouteConfig,
): route is RouteConfig & {metadata: {sourceFilePath: string}} {
  return typeof route.metadata?.sourceFilePath === 'string';
}

function stripBaseUrl(routePath: string, baseUrl: string): string {
  if (baseUrl === '/' || baseUrl === '') {
    return routePath;
  }

  const normalizedBaseUrl = baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl;

  if (!routePath.startsWith(normalizedBaseUrl)) {
    return routePath;
  }

  const stripped = routePath.slice(normalizedBaseUrl.length);
  return stripped === '' ? '/' : stripped;
}

function getSection(routePath: string, baseUrl: string): string {
  const routeWithoutBaseUrl = stripBaseUrl(routePath, baseUrl);

  if (
    routeWithoutBaseUrl === '/docs' ||
    routeWithoutBaseUrl.startsWith('/docs/')
  ) {
    return 'Docs';
  }
  if (
    routeWithoutBaseUrl === '/community' ||
    routeWithoutBaseUrl.startsWith('/community/')
  ) {
    return 'Community';
  }
  if (
    routeWithoutBaseUrl === '/blog' ||
    routeWithoutBaseUrl.startsWith('/blog/')
  ) {
    return 'Blog';
  }
  if (
    routeWithoutBaseUrl === '/changelog' ||
    routeWithoutBaseUrl.startsWith('/changelog/')
  ) {
    return 'Changelog';
  }
  return 'Pages';
}

function toMarkdownRoutePath(routePath: string): string {
  const normalizedRoutePath =
    routePath !== '/' && routePath.endsWith('/')
      ? routePath.slice(0, -1)
      : routePath;

  return normalizedRoutePath === '/'
    ? '/index.md'
    : `${normalizedRoutePath}.md`;
}

function toOutputFilePath(outDir: string, routePath: string): string {
  return path.join(outDir, routePath.replace(/^\//, ''));
}

function toAbsoluteUrl(siteUrl: string, routePath: string): string {
  return new URL(routePath, siteUrl).toString();
}

function toBaseUrlPath(baseUrl: string, filename: string): string {
  const normalizedBaseUrl = baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '');
  return `${normalizedBaseUrl}/${filename}`.replace(/\/+/g, '/');
}

function toIndexUrl(
  siteUrl: string,
  baseUrl: string,
  filename: string,
): string {
  return toAbsoluteUrl(siteUrl, toBaseUrlPath(baseUrl, filename));
}

function fallbackTitle(routePath: string): string {
  if (routePath === '/' || routePath === '') {
    return 'Home';
  }

  const segment = routePath
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .split('/')
    .filter(Boolean)
    .at(-1);

  return segment ?? 'Page';
}

async function prepareMarkdownFromSource({
  filePath,
  sourceFilePath,
  routePath,
  htmlUrl,
  parseFrontMatter,
}: {
  filePath: string;
  sourceFilePath: string;
  routePath: string;
  htmlUrl: string;
  parseFrontMatter: ParseFrontMatter;
}): Promise<PreparedMarkdown> {
  if (!MarkdownSourcePattern.test(sourceFilePath)) {
    const title = fallbackTitle(routePath);
    return {
      title,
      markdown: [
        `# ${title}`,
        '',
        `Canonical URL: ${htmlUrl}`,
        '',
        'This page is implemented as a React page, so there is no source Markdown file to expose directly.',
        '',
        `Source file: \`${sourceFilePath}\``,
        '',
      ].join('\n'),
    };
  }

  const fileContent = await fs.readFile(filePath, 'utf-8');
  const parsed = await parseMarkdownFile({
    filePath,
    fileContent,
    parseFrontMatter,
  });

  const title =
    typeof parsed.frontMatter.title === 'string'
      ? parsed.frontMatter.title
      : parsed.contentTitle ?? fallbackTitle(routePath);

  let markdown = parsed.content.trim();

  if (title && !markdown.startsWith('# ')) {
    markdown = `# ${title}\n\n${markdown}`;
  }

  return {
    title,
    markdown: `${markdown.trim()}\n`,
  };
}

function buildGroupedIndex(entries: AgentDocsEntry[]): string[] {
  const groupedEntries = new Map<string, AgentDocsEntry[]>();

  entries.forEach((entry) => {
    const existing = groupedEntries.get(entry.section) ?? [];
    existing.push(entry);
    groupedEntries.set(entry.section, existing);
  });

  const orderedSections = [
    ...SectionOrder.filter((section) => groupedEntries.has(section)),
    ...[...groupedEntries.keys()].filter(
      (section) => !SectionOrderSet.has(section),
    ),
  ];

  return orderedSections.flatMap((section) => {
    const sectionEntries = groupedEntries
      .get(section)!
      .sort((left, right) => left.routePath.localeCompare(right.routePath));

    return [
      `## ${section}`,
      ...sectionEntries.map(
        (entry) => `- [${entry.title}](${entry.markdownUrl})`,
      ),
      '',
    ];
  });
}

function buildSummaryIndex({
  siteTitle,
  siteUrl,
  baseUrl,
  entries,
}: {
  siteTitle: string;
  siteUrl: string;
  baseUrl: string;
  entries: AgentDocsEntry[];
}): string {
  const groupedEntries = new Map<string, AgentDocsEntry[]>();

  entries.forEach((entry) => {
    const existing = groupedEntries.get(entry.section) ?? [];
    existing.push(entry);
    groupedEntries.set(entry.section, existing);
  });

  const sectionFiles = [
    {section: 'Docs', filename: 'llms-docs.txt'},
    {section: 'Community', filename: 'llms-community.txt'},
    {section: 'Blog', filename: 'llms-blog.txt'},
    {section: 'Changelog', filename: 'llms-changelog.txt'},
    {section: 'Pages', filename: 'llms-pages.txt'},
  ].filter((entry) => groupedEntries.has(entry.section));

  const lines = [
    `# ${siteTitle}`,
    '',
    `> Agent-readable index for ${siteTitle}.`,
    '',
    'Append `.md` to a canonical page URL to retrieve the markdown form published by this build when it exists.',
    '',
    '## Indexes',
    `- [Full index](${toIndexUrl(siteUrl, baseUrl, 'llms-full.txt')})`,
    ...sectionFiles.map(
      ({section, filename}) =>
        `- [${section}](${toIndexUrl(siteUrl, baseUrl, filename)})`,
    ),
    '',
  ];

  SectionOrder.forEach((section) => {
    const sectionEntries = groupedEntries.get(section);
    if (!sectionEntries || sectionEntries.length === 0) {
      return;
    }

    lines.push(`## ${section}`);
    sectionEntries
      .sort((left, right) => left.routePath.localeCompare(right.routePath))
      .slice(0, 8)
      .forEach((entry) => {
        lines.push(`- [${entry.title}](${entry.markdownUrl})`);
      });
    lines.push('');
  });

  return `${lines.join('\n').trim()}\n`;
}

function buildSectionIndex({
  siteTitle,
  section,
  entries,
}: {
  siteTitle: string;
  section: string;
  entries: AgentDocsEntry[];
}): string {
  return [
    `# ${siteTitle} ${section}`,
    '',
    `> Agent-readable ${section.toLowerCase()} index for ${siteTitle}.`,
    '',
    ...buildGroupedIndex(entries),
  ]
    .join('\n')
    .trim()
    .concat('\n');
}

function buildFullIndex({
  siteTitle,
  entries,
}: {
  siteTitle: string;
  entries: AgentDocsEntry[];
}): string {
  return [
    `# ${siteTitle} Full Index`,
    '',
    `> Agent-readable full index for ${siteTitle}.`,
    '',
    ...buildGroupedIndex(entries),
  ]
    .join('\n')
    .trim()
    .concat('\n');
}

const AgentDocsPlugin: Plugin = {
  name: 'agent-docs-plugin',

  async postBuild(props) {
    const {outDir, routes, routesBuildMetadata, siteDir, siteConfig, baseUrl} =
      props;
    const preparedMarkdownBySource = new Map<
      string,
      Promise<PreparedMarkdown>
    >();

    const allRoutes = flattenRoutes(routes)
      .filter(isSourceBackedRoute)
      .filter((route) => route.path !== '/404.html')
      .filter((route) => !routesBuildMetadata[route.path]?.noIndex);

    const entries = await Promise.all(
      allRoutes.map(async (route) => {
        const sourceFilePath = route.metadata.sourceFilePath;
        const absoluteSourceFilePath = path.join(siteDir, sourceFilePath);
        const markdownRoutePath = toMarkdownRoutePath(route.path);
        const markdownUrl = toAbsoluteUrl(siteConfig.url, markdownRoutePath);
        const htmlUrl = toAbsoluteUrl(siteConfig.url, route.path);

        let preparedMarkdown = preparedMarkdownBySource.get(sourceFilePath);
        if (!preparedMarkdown) {
          preparedMarkdown = prepareMarkdownFromSource({
            filePath: absoluteSourceFilePath,
            sourceFilePath,
            routePath: route.path,
            htmlUrl,
            parseFrontMatter: siteConfig.markdown.parseFrontMatter,
          });
          preparedMarkdownBySource.set(sourceFilePath, preparedMarkdown);
        }

        const prepared = await preparedMarkdown;
        const outputFilePath = toOutputFilePath(outDir, markdownRoutePath);
        await fs.ensureDir(path.dirname(outputFilePath));
        await fs.writeFile(outputFilePath, prepared.markdown);

        return {
          routePath: route.path,
          markdownRoutePath,
          markdownUrl,
          sourceFilePath,
          title: prepared.title,
          section: getSection(route.path, baseUrl),
        } satisfies AgentDocsEntry;
      }),
    );

    const sortedEntries = entries.sort((left, right) =>
      left.routePath.localeCompare(right.routePath),
    );

    const groupedEntries = new Map<string, AgentDocsEntry[]>();
    sortedEntries.forEach((entry) => {
      const existing = groupedEntries.get(entry.section) ?? [];
      existing.push(entry);
      groupedEntries.set(entry.section, existing);
    });

    await fs.writeFile(
      path.join(outDir, 'llms.txt'),
      buildSummaryIndex({
        siteTitle: siteConfig.title,
        siteUrl: siteConfig.url,
        baseUrl,
        entries: sortedEntries,
      }),
    );

    await fs.writeFile(
      path.join(outDir, 'llms-full.txt'),
      buildFullIndex({siteTitle: siteConfig.title, entries: sortedEntries}),
    );

    await Promise.all(
      [...groupedEntries.entries()].map(async ([section, sectionEntries]) => {
        await fs.writeFile(
          path.join(outDir, `llms-${section.toLowerCase()}.txt`),
          buildSectionIndex({
            siteTitle: siteConfig.title,
            section,
            entries: sectionEntries,
          }),
        );
      }),
    );
  },
};

export default function pluginAgentDocs(): Plugin {
  return AgentDocsPlugin;
}
