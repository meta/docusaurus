# Argos visual regression tests

We use [Argos CI](https://argos-ci.com) to detect visual regressions on Docusaurus.

This workspace can be run manually, but is generally run through the [Argos GitHub Action](../.github/workflows/argos.yml).

## Workflow overview

This workflow runs for `main` and PR branches, and add a commit status to each PR with a visual diff that we can easily inspect.

The workflow execute the 2 main steps below:

### Screenshots

- Build the website locally with `pnpm argos:build` (a variant of `pnpm build:website:fast`)
- Start the website server with `pnpm serve:website` on [http://localhost:3000](http://localhost:3000)
- Take screenshots of all pages found in `sitemap.xml` with Playwright
- Upload all screenshots to [Argos CI](https://argos-ci.com) using the [Playwright reporter](https://argos-ci.com/docs/reference/playwright)

### Text snapshots

- Rebuild - this time with HTML unminified/formatted.
- Upload [HTML/CSS/JS files, blog feeds (RSS/Atom/JSON) and the sitemap to also diff them on Argos](https://argos-ci.com/docs/learn/how-to-guides/visual-coverage/compare-non-image-files) using `pnpm argos:upload:text-snapshots`

## Run manually

Install the Playwright browser once:

```bash
pnpm --filter argos exec playwright install chromium
```

To run the screenshot step manually:

```bash
pnpm argos:build
pnpm argos:screenshot
```

To run the text-snapshots step manually:

```bash
pnpm argos:build:text-snapshots
pnpm argos:format:text-snapshots
pnpm argos:upload:text-snapshots
```

## How to modify

- Use [./tests/screenshot.spec.ts](./tests/screenshot.spec.ts) to customize the screenshots we take, eventually filter out some useless sitemap pages like versioned docs
- Use [./tests/screenshot.css](./tests/screenshot.css) to hide flaky CSS elements: iframe, video, gif...
