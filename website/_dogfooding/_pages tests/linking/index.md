---
title: Markdown Linking Test
description: Test pages to verify markdown file path links work in the pages plugin
---

# Linking Test

This folder contains test pages to verify markdown file path links work correctly in the `@docusaurus/plugin-content-pages`.

## Relative file path links

- [`./index.md`](./index.md)
- [`./page-a.md`](./page-a.md)
- [`./nested/page-b.md`](./nested/page-b.md)

## Absolute file path links

- [`/index.md`](/linking/index.md)
- [`/page-a.md`](/linking/page-a.md)
- [`/nested/page-b.md`](/linking/nested/page-b.md)

## Cross-plugin file path links

Links to Markdown files owned by another plugin, see [#9117](https://github.com/facebook/docusaurus/issues/9117)

- [`../../_docs tests/tests/links/target.mdx`](<../../_docs tests/tests/links/target.mdx>)
- [`../../_blog tests/2023-08-05.mdx`](<../../_blog tests/2023-08-05.mdx>)
- [`../../../docs/introduction.mdx`](../../../docs/introduction.mdx)
- [`/docs/introduction.mdx`](/docs/introduction.mdx)

## Site alias file path links

- [`@site/_dogfooding/_pages tests/linking/index.md`](<@site/_dogfooding/_pages tests/linking/index.md>)
- [`@site/_dogfooding/_pages tests/linking/page-a.md`](<@site/_dogfooding/_pages tests/linking/page-a.md>)
- [`@site/_dogfooding/_pages tests/linking/nested/page-b.md`](<@site/_dogfooding/_pages tests/linking/nested/page-b.md>)
