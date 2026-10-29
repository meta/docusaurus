/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {outputFile} from '@docusaurus/fs';

/**
 * Multiple versions may be published on the same day, causing the order to be
 * the reverse. Therefore, our publish time has a "fake hour" to order them.
 */
// TODO may leak small amount of memory in multi-locale builds
const publishTimes = new Set<string>();

type Author = {name: string; url: string; alias: string; imageURL: string};

type AuthorsMap = Record<string, Author>;

type ChangelogEntry = {
  title: string;
  content: string;
  authors: Author[];
};

function parseAuthor(committerLine: string): Author {
  const groups = committerLine.match(
    /- (?:(?<name>.*?) \()?\[@(?<alias>.*)\]\((?<url>.*?)\)\)?/,
  )!.groups as {name: string; alias: string; url: string};

  return {
    ...groups,
    name: groups.name ?? groups.alias,
    imageURL: `https://github.com/${groups.alias}.png`,
  };
}

function parseAuthors(content: string): Author[] {
  const committersContent = content.match(/## Committers: \d.*/s)?.[0];
  if (!committersContent) {
    return [];
  }
  const committersLines = committersContent.match(/- .*/g)!;

  const authors = committersLines
    .map(parseAuthor)
    .sort((a, b) => a.url.localeCompare(b.url));

  return authors;
}

function createAuthorsMap(changelogEntries: ChangelogEntry[]): AuthorsMap {
  const allAuthors = changelogEntries.flatMap((entry) => entry.authors);
  const authorsMap: AuthorsMap = {};
  allAuthors?.forEach((author) => {
    authorsMap[author.alias] = author;
  });
  return authorsMap;
}

function toChangelogEntry(sectionContent: string): ChangelogEntry | null {
  const title = sectionContent
    .match(/\n## .*/)?.[0]
    .trim()
    .replace('## ', '');
  if (!title) {
    return null;
  }
  const content = sectionContent
    .replace(/\n## .*/, '')
    .trim()
    .replace('running_woman', 'running');

  const authors = parseAuthors(content);

  let hour = 20;
  const date = title.match(/ \((?<date>.*)\)/)?.groups!.date;
  while (publishTimes.has(`${date}T${hour}:00`)) {
    hour -= 1;
  }
  publishTimes.add(`${date}T${hour}:00`);

  return {
    authors,
    title: title.replace(/ \(.*\)/, ''),
    content: `---
mdx:
 format: md
date: ${`${date}T${hour}:00`}${
      authors.length > 0
        ? `
authors:
${authors.map((author) => `  - '${author.alias}'`).join('\n')}`
        : ''
    }
---

# ${title.replace(/ \(.*\)/, '')}

<!-- truncate -->

${content.replace(/####/g, '##')}`,
  };
}

export function toChangelogEntries(filesContent: string[]): ChangelogEntry[] {
  return filesContent
    .flatMap((content) => content.split(/(?=\n## )/))
    .map(toChangelogEntry)
    .filter((s): s is ChangelogEntry => s !== null);
}

export async function createBlogFiles(
  generateDir: string,
  changelogEntries: ChangelogEntry[],
): Promise<void> {
  await Promise.all(
    changelogEntries.map((changelogEntry) =>
      outputFile(
        path.join(generateDir, `${changelogEntry.title}.md`),
        changelogEntry.content,
      ),
    ),
  );

  await outputFile(
    path.join(generateDir, 'authors.json'),
    JSON.stringify(createAuthorsMap(changelogEntries), null, 2),
  );
}
