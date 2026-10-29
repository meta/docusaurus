# Docusaurus Changelog

## 3.10.2 (2026-07-10)

Backport and cherry-pick commits from main for v3.10.2 patch release:

- [fix(bundler): do not import `@swc/html`, fix StackBlitz playground \#12055](https://github.com/facebook/docusaurus/pull/12055)
- [fix(core): use locale url in site config \#12054](https://github.com/facebook/docusaurus/pull/12054)
- [fix(theme-classic): remove redundant sidebar label titles \#11966](https://github.com/facebook/docusaurus/pull/11966)
- [fix(mdx-loader): avoid transforming dotted directory links into asset… \#11944](https://github.com/facebook/docusaurus/pull/11944)
- [fix(dev-server): for HTTPS, support non-RSA TLS certs \#12065](https://github.com/facebook/docusaurus/pull/12065)
- [fix(utils): fix `extractLeadingEmoji()` edge cases \#12100](https://github.com/facebook/docusaurus/pull/12100)
- [fix(gtag.js, faster): Fix StackBlitz, vendor `@types/gtag.js`, upgrade `@swc/html` \#12080](https://github.com/facebook/docusaurus/pull/12080)
- [fix(create-docusaurus): init template README should use npm commands by default \#12138](https://github.com/facebook/docusaurus/pull/12138)
- [fix(cli): `docusaurus serve` should pass `--host` to `server.listen()` \#12127](https://github.com/facebook/docusaurus/pull/12127)
- [fix(core): bump detect-port to v2.1, fix pnpm `trustPolicy` downgrade issue \#12012](https://github.com/facebook/docusaurus/pull/12012)
- [fix(i18n): complete Spanish translations for theme-common and theme-l… \#12180](https://github.com/facebook/docusaurus/pull/12180)
- [chore(deps): migrate to `@11ty/gray-matter` \#12181](https://github.com/facebook/docusaurus/pull/12181)
- [fix(core): fix BaseUrlIssueBanner little security issue \#12260](https://github.com/facebook/docusaurus/pull/12260)
- [fix(core): accept boolean attributes in headTags config validation \#12238](https://github.com/facebook/docusaurus/pull/12238)
- [fix(sitemap): don't drop lastmod for an epoch (0) timestamp \#12212](https://github.com/facebook/docusaurus/pull/12212)
- [fix(utils): preserve author names containing commas in git log parsing \#12069](https://github.com/facebook/docusaurus/pull/12069)

## 3.10.1 (2026-04-30)

#### :bug: Bug Fix

- `docusaurus-bundler`
  - [#11981](https://github.com/facebook/docusaurus/pull/11981) fix(bundler): fix v3 webpackbar bug due to webpack breaking change ([@slorber](https://github.com/slorber))

#### :wrench: Maintenance

- `docusaurus`
  - [#11982](https://github.com/facebook/docusaurus/pull/11982) chore: cherry-pick commits for v3.10.1 patch release ([@slorber](https://github.com/slorber))

#### Committers: 1

- Sébastien Lorber ([@slorber](https://github.com/slorber))

## 3.10.0 (2026-04-07)

#### :rocket: New Feature

- `docusaurus-types`, `docusaurus`
  - [#11896](https://github.com/facebook/docusaurus/pull/11896) feat(core): add `future.v4.mdx1CompatDisabledByDefault` flag ([@slorber](https://github.com/slorber))
  - [#11797](https://github.com/facebook/docusaurus/pull/11797) feat(core): promote `siteConfig.storage` to stable + add `future.v4.siteStorageNamespacing` flag [Claude] ([@slorber](https://github.com/slorber))
  - [#11571](https://github.com/facebook/docusaurus/pull/11571) feat(core): support custom html elements in head tags ([@lebalz](https://github.com/lebalz))
- `create-docusaurus`
  - [#11897](https://github.com/facebook/docusaurus/pull/11897) feat(create-docusaurus): update init template to `.mdx` extension and strict MDX syntax ([@slorber](https://github.com/slorber))
  - [#11696](https://github.com/facebook/docusaurus/pull/11696) feat(create-docusaurus): Newly initialized TS sites should use "strict: true" ([@slorber](https://github.com/slorber))
  - [#11611](https://github.com/facebook/docusaurus/pull/11611) feat(create-docusaurus): enable creation in current directory ([@Mcheung7272](https://github.com/Mcheung7272))
- Other
  - [#11874](https://github.com/facebook/docusaurus/pull/11874) feat(ci): improve npm supply chain security - improve Dependabot config ([@slorber](https://github.com/slorber))
  - [#11712](https://github.com/facebook/docusaurus/pull/11712) feat(publish): Use trusted publishing (OIDC) for canary releases ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-bundler`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-pwa`, `docusaurus-types`, `docusaurus`
  - [#11802](https://github.com/facebook/docusaurus/pull/11802) feat(core): Docusaurus Faster is stable + v4 future flag turns it on by default ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`, `docusaurus-utils`, `docusaurus`
  - [#11777](https://github.com/facebook/docusaurus/pull/11777) feat(cli): `write-heading-ids` CLI now supports the `--syntax` and `--migrate` options ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`
  - [#11755](https://github.com/facebook/docusaurus/pull/11755) feat(mdx-loader): add support for explicit `headingId` based on MD/MDX comments ([@slorber](https://github.com/slorber))
- `docusaurus-theme-live-codeblock`, `docusaurus-theme-translations`
  - [#11675](https://github.com/facebook/docusaurus/pull/11675) feat(theme-live-codeblock): reset button + wire `position` prop ([@NPX2218](https://github.com/NPX2218))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#11734](https://github.com/facebook/docusaurus/pull/11734) feat(theme): Split `<DocCard>`, improve extensibility, better handling of emoji icons, stable classNames ([@slorber](https://github.com/slorber))
  - [#11733](https://github.com/facebook/docusaurus/pull/11733) feat(theme): Use React context for `<Tabs>`, allow custom `<TabItem>` components ([@slorber](https://github.com/slorber))
- `docusaurus-faster`, `docusaurus`
  - [#11715](https://github.com/facebook/docusaurus/pull/11715) feat(bundler): upgrade to Rspack 1.7, remove useless experimental feature flags ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-pages`
  - [#11666](https://github.com/facebook/docusaurus/pull/11666) feat(pages): add support for Markdown file path links ([@VedantMadane](https://github.com/VedantMadane))
- `docusaurus-mdx-loader`, `docusaurus-theme-classic`
  - [#11642](https://github.com/facebook/docusaurus/pull/11642) feat(mdx-loader): add admonitions directive support for class/id shortcuts ([@lebalz](https://github.com/lebalz))
- `docusaurus-theme-classic`
  - [#11635](https://github.com/facebook/docusaurus/pull/11635) feat(theme): add MDXComponents/Li to swizzle config ([@moskalakamil](https://github.com/moskalakamil))
- `docusaurus-theme-search-algolia`
  - [#11581](https://github.com/facebook/docusaurus/pull/11581) feat(theme-search-algolia): allow overriding transformSearchClient ([@hugohaggmark](https://github.com/hugohaggmark))
  - [#11541](https://github.com/facebook/docusaurus/pull/11541) feat(theme-search-algolia): add support for DocSearch v4.3.2 and new Suggested Questions ([@NatanTechofNY](https://github.com/NatanTechofNY))
- `create-docusaurus`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-sitemap`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#11512](https://github.com/facebook/docusaurus/pull/11512) feat(core): New siteConfig `future.experimental_vcs` API + `future.experimental_faster.gitEagerVcs` flag ([@slorber](https://github.com/slorber))

#### :bug: Bug Fix

- `docusaurus`
  - [#11844](https://github.com/facebook/docusaurus/pull/11844) fix(core): fix `url.resolve()` Node.js deprecation warning ([@slorber](https://github.com/slorber))
  - [#11833](https://github.com/facebook/docusaurus/pull/11833) fix(core): upgrade serve handler min version to for upgrade users to a secure version ([@BearAlliance](https://github.com/BearAlliance))
  - [#11763](https://github.com/facebook/docusaurus/pull/11763) fix(cli): fix `write-heading-ids` CLI when no files provided ([@slorber](https://github.com/slorber))
  - [#11693](https://github.com/facebook/docusaurus/pull/11693) fix(core): Remove deprecated experiments.lazyBarrel config for RsPack ([@VedikaGupt](https://github.com/VedikaGupt))
  - [#11604](https://github.com/facebook/docusaurus/pull/11604) fix(core): webpack aliases shouldn't be created for test files and typedefs ([@slorber](https://github.com/slorber))
  - [#11603](https://github.com/facebook/docusaurus/pull/11603) fix(core): Fix openBrowser AppleScript support for Arc ([@slorber](https://github.com/slorber))
  - [#11579](https://github.com/facebook/docusaurus/pull/11579) fix(core): in `isInternalUrl()`, URI protocol scheme detection should implement the spec more strictly ([@slorber](https://github.com/slorber))
  - [#11550](https://github.com/facebook/docusaurus/pull/11550) fix(core): optimize i18n integration for site builds + improve inference of locale config ([@slorber](https://github.com/slorber))
- `docusaurus-faster`, `docusaurus`
  - [#11817](https://github.com/facebook/docusaurus/pull/11817) fix(faster): upgrade Rspack, fix Yarn PnP support ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-logger`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-google-gtag`, `docusaurus-plugin-pwa`, `docusaurus`
  - [#11843](https://github.com/facebook/docusaurus/pull/11843) fix(create-docusaurus): fix support for TypeScript 6.0 + fix our CI ([@slorber](https://github.com/slorber))
- `docusaurus-utils`
  - [#11804](https://github.com/facebook/docusaurus/pull/11804) fix(utils): Git Eager VSC should have better DX ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`
  - [#11796](https://github.com/facebook/docusaurus/pull/11796) fix(theme): restore copy-text-to-clipboard as lazy fallback for non-secure contexts ([@dmoranp](https://github.com/dmoranp))
  - [#11513](https://github.com/facebook/docusaurus/pull/11513) fix(a11y): add Space key support for navbar dropdowns ([@TheCyperpunk](https://github.com/TheCyperpunk))
  - [#11565](https://github.com/facebook/docusaurus/pull/11565) fix(theme): Change code block line from span to div, fix Firefox text selection/copy bug ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-docs`
  - [#11794](https://github.com/facebook/docusaurus/pull/11794) fix(content-docs): translate generated-index category titles in pagination links ([@dmoranp](https://github.com/dmoranp))
  - [#11743](https://github.com/facebook/docusaurus/pull/11743) fix(content-docs): use category key for generated-index translation lookup ([@4RH1T3CT0R7](https://github.com/4RH1T3CT0R7))
  - [#11616](https://github.com/facebook/docusaurus/pull/11616) fix(docs): breadcrumb APIs only return category/docs items, ignoring links ([@Chesars](https://github.com/Chesars))
- `docusaurus-plugin-google-gtag`
  - [#11770](https://github.com/facebook/docusaurus/pull/11770) fix(create-docusaurus): update @types/gtag.js to 0.0.20 ([@fresh3nough](https://github.com/fresh3nough))
- `docusaurus-theme-search-algolia`
  - [#11683](https://github.com/facebook/docusaurus/pull/11683) fix(algolia): upgrade to DocSearch 4.5 + fix types ([@slorber](https://github.com/slorber))
  - [#11560](https://github.com/facebook/docusaurus/pull/11560) fix(theme-search-algolia): preserve query strings in useSearchResultUrlProcessor ([@pyrytakala](https://github.com/pyrytakala))
- `docusaurus-plugin-content-blog`
  - [#11736](https://github.com/facebook/docusaurus/pull/11736) fix(content-blog): fix wrong path variable in feed XSLT CSS file validation ([@akshatsinha0](https://github.com/akshatsinha0))
  - [#11577](https://github.com/facebook/docusaurus/pull/11577) fix(blog): Fix author paginated page url: `/blog/authors/<author>/page/2` ([@slorber](https://github.com/slorber))
  - [#11562](https://github.com/facebook/docusaurus/pull/11562) chore(blog): refactor blog Content, remove useless `blogListPaginated` attribute ([@slorber](https://github.com/slorber))
  - [#11559](https://github.com/facebook/docusaurus/pull/11559) fix(content-blog): filter unlisted posts from author pages ([@pyrytakala](https://github.com/pyrytakala))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#11713](https://github.com/facebook/docusaurus/pull/11713) fix(a11y): remove `useKeyboardNavigation` hook ([@nmggithub](https://github.com/nmggithub))
- `docusaurus-plugin-ideal-image`
  - [#11659](https://github.com/facebook/docusaurus/pull/11659) fix(ideal-image): `<IdealImage>` should forward remaining props to the underlying component ([@tempoz](https://github.com/tempoz))
- `eslint-plugin`
  - [#11587](https://github.com/facebook/docusaurus/pull/11587) fix(eslint-plugin): specify exact type of `no-untranslated-text` rule options ([@andreww2012](https://github.com/andreww2012))
- `docusaurus-mdx-loader`
  - [#11530](https://github.com/facebook/docusaurus/pull/11530) fix(mdx-loader): fix url.parse deprecation warning on Node 24+ ([@kou029w](https://github.com/kou029w))
- `docusaurus-bundler`, `docusaurus-faster`, `docusaurus-theme-mermaid`
  - [#11496](https://github.com/facebook/docusaurus/pull/11496) fix(faster): fix server build SWC / browserslist node target ([@slorber](https://github.com/slorber))

#### :zap: Performance

- `docusaurus-plugin-content-blog`
  - [#11707](https://github.com/facebook/docusaurus/pull/11707) refactor(content-blog): decouple getTagsFile from generateBlogPosts ([@garry00107](https://github.com/garry00107))
- `create-docusaurus`, `docusaurus-utils`, `docusaurus`
  - [#11684](https://github.com/facebook/docusaurus/pull/11684) refactor(create-docusaurus): remove useless dependencies (docusaurus-utils, execa, fs-extra) + simplify some code ([@slorber](https://github.com/slorber))
- `create-docusaurus`
  - [#11653](https://github.com/facebook/docusaurus/pull/11653) refactor(create-docusaurus): replace lodash with native implementation ([@torresgol10](https://github.com/torresgol10))

#### :memo: Documentation

- `docusaurus`
  - [#11779](https://github.com/facebook/docusaurus/pull/11779) chore(website): migrate MDX heading ids to comment syntax + upgrade Crowdin parser version ([@slorber](https://github.com/slorber))
- Other
  - [#11784](https://github.com/facebook/docusaurus/pull/11784) docs(website): change recommended syntax for math equations ([@slorber](https://github.com/slorber))
  - [#11623](https://github.com/facebook/docusaurus/pull/11623) docs: Add expose-markdown-docusaurus-plugin resource ([@FlyNumber](https://github.com/FlyNumber))

#### :robot: Dependencies

- Other
  - [#11886](https://github.com/facebook/docusaurus/pull/11886) chore(deps): bump react-json-view-lite from 2.3.0 to 2.5.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11885](https://github.com/facebook/docusaurus/pull/11885) chore(deps): bump postcss from 8.5.4 to 8.5.8 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11888](https://github.com/facebook/docusaurus/pull/11888) chore(deps): bump lodash from 4.17.23 to 4.18.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11882](https://github.com/facebook/docusaurus/pull/11882) chore(deps): bump @babel/core from 7.28.6 to 7.29.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11880](https://github.com/facebook/docusaurus/pull/11880) chore(deps): bump fs-extra and @types/fs-extra ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11861](https://github.com/facebook/docusaurus/pull/11861) chore(deps): bump preactjs/compressed-size-action from 2.9.0 to 2.9.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11851](https://github.com/facebook/docusaurus/pull/11851) chore(deps): bump handlebars from 4.7.7 to 4.7.9 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11849](https://github.com/facebook/docusaurus/pull/11849) chore(deps): bump convict from 6.2.4 to 6.2.5 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11857](https://github.com/facebook/docusaurus/pull/11857) chore(deps): bump node-forge from 1.3.2 to 1.4.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11838](https://github.com/facebook/docusaurus/pull/11838) chore(deps-dev): bump picomatch from 2.3.1 to 2.3.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11822](https://github.com/facebook/docusaurus/pull/11822) chore(deps): bump flatted from 3.3.1 to 3.4.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11810](https://github.com/facebook/docusaurus/pull/11810) chore(deps): bump marocchino/sticky-pull-request-comment from 2.9.4 to 3.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11811](https://github.com/facebook/docusaurus/pull/11811) chore(deps): bump treosh/lighthouse-ci-action from 12.6.1 to 12.6.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11813](https://github.com/facebook/docusaurus/pull/11813) chore(deps): bump socket.io-parser from 4.2.4 to 4.2.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11806](https://github.com/facebook/docusaurus/pull/11806) chore(deps): bump yauzl from 3.1.3 to 3.2.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11789](https://github.com/facebook/docusaurus/pull/11789) chore(deps): bump actions/dependency-review-action from 4.8.3 to 4.9.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11790](https://github.com/facebook/docusaurus/pull/11790) chore(deps): bump actions/setup-node from 6.2.0 to 6.3.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11776](https://github.com/facebook/docusaurus/pull/11776) chore(deps): bump dompurify from 3.2.5 to 3.3.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11768](https://github.com/facebook/docusaurus/pull/11768) chore(deps): bump actions/upload-artifact from 6.0.0 to 7.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11774](https://github.com/facebook/docusaurus/pull/11774) chore(deps): bump svgo from 3.2.0 to 3.3.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11762](https://github.com/facebook/docusaurus/pull/11762) chore(deps): bump rollup from 2.79.2 to 2.80.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11756](https://github.com/facebook/docusaurus/pull/11756) chore(deps): bump actions/dependency-review-action from 4.8.2 to 4.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11692](https://github.com/facebook/docusaurus/pull/11692) chore(deps): bump actions/checkout from 6.0.1 to 6.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11679](https://github.com/facebook/docusaurus/pull/11679) chore(deps): bump lodash from 4.17.21 to 4.17.23 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11674](https://github.com/facebook/docusaurus/pull/11674) chore(deps): bump actions/setup-node from 6.1.0 to 6.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11625](https://github.com/facebook/docusaurus/pull/11625) chore(deps): bump preactjs/compressed-size-action from 2.8.0 to 2.9.0 - pin all remaining GitHub actions ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11608](https://github.com/facebook/docusaurus/pull/11608) chore(deps): bump actions/setup-node from 6.0.0 to 6.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11609](https://github.com/facebook/docusaurus/pull/11609) chore(deps): bump actions/checkout from 6.0.0 to 6.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11589](https://github.com/facebook/docusaurus/pull/11589) chore(deps): bump mdast-util-to-hast from 13.2.0 to 13.2.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11574](https://github.com/facebook/docusaurus/pull/11574) chore(deps): bump node-forge from 1.3.1 to 1.3.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11557](https://github.com/facebook/docusaurus/pull/11557) chore(deps): bump actions/dependency-review-action from 4.8.1 to 4.8.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11569](https://github.com/facebook/docusaurus/pull/11569) chore(deps): bump actions/checkout from 5.0.0 to 6.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11551](https://github.com/facebook/docusaurus/pull/11551) chore(deps): bump js-yaml from 4.1.0 to 4.1.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11514](https://github.com/facebook/docusaurus/pull/11514) chore(deps): bump actions/upload-artifact from 4 to 5 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11515](https://github.com/facebook/docusaurus/pull/11515) chore(deps): bump github/codeql-action from 4.30.9 to 4.31.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11504](https://github.com/facebook/docusaurus/pull/11504) chore(deps): bump github/codeql-action from 4.30.8 to 4.30.9 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#11503](https://github.com/facebook/docusaurus/pull/11503) chore(deps): bump actions/setup-node from 5.0.0 to 6.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- `docusaurus-bundler`, `docusaurus-mdx-loader`
  - [#11717](https://github.com/facebook/docusaurus/pull/11717) chore(deps): bump webpack from 5.95.0 to 5.104.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :wrench: Maintenance

- Other
  - [#11846](https://github.com/facebook/docusaurus/pull/11846) chore(website): disable `mdx1Compat.comments` on our site ([@slorber](https://github.com/slorber))
  - [#11845](https://github.com/facebook/docusaurus/pull/11845) chore(website): Upgrade to Algolia v4.6 ([@slorber](https://github.com/slorber))
  - [#11795](https://github.com/facebook/docusaurus/pull/11795) chore(ci): canary/trusted publishing shouldn't use any caching ([@slorber](https://github.com/slorber))
  - [#11753](https://github.com/facebook/docusaurus/pull/11753) chore: Add basic AGENTS.md ([@slorber](https://github.com/slorber))
  - [#11639](https://github.com/facebook/docusaurus/pull/11639) test(jest): simplify Jest snapshotPathNormalizer.ts ([@slorber](https://github.com/slorber))
  - [#11626](https://github.com/facebook/docusaurus/pull/11626) chore(website): upgrade to DocSearch 4.4.0 + fix little website theming issues ([@slorber](https://github.com/slorber))
  - [#11553](https://github.com/facebook/docusaurus/pull/11553) chore(ci): upgrade Netlify to Node 24 (LTS) + add `git backfill` command ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-babel`, `docusaurus-bundler`, `docusaurus-cssnano-preset`, `docusaurus-faster`, `docusaurus-logger`, `docusaurus-mdx-loader`, `docusaurus-module-type-aliases`, `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-css-cascade-layers`, `docusaurus-plugin-debug`, `docusaurus-plugin-google-analytics`, `docusaurus-plugin-google-gtag`, `docusaurus-plugin-google-tag-manager`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-plugin-rsdoctor`, `docusaurus-plugin-sitemap`, `docusaurus-plugin-svgr`, `docusaurus-plugin-vercel-analytics`, `docusaurus-preset-classic`, `docusaurus-remark-plugin-npm2yarn`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`, `docusaurus-theme-search-algolia`, `docusaurus-theme-translations`, `docusaurus-tsconfig`, `docusaurus-types`, `docusaurus-utils-common`, `docusaurus-utils-validation`, `docusaurus-utils`, `docusaurus`, `eslint-plugin`, `lqip-loader`, `stylelint-copyright`
  - [#11823](https://github.com/facebook/docusaurus/pull/11823) chore(ci): fixes for the npm trusted publishing workflow ([@slorber](https://github.com/slorber))
  - [#11819](https://github.com/facebook/docusaurus/pull/11819) chore(ci): add Trusted Publishing release workflow through dispatch action ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-docs`, `docusaurus-plugin-ideal-image`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-mermaid`, `docusaurus-utils`, `docusaurus`
  - [#11698](https://github.com/facebook/docusaurus/pull/11698) chore(monorepo): upgrade React packages to v19 ([@slorber](https://github.com/slorber))
- `docusaurus-cssnano-preset`, `docusaurus-logger`, `docusaurus-mdx-loader`, `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-ideal-image`, `docusaurus-remark-plugin-npm2yarn`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-utils-validation`, `docusaurus-utils`, `docusaurus`
  - [#11702](https://github.com/facebook/docusaurus/pull/11702) chore(monorepo): upgrade to Jest 30 ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus`
  - [#11697](https://github.com/facebook/docusaurus/pull/11697) chore(monorepo): upgrade React monorepo types to v19 ([@slorber](https://github.com/slorber))
- `docusaurus-babel`
  - [#11586](https://github.com/facebook/docusaurus/pull/11586) chore(deps): remove unused @babel/runtime-corejs3 dependency ([@JustinBeckwith](https://github.com/JustinBeckwith))
- `docusaurus-plugin-content-blog`
  - [#11564](https://github.com/facebook/docusaurus/pull/11564) test(blog): Add basic tests for blog routes. ([@slorber](https://github.com/slorber))

#### :globe_with_meridians: Translations

- `docusaurus-theme-translations`
  - [#11632](https://github.com/facebook/docusaurus/pull/11632) feat(i18n): add Urdu (ur) default theme translations ([@hammadurrehman2006](https://github.com/hammadurrehman2006))
  - [#11533](https://github.com/facebook/docusaurus/pull/11533) fix(translations): complete theme translations for Algolia pt-br ([@luicfrr](https://github.com/luicfrr))

#### Committers: 41

- Akshat Sinha ([@akshatsinha0](https://github.com/akshatsinha0))
- Aleksandar Zgonjan ([@acosoft](https://github.com/acosoft))
- Andrew Kazakov ([@andreww2012](https://github.com/andreww2012))
- Anukool Pandey ([@ANUKOOL324](https://github.com/ANUKOOL324))
- Artem Lytkin ([@4RH1T3CT0R7](https://github.com/4RH1T3CT0R7))
- Balthasar Hofer ([@lebalz](https://github.com/lebalz))
- Bhoomi Sharma ([@Bhoomi070](https://github.com/Bhoomi070))
- Cesar Garcia ([@Chesars](https://github.com/Chesars))
- Denny Morán ([@dmoranp](https://github.com/dmoranp))
- Dmitriy Rotaenko ([@dmitriyrotaenko](https://github.com/dmitriyrotaenko))
- Eoin Shaughnessy ([@EoinTrial](https://github.com/EoinTrial))
- Gaurav Sulsule ([@garry00107](https://github.com/garry00107))
- Gnana Eswar Gunturu ([@GnanaEswarGunturu](https://github.com/GnanaEswarGunturu))
- Hugo Häggmark ([@hugohaggmark](https://github.com/hugohaggmark))
- Ivan Torres ([@torresgol10](https://github.com/torresgol10))
- Justin Beckwith ([@JustinBeckwith](https://github.com/JustinBeckwith))
- Kamil Moskała ([@moskalakamil](https://github.com/moskalakamil))
- Kohei Watanabe ([@kou029w](https://github.com/kou029w))
- Kuldeep Prasad Mishra ([@kmish9685](https://github.com/kmish9685))
- Kunwardeep Singh ([@work109677-sudo](https://github.com/work109677-sudo))
- Luiz Carlos ([@luicfrr](https://github.com/luicfrr))
- Matthew Cheung ([@Mcheung7272](https://github.com/Mcheung7272))
- Max Clayton Clowes ([@mcclowes](https://github.com/mcclowes))
- Misrilal ([@Misrilal-Sah](https://github.com/Misrilal-Sah))
- Muhammad Hammad ur Rehman ([@hammadurrehman2006](https://github.com/hammadurrehman2006))
- Nader Jaber ([@FlyNumber](https://github.com/FlyNumber))
- Natan Yagudayev ([@NatanTechofNY](https://github.com/NatanTechofNY))
- Neel Bansal ([@NPX2218](https://github.com/NPX2218))
- Nick Cacace ([@BearAlliance](https://github.com/BearAlliance))
- Noah Gregory ([@nmggithub](https://github.com/nmggithub))
- Poetry Of Code ([@poetryofcode](https://github.com/poetryofcode))
- Pyry Takala ([@pyrytakala](https://github.com/pyrytakala))
- Salman Chishti ([@salmanmkc](https://github.com/salmanmkc))
- Sreehari Upas ([@SreehariU](https://github.com/SreehariU))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Vedant Madane ([@VedantMadane](https://github.com/VedantMadane))
- Vedika Gupta ([@VedikaGupt](https://github.com/VedikaGupt))
- Zoey Greer ([@tempoz](https://github.com/tempoz))
- [@TheCyperpunk](https://github.com/TheCyperpunk)
- [@snikkrs](https://github.com/snikkrs)
- fre$h ([@fresh3nough](https://github.com/fresh3nough)

## 3.9.2 (2025-10-17)

#### :bug: Bug Fix

- `docusaurus-plugin-content-docs`
  - [#11490](https://github.com/facebook/docusaurus/pull/11490) fix(docs): add support for missing `sidebar_key` front matter attribute ([@slorber](https://github.com/slorber))
- `docusaurus-cssnano-preset`
  - [#11487](https://github.com/facebook/docusaurus/pull/11487) fix(cssnano-preset): disable CSS counter minification ([@YDKK](https://github.com/YDKK))
- `docusaurus-theme-search-algolia`
  - [#11468](https://github.com/facebook/docusaurus/pull/11468) fix(theme-search-algolia): Fix Algolia AskAI validation logic ([@slorber](https://github.com/slorber))
- `docusaurus-theme-translations`
  - [#11431](https://github.com/facebook/docusaurus/pull/11431) fix(theme-translation): add missing Polish (pl) theme translations ([@mariuszkrzaczkowski](https://github.com/mariuszkrzaczkowski))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#11466](https://github.com/facebook/docusaurus/pull/11466) fix(theme): Fix CSS `scroll-margin-top` when clicking footnote items, factorize code ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#11452](https://github.com/facebook/docusaurus/pull/11452) fix(core): allow `i18n.localeConfigs.translate` in validation ([@trofim24](https://github.com/trofim24))
- `docusaurus-theme-mermaid`
  - [#11437](https://github.com/facebook/docusaurus/pull/11437) fix(theme-mermaid): Fix Mermaid ELK layout dependency required bug on v3.9 ([@slorber](https://github.com/slorber))

#### :zap: Performance

- `docusaurus-theme-mermaid`
  - [#11438](https://github.com/facebook/docusaurus/pull/11438) perf(theme-mermaid): lazy load the Mermaid library ([@slorber](https://github.com/slorber))

#### :nail_care: Polish

- `docusaurus-theme-classic`
  - [#11463](https://github.com/facebook/docusaurus/pull/11463) fix(theme): remove "Edit this page" button from print view ([@richk21](https://github.com/richk21))

#### :robot: Dependencies

- [#11479](https://github.com/facebook/docusaurus/pull/11479) chore(deps): bump stefanzweifel/git-auto-commit-action from 6 to 7 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11480](https://github.com/facebook/docusaurus/pull/11480) chore(deps): bump github/codeql-action from 3.26.5 to 4.30.8 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11481](https://github.com/facebook/docusaurus/pull/11481) chore(deps): bump actions/dependency-review-action from 4.8.0 to 4.8.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11446](https://github.com/facebook/docusaurus/pull/11446) chore(deps): bump actions/dependency-review-action from 4.7.3 to 4.8.0 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :globe_with_meridians: Translations

- `docusaurus-theme-translations`
  - [#11484](https://github.com/facebook/docusaurus/pull/11484) fix(translations): improve Arabic theme translations ([@maysara-elshewehy](https://github.com/maysara-elshewehy))

#### Committers: 9

- Alexander Trofimov ([@trofim24](https://github.com/trofim24))
- Dan Roscigno ([@DanRoscigno](https://github.com/DanRoscigno))
- Eleni Grosdouli ([@egrosdou01](https://github.com/egrosdou01))
- Ethan ([@ethanppl](https://github.com/ethanppl))
- Mariusz Krzaczkowski ([@mariuszkrzaczkowski](https://github.com/mariuszkrzaczkowski))
- Maysara ([@maysara-elshewehy](https://github.com/maysara-elshewehy))
- Richa Kiran ([@richk21](https://github.com/richk21))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- [@YDKK](https://github.com/YDKK)

## 3.9.1 (2025-09-26)

#### :bug: Bug Fix

- `docusaurus`
  - [#11434](https://github.com/facebook/docusaurus/pull/11434) fix(core): fix Docusaurus outDir for sites using baseUrl ([@slorber](https://github.com/slorber))

#### Committers: 1

- Sébastien Lorber ([@slorber](https://github.com/slorber))

## 3.9.0 (2025-09-25)

#### :rocket: New Feature

- `docusaurus-theme-search-algolia`
  - [#11421](https://github.com/facebook/docusaurus/pull/11421) feat(theme-search-algolia): use DocSearch v4.1, optimize integration ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`, `docusaurus-theme-classic`
  - [#11425](https://github.com/facebook/docusaurus/pull/11425) feat(blog): Add support for email social icon + resize default social icon a bit ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#11426](https://github.com/facebook/docusaurus/pull/11426) feat(theme): Add theme-tabs-container stable className ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-search-algolia`, `docusaurus-theme-translations`
  - [#11327](https://github.com/facebook/docusaurus/pull/11327) feat(search): add runtime support for DocSearch v4 ([@dylantientcheu](https://github.com/dylantientcheu))
- `docusaurus-faster`, `docusaurus`
  - [#11415](https://github.com/facebook/docusaurus/pull/11415) feat(faster): upgrade Rspack to 1.5, use lazyBarrel experiment, remove deprecated option ([@slorber](https://github.com/slorber))
  - [#11294](https://github.com/facebook/docusaurus/pull/11294) feat(faster): Upgrade to Rspack 1.4 ([@slorber](https://github.com/slorber))
- `docusaurus-utils`
  - [#11397](https://github.com/facebook/docusaurus/pull/11397) feat(mdx): resolve `@site/*` markdown links, fix resolution priority bugs ([@slorber](https://github.com/slorber))
- `docusaurus-theme-mermaid`
  - [#11357](https://github.com/facebook/docusaurus/pull/11357) feat(mermaid): support elk layout ([@Feez2403](https://github.com/Feez2403))
- `docusaurus-plugin-pwa`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#11316](https://github.com/facebook/docusaurus/pull/11316) feat(core): Add `i18n.localeConfigs[locale].{url,baseUrl}` config options, fix multi-domain deployments ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#11304](https://github.com/facebook/docusaurus/pull/11304) feat(core): add `i18n.localeConfigs.translate` + skip translation process if `i18n/<locale>` dir doesn't exist ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-docs`
  - [#11228](https://github.com/facebook/docusaurus/pull/11228) feat(docs): sidebar item `key` attribute - fix docs translations key conflicts ([@slorber](https://github.com/slorber))
- `create-docusaurus`
  - [#11293](https://github.com/facebook/docusaurus/pull/11293) feat(create-docusaurus): use respectPrefersColorScheme in init template ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`, `docusaurus-types`, `docusaurus`
  - [#11282](https://github.com/facebook/docusaurus/pull/11282) feat(core): add `siteConfig.markdown.emoji` config option to disable `remark-emoji` ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-types`, `docusaurus`
  - [#11283](https://github.com/facebook/docusaurus/pull/11283) feat(core): Add `siteConfig.markdown.hooks`, deprecate `siteConfig.onBrokenMarkdownLinks` ([@slorber](https://github.com/slorber))

#### :bug: Bug Fix

- `docusaurus-theme-classic`, `docusaurus`
  - [#11422](https://github.com/facebook/docusaurus/pull/11422) fix(theme): fix copy of indented code blocks, replace copy-text-to-clipboard by clipboard API ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`
  - [#11407](https://github.com/facebook/docusaurus/pull/11407) fix(theme): remove hardcoded fill from Bluesky and LinkedIn icons ([@Simek](https://github.com/Simek))
  - [#11389](https://github.com/facebook/docusaurus/pull/11389) fix(theme): render sidebar category index with unlisted children as a simple doc/link item ([@slorber](https://github.com/slorber))
  - [#11360](https://github.com/facebook/docusaurus/pull/11360) fix(theme): Add translate no to heading anchors and blog authors ([@slorber](https://github.com/slorber))
  - [#11356](https://github.com/facebook/docusaurus/pull/11356) fix(theme): Doc sidebar links/categories with long labels should display properly ([@slorber](https://github.com/slorber))
  - [#11338](https://github.com/facebook/docusaurus/pull/11338) fix(theme-classic): fix collapsed sidebar category expansion when navigating to another link within that category ([@qqq614](https://github.com/qqq614))
  - [#11289](https://github.com/facebook/docusaurus/pull/11289) fix(theme): Fix footnote ref scrolling behind the navbar when footnote back reference clicked ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#11410](https://github.com/facebook/docusaurus/pull/11410) fix(deps): upgrade webpack-dev-server to v5, fix security warning ([@slorber](https://github.com/slorber))
  - [#11347](https://github.com/facebook/docusaurus/pull/11347) fix(core): Fix docusaurus start on macOS when exec throws a synchronous error ([@slorber](https://github.com/slorber))
  - [#11271](https://github.com/facebook/docusaurus/pull/11271) fix(dev-server): use correct dev server HTML lang attribute ([@enumura1](https://github.com/enumura1))
- `docusaurus-theme-common`
  - [#11405](https://github.com/facebook/docusaurus/pull/11405) fix(theme): fix `useColorMode()` visual glitches due to provider unmounts/remounts ([@slorber](https://github.com/slorber))
  - [#11280](https://github.com/facebook/docusaurus/pull/11280) fix(theme-common): Export FooterColumnItem type ([@stubinubin](https://github.com/stubinubin))
- `docusaurus-bundler`, `docusaurus-faster`
  - [#11383](https://github.com/facebook/docusaurus/pull/11383) fix(ssg): HTML minifier should preserve `<head>` for `og:image` crawlers ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-translations`
  - [#11331](https://github.com/facebook/docusaurus/pull/11331) fix(theme): Add `aria-label` to `IconExternalLink` with value `'(opens in new tab)'` ([@WestonThayer](https://github.com/WestonThayer))
- `docusaurus-plugin-content-docs`
  - [#11281](https://github.com/facebook/docusaurus/pull/11281) fix(docs): Fix empty sidebar item category `className` lost when post-processed to a doc ([@slorber](https://github.com/slorber))
  - [#11251](https://github.com/facebook/docusaurus/pull/11251) fix(docs): prevent docs ids conflicts within a version ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#11263](https://github.com/facebook/docusaurus/pull/11263) fix(theme): make `useHistorySelector()` hydration-safe + use it read search/hash in theme ([@slorber](https://github.com/slorber))

#### :memo: Documentation

- [#11339](https://github.com/facebook/docusaurus/pull/11339) docs: clarify impact of document ID on the URL ([@shanti2530](https://github.com/shanti2530))

#### :robot: Dependencies

- [#11402](https://github.com/facebook/docusaurus/pull/11402) chore(deps): bump actions/github-script from 7.0.1 to 8.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11401](https://github.com/facebook/docusaurus/pull/11401) chore(deps): bump actions/dependency-review-action from 4.7.2 to 4.7.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11403](https://github.com/facebook/docusaurus/pull/11403) chore(deps): bump actions/setup-node from 4.4.0 to 5.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11373](https://github.com/facebook/docusaurus/pull/11373) chore(deps): bump actions/dependency-review-action from 4.7.1 to 4.7.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11365](https://github.com/facebook/docusaurus/pull/11365) chore(deps): bump actions/checkout from 4 to 5 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11342](https://github.com/facebook/docusaurus/pull/11342) chore(deps): bump form-data from 4.0.1 to 4.0.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11341](https://github.com/facebook/docusaurus/pull/11341) chore(deps): bump marocchino/sticky-pull-request-comment from 2.9.3 to 2.9.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11285](https://github.com/facebook/docusaurus/pull/11285) chore(deps): bump marocchino/sticky-pull-request-comment from 2.9.2 to 2.9.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11272](https://github.com/facebook/docusaurus/pull/11272) chore(deps): bump stefanzweifel/git-auto-commit-action from 5 to 6 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11273](https://github.com/facebook/docusaurus/pull/11273) chore(deps): bump treosh/lighthouse-ci-action from 12.1.0 to 12.6.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :wrench: Maintenance

- `create-docusaurus`, `docusaurus-babel`, `docusaurus-bundler`, `docusaurus-cssnano-preset`, `docusaurus-faster`, `docusaurus-logger`, `docusaurus-mdx-loader`, `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-css-cascade-layers`, `docusaurus-plugin-debug`, `docusaurus-plugin-google-analytics`, `docusaurus-plugin-google-gtag`, `docusaurus-plugin-google-tag-manager`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-plugin-rsdoctor`, `docusaurus-plugin-sitemap`, `docusaurus-plugin-svgr`, `docusaurus-plugin-vercel-analytics`, `docusaurus-preset-classic`, `docusaurus-remark-plugin-npm2yarn`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`, `docusaurus-theme-search-algolia`, `docusaurus-theme-translations`, `docusaurus-utils-common`, `docusaurus-utils-validation`, `docusaurus-utils`, `docusaurus`, `eslint-plugin`, `lqip-loader`
  - [#11408](https://github.com/facebook/docusaurus/pull/11408) chore: drop support for Node 18, that reached End-of-Life ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`
  - [#11317](https://github.com/facebook/docusaurus/pull/11317) chore: minor reduction to inline svg/js code ([@SethFalco](https://github.com/SethFalco))
- `docusaurus-plugin-content-docs`
  - [#11307](https://github.com/facebook/docusaurus/pull/11307) test(docs): fix docs tests issues ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`
  - [#11290](https://github.com/facebook/docusaurus/pull/11290) chore: upgrade website to Rspack 1.4 + fix Rspack internal performance tracing ([@slorber](https://github.com/slorber))
- Other
  - [#11287](https://github.com/facebook/docusaurus/pull/11287) chore(website): split changelog per version + adjust changelog plugin implementation ([@slorber](https://github.com/slorber))

#### :globe_with_meridians: Translations

- `docusaurus-theme-translations`
  - [#11315](https://github.com/facebook/docusaurus/pull/11315) fix(theme-translations): Add missing Portuguese (pt-BR) theme translations and improve some of it. ([@marcelocell](https://github.com/marcelocell))
  - [#11305](https://github.com/facebook/docusaurus/pull/11305) fix(translations): Add missing Ukrainian translations ([@maluke](https://github.com/maluke))

#### Committers: 18

- Akshat Sinha ([@akshatsinha0](https://github.com/akshatsinha0))
- Bartosz Kaszubowski ([@Simek](https://github.com/Simek))
- Dylan Tientcheu ([@dylantientcheu](https://github.com/dylantientcheu))
- Guo Ci ([@guoci](https://github.com/guoci))
- Jaime Iniesta ([@jaimeiniesta](https://github.com/jaimeiniesta))
- Joshua Chen ([@Josh-Cena](https://github.com/Josh-Cena))
- Marcelo Junior ([@marcelocell](https://github.com/marcelocell))
- Maria Stellini ([@shanti2530](https://github.com/shanti2530))
- Riccardo ([@3v0k4](https://github.com/3v0k4))
- Sergey Schetinin ([@maluke](https://github.com/maluke))
- Seth Falco ([@SethFalco](https://github.com/SethFalco))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Weston Thayer ([@WestonThayer](https://github.com/WestonThayer))
- [@Feez2403](https://github.com/Feez2403)
- [@stubinubin](https://github.com/stubinubin)
- [@ya-dvorovenko](https://github.com/ya-dvorovenko)
- enumura ([@enumura1](https://github.com/enumura1))
- hjcho ([@qqq614](https://github.com/qqq614))

## 3.8.1 (2025-06-06)

#### :bug: Bug Fix

- `docusaurus-theme-classic`
  - [#11242](https://github.com/facebook/docusaurus/pull/11242) fix(theme): fix unability to navigate to category's page when browsing its children items ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-css-cascade-layers`
  - [#11241](https://github.com/facebook/docusaurus/pull/11241) fix(css-cascade-layers): fix windows css cascade layers bug ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#11222](https://github.com/facebook/docusaurus/pull/11222) fix(bundler): fix `docusaurus start` using `concatenateModules: true` ([@slorber](https://github.com/slorber))
  - [#11217](https://github.com/facebook/docusaurus/pull/11217) fix: include Arc to supported Chromium Browsers ([@wellwelwel](https://github.com/wellwelwel))
  - [#11205](https://github.com/facebook/docusaurus/pull/11205) fix(core): fix `docusaurus start` error for macOS users with no Chromium-based browser ([@slorber](https://github.com/slorber))
- `docusaurus-types`
  - [#11221](https://github.com/facebook/docusaurus/pull/11221) fix(types): fix future flags public types ([@slorber](https://github.com/slorber))

#### :zap: Performance

- `docusaurus-plugin-content-blog`, `docusaurus-plugin-sitemap`, `docusaurus-theme-classic`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#11211](https://github.com/facebook/docusaurus/pull/11211) perf: avoid duplicated `git log` calls in `loadContent()` and `postBuild()` for untracked Git files ([@slorber](https://github.com/slorber))

#### :wrench: Maintenance

- `docusaurus-faster`
  - [#11248](https://github.com/facebook/docusaurus/pull/11248) chore(faster): upgrade Rspack ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-docs`
  - [#11230](https://github.com/facebook/docusaurus/pull/11230) refactor(docs): extract `loadVersion()` without changing the behavior ([@slorber](https://github.com/slorber))
- Other
  - [#11212](https://github.com/facebook/docusaurus/pull/11212) chore: upgrade to Node 22 by default ([@slorber](https://github.com/slorber))

#### Committers: 7

- Ben McCann ([@benmccann](https://github.com/benmccann))
- Dave Meyer ([@dave-meyer](https://github.com/dave-meyer))
- Léo Vincent ([@leovct](https://github.com/leovct))
- Noritaka Kobayashi ([@noritaka1166](https://github.com/noritaka1166))
- Phil Parsons ([@p-m-p](https://github.com/p-m-p))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Weslley Araújo ([@wellwelwel](https://github.com/wellwelwel))

## 3.8.0 (2025-05-26)

#### :rocket: New Feature

- `docusaurus-plugin-css-cascade-layers`, `docusaurus-preset-classic`, `docusaurus-theme-classic`, `docusaurus-types`, `docusaurus`
  - [#11142](https://github.com/facebook/docusaurus/pull/11142) feat(theme): new CSS cascade layers plugin + built-in `v4.useCssCascadeLayers` future flag ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#11156](https://github.com/facebook/docusaurus/pull/11156) feat(core): add internal flag to skip bundling ([@slorber](https://github.com/slorber))
  - [#11067](https://github.com/facebook/docusaurus/pull/11067) feat(core): enable Rspack `parallelCodeSplitting` ([@slorber](https://github.com/slorber))
- `docusaurus-module-type-aliases`, `docusaurus-plugin-content-blog`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-search-algolia`, `docusaurus`
  - [#11090](https://github.com/facebook/docusaurus/pull/11090) feat(theme): make it possible to provide your own page title formatter ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-pages`
  - [#11088](https://github.com/facebook/docusaurus/pull/11088) feat(pages): Support `frontMatter.slug` like docs and blog plugins ([@slorber](https://github.com/slorber))
- `docusaurus-faster`, `docusaurus`
  - [#11006](https://github.com/facebook/docusaurus/pull/11006) feat(core): Add bundler tracing/profiling ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-translations`
  - [#10987](https://github.com/facebook/docusaurus/pull/10987) feat(theme): Allow resetting colorMode to System/OS value ([@slorber](https://github.com/slorber))
- `docusaurus-remark-plugin-npm2yarn`
  - [#10953](https://github.com/facebook/docusaurus/pull/10953) feat(plugin-npm2yarn): Add Bun to default tabs conversions ([@jakeboone02](https://github.com/jakeboone02))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#10945](https://github.com/facebook/docusaurus/pull/10945) feat(theme): add theme layout stable CSS classes ([@slorber](https://github.com/slorber))
  - [#10846](https://github.com/facebook/docusaurus/pull/10846) feat(theme): code block showLineNumbers=start metastring ([@slorber](https://github.com/slorber))
- `docusaurus-faster`, `docusaurus-plugin-content-docs`, `docusaurus-types`, `docusaurus`
  - [#10931](https://github.com/facebook/docusaurus/pull/10931) feat(core): Docusaurus Faster - Rspack Persistent Cache ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`
  - [#10852](https://github.com/facebook/docusaurus/pull/10852) feat(theme): add `versions` attribute to `docsVersionDropdown` navbar item ([@hrumhurum](https://github.com/hrumhurum))
- `docusaurus-types`, `docusaurus`
  - [#10826](https://github.com/facebook/docusaurus/pull/10826) feat(core): Docusaurus Faster - SSG worker threads ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-sitemap`, `docusaurus-types`, `docusaurus`
  - [#10850](https://github.com/facebook/docusaurus/pull/10850) feat(core): new `postBuild({routesBuildMetadata})` API, deprecate `head` attribute + v4 future flag ([@slorber](https://github.com/slorber))

#### :bug: Bug Fix

- `docusaurus-plugin-content-blog`
  - [#11138](https://github.com/facebook/docusaurus/pull/11138) refactor(content-blog): replace `reading-time` with `Intl.Segmenter` API ([@shreedharbhat98](https://github.com/shreedharbhat98))
- `docusaurus-plugin-content-blog`
  - [#11138](https://github.com/facebook/docusaurus/pull/11138) refactor(content-blog): replace `reading-time` with `Intl.Segmenter` API ([@shreedharbhat98](https://github.com/shreedharbhat98))
  - [#11068](https://github.com/facebook/docusaurus/pull/11068) fix(blog): fix blog Atom feed item url / XSL bug ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-docs`
  - [#11179](https://github.com/facebook/docusaurus/pull/11179) fix(mdx-loader): remove opt-in for mdx dependency file ([@slorber](https://github.com/slorber))
  - [#10875](https://github.com/facebook/docusaurus/pull/10875) fix(docs): versioning CLI should copy localized translation file `current.json` to `version-<v>.json` ([@jkboxomine](https://github.com/jkboxomine))
- `create-docusaurus`
  - [#11157](https://github.com/facebook/docusaurus/pull/11157) fix(create-docusaurus): Improve init template README, fix headings and remove $ in bash code blocks ([@arienshibani](https://github.com/arienshibani))
- `docusaurus-theme-common`
  - [#11153](https://github.com/facebook/docusaurus/pull/11153) fix(theme): restore former code block theme-common internal APIs ([@slorber](https://github.com/slorber))
  - [#11046](https://github.com/facebook/docusaurus/pull/11046) fix(theme): Fix code block magic comments with CRLF line breaks bug ([@coder-xiaomo](https://github.com/coder-xiaomo))
  - [#10989](https://github.com/facebook/docusaurus/pull/10989) fix(theme): mobile drawer history blocker should be rendered conditionally (workaround) ([@slorber](https://github.com/slorber))
  - [#10954](https://github.com/facebook/docusaurus/pull/10954) fix(theme): fix `useColorMode().colorMode` leading to React hydration mismatches ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`
  - [#11085](https://github.com/facebook/docusaurus/pull/11085) fix(theme): add missing `rel="tag"` attribute for docs/blog tags ([@slorber](https://github.com/slorber))
  - [#10999](https://github.com/facebook/docusaurus/pull/10999) fix(theme): CodeBlock should accept `title` of `ReactNode` type ([@lebalz](https://github.com/lebalz))
  - [#10705](https://github.com/facebook/docusaurus/pull/10705) fix(theme): only render secondaryMenu if it should be shown ([@hidde](https://github.com/hidde))
  - [#10898](https://github.com/facebook/docusaurus/pull/10898) fix(theme): a11y fix on mobile DropdownNavbarItem ([@mxschmitt](https://github.com/mxschmitt))
  - [#10909](https://github.com/facebook/docusaurus/pull/10909) fix(theme): apply docs `sidebar_class_name` in DocCard + better dogfooding ([@slorber](https://github.com/slorber))
  - [#10849](https://github.com/facebook/docusaurus/pull/10849) fix(theme): fix `<DocCard>` height inconsistency ([@hichemfantar](https://github.com/hichemfantar))
  - [#10866](https://github.com/facebook/docusaurus/pull/10866) fix(theme): Hide code block buttons before React hydration ([@kennethormandy](https://github.com/kennethormandy))
- `docusaurus-theme-classic`, `docusaurus-theme-translations`
  - [#11053](https://github.com/facebook/docusaurus/pull/11053) fix(theme): navbar mobile sidebar should allow clicking dropdown parent link ([@slorber](https://github.com/slorber))
- `docusaurus-utils`
  - [#11027](https://github.com/facebook/docusaurus/pull/11027) fix(cli): fix CLI write-translation bug ([@slorber](https://github.com/slorber))
- `docusaurus-theme-translations`
  - [#11030](https://github.com/facebook/docusaurus/pull/11030) fix(theme-translation): add missing Japanese translation for System Mode ([@tats-u](https://github.com/tats-u))
  - [#10893](https://github.com/facebook/docusaurus/pull/10893) fix(theme-translations): Turkish exist language translate completed. ([@ramazansancar](https://github.com/ramazansancar))
  - [#10884](https://github.com/facebook/docusaurus/pull/10884) fix(theme-translations): Add missing Polish (pl) theme translations ([@mariuszkrzaczkowski](https://github.com/mariuszkrzaczkowski))
- `docusaurus-plugin-ideal-image`
  - [#11026](https://github.com/facebook/docusaurus/pull/11026) fix(ideal-image): fix waypoint initial scroll bug ([@slorber](https://github.com/slorber))
  - [#11014](https://github.com/facebook/docusaurus/pull/11014) fix(ideal-image): Internalize `react-waypoint` dependency, fix React 19 compatibility ([@slorber](https://github.com/slorber))
  - [#10910](https://github.com/facebook/docusaurus/pull/10910) fix(ideal-image): Add issuer to ideal-image Webpack loader ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`
  - [#11004](https://github.com/facebook/docusaurus/pull/11004) fix(mdx-loader): refactor and fix heading to toc html value serialization ([@slorber](https://github.com/slorber))
- `docusaurus-module-type-aliases`
  - [#10998](https://github.com/facebook/docusaurus/pull/10998) fix(module-type-aliases): pin react-helmet-async to @slorber/react-helmet-async@1.3.0 ([@cylewaitforit](https://github.com/cylewaitforit))
- `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-translations`
  - [#10987](https://github.com/facebook/docusaurus/pull/10987) feat(theme): Allow resetting colorMode to System/OS value ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-utils`
  - [#10958](https://github.com/facebook/docusaurus/pull/10958) fix(create-docusaurus): fix CLI and remove shelljs escapeShellArg util ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`, `docusaurus-plugin-content-docs`
  - [#10934](https://github.com/facebook/docusaurus/pull/10934) fix(docs): fix mdx loader cache invalidation bug on versions changes ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`
  - [#10929](https://github.com/facebook/docusaurus/pull/10929) fix(plugins): add missing `validateOptions` types ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#10888](https://github.com/facebook/docusaurus/pull/10888) fix(seo): docs breadcrumb structured data should use JSON-LD and filter unliked categories ([@johnnyreilly](https://github.com/johnnyreilly))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#10886](https://github.com/facebook/docusaurus/pull/10886) fix(theme): collapse doc sidebar category on label click if active ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#10915](https://github.com/facebook/docusaurus/pull/10915) fix(core): use `os.availableParallelism()` for SSG worker threads count ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-docs`, `docusaurus-theme-classic`
  - [#10847](https://github.com/facebook/docusaurus/pull/10847) fix(theme): Fix `<DocCardList>` usage on docs at root of a sidebar ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-svgr`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#10820](https://github.com/facebook/docusaurus/pull/10820) fix(core): restore core svg file-loader ([@slorber](https://github.com/slorber))
- `docusaurus-logger`
  - [#10818](https://github.com/facebook/docusaurus/pull/10818) fix: perflogger mark detail bug ([@slorber](https://github.com/slorber))

#### :zap: Performance

- `docusaurus-utils`, `docusaurus`
  - [#11178](https://github.com/facebook/docusaurus/pull/11178) perf(core): disable Rspack `parallelCodeSplitting` temporarily ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#11177](https://github.com/facebook/docusaurus/pull/11177) perf(core): fix bad value for mergeDuplicateChunks (typo) ([@slorber](https://github.com/slorber))
  - [#11170](https://github.com/facebook/docusaurus/pull/11170) perf(core): add default for DOCUSAURUS_SSG_WORKER_THREAD_RECYCLER_MAX_MEMORY ([@slorber](https://github.com/slorber))
  - [#11166](https://github.com/facebook/docusaurus/pull/11166) feat(core): expose opt-in env variable for SSG thread recycling ([@slorber](https://github.com/slorber))
  - [#11072](https://github.com/facebook/docusaurus/pull/11072) perf(core): remove bundler `optimization.removeAvailableModules` ([@slorber](https://github.com/slorber))
  - [#11067](https://github.com/facebook/docusaurus/pull/11067) feat(core): enable Rspack `parallelCodeSplitting` ([@slorber](https://github.com/slorber))
  - [#11037](https://github.com/facebook/docusaurus/pull/11037) refactor(core): remove clean-webpack-plugin ([@slorber](https://github.com/slorber))
  - [#11007](https://github.com/facebook/docusaurus/pull/11007) perf(core): Optimize `docusaurus start/serve`, fix `openBrowser()` perf issue on macOS ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`, `docusaurus-faster`, `docusaurus`
  - [#11176](https://github.com/facebook/docusaurus/pull/11176) perf(bundler): fine-tuning of Webpack/Rspack optimizations ([@slorber](https://github.com/slorber))
- `docusaurus-utils`
  - [#11163](https://github.com/facebook/docusaurus/pull/11163) perf(utils): implement git command queue ([@slorber](https://github.com/slorber))
- `docusaurus-logger`, `docusaurus`
  - [#11162](https://github.com/facebook/docusaurus/pull/11162) perf(core): optimize SSG collected data memory and worker thread communication ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`, `docusaurus`
  - [#10956](https://github.com/facebook/docusaurus/pull/10956) refactor: remove `react-dev-utils` (CRA) dependency, internalize code ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`
  - [#10885](https://github.com/facebook/docusaurus/pull/10885) perf(theme): use SVG sprite for IconExternalLink ([@slorber](https://github.com/slorber))
- `docusaurus-types`, `docusaurus`
  - [#10826](https://github.com/facebook/docusaurus/pull/10826) feat(core): Docusaurus Faster - SSG worker threads ([@slorber](https://github.com/slorber))

#### :nail_care: Polish

- `docusaurus-theme-live-codeblock`
  - [#11120](https://github.com/facebook/docusaurus/pull/11120) fix(theme): improve color contrast of live code block header ([@JackHowa](https://github.com/JackHowa))
- `docusaurus-theme-translations`
  - [#10825](https://github.com/facebook/docusaurus/pull/10825) fix(theme-translations): Add missing Polish (pl) theme translations ([@mariuszkrzaczkowski](https://github.com/mariuszkrzaczkowski))
  - [#10816](https://github.com/facebook/docusaurus/pull/10816) chore(theme-translations): add missing zh theme translations ([@MisterFISHUP](https://github.com/MisterFISHUP))

#### :memo: Documentation

- [#11181](https://github.com/facebook/docusaurus/pull/11181) docs: adjust the Docusaurus release process documentation to our new simpler process ([@slorber](https://github.com/slorber))
- [#11180](https://github.com/facebook/docusaurus/pull/11180) docs(ideal-image): Add warning for pnpm 10+ and `sharp` install script ([@slorber](https://github.com/slorber))
- [#11137](https://github.com/facebook/docusaurus/pull/11137) docs(deploy): remove `layer0` from deployment docs ([@PaiJi](https://github.com/PaiJi))
- [#10822](https://github.com/facebook/docusaurus/pull/10822) docs(website): Comparison with Rspress ([@DevJoaoLopes](https://github.com/DevJoaoLopes))

#### :robot: Dependencies

- [#11185](https://github.com/facebook/docusaurus/pull/11185) chore(deps): bump actions/dependency-review-action from 4.7.0 to 4.7.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11182](https://github.com/facebook/docusaurus/pull/11182) chore(deps): bump lockfile-lint-api from 5.9.1 to 5.9.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11174](https://github.com/facebook/docusaurus/pull/11174) chore(deps): bump actions/dependency-review-action from 4.6.0 to 4.7.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11135](https://github.com/facebook/docusaurus/pull/11135) chore(deps): bump http-proxy-middleware from 2.0.7 to 2.0.9 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11103](https://github.com/facebook/docusaurus/pull/11103) chore(deps): bump marocchino/sticky-pull-request-comment from 2.9.1 to 2.9.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11102](https://github.com/facebook/docusaurus/pull/11102) chore(deps): bump actions/setup-node from 4.3.0 to 4.4.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11070](https://github.com/facebook/docusaurus/pull/11070) chore(deps): bump estree-util-value-to-estree from 3.1.2 to 3.3.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11069](https://github.com/facebook/docusaurus/pull/11069) chore(deps): bump actions/dependency-review-action from 4.5.0 to 4.6.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#11002](https://github.com/facebook/docusaurus/pull/11002) chore(deps): bump actions/setup-node from 4.2.0 to 4.3.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10990](https://github.com/facebook/docusaurus/pull/10990) chore(deps): bump @babel/runtime-corejs3 from 7.25.9 to 7.26.10 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10970](https://github.com/facebook/docusaurus/pull/10970) chore(deps): bump axios from 1.7.7 to 1.8.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10978](https://github.com/facebook/docusaurus/pull/10978) chore(deps): bump prismjs from 1.29.0 to 1.30.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10957](https://github.com/facebook/docusaurus/pull/10957) chore(deps): bump http-proxy-middleware from 2.0.6 to 2.0.7 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10937](https://github.com/facebook/docusaurus/pull/10937) chore(deps): bump dompurify from 3.1.6 to 3.2.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10936](https://github.com/facebook/docusaurus/pull/10936) chore(deps): bump preactjs/compressed-size-action from 2.7.0 to 2.8.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10873](https://github.com/facebook/docusaurus/pull/10873) chore(deps): bump actions/setup-node from 4.1.0 to 4.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10853](https://github.com/facebook/docusaurus/pull/10853) chore(deps): bump marocchino/sticky-pull-request-comment from 2.9.0 to 2.9.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10851](https://github.com/facebook/docusaurus/pull/10851) chore(deps): bump katex from 0.16.11 to 0.16.21 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :wrench: Maintenance

- `docusaurus-mdx-loader`, `docusaurus-utils`
  - [#11168](https://github.com/facebook/docusaurus/pull/11168) chore: add Node 24 to CI + fix deprecation warnings ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`
  - [#11116](https://github.com/facebook/docusaurus/pull/11116) test(blog): Add unit tests for calculating blog posts reading time ([@shreedharbhat98](https://github.com/shreedharbhat98))
- `docusaurus-mdx-loader`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`
  - [#11077](https://github.com/facebook/docusaurus/pull/11077) refactor(live-codeblock): refactor live code block theme components ([@slorber](https://github.com/slorber))
- Other
  - [#11075](https://github.com/facebook/docusaurus/pull/11075) fix(c): fix `yarn lint:spelling:fix` script ([@slorber](https://github.com/slorber))
- `docusaurus-faster`
  - [#11073](https://github.com/facebook/docusaurus/pull/11073) chore: upgrade Rspack 1.3.3 ([@slorber](https://github.com/slorber))
  - [#10870](https://github.com/facebook/docusaurus/pull/10870) chore(deps): bump @rspack/core in Faster from 1.2.0-alpha.0 to 1.2.2 ([@tats-u](https://github.com/tats-u))
- `docusaurus-theme-mermaid`
  - [#11066](https://github.com/facebook/docusaurus/pull/11066) chore: upgrade mermaid, fix diagram labels bug ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`
  - [#11065](https://github.com/facebook/docusaurus/pull/11065) chore: upgrade image-size deps to v2 ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#11062](https://github.com/facebook/docusaurus/pull/11062) refactor(theme): introduce CodeBlockContextProvider + split into smaller components ([@slorber](https://github.com/slorber))
  - [#11059](https://github.com/facebook/docusaurus/pull/11059) refactor(theme): CodeBlock, centralize metadata parsing + refactor theme component ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-theme-common`
  - [#11058](https://github.com/facebook/docusaurus/pull/11058) refactor(theme): refactor CodeBlock parseLines logic + use inline snapshots to ease review ([@slorber](https://github.com/slorber))
- `docusaurus-faster`, `docusaurus`
  - [#11039](https://github.com/facebook/docusaurus/pull/11039) chore: use rspack 1.3.0 ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-ideal-image`
  - [#11010](https://github.com/facebook/docusaurus/pull/11010) refactor(ideal-image-plugin): internalize legacy component code ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-mermaid`, `docusaurus-theme-search-algolia`
  - [#10969](https://github.com/facebook/docusaurus/pull/10969) chore: add `eslint-plugin-react-compiler` ([@slorber](https://github.com/slorber))
- `docusaurus-cssnano-preset`, `docusaurus-mdx-loader`, `docusaurus-plugin-content-blog`, `docusaurus-remark-plugin-npm2yarn`, `eslint-plugin`, `stylelint-copyright`
  - [#10966](https://github.com/facebook/docusaurus/pull/10966) chore: upgrade monorepo to TS 5.8 ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`, `docusaurus`
  - [#10956](https://github.com/facebook/docusaurus/pull/10956) refactor: remove `react-dev-utils` (CRA) dependency, internalize code ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-plugin-content-docs`, `docusaurus-utils`, `docusaurus`
  - [#10358](https://github.com/facebook/docusaurus/pull/10358) refactor: replace unmaintained shelljs dependency by execa ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-theme-search-algolia`
  - [#10941](https://github.com/facebook/docusaurus/pull/10941) chore(algolia): bump docsearch dependency to v3.9 ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-debug`
  - [#10903](https://github.com/facebook/docusaurus/pull/10903) chore(plugin-debug): upgrade react-json-view-lite to v2.3.0 for react 19 ([@reece-white](https://github.com/reece-white))
  - [#10819](https://github.com/facebook/docusaurus/pull/10819) chore(plugin-debug): upgrade react-json-view-lite to v2, prepare for React 19 ([@slorber](https://github.com/slorber))
- `create-docusaurus`
  - [#10871](https://github.com/facebook/docusaurus/pull/10871) refactor(create-docusaurus): add `future.v4` flag to init templates ([@slorber](https://github.com/slorber))

#### Committers: 38

- Arien Shibani ([@arienshibani](https://github.com/arienshibani))
- Balthasar Hofer ([@lebalz](https://github.com/lebalz))
- Ben McCann ([@benmccann](https://github.com/benmccann))
- Daniel Kuschny ([@Danielku15](https://github.com/Danielku15))
- David King Roderos ([@dkroderos](https://github.com/dkroderos))
- FISH UP ([@MisterFISHUP](https://github.com/MisterFISHUP))
- Hichem Fantar ([@hichemfantar](https://github.com/hichemfantar))
- Hidde de Vries ([@hidde](https://github.com/hidde))
- Jack Howard ([@JackHowa](https://github.com/JackHowa))
- Jake Boone ([@jakeboone02](https://github.com/jakeboone02))
- JiPai ([@PaiJi](https://github.com/PaiJi))
- John Reilly ([@johnnyreilly](https://github.com/johnnyreilly))
- Joshua Chen ([@Josh-Cena](https://github.com/Josh-Cena))
- João Victor Lopes ([@DevJoaoLopes](https://github.com/DevJoaoLopes))
- Justin D Mathew ([@JDMathew](https://github.com/JDMathew))
- Kenneth Ormandy ([@kennethormandy](https://github.com/kennethormandy))
- Mariusz Krzaczkowski ([@mariuszkrzaczkowski](https://github.com/mariuszkrzaczkowski))
- Massoud Maboudi ([@massoudmaboudi](https://github.com/massoudmaboudi))
- Max Schmitt ([@mxschmitt](https://github.com/mxschmitt))
- Milica ([@mmaksimovic](https://github.com/mmaksimovic))
- Oleksiy Gapotchenko ([@hrumhurum](https://github.com/hrumhurum))
- Ramazan Sancar ([@ramazansancar](https://github.com/ramazansancar))
- Shreedhar Bhat ([@shreedharbhat98](https://github.com/shreedharbhat98))
- Stephen Glass ([@stephenglass](https://github.com/stephenglass))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Taras ([@taraspos](https://github.com/taraspos))
- Tatsunori Uchino ([@tats-u](https://github.com/tats-u))
- Waldir Pimenta ([@waldyrious](https://github.com/waldyrious))
- Yangshun Tay ([@yangshun](https://github.com/yangshun))
- Yoshiaki Yoshida ([@kakakakakku](https://github.com/kakakakakku))
- [@cylewaitforit](https://github.com/cylewaitforit)
- [@jkboxomine](https://github.com/jkboxomine)
- [@reece-white](https://github.com/reece-white)
- kilavvy ([@kilavvy](https://github.com/kilavvy))
- ozaki ([@OzakIOne](https://github.com/OzakIOne))
- pedenys ([@pedenys](https://github.com/pedenys))
- マルコメ ([@Marukome0743](https://github.com/Marukome0743))
- 程序员小墨 ([@coder-xiaomo](https://github.com/coder-xiaomo))

## 3.7.0 (2025-01-03)

#### :rocket: New Feature

- `docusaurus-faster`, `docusaurus`
  - [#10800](https://github.com/facebook/docusaurus/pull/10800) feat(core): Turn Rspack incremental on by default (again) ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`, `docusaurus-theme-classic`
  - [#10768](https://github.com/facebook/docusaurus/pull/10768) feat(blog): Add author social icons for bluesky, mastodon, threads, twitch, youtube, instagram ([@GingerGeek](https://github.com/GingerGeek))
- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-module-type-aliases`, `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-debug`, `docusaurus-plugin-google-analytics`, `docusaurus-plugin-google-gtag`, `docusaurus-plugin-google-tag-manager`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-plugin-rsdoctor`, `docusaurus-plugin-sitemap`, `docusaurus-plugin-svgr`, `docusaurus-plugin-vercel-analytics`, `docusaurus-preset-classic`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`, `docusaurus-theme-search-algolia`, `docusaurus-types`, `docusaurus`
  - [#10763](https://github.com/facebook/docusaurus/pull/10763) feat: Add React 19 support to Docusaurus v3 ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`
  - [#10729](https://github.com/facebook/docusaurus/pull/10729) feat(blog): Add `frontMatter.sidebar_label` ([@slorber](https://github.com/slorber))
- `docusaurus-module-type-aliases`, `docusaurus-plugin-svgr`, `docusaurus-preset-classic`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#10677](https://github.com/facebook/docusaurus/pull/10677) feat(svgr): create new Docusaurus SVGR plugin ([@slorber](https://github.com/slorber))

#### :bug: Bug Fix

- `docusaurus-remark-plugin-npm2yarn`
  - [#10803](https://github.com/facebook/docusaurus/pull/10803) fix(npm-to-yarn): add missing npm-to-yarn converter for Bun ([@Lehoczky](https://github.com/Lehoczky))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#10796](https://github.com/facebook/docusaurus/pull/10796) fix(theme): Footer Column/Link should merge provided className ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`, `docusaurus-theme-common`
  - [#10786](https://github.com/facebook/docusaurus/pull/10786) fix(core): fix React hydration errors, change html minifier settings ([@slorber](https://github.com/slorber))
- `docusaurus-theme-common`
  - [#10782](https://github.com/facebook/docusaurus/pull/10782) fix(theme-common): code block magic comments should support SQL block comments ([@WillBlack403](https://github.com/WillBlack403))
- `docusaurus-theme-translations`
  - [#10783](https://github.com/facebook/docusaurus/pull/10783) fix(theme-translations): Add missing Dutch (nl) theme translations ([@janaukema](https://github.com/janaukema))
  - [#10760](https://github.com/facebook/docusaurus/pull/10760) fix(theme-translation): add missing Korean (ko) theme translations ([@effozen](https://github.com/effozen))
- `docusaurus-plugin-content-docs`
  - [#10754](https://github.com/facebook/docusaurus/pull/10754) fix(docs): fix sidebar item visibility bug for category index ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#10727](https://github.com/facebook/docusaurus/pull/10727) fix(core): fix codegen routesChunkName possible hash collision ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`
  - [#10723](https://github.com/facebook/docusaurus/pull/10723) fix(mdx-loader): fix md image paths with spaces bug related to transformImage encoding problem ([@slorber](https://github.com/slorber))

#### :memo: Documentation

- [#10740](https://github.com/facebook/docusaurus/pull/10740) docs: Link initialization docs together ([@waldyrious](https://github.com/waldyrious))

#### :robot: Dependencies

- [#10771](https://github.com/facebook/docusaurus/pull/10771) chore(deps): bump nanoid from 3.3.7 to 3.3.8 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10721](https://github.com/facebook/docusaurus/pull/10721) chore(deps): bump actions/dependency-review-action from 4.4.0 to 4.5.0 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :wrench: Maintenance

- Other
  - [#10770](https://github.com/facebook/docusaurus/pull/10770) chore: Devcontainer upgrade to Ubuntu Noble & Node 22 ([@GingerGeek](https://github.com/GingerGeek))
- `docusaurus-theme-search-algolia`
  - [#10801](https://github.com/facebook/docusaurus/pull/10801) refactor(algolia): simplify SearchBar component ([@slorber](https://github.com/slorber))
  - [#10672](https://github.com/facebook/docusaurus/pull/10672) chore(algolia): upgrade algoliasearch to v5 ([@millotp](https://github.com/millotp))
- `docusaurus`
  - [#10798](https://github.com/facebook/docusaurus/pull/10798) refactor(core): Use Intl native API to get locale direction, remove rtl-detect depend… ([@slorber](https://github.com/slorber))
  - [#10747](https://github.com/facebook/docusaurus/pull/10747) refactor(core): swizzle wrap should use ReactNode instead of JSX.Element ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-module-type-aliases`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-debug`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`, `docusaurus-theme-search-algolia`, `docusaurus-types`, `docusaurus`
  - [#10746](https://github.com/facebook/docusaurus/pull/10746) refactor: prepare types for React 19 ([@slorber](https://github.com/slorber))
- `docusaurus-theme-common`
  - [#10728](https://github.com/facebook/docusaurus/pull/10728) refactor(theme-common): change storageUtils useSyncExternalCode getSnapshot workaround ([@slorber](https://github.com/slorber))

#### Committers: 14

- Alvin Bryan ([@alvinometric](https://github.com/alvinometric))
- Hichem Fantar ([@hichemfantar](https://github.com/hichemfantar))
- Ivan Cheban ([@ivancheban](https://github.com/ivancheban))
- Jake Boone ([@jakeboone02](https://github.com/jakeboone02))
- Jan Aukema ([@janaukema](https://github.com/janaukema))
- Lehoczky Zoltán ([@Lehoczky](https://github.com/Lehoczky))
- Lin Huang ([@codimiracle](https://github.com/codimiracle))
- Pierre Millot ([@millotp](https://github.com/millotp))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Taylor Reece ([@taylorreece](https://github.com/taylorreece))
- Waldir Pimenta ([@waldyrious](https://github.com/waldyrious))
- William Black ([@WillBlack403](https://github.com/WillBlack403))
- Zed Spencer-Milnes ([@GingerGeek](https://github.com/GingerGeek))
- Zen ([@effozen](https://github.com/effozen))

## 3.6.3 (2024-11-22)

#### :bug: Bug Fix

- `docusaurus`
  - [#10712](https://github.com/facebook/docusaurus/pull/10712) fix(core): disable Rspack incremental in dev ([@slorber](https://github.com/slorber))

#### Committers: 1

- Sébastien Lorber ([@slorber](https://github.com/slorber))

## 3.6.2 (2024-11-19)

#### :bug: Bug Fix

- `docusaurus-module-type-aliases`
  - [#10693](https://github.com/facebook/docusaurus/pull/10693) fix(types): add missing ambiant TS declarations for .md / .mdx partials ([@slorber](https://github.com/slorber))
- `docusaurus-theme-translations`
  - [#10688](https://github.com/facebook/docusaurus/pull/10688) fix(theme-translation): add and update Japanese translations ([@Ryoga-exe](https://github.com/Ryoga-exe))
- `docusaurus`
  - [#10685](https://github.com/facebook/docusaurus/pull/10685) fix(cli): `docusaurus --help` should print plugin commands using `extendCli()` ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`
  - [#10680](https://github.com/facebook/docusaurus/pull/10680) fix(bundler): allow CSS nesting by default, restore postcss-preset-env ([@slorber](https://github.com/slorber))
- `create-docusaurus`
  - [#10676](https://github.com/facebook/docusaurus/pull/10676) fix(create-docusaurus): add ts exclude to TS init template ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`, `docusaurus-faster`, `docusaurus`
  - [#10648](https://github.com/facebook/docusaurus/pull/10648) fix(faster): Upgrade to Rspack 1.1.1, fix build progress bar display ([@slorber](https://github.com/slorber))

#### :wrench: Maintenance

- [#10691](https://github.com/facebook/docusaurus/pull/10691) chore(ci): retry `yarn install` to ignore temporary network errors ([@slorber](https://github.com/slorber))

#### Committers: 5

- Junior_Gx ([@goffxnca](https://github.com/goffxnca))
- Kyle Tsang ([@kyletsang](https://github.com/kyletsang))
- Ryoga ([@Ryoga-exe](https://github.com/Ryoga-exe))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Zwyx ([@Zwyx](https://github.com/Zwyx))

## 3.6.1 (2024-11-08)

#### :bug: Bug Fix

- `docusaurus`
  - [#10658](https://github.com/facebook/docusaurus/pull/10658) fix(core): bundler should not minimize static assets ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`, `docusaurus-faster`, `docusaurus-utils-common`, `docusaurus-utils`
  - [#10649](https://github.com/facebook/docusaurus/pull/10649) fix(faster,utils): fix faster/types peerDependencies ([@slorber](https://github.com/slorber))

#### :nail_care: Polish

- `docusaurus-bundler`, `docusaurus-types`, `docusaurus`
  - [#10655](https://github.com/facebook/docusaurus/pull/10655) refactor(faster,bundler,core): improve js loader DX ([@slorber](https://github.com/slorber))

#### :memo: Documentation

- [#10657](https://github.com/facebook/docusaurus/pull/10657) docs: fix old base ts config ref ([@slorber](https://github.com/slorber))

#### :wrench: Maintenance

- `docusaurus-mdx-loader`
  - [#10651](https://github.com/facebook/docusaurus/pull/10651) refactor(mdx-loader): streamline typescript usage for remark plugin types ([@lebalz](https://github.com/lebalz))
- Other
  - [#10650](https://github.com/facebook/docusaurus/pull/10650) chore: Argos screenshot dogfooding test pages ([@slorber](https://github.com/slorber))

#### Committers: 2

- Balthasar Hofer ([@lebalz](https://github.com/lebalz))
- Sébastien Lorber ([@slorber](https://github.com/slorber))

## 3.6.0 (2024-11-04)

#### :rocket: New Feature

- `docusaurus-plugin-content-blog`, `docusaurus-theme-classic`
  - [#10586](https://github.com/facebook/docusaurus/pull/10586) feat(blog): Add `frontMatter.title_meta` to override title for SEO ([@ilg-ul](https://github.com/ilg-ul))
- `docusaurus`
  - [#10600](https://github.com/facebook/docusaurus/pull/10600) feat(cli): build/deploy should allow multiple `--locale` options ([@slorber](https://github.com/slorber))
- `docusaurus-logger`
  - [#10590](https://github.com/facebook/docusaurus/pull/10590) feat(core): add Node.js memory perf logging ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-rsdoctor`
  - [#10588](https://github.com/facebook/docusaurus/pull/10588) feat: new Rsdoctor official plugin ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`, `docusaurus-faster`, `docusaurus-theme-classic`, `docusaurus`
  - [#10402](https://github.com/facebook/docusaurus/pull/10402) feat(core): Replace Webpack with Rspack - `siteConfig.future.experimental_faster.rspackBundler` ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`, `docusaurus-faster`, `docusaurus-types`, `docusaurus`
  - [#10554](https://github.com/facebook/docusaurus/pull/10554) feat(core): faster HTML minimizer - `siteConfig.future.experimental_faster.swcHtmlMinimizer` ([@slorber](https://github.com/slorber))
  - [#10522](https://github.com/facebook/docusaurus/pull/10522) feat(core): faster CSS minimizer - `siteConfig.future.experimental_faster.lightningCssMinimizer` ([@slorber](https://github.com/slorber))
- `docusaurus-theme-mermaid`
  - [#10510](https://github.com/facebook/docusaurus/pull/10510) feat(theme-mermaid): support Mermaid 11+ including new types of diagrams ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-types`, `docusaurus`
  - [#10479](https://github.com/facebook/docusaurus/pull/10479) feat(core, mdx-loader): deduplicate MDX compilation - `siteConfig.future.experimental_faster.mdxCrossCompilerCache` ([@slorber](https://github.com/slorber))
- `docusaurus-faster`, `docusaurus-types`, `docusaurus`
  - [#10441](https://github.com/facebook/docusaurus/pull/10441) feat(core): faster JS minimizer - `siteConfig.future.experimental_faster.swcJsMinimizer` ([@slorber](https://github.com/slorber))
- `docusaurus-faster`, `docusaurus-plugin-content-docs`, `docusaurus-types`, `docusaurus`
  - [#10435](https://github.com/facebook/docusaurus/pull/10435) feat(core): faster transpiler option - `siteConfig.future.experimental_faster.swcJsLoader` ([@slorber](https://github.com/slorber))

#### :bug: Bug Fix

- `docusaurus-bundler`, `docusaurus`
  - [#10632](https://github.com/facebook/docusaurus/pull/10632) fix(core): restore Rspack ProgressBar colors ([@slorber](https://github.com/slorber))
  - [#10581](https://github.com/facebook/docusaurus/pull/10581) fix(core): fix handling of Swc html minifier warnings ([@slorber](https://github.com/slorber))
  - [#10573](https://github.com/facebook/docusaurus/pull/10573) fix(core): move @docusaurus/faster to bundler peerDeps ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`
  - [#10617](https://github.com/facebook/docusaurus/pull/10617) fix(faster): allow Rspack + babel-loader ([@slorber](https://github.com/slorber))
  - [#10614](https://github.com/facebook/docusaurus/pull/10614) fix(faster): fix error message typo + add color ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`
  - [#10618](https://github.com/facebook/docusaurus/pull/10618) fix(theme): Restore former globalThis.Prism ([@slorber](https://github.com/slorber))
  - [#10585](https://github.com/facebook/docusaurus/pull/10585) fix(theme): light & dark mode checkbox doesn't announce state switches ([@andrewasche](https://github.com/andrewasche))
  - [#10439](https://github.com/facebook/docusaurus/pull/10439) fix(theme): upgrade infima, fix footer link width bug ([@slorber](https://github.com/slorber))
- `docusaurus-faster`
  - [#10616](https://github.com/facebook/docusaurus/pull/10616) fix(faster): add missing tslib dependency ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#10611](https://github.com/facebook/docusaurus/pull/10611) fix(core): fix DOCUSAURUS_CURRENT_LOCALE = 'undefined' ([@slorber](https://github.com/slorber))
  - [#10423](https://github.com/facebook/docusaurus/pull/10423) fix(core): always use hash for CSS module class names ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`, `docusaurus-faster`
  - [#10605](https://github.com/facebook/docusaurus/pull/10605) fix(core): Use proper swc loader options ([@slorber](https://github.com/slorber))
- `docusaurus-theme-translations`
  - [#10551](https://github.com/facebook/docusaurus/pull/10551) fix(translations): complete missing slovenian theme translations ([@patik123](https://github.com/patik123))
  - [#10507](https://github.com/facebook/docusaurus/pull/10507) fix(theme-translations): add missing Vietnamese translations ([@namnguyenthanhwork](https://github.com/namnguyenthanhwork))
  - [#10413](https://github.com/facebook/docusaurus/pull/10413) fix(translations): fix Spanish translation for "breadcrumbs" ([@TheMineWay](https://github.com/TheMineWay))
- `docusaurus-mdx-loader`
  - [#10553](https://github.com/facebook/docusaurus/pull/10553) fix(mdx-loader): fix cross-compiler cache randomly loading mdx with client/server envs ([@slorber](https://github.com/slorber))
- `docusaurus-tsconfig`
  - [#10547](https://github.com/facebook/docusaurus/pull/10547) fix(tsconfig): add `@docusaurus/tsconfig` target es2022 ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`
  - [#10424](https://github.com/facebook/docusaurus/pull/10424) fix(blog): normalize inline authors socials ([@OzakIOne](https://github.com/OzakIOne))
  - [#10440](https://github.com/facebook/docusaurus/pull/10440) fix(blog): apply baseUrl to relative image in blog authors ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-translations`
  - [#10431](https://github.com/facebook/docusaurus/pull/10431) fix(blog): authors count incorrectly rendered ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-types`, `docusaurus`
  - [#10420](https://github.com/facebook/docusaurus/pull/10420) fix(types): fix type of PluginModule ([@slorber](https://github.com/slorber))

#### :zap: Performance

- `docusaurus-bundler`, `docusaurus-faster`
  - [#10605](https://github.com/facebook/docusaurus/pull/10605) fix(core): Use proper swc loader options ([@slorber](https://github.com/slorber))
- Other
  - [#10601](https://github.com/facebook/docusaurus/pull/10601) perf(ci): Add CI checks to prevent memory, build-time and build-size regressions ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#10599](https://github.com/facebook/docusaurus/pull/10599) fix(core): fix i18n sites SSG memory leak - require.cache ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`
  - [#10470](https://github.com/facebook/docusaurus/pull/10470) refactor(mdx-loader): re-export metadata module instead of serializing it ([@slorber](https://github.com/slorber))
  - [#10457](https://github.com/facebook/docusaurus/pull/10457) refactor(mdx-loader): read metadata from memory (loaded content) instead of fs ([@slorber](https://github.com/slorber))

#### :memo: Documentation

- Other
  - [#10631](https://github.com/facebook/docusaurus/pull/10631) docs: fix frontMatter.mdx.format docs ([@slorber](https://github.com/slorber))
  - [#10630](https://github.com/facebook/docusaurus/pull/10630) docs: Add missing API ref docs for Docusaurus Faster options ([@slorber](https://github.com/slorber))
  - [#10592](https://github.com/facebook/docusaurus/pull/10592) docs: resource add docusaurus-i18n ([@moonrailgun](https://github.com/moonrailgun))
  - [#10535](https://github.com/facebook/docusaurus/pull/10535) docs: add tip about harmless vulnerabilities ([@ilg-ul](https://github.com/ilg-ul))
  - [#10545](https://github.com/facebook/docusaurus/pull/10545) docs: clarify component naming for markdown import ([@jackrabbit128](https://github.com/jackrabbit128))
  - [#10416](https://github.com/facebook/docusaurus/pull/10416) docs: corrected typo in search.mdx ([@B0r1sD](https://github.com/B0r1sD))
  - [#10405](https://github.com/facebook/docusaurus/pull/10405) docs(website): small spellfix on 3.5 update notes ([@Zenahr](https://github.com/Zenahr))
- `create-docusaurus`
  - [#10608](https://github.com/facebook/docusaurus/pull/10608) docs: mention config/sidebars run in Node.js runtime ([@slorber](https://github.com/slorber))

#### :robot: Dependencies

- Other
  - [#10623](https://github.com/facebook/docusaurus/pull/10623) chore(deps): bump actions/setup-node from 4.0.4 to 4.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#10624](https://github.com/facebook/docusaurus/pull/10624) chore(deps): bump actions/dependency-review-action from 4.3.4 to 4.4.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#10539](https://github.com/facebook/docusaurus/pull/10539) chore(deps): bump preactjs/compressed-size-action from 2.6.0 to 2.7.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#10530](https://github.com/facebook/docusaurus/pull/10530) chore(deps): bump rollup from 2.79.1 to 2.79.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#10518](https://github.com/facebook/docusaurus/pull/10518) chore(deps): bump actions/setup-node from 4.0.2 to 4.0.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#10505](https://github.com/facebook/docusaurus/pull/10505) chore(deps): bump dompurify from 3.0.5 to 3.1.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#10488](https://github.com/facebook/docusaurus/pull/10488) chore(deps): bump express from 4.19.2 to 4.20.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#10449](https://github.com/facebook/docusaurus/pull/10449) chore(deps): bump github/codeql-action from 3.26.3 to 3.26.5 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#10444](https://github.com/facebook/docusaurus/pull/10444) chore(deps): bump micromatch from 4.0.5 to 4.0.8 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#10425](https://github.com/facebook/docusaurus/pull/10425) chore(deps): bump github/codeql-action from 3.26.0 to 3.26.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- `docusaurus-plugin-pwa`
  - [#10455](https://github.com/facebook/docusaurus/pull/10455) chore(deps): bump webpack from 5.88.1 to 5.94.0 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :wrench: Maintenance

- Other
  - [#10612](https://github.com/facebook/docusaurus/pull/10612) chore: fix canary version prefix ([@slorber](https://github.com/slorber))
  - [#10438](https://github.com/facebook/docusaurus/pull/10438) chore(ci): fix setup-node, use LTS by default ([@slorber](https://github.com/slorber))
  - [#10418](https://github.com/facebook/docusaurus/pull/10418) chore(website): add Rsdoctor plugin ([@slorber](https://github.com/slorber))
- `docusaurus-babel`, `docusaurus-bundler`, `docusaurus-mdx-loader`, `docusaurus-plugin-debug`, `docusaurus-plugin-pwa`, `docusaurus-plugin-rsdoctor`, `docusaurus-theme-live-codeblock`, `docusaurus`
  - [#10610](https://github.com/facebook/docusaurus/pull/10610) chore: upgrade minor dependencies ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`, `docusaurus-faster`
  - [#10609](https://github.com/facebook/docusaurus/pull/10609) chore: upgrade faster packages ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`, `docusaurus-logger`, `docusaurus-types`, `docusaurus`
  - [#10593](https://github.com/facebook/docusaurus/pull/10593) refactor(core): refactor SSG infrastructure ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#10587](https://github.com/facebook/docusaurus/pull/10587) refactor(core): replace serve-handler fork by official deps ([@slorber](https://github.com/slorber))
  - [#10579](https://github.com/facebook/docusaurus/pull/10579) refactor(core): remove useless Webpack wait plugin ([@slorber](https://github.com/slorber))
  - [#10485](https://github.com/facebook/docusaurus/pull/10485) refactor(core): rewrite Webpack ChunkAssetPlugin with RuntimeModule ([@slorber](https://github.com/slorber))
  - [#10448](https://github.com/facebook/docusaurus/pull/10448) refactor(core): Restore null-loader ([@slorber](https://github.com/slorber))
  - [#10442](https://github.com/facebook/docusaurus/pull/10442) fix(core): use serve-handler fork to remove annoying punycode warning ([@slorber](https://github.com/slorber))
  - [#10410](https://github.com/facebook/docusaurus/pull/10410) refactor(core): remove useless build forceTerminate exit ([@slorber](https://github.com/slorber))
- `docusaurus-bundler`, `docusaurus-plugin-pwa`, `docusaurus-types`, `docusaurus`
  - [#10548](https://github.com/facebook/docusaurus/pull/10548) chore: upgrade Webpack to 5.95 and related deps ([@slorber](https://github.com/slorber))
- `create-docusaurus`
  - [#10514](https://github.com/facebook/docusaurus/pull/10514) refactor: remove babel.config.js from init templates + website ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-babel`, `docusaurus-bundler`, `docusaurus-mdx-loader`, `docusaurus-plugin-pwa`, `docusaurus-theme-classic`, `docusaurus-theme-translations`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#10511](https://github.com/facebook/docusaurus/pull/10511) refactor: create `@docusaurus/bundler` and `@docusaurus/babel` packages ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-plugin-pwa`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-mermaid`, `docusaurus-utils`, `docusaurus`, `eslint-plugin`
  - [#10509](https://github.com/facebook/docusaurus/pull/10509) chore: Rename Twitter links/labels to X ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-docs`, `docusaurus-types`, `docusaurus`
  - [#10497](https://github.com/facebook/docusaurus/pull/10497) refactor(core): prepare codebase for swappable bundler ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-utils`
  - [#10486](https://github.com/facebook/docusaurus/pull/10486) chore: upgrade to TS 5.6 + temporarily use skipLibCheck for TS 5.6 ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-logger`, `docusaurus-theme-translations`, `docusaurus`
  - [#10480](https://github.com/facebook/docusaurus/pull/10480) refactor: move PerfLogger from core to @docusaurus/logger ([@slorber](https://github.com/slorber))
- `docusaurus-remark-plugin-npm2yarn`
  - [#10454](https://github.com/facebook/docusaurus/pull/10454) chore: upgrade npm-to-yarn to v3 ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus`
  - [#10450](https://github.com/facebook/docusaurus/pull/10450) refactor(mdx-loader): refactor mdx-loader, expose loader creation utils ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`, `docusaurus-utils`, `docusaurus`
  - [#10429](https://github.com/facebook/docusaurus/pull/10429) refactor(core): improve handling of server bundle ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`
  - [#10422](https://github.com/facebook/docusaurus/pull/10422) refactor(mdx-loader): remove useless usage of mdx loader this.query ([@slorber](https://github.com/slorber))

#### Committers: 19

- Andrew Asche ([@andrewasche](https://github.com/andrewasche))
- Boris Depoortere ([@B0r1sD](https://github.com/B0r1sD))
- Chris Cho ([@ccho-mongodb](https://github.com/ccho-mongodb))
- Flix ([@flixyudh](https://github.com/flixyudh))
- Joel Campos ([@TheMineWay](https://github.com/TheMineWay))
- Kamil Moskała ([@moskalakamil](https://github.com/moskalakamil))
- Kenrick ([@kenrick95](https://github.com/kenrick95))
- Liviu Ionescu ([@ilg-ul](https://github.com/ilg-ul))
- Nguyễn Thành Nam ([@namnguyenthanhwork](https://github.com/namnguyenthanhwork))
- Patrick ([@patik123](https://github.com/patik123))
- Raghav ([@raghav2005](https://github.com/raghav2005))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Zenahr Barzani ([@Zenahr](https://github.com/Zenahr))
- [@Olexandr88](https://github.com/Olexandr88)
- [@Radovenchyk](https://github.com/Radovenchyk)
- [@jackrabbit128](https://github.com/jackrabbit128)
- [@k-seltzer](https://github.com/k-seltzer)
- moonrailgun ([@moonrailgun](https://github.com/moonrailgun))
- ozaki ([@OzakIOne](https://github.com/OzakIOne))

## 3.5.2 (2024-08-13)

#### :bug: Bug Fix

- `docusaurus-theme-common`
  - [#10397](https://github.com/facebook/docusaurus/pull/10397) fix(theme-common): restore useContextualSearchFilters public API for retrocompatibility ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#10391](https://github.com/facebook/docusaurus/pull/10391) fix(core): always alias React/ReactDOM to site dependency so that importing MDX from anywhere works ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-plugin-content-blog`
  - [#10392](https://github.com/facebook/docusaurus/pull/10392) fix(create-docusaurus): Improve init templates blog setup + fix warnings ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`
  - [#10390](https://github.com/facebook/docusaurus/pull/10390) fix(theme): Adjust blog authors line height to show descenders in lowercase letters (`g`, `j`, `p`, `q`, and `y`) ([@josh-wong](https://github.com/josh-wong))

#### :nail_care: Polish

- `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-translations`
  - [#10394](https://github.com/facebook/docusaurus/pull/10394) fix(translations): change casing of some en labels ([@cstangerup](https://github.com/cstangerup))

#### :memo: Documentation

- [#10393](https://github.com/facebook/docusaurus/pull/10393) docs(showcase): remove sites not using Docusaurus anymore ([@GatienBoquet](https://github.com/GatienBoquet))

#### :robot: Dependencies

- [#10396](https://github.com/facebook/docusaurus/pull/10396) chore(deps): bump github/codeql-action from 3.25.13 to 3.26.0 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 4

- Christian Stangerup ([@cstangerup](https://github.com/cstangerup))
- Gatien Boquet ([@GatienBoquet](https://github.com/GatienBoquet))
- Josh Wong ([@josh-wong](https://github.com/josh-wong))
- Sébastien Lorber ([@slorber](https://github.com/slorber))

## 3.5.1 (2024-08-09)

#### :bug: Bug Fix

- `docusaurus-plugin-content-blog`, `docusaurus-theme-search-algolia`
  - [#10384](https://github.com/facebook/docusaurus/pull/10384) fix(core): algolia context import ([@slorber](https://github.com/slorber))
- `docusaurus-theme-search-algolia`
  - [#10382](https://github.com/facebook/docusaurus/pull/10382) fix(theme-algolia): useDocusaurusContext import error ([@anaclumos](https://github.com/anaclumos))

#### Committers: 2

- Sunghyun Cho ([@anaclumos](https://github.com/anaclumos))
- Sébastien Lorber ([@slorber](https://github.com/slorber))

## 3.5.0 (2024-08-09)

#### :rocket: New Feature

- `docusaurus-plugin-content-blog`
  - [#10375](https://github.com/facebook/docusaurus/pull/10375) feat(blog): add `onUntruncatedBlogPosts` blog options ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-translations`
  - [#10376](https://github.com/facebook/docusaurus/pull/10376) feat(theme): show unlisted/draft banners in dev mode ([@OzakIOne](https://github.com/OzakIOne))
- `create-docusaurus`, `docusaurus-plugin-content-blog`
  - [#9252](https://github.com/facebook/docusaurus/pull/9252) feat(blog): add feed xlst options to render beautiful RSS and Atom feeds ([@Xebec19](https://github.com/Xebec19))
- `docusaurus-plugin-content-blog`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-translations`, `docusaurus-utils`
  - [#10216](https://github.com/facebook/docusaurus/pull/10216) feat(blog): authors page ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-theme-translations`
  - [#10339](https://github.com/facebook/docusaurus/pull/10339) feat(translation): add Estonian default translation ([@chirbard](https://github.com/chirbard))
  - [#10325](https://github.com/facebook/docusaurus/pull/10325) feat(translations): Indonesian translation ([@priyadi](https://github.com/priyadi))
- `docusaurus-mdx-loader`
  - [#10335](https://github.com/facebook/docusaurus/pull/10335) feat(mdx-loader): wrap mdx content title (`# Title`) in `<header>` for concistency ([@OzakIOne](https://github.com/OzakIOne))
- `create-docusaurus`, `docusaurus-plugin-content-blog`, `docusaurus-theme-classic`, `docusaurus-utils`
  - [#10222](https://github.com/facebook/docusaurus/pull/10222) feat(blog): author header social icons ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-plugin-client-redirects`, `docusaurus-plugin-google-analytics`, `docusaurus-plugin-google-gtag`, `docusaurus-plugin-google-tag-manager`, `docusaurus-plugin-pwa`, `docusaurus-plugin-sitemap`, `docusaurus-plugin-vercel-analytics`, `docusaurus-types`, `docusaurus`
  - [#10286](https://github.com/facebook/docusaurus/pull/10286) feat(core): allow plugins to self-disable by returning null ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`, `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#10252](https://github.com/facebook/docusaurus/pull/10252) feat(blog): group sidebar items by year (`themeConfig.blog.sidebar.groupByYear`) ([@alicelovescake](https://github.com/alicelovescake))
- `docusaurus-plugin-content-blog`, `docusaurus-utils`
  - [#10224](https://github.com/facebook/docusaurus/pull/10224) feat(blog): warn duplicate and inline authors ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-mdx-loader`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-utils-validation`
  - [#10241](https://github.com/facebook/docusaurus/pull/10241) feat(mdx): support recma plugins ([@slorber](https://github.com/slorber))

#### :bug: Bug Fix

- `docusaurus-theme-translations`
  - [#10344](https://github.com/facebook/docusaurus/pull/10344) fix(translations): fix wrong Estonian (et) translations and typos ([@Gekd](https://github.com/Gekd))
  - [#10360](https://github.com/facebook/docusaurus/pull/10360) fix(translations): Fix and Improve Spanish translations ([@sergioalmela](https://github.com/sergioalmela))
  - [#10235](https://github.com/facebook/docusaurus/pull/10235) fix(theme-translation): add missing German (de) theme.admonition translations ([@franzd1](https://github.com/franzd1))
- `docusaurus-theme-search-algolia`
  - [#10342](https://github.com/facebook/docusaurus/pull/10342) fix(search): fix algolia search ignore ctrl + F in search input ([@mxschmitt](https://github.com/mxschmitt))
- `docusaurus-plugin-content-docs`
  - [#10324](https://github.com/facebook/docusaurus/pull/10324) fix(docs): the _category_.json description attribute should display on generated index pages ([@bharateshwq](https://github.com/bharateshwq))
  - [#10309](https://github.com/facebook/docusaurus/pull/10309) fix(theme): docsVersionDropdown navbar item not showing the appropriate version ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus`
  - [#10368](https://github.com/facebook/docusaurus/pull/10368) fix(cli): Fix bad docusaurus CLI behavior on for --version, -V, --help, -h ([@ashiq-firoz](https://github.com/ashiq-firoz))
  - [#10311](https://github.com/facebook/docusaurus/pull/10311) fix(core): revert wrong anchor link implementation change ([@slorber](https://github.com/slorber))
  - [#10239](https://github.com/facebook/docusaurus/pull/10239) fix(core): fail fast if plugin has no name ([@slorber](https://github.com/slorber))
  - [#10225](https://github.com/facebook/docusaurus/pull/10225) fix(core): fix sites unable to start/build without a static dir ([@slorber](https://github.com/slorber))
  - [#10223](https://github.com/facebook/docusaurus/pull/10223) fix: escape period ([@d4nyll](https://github.com/d4nyll))
- `docusaurus-theme-classic`
  - [#10288](https://github.com/facebook/docusaurus/pull/10288) fix(theme): fix DocsVersionDropdownNavbarItem version link target ([@slorber](https://github.com/slorber))
  - [#10219](https://github.com/facebook/docusaurus/pull/10219) fix(theme): ignored className attribute on lazy loaded TabItem ([@lebalz](https://github.com/lebalz))
- `docusaurus-utils`
  - [#10240](https://github.com/facebook/docusaurus/pull/10240) fix(markdown): mdx-code-block should support intentation ([@slorber](https://github.com/slorber))

#### :nail_care: Polish

- `docusaurus-theme-translations`
  - [#10257](https://github.com/facebook/docusaurus/pull/10257) chore(theme-translations): add more Traditional Chinese(zh-Hant) translations ([@pjchender](https://github.com/pjchender))

#### :memo: Documentation

- Other
  - [#10361](https://github.com/facebook/docusaurus/pull/10361) docs: rename @getcanary/docusaurus-pagefind in docs ([@yujonglee](https://github.com/yujonglee))
  - [#10345](https://github.com/facebook/docusaurus/pull/10345) docs: Add @getcanary/docusaurus-pagefind in docs ([@yujonglee](https://github.com/yujonglee))
  - [#10337](https://github.com/facebook/docusaurus/pull/10337) docs: fix default value for `docRootComponent` ([@ultimate](https://github.com/ultimate))
  - [#10310](https://github.com/facebook/docusaurus/pull/10310) docs: remove deprecated partial toc warning ([@slorber](https://github.com/slorber))
  - [#10245](https://github.com/facebook/docusaurus/pull/10245) docs: add emoji for consistency ([@Paneedah](https://github.com/Paneedah))
  - [#10180](https://github.com/facebook/docusaurus/pull/10180) docs: backport #10173 to v3.3 + v3.4 & revise the content ([@tats-u](https://github.com/tats-u))
  - [#10233](https://github.com/facebook/docusaurus/pull/10233) docs(search): update docsearch api url ([@dhayab](https://github.com/dhayab))
- `docusaurus-plugin-google-gtag`
  - [#10338](https://github.com/facebook/docusaurus/pull/10338) docs(plugin-google-gtag): replace the broken Google Developers links with valid ones ([@bohyunjung](https://github.com/bohyunjung))

#### :robot: Dependencies

- [#10330](https://github.com/facebook/docusaurus/pull/10330) chore(deps): bump github/codeql-action from 3.25.12 to 3.25.13 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10299](https://github.com/facebook/docusaurus/pull/10299) chore(deps): bump actions/dependency-review-action from 4.3.3 to 4.3.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10300](https://github.com/facebook/docusaurus/pull/10300) chore(deps): bump github/codeql-action from 3.25.11 to 3.25.12 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10259](https://github.com/facebook/docusaurus/pull/10259) chore(deps): bump github/codeql-action from 3.25.10 to 3.25.11 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10247](https://github.com/facebook/docusaurus/pull/10247) chore(deps): bump treosh/lighthouse-ci-action from 11.4.0 to 12.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10226](https://github.com/facebook/docusaurus/pull/10226) chore(deps): bump github/codeql-action from 3.25.8 to 3.25.10 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10227](https://github.com/facebook/docusaurus/pull/10227) chore(deps): bump ws from 7.5.9 to 7.5.10 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10210](https://github.com/facebook/docusaurus/pull/10210) chore(deps): bump braces from 3.0.2 to 3.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10209](https://github.com/facebook/docusaurus/pull/10209) chore(deps): bump actions/dependency-review-action from 4.3.2 to 4.3.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10208](https://github.com/facebook/docusaurus/pull/10208) chore(deps): bump github/codeql-action from 3.25.7 to 3.25.8 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10195](https://github.com/facebook/docusaurus/pull/10195) chore(deps): bump github/codeql-action from 3.25.6 to 3.25.7 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :wrench: Maintenance

- Other
  - [#10369](https://github.com/facebook/docusaurus/pull/10369) feat(ci): continuous releases for main and PRs with pkg.pr.new ([@Aslemammad](https://github.com/Aslemammad))
- `docusaurus-theme-classic`
  - [#10343](https://github.com/facebook/docusaurus/pull/10343) chore(deps): update infima npm dependency to version 0.2.0-alpha.44 ([@hichemfantar](https://github.com/hichemfantar))
- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-search-algolia`
  - [#10316](https://github.com/facebook/docusaurus/pull/10316) refactor(docs): theme-common shouldn't depend on docs content ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`, `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#10313](https://github.com/facebook/docusaurus/pull/10313) refactor(blog): theme-common shouldn't depend on blog content plugins ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-cssnano-preset`, `docusaurus-logger`, `docusaurus-mdx-loader`, `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-debug`, `docusaurus-plugin-google-analytics`, `docusaurus-plugin-google-gtag`, `docusaurus-plugin-google-tag-manager`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-plugin-sitemap`, `docusaurus-plugin-vercel-analytics`, `docusaurus-preset-classic`, `docusaurus-remark-plugin-npm2yarn`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`, `docusaurus-theme-search-algolia`, `docusaurus-theme-translations`, `docusaurus-utils-common`, `docusaurus-utils-validation`, `docusaurus-utils`, `docusaurus`, `eslint-plugin`, `lqip-loader`, `stylelint-copyright`
  - [#10256](https://github.com/facebook/docusaurus/pull/10256) chore: simplify TypeScript configs, use TS 5.5 configDir placeholder ([@slorber](https://github.com/slorber))

#### Committers: 25

- Aaron Chen ([@pjchender](https://github.com/pjchender))
- Alice Zhao ([@alicelovescake](https://github.com/alicelovescake))
- Ashiq Firoz ([@ashiq-firoz](https://github.com/ashiq-firoz))
- Balthasar Hofer ([@lebalz](https://github.com/lebalz))
- Bharatesh ([@bharateshwq](https://github.com/bharateshwq))
- Daniel Li ([@d4nyll](https://github.com/d4nyll))
- Dhaya ([@dhayab](https://github.com/dhayab))
- Hichem Fantar ([@hichemfantar](https://github.com/hichemfantar))
- John Reilly ([@johnnyreilly](https://github.com/johnnyreilly))
- Joshua Chen ([@Josh-Cena](https://github.com/Josh-Cena))
- Julian V ([@ultimate](https://github.com/ultimate))
- Markus Tamm ([@chirbard](https://github.com/chirbard))
- Max Schmitt ([@mxschmitt](https://github.com/mxschmitt))
- Mohammad Bagher Abiyat ([@Aslemammad](https://github.com/Aslemammad))
- Paneedah ([@Paneedah](https://github.com/Paneedah))
- Priyadi Iman Nurcahyo ([@priyadi](https://github.com/priyadi))
- Robin Otter ([@Gekd](https://github.com/Gekd))
- Rohan Thakur ([@Xebec19](https://github.com/Xebec19))
- Sergio ([@sergioalmela](https://github.com/sergioalmela))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Tatsunori Uchino ([@tats-u](https://github.com/tats-u))
- [@franzd1](https://github.com/franzd1)
- ozaki ([@OzakIOne](https://github.com/OzakIOne))
- yujonglee ([@yujonglee](https://github.com/yujonglee))
- 정보현 Bohyun Jung ([@bohyunjung](https://github.com/bohyunjung))

## 3.4.0 (2024-05-31)

#### :rocket: New Feature

- `create-docusaurus`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-theme-classic`, `docusaurus-utils-validation`, `docusaurus-utils`
  - [#10137](https://github.com/facebook/docusaurus/pull/10137) feat(docs, blog): add support for `tags.yml`, predefined list of tags ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-theme-translations`
  - [#10151](https://github.com/facebook/docusaurus/pull/10151) feat(theme-translations): Added Turkmen (tk) default theme translations ([@ilmedova](https://github.com/ilmedova))
  - [#10111](https://github.com/facebook/docusaurus/pull/10111) feat(theme-translations): Add Bulgarian default theme translations (bg) ([@PetarMc1](https://github.com/PetarMc1))
- `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-pwa`, `docusaurus-plugin-sitemap`, `docusaurus-theme-search-algolia`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#9859](https://github.com/facebook/docusaurus/pull/9859) feat(core): hash router option - browse site offline (experimental) ([@slorber](https://github.com/slorber))
- `docusaurus-module-type-aliases`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-types`, `docusaurus`
  - [#10121](https://github.com/facebook/docusaurus/pull/10121) feat(core): site storage config options (experimental) ([@slorber](https://github.com/slorber))

#### :bug: Bug Fix

- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-utils`
  - [#10185](https://github.com/facebook/docusaurus/pull/10185) fix(docs, blog): Markdown link resolution does not support hot reload ([@slorber](https://github.com/slorber))
- `docusaurus-theme-search-algolia`
  - [#10178](https://github.com/facebook/docusaurus/pull/10178) fix(theme): SearchPage should respect `contextualSearch: false` setting ([@ncoughlin](https://github.com/ncoughlin))
  - [#10164](https://github.com/facebook/docusaurus/pull/10164) fix(search): fix algolia search container bug ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-utils`
  - [#10168](https://github.com/facebook/docusaurus/pull/10168) fix(mdx-loader): resolve Markdown/MDX links with Remark instead of RegExp ([@slorber](https://github.com/slorber))
- `docusaurus-theme-translations`
  - [#10165](https://github.com/facebook/docusaurus/pull/10165) fix(theme-translation): add missing Korean (ko) theme translations ([@revi](https://github.com/revi))
  - [#10157](https://github.com/facebook/docusaurus/pull/10157) fix(theme-translations): complete Vietnamese theme translations ([@namnguyenthanhwork](https://github.com/namnguyenthanhwork))
- `docusaurus`
  - [#10145](https://github.com/facebook/docusaurus/pull/10145) fix(core): fix serve workaround regexp ([@slorber](https://github.com/slorber))
  - [#10142](https://github.com/facebook/docusaurus/pull/10142) fix(core): fix `docusaurus serve` broken for assets when using trailingSlash ([@slorber](https://github.com/slorber))
  - [#10130](https://github.com/facebook/docusaurus/pull/10130) fix(core): the broken anchor checker should not be sensitive pathname trailing slashes ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#10144](https://github.com/facebook/docusaurus/pull/10144) fix(theme): fix announcement bar layout shift due to missing storage key namespace ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-docs`, `docusaurus`
  - [#10132](https://github.com/facebook/docusaurus/pull/10132) fix(core): `configurePostCss()` should run after `configureWebpack()` ([@slorber](https://github.com/slorber))
- `docusaurus-utils`, `docusaurus`
  - [#10131](https://github.com/facebook/docusaurus/pull/10131) fix(core): codegen should generate unique route prop filenames ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-translations`
  - [#10118](https://github.com/facebook/docusaurus/pull/10118) fix(theme-translations): fix missing pluralization for label DocCard.categoryDescription.plurals ([@slorber](https://github.com/slorber))

#### :memo: Documentation

- [#10176](https://github.com/facebook/docusaurus/pull/10176) docs: add community plugin docusaurus-graph ([@Arsero](https://github.com/Arsero))
- [#10173](https://github.com/facebook/docusaurus/pull/10173) docs: improve how to use `<details>` ([@tats-u](https://github.com/tats-u))
- [#10167](https://github.com/facebook/docusaurus/pull/10167) docs: suggest using `{<...>...</...>}` if don't use Markdown in migra… ([@tats-u](https://github.com/tats-u))
- [#10143](https://github.com/facebook/docusaurus/pull/10143) docs: recommend users to remove hast-util-is-element in migration to v3 ([@tats-u](https://github.com/tats-u))
- [#10124](https://github.com/facebook/docusaurus/pull/10124) docs: v3 prepare your site blog post should point users to the upgrade guide ([@homotechsual](https://github.com/homotechsual))

#### :robot: Dependencies

- [#10155](https://github.com/facebook/docusaurus/pull/10155) chore(deps): bump peaceiris/actions-gh-pages from 3 to 4 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10154](https://github.com/facebook/docusaurus/pull/10154) chore(deps): bump github/codeql-action from 2.13.4 to 3.25.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10112](https://github.com/facebook/docusaurus/pull/10112) chore(deps): bump actions/dependency-review-action from 4.3.1 to 4.3.2 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 11

- Azzedine E. ([@Arsero](https://github.com/Arsero))
- CodeDoctor ([@CodeDoctorDE](https://github.com/CodeDoctorDE))
- Mahri Ilmedova ([@ilmedova](https://github.com/ilmedova))
- Mikey O'Toole ([@homotechsual](https://github.com/homotechsual))
- Nguyễn Thành Nam ([@namnguyenthanhwork](https://github.com/namnguyenthanhwork))
- Nick Coughlin ([@ncoughlin](https://github.com/ncoughlin))
- Petar_mc ([@PetarMc1](https://github.com/PetarMc1))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Tatsunori Uchino ([@tats-u](https://github.com/tats-u))
- Yongmin ([@revi](https://github.com/revi))
- ozaki ([@OzakIOne](https://github.com/OzakIOne))

## 3.3.2 (2024-05-03)

#### :bug: Bug Fix

- `docusaurus-module-type-aliases`, `docusaurus`
  - [#10103](https://github.com/facebook/docusaurus/pull/10103) fix(core): do not recreate ReactDOM Root, fix React warning on hot reload ([@slorber](https://github.com/slorber))

#### Committers: 1

- Sébastien Lorber ([@slorber](https://github.com/slorber))

## 3.3.1 (2024-05-03)

Failed release

## 3.3.0 (2024-05-03)

#### :rocket: New Feature

- `docusaurus-plugin-sitemap`
  - [#10083](https://github.com/facebook/docusaurus/pull/10083) feat: add createSitemapItems hook ([@johnnyreilly](https://github.com/johnnyreilly))
- `docusaurus-mdx-loader`, `docusaurus-types`, `docusaurus`
  - [#10064](https://github.com/facebook/docusaurus/pull/10064) feat(core): add new site config option `siteConfig.markdown.anchors.maintainCase` ([@iAdramelk](https://github.com/iAdramelk))
- `docusaurus`
  - [#9767](https://github.com/facebook/docusaurus/pull/9767) feat(cli): docusaurus deploy should support a --target-dir option ([@SandPod](https://github.com/SandPod))
- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-debug`, `docusaurus-types`, `docusaurus`
  - [#10042](https://github.com/facebook/docusaurus/pull/10042) feat(core): simplify plugin API, support route.props ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-pages`, `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#10032](https://github.com/facebook/docusaurus/pull/10032) feat(pages): add LastUpdateAuthor & LastUpdateTime & editUrl ([@OzakIOne](https://github.com/OzakIOne))

#### :bug: Bug Fix

- `docusaurus-cssnano-preset`, `docusaurus-utils`, `docusaurus`
  - [#10092](https://github.com/facebook/docusaurus/pull/10092) chore: Upgrade svgr / svgo / cssnano ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`
  - [#10091](https://github.com/facebook/docusaurus/pull/10091) fix(theme): `<Tabs>` props should allow overriding defaults ([@gagdiez](https://github.com/gagdiez))
  - [#10080](https://github.com/facebook/docusaurus/pull/10080) fix(theme): `<Admonition>` should render properly without heading/icon ([@andrmaz](https://github.com/andrmaz))
- `docusaurus`
  - [#10090](https://github.com/facebook/docusaurus/pull/10090) fix(core): `docusaurus serve` redirects should include the site `/baseUrl/` prefix ([@slorber](https://github.com/slorber))
- `docusaurus-module-type-aliases`, `docusaurus-preset-classic`, `docusaurus-theme-classic`, `docusaurus-theme-live-codeblock`, `docusaurus`
  - [#10079](https://github.com/facebook/docusaurus/pull/10079) fix: handle React v18.3 warnings ([@slorber](https://github.com/slorber))
- `docusaurus-theme-translations`
  - [#10070](https://github.com/facebook/docusaurus/pull/10070) fix(theme-translations): add missing theme translations for pt-BR ([@h3nr1ke](https://github.com/h3nr1ke))
  - [#10051](https://github.com/facebook/docusaurus/pull/10051) fix(theme-translations): correct label for tip admonition in italian ([@tomsotte](https://github.com/tomsotte))
- `docusaurus-theme-search-algolia`
  - [#10048](https://github.com/facebook/docusaurus/pull/10048) fix(algolia): add insights property on Algolia Theme Config object TS definition ([@Virgil993](https://github.com/Virgil993))
- `docusaurus-plugin-content-docs`, `docusaurus`
  - [#10054](https://github.com/facebook/docusaurus/pull/10054) fix(core): sortRoutes shouldn't have a default baseUrl value, this led to a bug ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-docs`
  - [#10025](https://github.com/facebook/docusaurus/pull/10025) fix(docs): sidebar item label impact the pagination label of docs ([@Abdullah-03](https://github.com/Abdullah-03))
- `docusaurus-utils`
  - [#10022](https://github.com/facebook/docusaurus/pull/10022) fix(utils): getFileCommitDate should support `log.showSignature=true` ([@slorber](https://github.com/slorber))

#### :zap: Performance

- `docusaurus`
  - [#10060](https://github.com/facebook/docusaurus/pull/10060) refactor(core): optimize App entrypoint, it should not re-render when navigating ([@slorber](https://github.com/slorber))

#### :nail_care: Polish

- `docusaurus-theme-classic`
  - [#10061](https://github.com/facebook/docusaurus/pull/10061) refactor(theme): simplify CSS solution to solve empty search container ([@slorber](https://github.com/slorber))
- `docusaurus-theme-common`
  - [#10023](https://github.com/facebook/docusaurus/pull/10023) refactor(website): refactor showcase components ([@slorber](https://github.com/slorber))

#### :memo: Documentation

- [#10096](https://github.com/facebook/docusaurus/pull/10096) docs: Fix `déja` to `déjà` in `swizzling.mdx` ([@Zwyx](https://github.com/Zwyx))
- [#10093](https://github.com/facebook/docusaurus/pull/10093) docs: Fix dead Typesense links ([@kaihoffman](https://github.com/kaihoffman))
- [#10085](https://github.com/facebook/docusaurus/pull/10085) docs: make `ThemedImage` example work out of the box ([@lebalz](https://github.com/lebalz))
- [#10082](https://github.com/facebook/docusaurus/pull/10082) docs: add note regarding ts extension for config file. ([@homotechsual](https://github.com/homotechsual))
- [#9490](https://github.com/facebook/docusaurus/pull/9490) docs: add troubleshooting steps to migration/upgrade page ([@homotechsual](https://github.com/homotechsual))
- [#10056](https://github.com/facebook/docusaurus/pull/10056) docs(search): Algolia troubleshooting section for index configuration problems ([@slorber](https://github.com/slorber))
- [#10039](https://github.com/facebook/docusaurus/pull/10039) docs: visit is a named export of unist-util-visit ([@pearmini](https://github.com/pearmini))
- [#10020](https://github.com/facebook/docusaurus/pull/10020) docs: Fix wrong path example ([@tomy0000000](https://github.com/tomy0000000))
- [#10011](https://github.com/facebook/docusaurus/pull/10011) docs: add stormkit as deployment platform ([@eldemcan](https://github.com/eldemcan))

#### :robot: Dependencies

- [#10097](https://github.com/facebook/docusaurus/pull/10097) chore(deps): bump ejs from 3.1.9 to 3.1.10 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10089](https://github.com/facebook/docusaurus/pull/10089) chore(deps): bump actions/dependency-review-action from 4.2.5 to 4.3.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10088](https://github.com/facebook/docusaurus/pull/10088) chore(deps): bump preactjs/compressed-size-action from 2.5.0 to 2.6.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#10034](https://github.com/facebook/docusaurus/pull/10034) chore(deps): bump semver from 7.3.4 to 7.6.0 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :wrench: Maintenance

- `create-docusaurus`, `docusaurus-cssnano-preset`, `docusaurus-logger`, `docusaurus-mdx-loader`, `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-debug`, `docusaurus-plugin-google-analytics`, `docusaurus-plugin-google-gtag`, `docusaurus-plugin-google-tag-manager`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-plugin-sitemap`, `docusaurus-plugin-vercel-analytics`, `docusaurus-preset-classic`, `docusaurus-remark-plugin-npm2yarn`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`, `docusaurus-theme-search-algolia`, `docusaurus-theme-translations`, `docusaurus-utils-common`, `docusaurus-utils-validation`, `docusaurus-utils`, `docusaurus`, `eslint-plugin`, `lqip-loader`, `stylelint-copyright`
  - [#10065](https://github.com/facebook/docusaurus/pull/10065) refactor: extract base TS client config + upgrade TS + refactor TS setup ([@slorber](https://github.com/slorber))
- Other
  - [#10063](https://github.com/facebook/docusaurus/pull/10063) test(e2e): TypeCheck website/starter in min/max range of TS versions ([@slorber](https://github.com/slorber))
  - [#10049](https://github.com/facebook/docusaurus/pull/10049) fix(website): fix website manifest.json name "Docusaurus v2" to just "Docusaurus" ([@volcanofr](https://github.com/volcanofr))

#### Committers: 20

- Abdullah Saud ([@Abdullah-03](https://github.com/Abdullah-03))
- Alexander Sandor ([@SandPod](https://github.com/SandPod))
- Alexey Ivanov ([@iAdramelk](https://github.com/iAdramelk))
- Andrea Mazzucchelli ([@andrmaz](https://github.com/andrmaz))
- Bairui Su ([@pearmini](https://github.com/pearmini))
- Balthasar Hofer ([@lebalz](https://github.com/lebalz))
- Can Eldem ([@eldemcan](https://github.com/eldemcan))
- Daniel Li ([@d4nyll](https://github.com/d4nyll))
- Guille ([@gagdiez](https://github.com/gagdiez))
- H3NR1KE ([@h3nr1ke](https://github.com/h3nr1ke))
- John Reilly ([@johnnyreilly](https://github.com/johnnyreilly))
- Kai Hoffman ([@kaihoffman](https://github.com/kaihoffman))
- Mikey O'Toole ([@homotechsual](https://github.com/homotechsual))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Tommaso Sotte ([@tomsotte](https://github.com/tomsotte))
- Tomy Hsieh ([@tomy0000000](https://github.com/tomy0000000))
- Zwyx ([@Zwyx](https://github.com/Zwyx))
- [@Virgil993](https://github.com/Virgil993)
- [@volcanofr](https://github.com/volcanofr)
- ozaki ([@OzakIOne](https://github.com/OzakIOne))

## 3.2.1 (2024-04-04)

#### :bug: Bug Fix

- `docusaurus`
  - [#10012](https://github.com/facebook/docusaurus/pull/10012) fix(core): fix configurePostCss v3.2 regression ([@slorber](https://github.com/slorber))

#### :memo: Documentation

- [#9980](https://github.com/facebook/docusaurus/pull/9980) docs: remove old github action description ([@OzakIOne](https://github.com/OzakIOne))
- [#10014](https://github.com/facebook/docusaurus/pull/10014) docs(website): fix SEO docs headTags example ([@OzakIOne](https://github.com/OzakIOne))
- [#10004](https://github.com/facebook/docusaurus/pull/10004) docs(website): Announce v3.2 on website/homepage ([@slorber](https://github.com/slorber))

#### :robot: Dependencies

- [#10006](https://github.com/facebook/docusaurus/pull/10006) chore(deps): bump actions/dependency-review-action from 4.2.4 to 4.2.5 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 2

- Sébastien Lorber ([@slorber](https://github.com/slorber))
- ozaki ([@OzakIOne](https://github.com/OzakIOne))

## 3.2.0 (2024-03-29)

#### :rocket: New Feature

- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-sitemap`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#9954](https://github.com/facebook/docusaurus/pull/9954) feat(sitemap): add support for "lastmod" ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-utils-validation`, `docusaurus-utils`
  - [#9912](https://github.com/facebook/docusaurus/pull/9912) feat(blog): add LastUpdateAuthor & LastUpdateTime ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-plugin-debug`, `docusaurus-types`, `docusaurus`
  - [#9931](https://github.com/facebook/docusaurus/pull/9931) feat(core): add new plugin allContentLoaded lifecycle ([@slorber](https://github.com/slorber))
- `docusaurus-theme-translations`
  - [#9928](https://github.com/facebook/docusaurus/pull/9928) feat(theme-translations) Icelandic (is) ([@Hallinn](https://github.com/Hallinn))
- `docusaurus-plugin-content-blog`
  - [#9886](https://github.com/facebook/docusaurus/pull/9886) feat(blog): allow processing blog posts through a processBlogPosts function ([@OzakIOne](https://github.com/OzakIOne))
  - [#9838](https://github.com/facebook/docusaurus/pull/9838) feat(blog): add blog pageBasePath plugin option ([@ilg-ul](https://github.com/ilg-ul))
- `docusaurus`
  - [#9681](https://github.com/facebook/docusaurus/pull/9681) feat(swizzle): ask user preferred language if no language CLI option provided ([@yixiaojiu](https://github.com/yixiaojiu))
- `create-docusaurus`, `docusaurus-utils`
  - [#9442](https://github.com/facebook/docusaurus/pull/9442) feat(create-docusaurus): ask user for preferred language when no language CLI option provided ([@Rafael-Martins](https://github.com/Rafael-Martins))
- `docusaurus-plugin-vercel-analytics`
  - [#9687](https://github.com/facebook/docusaurus/pull/9687) feat(plugin-vercel-analytics): add new vercel analytics plugin ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-mdx-loader`
  - [#9684](https://github.com/facebook/docusaurus/pull/9684) feat(mdx-loader): the table-of-contents should display toc/headings of imported MDX partials ([@anatolykopyl](https://github.com/anatolykopyl))

#### :bug: Bug Fix

- `docusaurus-mdx-loader`
  - [#9999](https://github.com/facebook/docusaurus/pull/9999) fix(mdx-loader): Ignore contentTitle coming after Markdown thematicBreak ([@slorber](https://github.com/slorber))
- `docusaurus-theme-search-algolia`
  - [#9945](https://github.com/facebook/docusaurus/pull/9945) fix(a11y): move focus algolia-search focus back to search input on Escape ([@mxschmitt](https://github.com/mxschmitt))
- `docusaurus-plugin-content-blog`
  - [#9920](https://github.com/facebook/docusaurus/pull/9920) fix(blog): apply trailing slash to blog feed ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-theme-classic`
  - [#9944](https://github.com/facebook/docusaurus/pull/9944) fix(theme): improve a11y of DocSidebarItemCategory expand/collapsed button ([@mxschmitt](https://github.com/mxschmitt))
- `docusaurus-theme-translations`
  - [#9915](https://github.com/facebook/docusaurus/pull/9915) fix(theme-translations): complete and modify Japanese translations ([@Suenaga-Ryuya](https://github.com/Suenaga-Ryuya))
  - [#9910](https://github.com/facebook/docusaurus/pull/9910) fix(theme-translations): add Japanese translations ([@Suenaga-Ryuya](https://github.com/Suenaga-Ryuya))
  - [#9872](https://github.com/facebook/docusaurus/pull/9872) fix(theme-translations): complete and improve Spanish theme translations ([@4troDev](https://github.com/4troDev))
  - [#9812](https://github.com/facebook/docusaurus/pull/9812) fix(i18n): add missing theme translations for fa locale ([@VahidNaderi](https://github.com/VahidNaderi))
- `docusaurus-utils`
  - [#9897](https://github.com/facebook/docusaurus/pull/9897) fix(mdx-loader): mdx-code-block should support CRLF ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#9878](https://github.com/facebook/docusaurus/pull/9878) fix(core): fix default i18n calendar used, infer it from locale if possible ([@slorber](https://github.com/slorber))
  - [#9852](https://github.com/facebook/docusaurus/pull/9852) fix(core): ensure core error boundary is able to render theme layout ([@slorber](https://github.com/slorber))
- `docusaurus-remark-plugin-npm2yarn`
  - [#9861](https://github.com/facebook/docusaurus/pull/9861) fix(remark-npm2yarn): update npm-to-yarn from 2.0.0 to 2.2.1, fix pnpm extra args syntax ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-theme-classic`, `docusaurus-theme-translations`
  - [#9851](https://github.com/facebook/docusaurus/pull/9851) fix(theme-classic): should use plurals for category items description ([@baradusov](https://github.com/baradusov))

#### :zap: Performance

- `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#9975](https://github.com/facebook/docusaurus/pull/9975) refactor(core): improve dev perf, fine-grained site reloads - part 3 ([@slorber](https://github.com/slorber))
- `docusaurus-types`, `docusaurus`
  - [#9968](https://github.com/facebook/docusaurus/pull/9968) refactor(core): improve dev perf, fine-grained site reloads - part2 ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-types`, `docusaurus`
  - [#9903](https://github.com/facebook/docusaurus/pull/9903) refactor(core): improve dev perf, fine-grained site reloads - part1 ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-utils`
  - [#9890](https://github.com/facebook/docusaurus/pull/9890) perf: optimize getFileCommitDate, make it async ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#9798](https://github.com/facebook/docusaurus/pull/9798) refactor(core): internalize, simplify and optimize the SSG logic ([@slorber](https://github.com/slorber))

#### :nail_care: Polish

- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#9868](https://github.com/facebook/docusaurus/pull/9868) refactor(theme): dates should be formatted on the client-side instead of in nodejs code ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-plugin-content-blog`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-types`
  - [#9669](https://github.com/facebook/docusaurus/pull/9669) refactor(theme): use JSON-LD instead of microdata for blog structured data ([@johnnyreilly](https://github.com/johnnyreilly))
- `docusaurus-plugin-content-docs`
  - [#9839](https://github.com/facebook/docusaurus/pull/9839) refactor(blog): improve doc global data hook error message + add doc warning to blogOnly mode ([@OzakIOne](https://github.com/OzakIOne))

#### :memo: Documentation

- [#9937](https://github.com/facebook/docusaurus/pull/9937) docs: use official GitHub Action to deploy to GitHub Pages ([@vlad-nestorov](https://github.com/vlad-nestorov))
- [#9971](https://github.com/facebook/docusaurus/pull/9971) docs: replace VuePress by VitePress on tool comparison section ([@sunkanmii](https://github.com/sunkanmii))
- [#9914](https://github.com/facebook/docusaurus/pull/9914) docs: update legacy MDX v1 links to markdown links ([@OzakIOne](https://github.com/OzakIOne))
- [#9913](https://github.com/facebook/docusaurus/pull/9913) docs: update legacy MDX v1 links to markdown links ([@OzakIOne](https://github.com/OzakIOne))
- [#9906](https://github.com/facebook/docusaurus/pull/9906) docs: emphasize "index slug" convention ([@Josh-Cena](https://github.com/Josh-Cena))
- [#9877](https://github.com/facebook/docusaurus/pull/9877) docs: fix typos in deployment.mdx ([@Oreoxmt](https://github.com/Oreoxmt))
- [#9845](https://github.com/facebook/docusaurus/pull/9845) docs: typo ([@OzakIOne](https://github.com/OzakIOne))
- [#9816](https://github.com/facebook/docusaurus/pull/9816) docs: Add docs for Mermaid Component ([@Its-Just-Nans](https://github.com/Its-Just-Nans))

#### :robot: Dependencies

- [#9981](https://github.com/facebook/docusaurus/pull/9981) chore(deps): bump actions/dependency-review-action from 4.1.3 to 4.2.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#9982](https://github.com/facebook/docusaurus/pull/9982) chore(deps): bump katex from 0.16.8 to 0.16.10 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#9983](https://github.com/facebook/docusaurus/pull/9983) chore(deps): bump express from 4.18.2 to 4.19.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#9977](https://github.com/facebook/docusaurus/pull/9977) chore(deps): bump webpack-dev-middleware from 5.3.3 to 5.3.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#9958](https://github.com/facebook/docusaurus/pull/9958) chore(deps): bump follow-redirects from 1.15.4 to 1.15.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#9892](https://github.com/facebook/docusaurus/pull/9892) chore(deps): bump actions/dependency-review-action from 4.1.2 to 4.1.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#9869](https://github.com/facebook/docusaurus/pull/9869) chore(deps): bump actions/dependency-review-action from 4.0.0 to 4.1.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#9874](https://github.com/facebook/docusaurus/pull/9874) chore(deps): bump ip from 2.0.0 to 2.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#9843](https://github.com/facebook/docusaurus/pull/9843) chore(deps): bump actions/setup-node from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#9824](https://github.com/facebook/docusaurus/pull/9824) chore(deps): bump treosh/lighthouse-ci-action from 10.1.0 to 11.4.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#9823](https://github.com/facebook/docusaurus/pull/9823) chore(deps): bump marocchino/sticky-pull-request-comment from 2.8.0 to 2.9.0 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :wrench: Maintenance

- `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-docs`, `docusaurus-utils-common`, `docusaurus-utils-validation`, `docusaurus-utils`, `docusaurus`
  - [#9972](https://github.com/facebook/docusaurus/pull/9972) refactor(utils): remove duplicated function ([@OzakIOne](https://github.com/OzakIOne))
- Other
  - [#9965](https://github.com/facebook/docusaurus/pull/9965) refactor(website): organise blog posts by year ([@GingerGeek](https://github.com/GingerGeek))
  - [#9865](https://github.com/facebook/docusaurus/pull/9865) chore(website): update @crowdin/crowdin-api-client ([@chris-bateman](https://github.com/chris-bateman))
- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-utils`
  - [#9963](https://github.com/facebook/docusaurus/pull/9963) refactor(docs,blog): last update timestamp should be in milliseconds instead of seconds ([@slorber](https://github.com/slorber))

#### Committers: 22

- Aolin ([@Oreoxmt](https://github.com/Oreoxmt))
- Anatoly Kopyl ([@anatolykopyl](https://github.com/anatolykopyl))
- Chris Bateman ([@chris-bateman](https://github.com/chris-bateman))
- Fafowora Sunkanmi ([@sunkanmii](https://github.com/sunkanmii))
- Hallbjörn Magnússon ([@Hallinn](https://github.com/Hallinn))
- John Reilly ([@johnnyreilly](https://github.com/johnnyreilly))
- Joshua Chen ([@Josh-Cena](https://github.com/Josh-Cena))
- Josue [4tro] A ([@4troDev](https://github.com/4troDev))
- Liviu Ionescu ([@ilg-ul](https://github.com/ilg-ul))
- Max Schmitt ([@mxschmitt](https://github.com/mxschmitt))
- Rafael Martins ([@Rafael-Martins](https://github.com/Rafael-Martins))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Vahid Naderi ([@VahidNaderi](https://github.com/VahidNaderi))
- Vlad Nestorov ([@vlad-nestorov](https://github.com/vlad-nestorov))
- Zed Spencer-Milnes ([@GingerGeek](https://github.com/GingerGeek))
- axel7083 ([@axel7083](https://github.com/axel7083))
- krinza.eth ([@kaymomin](https://github.com/kaymomin))
- n4n5 ([@Its-Just-Nans](https://github.com/Its-Just-Nans))
- ozaki ([@OzakIOne](https://github.com/OzakIOne))
- suenryu ([@Suenaga-Ryuya](https://github.com/Suenaga-Ryuya))
- Нуриль Барадусов ([@baradusov](https://github.com/baradusov))
- 翊小久 ([@yixiaojiu](https://github.com/yixiaojiu))

## 3.1.1 (2024-01-26)

#### :bug: Bug Fix

- `docusaurus-types`, `docusaurus`
  - [#9791](https://github.com/facebook/docusaurus/pull/9791) fix(core): broken links optimization behaves differently than non-optimized logic ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#9788](https://github.com/facebook/docusaurus/pull/9788) fix(core): links with target "\_blank" should no be checked by the broken link checker ([@slorber](https://github.com/slorber))
  - [#9407](https://github.com/facebook/docusaurus/pull/9407) fix(core): conditionally include `hostname` parameter when using… ([@jack-robson](https://github.com/jack-robson))
- `docusaurus-utils`
  - [#9776](https://github.com/facebook/docusaurus/pull/9776) fix(mdx-loader): allow spaces before `mdx-code-block` info string ([@eitsupi](https://github.com/eitsupi))
- `create-docusaurus`
  - [#9783](https://github.com/facebook/docusaurus/pull/9783) fix(create-docusaurus): fix typo in init template sample docs ([@dawei-wang](https://github.com/dawei-wang))
- `docusaurus-theme-common`
  - [#9727](https://github.com/facebook/docusaurus/pull/9727) fix(theme-common): fix missing code block MagicComments style in Visual Basic (.NET) 16 ([@tats-u](https://github.com/tats-u))
- `docusaurus-theme-classic`, `docusaurus-theme-mermaid`
  - [#9733](https://github.com/facebook/docusaurus/pull/9733) fix: remove old useless mdx typedefs ([@slorber](https://github.com/slorber))
- `docusaurus-module-type-aliases`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-utils`, `docusaurus`
  - [#9732](https://github.com/facebook/docusaurus/pull/9732) fix(core): various broken anchor link fixes ([@slorber](https://github.com/slorber))

#### :zap: Performance

- `docusaurus`
  - [#9778](https://github.com/facebook/docusaurus/pull/9778) perf(core): optimize broken links checker ([@slorber](https://github.com/slorber))

#### :nail_care: Polish

- `docusaurus-theme-classic`
  - [#9470](https://github.com/facebook/docusaurus/pull/9470) polish(theme): MDX images should use async decoding ([@sanjaiyan-dev](https://github.com/sanjaiyan-dev))

#### Committers: 6

- Jack Robson ([@jack-robson](https://github.com/jack-robson))
- Sanjaiyan Parthipan ([@sanjaiyan-dev](https://github.com/sanjaiyan-dev))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Tatsunori Uchino ([@tats-u](https://github.com/tats-u))
- [@dawei-wang](https://github.com/dawei-wang)
- [@eitsupi](https://github.com/eitsupi)

## 3.1.0 (2024-01-05)

#### :rocket: New Feature

- `docusaurus-mdx-loader`, `docusaurus-module-type-aliases`, `docusaurus-theme-classic`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#9528](https://github.com/facebook/docusaurus/pull/9528) feat(core): make broken link checker detect broken anchors - add `onBrokenAnchors` config ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-mdx-loader`, `docusaurus-types`, `docusaurus`
  - [#9674](https://github.com/facebook/docusaurus/pull/9674) feat(mdx-loader): add support for siteConfig.markdown.remarkRehypeOptions ([@slorber](https://github.com/slorber))
- `docusaurus-theme-common`
  - [#9671](https://github.com/facebook/docusaurus/pull/9671) feat(theme-common): code block MagicComments support for (Visual) Basic/Batch/Fortran/COBOL/ML ([@tats-u](https://github.com/tats-u))
- `docusaurus-mdx-loader`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#9624](https://github.com/facebook/docusaurus/pull/9624) feat: siteConfig.markdown.parseFrontMatter hook ([@slorber](https://github.com/slorber))
- `docusaurus-utils`
  - [#9610](https://github.com/facebook/docusaurus/pull/9610) feat(core): enable port configuration via environment variable ([@OzakIOne](https://github.com/OzakIOne))

#### :bug: Bug Fix

- `docusaurus-theme-classic`, `docusaurus-theme-live-codeblock`
  - [#9704](https://github.com/facebook/docusaurus/pull/9704) fix(theme): allow empty code blocks and live playgrounds ([@slorber](https://github.com/slorber))
- `create-docusaurus`
  - [#9696](https://github.com/facebook/docusaurus/pull/9696) fix(create-docusaurus): fix init template code blocks, and little improvements ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-pwa`
  - [#9668](https://github.com/facebook/docusaurus/pull/9668) fix(pwa-plugin): upgrade workbox ([@SimenB](https://github.com/SimenB))
- `docusaurus`
  - [#9648](https://github.com/facebook/docusaurus/pull/9648) fix(cli): output help when no conventional config + no subcommand ([@Josh-Cena](https://github.com/Josh-Cena))
- `docusaurus-theme-live-codeblock`
  - [#9631](https://github.com/facebook/docusaurus/pull/9631) fix(live-codeblock): stabilize react-live transformCode callback, fix editor/preview desync ([@slorber](https://github.com/slorber))
- `docusaurus-utils`
  - [#9617](https://github.com/facebook/docusaurus/pull/9617) fix(utils): Markdown link replacement with <> but no spaces ([@Josh-Cena](https://github.com/Josh-Cena))
- `docusaurus-module-type-aliases`
  - [#9612](https://github.com/facebook/docusaurus/pull/9612) fix(type-aliases): add `title` prop for imported inline SVG React components ([@axmmisaka](https://github.com/axmmisaka))
- `docusaurus-plugin-content-blog`
  - [#9581](https://github.com/facebook/docusaurus/pull/9581) fix(content-blog): add baseUrl for author.image_url ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-theme-translations`
  - [#9477](https://github.com/facebook/docusaurus/pull/9477) fix(i18n): complete translations for theme-common.json Brazilian Portuguese (pt-BR) ([@c0h1b4](https://github.com/c0h1b4))

#### :nail_care: Polish

- `docusaurus-theme-common`
  - [#9335](https://github.com/facebook/docusaurus/pull/9335) refactor(theme-common): allow optional desktopBreakpoint param in useWindowSize ([@jgarrow](https://github.com/jgarrow))

#### :wrench: Maintenance

- `docusaurus-theme-search-algolia`
  - [#9604](https://github.com/facebook/docusaurus/pull/9604) chore: add lint autofix CI job ([@slorber](https://github.com/slorber))

#### Committers: 8

- Janessa Garrow ([@jgarrow](https://github.com/jgarrow))
- Joshua Chen ([@Josh-Cena](https://github.com/Josh-Cena))
- Simen Bekkhus ([@SimenB](https://github.com/SimenB))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Tatsunori Uchino ([@tats-u](https://github.com/tats-u))
- [@c0h1b4](https://github.com/c0h1b4)
- axmmisaka ([@axmmisaka](https://github.com/axmmisaka))
- ozaki ([@OzakIOne](https://github.com/OzakIOne))

## 3.0.1 (2023-11-30)

#### :bug: Bug Fix

- `docusaurus-utils`
  - [#9570](https://github.com/facebook/docusaurus/pull/9570) fix: add v2 retrocompatible support for quoted admonitions ([@slorber](https://github.com/slorber))
  - [#9535](https://github.com/facebook/docusaurus/pull/9535) fix: v3 admonitions should support v2 title syntax for nested admonitions ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#9567](https://github.com/facebook/docusaurus/pull/9567) fix(theme): upgrade prism-react-renderer, fix html script and style tag highlighting ([@slorber](https://github.com/slorber))
- `docusaurus-theme-common`
  - [#9531](https://github.com/facebook/docusaurus/pull/9531) fix(theme): docs html sidebar items should always be visible ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`
  - [#9530](https://github.com/facebook/docusaurus/pull/9530) fix(theme): fix firefox CSS :has() support bug ([@slorber](https://github.com/slorber))
- `create-docusaurus`
  - [#9487](https://github.com/facebook/docusaurus/pull/9487) fix(create-docusaurus): fix readme docusaurus 2 ref ([@slorber](https://github.com/slorber))

#### :robot: Dependencies

- `docusaurus-plugin-debug`
  - [#9566](https://github.com/facebook/docusaurus/pull/9566) chore(debug-plugin): migrate to a new maintained JSON Viewer ([@mcrstudio](https://github.com/mcrstudio))
- `create-docusaurus`, `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#9572](https://github.com/facebook/docusaurus/pull/9572) chore: upgrade prism-react-renderer to 2.3.0 to avoid older clsx ([@harryzcy](https://github.com/harryzcy))
  - [#9567](https://github.com/facebook/docusaurus/pull/9567) fix(theme): upgrade prism-react-renderer, fix html script and style tag highlighting ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-plugin-pwa`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-search-algolia`
  - [#9464](https://github.com/facebook/docusaurus/pull/9464) chore: Upgrade clsx to 2.0.0 ([@harryzcy](https://github.com/harryzcy))
- `docusaurus`
  - [#9547](https://github.com/facebook/docusaurus/pull/9547) chore(core): replace `wait-on` dependency with custom lighter code ([@NickGerleman](https://github.com/NickGerleman))
- `docusaurus-plugin-pwa`, `docusaurus`
  - [#9529](https://github.com/facebook/docusaurus/pull/9529) chore: ugrade babel dependencies to v7.23.3 ([@reece-white](https://github.com/reece-white))

#### Committers: 6

- Chongyi Zheng ([@harryzcy](https://github.com/harryzcy))
- MCR Studio ([@mcrstudio](https://github.com/mcrstudio))
- Nick Gerleman ([@NickGerleman](https://github.com/NickGerleman))
- Shreesh Nautiyal ([@Shreesh09](https://github.com/Shreesh09))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- [@reece-white](https://github.com/reece-white)

## 3.0.0 (2023-10-31)

#### :boom: Breaking Change

- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-plugin-content-blog`, `docusaurus-remark-plugin-npm2yarn`, `docusaurus-theme-classic`
  - [#9451](https://github.com/facebook/docusaurus/pull/9451) feat(mdx-loader): upgrade to MDX v3 ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-ideal-image`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#9317](https://github.com/facebook/docusaurus/pull/9317) feat(core): support TypeScript + ESM configuration ([@harryzcy](https://github.com/harryzcy))
- `create-docusaurus`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus`
  - [#9316](https://github.com/facebook/docusaurus/pull/9316) chore: upgrade syntax highlighting dependencies, `prism-react-renderer` to v2, `react-live` to v4 ([@harryzcy](https://github.com/harryzcy))
- `create-docusaurus`, `docusaurus-cssnano-preset`, `docusaurus-logger`, `docusaurus-mdx-loader`, `docusaurus-migrate`, `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-debug`, `docusaurus-plugin-google-analytics`, `docusaurus-plugin-google-gtag`, `docusaurus-plugin-google-tag-manager`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-plugin-sitemap`, `docusaurus-preset-classic`, `docusaurus-remark-plugin-npm2yarn`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`, `docusaurus-theme-search-algolia`, `docusaurus-theme-translations`, `docusaurus-utils-common`, `docusaurus-utils-validation`, `docusaurus-utils`, `docusaurus`, `eslint-plugin`, `lqip-loader`
  - [#9348](https://github.com/facebook/docusaurus/pull/9348) chore: update node engine version 18 ([@OzakIOne](https://github.com/OzakIOne))
- `docusaurus-plugin-content-docs`, `docusaurus-theme-classic`
  - [#9310](https://github.com/facebook/docusaurus/pull/9310) chore(plugin-docs): remove legacy versioned prefix on doc ids and sidebar names in versioned sidebars ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-translations`
  - [#9308](https://github.com/facebook/docusaurus/pull/9308) fix(theme): make warning a first-class admonition, and deprecate caution admonition ([@slorber](https://github.com/slorber))
- `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`
  - [#9305](https://github.com/facebook/docusaurus/pull/9305) feat(theme-mermaid): upgrade Mermaid to v10.4 - handle async rendering ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-debug`, `docusaurus-plugin-google-analytics`, `docusaurus-plugin-google-gtag`, `docusaurus-plugin-google-tag-manager`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`, `docusaurus-theme-search-algolia`, `docusaurus-tsconfig`, `docusaurus`
  - [#9258](https://github.com/facebook/docusaurus/pull/9258) feat: Docusaurus v3 upgrades and require TypeScript 5 ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`
  - [#9189](https://github.com/facebook/docusaurus/pull/9189) feat(blog-plugin): limit option for blog feedOptions ([@johnnyreilly](https://github.com/johnnyreilly))
- `create-docusaurus`, `docusaurus-tsconfig`
  - [#9050](https://github.com/facebook/docusaurus/pull/9050) feat: create official TypeScript base config @docusaurus/tsconfig ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-module-type-aliases`, `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-debug`, `docusaurus-plugin-google-analytics`, `docusaurus-plugin-google-gtag`, `docusaurus-plugin-google-tag-manager`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-plugin-sitemap`, `docusaurus-preset-classic`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`, `docusaurus-theme-search-algolia`, `docusaurus-types`, `docusaurus`
  - [#8961](https://github.com/facebook/docusaurus/pull/8961) feat: React 18 + automatic JSX runtime + build --dev ([@slorber](https://github.com/slorber))
- `create-docusaurus`
  - [#9026](https://github.com/facebook/docusaurus/pull/9026) chore: remove facebook template ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-migrate`, `docusaurus-plugin-content-blog`, `docusaurus-remark-plugin-npm2yarn`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-mermaid`, `docusaurus-types`, `docusaurus-utils-validation`, `docusaurus-utils`, `docusaurus`
  - [#8288](https://github.com/facebook/docusaurus/pull/8288) feat: upgrade to MDX v2 ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-docs`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus`
  - [#7966](https://github.com/facebook/docusaurus/pull/7966) fix(plugin-docs,theme): refactor docs plugin routes and component tree ([@slorber](https://github.com/slorber))

#### :rocket: New Feature

- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-plugin-content-blog`, `docusaurus-remark-plugin-npm2yarn`, `docusaurus-theme-classic`
  - [#9451](https://github.com/facebook/docusaurus/pull/9451) feat(mdx-loader): upgrade to MDX v3 ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`, `docusaurus-utils`
  - [#9394](https://github.com/facebook/docusaurus/pull/9394) feat(mdx-loader): Remark plugin to report unused MDX / Markdown directives ([@OzakIOne](https://github.com/OzakIOne))
- `create-docusaurus`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-ideal-image`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`
  - [#9317](https://github.com/facebook/docusaurus/pull/9317) feat(core): support TypeScript + ESM configuration ([@harryzcy](https://github.com/harryzcy))
- `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`
  - [#9305](https://github.com/facebook/docusaurus/pull/9305) feat(theme-mermaid): upgrade Mermaid to v10.4 - handle async rendering ([@slorber](https://github.com/slorber))
- `create-docusaurus`
  - [#9241](https://github.com/facebook/docusaurus/pull/9241) feat: support bun package manager in `create-docusaurus` ([@colinhacks](https://github.com/colinhacks))
- `docusaurus-plugin-content-blog`
  - [#9189](https://github.com/facebook/docusaurus/pull/9189) feat(blog-plugin): limit option for blog feedOptions ([@johnnyreilly](https://github.com/johnnyreilly))
- `docusaurus-theme-classic`
  - [#9152](https://github.com/facebook/docusaurus/pull/9152) feat(theme): add support for meta og locale and alternates ([@FlorinaPacurar](https://github.com/FlorinaPacurar))
  - [#9028](https://github.com/facebook/docusaurus/pull/9028) feat(theme): add ability to inject data attributes from query-string - possibility to create an iframe/embed variant of a page ([@slorber](https://github.com/slorber))
  - [#8915](https://github.com/facebook/docusaurus/pull/8915) feat(theme): add queryString option to localeDropdown ([@wceolin](https://github.com/wceolin))
- `docusaurus-plugin-client-redirects`, `docusaurus-utils-validation`
  - [#9171](https://github.com/facebook/docusaurus/pull/9171) feat(client-redirects-plugin): support fully qualified urls and querystring/hash in destination/to url ([@slorber](https://github.com/slorber))
- `docusaurus`
  - [#9102](https://github.com/facebook/docusaurus/pull/9102) feat(cli): deploy command should allow customizing git config user.name / user.email in deployment branch (#9101) ([@amdshrif](https://github.com/amdshrif))
- `docusaurus-mdx-loader`, `docusaurus-types`, `docusaurus`
  - [#9097](https://github.com/facebook/docusaurus/pull/9097) feat(mdx): add siteConfig.markdown.format to configure the default content parser (MDX / CommonMark) ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-pages`, `docusaurus-theme-classic`
  - [#9071](https://github.com/facebook/docusaurus/pull/9071) feat(pages): add support for missing SEO front matter + improve SEO docs ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-tsconfig`
  - [#9050](https://github.com/facebook/docusaurus/pull/9050) feat: create official TypeScript base config @docusaurus/tsconfig ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-module-type-aliases`, `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-debug`, `docusaurus-plugin-google-analytics`, `docusaurus-plugin-google-gtag`, `docusaurus-plugin-google-tag-manager`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-plugin-sitemap`, `docusaurus-preset-classic`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`, `docusaurus-theme-search-algolia`, `docusaurus-types`, `docusaurus`
  - [#8961](https://github.com/facebook/docusaurus/pull/8961) feat: React 18 + automatic JSX runtime + build --dev ([@slorber](https://github.com/slorber))
- `docusaurus-theme-common`
  - [#8982](https://github.com/facebook/docusaurus/pull/8982) feat(theme-common): code block MagicComments support for TeX/LaTeX/Matlab ([@jj-style](https://github.com/jj-style))
  - [#8870](https://github.com/facebook/docusaurus/pull/8870) feat(theme-common): code block MagicComments support for Lua/Haskell -- and WebAssembly ;; ([@tarunrajput](https://github.com/tarunrajput))
- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-migrate`, `docusaurus-plugin-content-blog`, `docusaurus-remark-plugin-npm2yarn`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-mermaid`, `docusaurus-types`, `docusaurus-utils-validation`, `docusaurus-utils`, `docusaurus`
  - [#8288](https://github.com/facebook/docusaurus/pull/8288) feat: upgrade to MDX v2 ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#8890](https://github.com/facebook/docusaurus/pull/8890) feat(theme): create more generic ThemedComponent util from ThemedImage ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-theme-classic`, `docusaurus-theme-search-algolia`, `eslint-plugin`
  - [#8384](https://github.com/facebook/docusaurus/pull/8384) feat(eslint-plugin): new prefer-docusaurus-heading rule ([@Devansu-Yadav](https://github.com/Devansu-Yadav))
- `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-search-algolia`, `docusaurus`, `eslint-plugin`
  - [#8156](https://github.com/facebook/docusaurus/pull/8156) feat: add eslint plugin no-html-links ([@JohnVicke](https://github.com/JohnVicke))
- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-translations`, `docusaurus-utils-validation`, `docusaurus-utils`
  - [#8004](https://github.com/facebook/docusaurus/pull/8004) feat(docs,blog,pages): add support for "unlisted" front matter - hide md content in production ([@jodyheavener](https://github.com/jodyheavener))

#### :bug: Bug Fix

- `docusaurus-theme-common`
  - [#9446](https://github.com/facebook/docusaurus/pull/9446) fix(theme): fix useWindowSize React hydration issue ([@slorber](https://github.com/slorber))
  - [#9276](https://github.com/facebook/docusaurus/pull/9276) fix(theme-common): remove useless useSyncExternalStore shim ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`
  - [#9437](https://github.com/facebook/docusaurus/pull/9437) fix(plugin-blog): blog archive should hide unlisted blog posts ([@slorber](https://github.com/slorber))
  - [#9151](https://github.com/facebook/docusaurus/pull/9151) fix(content-blog): links in feed should be absolute ([@VinceCYLiao](https://github.com/VinceCYLiao))
- `docusaurus`
  - [#9387](https://github.com/facebook/docusaurus/pull/9387) fix(core): log missing errorInfo in React 18 onRecoverableError callback ([@johnnyreilly](https://github.com/johnnyreilly))
  - [#9309](https://github.com/facebook/docusaurus/pull/9309) fix(cli): disable vertical borders of the update notification ([@qwerzl](https://github.com/qwerzl))
  - [#9112](https://github.com/facebook/docusaurus/pull/9112) fix(core): throw error if build folder already exists on initial clean ([@thedevwonder](https://github.com/thedevwonder))
  - [#9006](https://github.com/facebook/docusaurus/pull/9006) fix(core): docusaurus CLI should detect the correct yarn version when suggesting upgrades ([@0420syj](https://github.com/0420syj))
  - [#7951](https://github.com/facebook/docusaurus/pull/7951) fix(core): make webpack HMR always listen to current location ([@jeengbe](https://github.com/jeengbe))
- `docusaurus-mdx-loader`
  - [#9386](https://github.com/facebook/docusaurus/pull/9386) fix(mdx-loader): get correct error line numbers, handle front matter + contentTitle with remark ([@slorber](https://github.com/slorber))
  - [#9262](https://github.com/facebook/docusaurus/pull/9262) fix(mdx-loader): improve mdxJsxTextElementToHtml ([@slorber](https://github.com/slorber))
  - [#9202](https://github.com/facebook/docusaurus/pull/9202) fix(mdx-loader): ensure heading anchor slugs respect GitHub emoji behavior ([@yosukekato165](https://github.com/yosukekato165))
  - [#9100](https://github.com/facebook/docusaurus/pull/9100) fix(mdx): fix for html multi-line comments ([@slorber](https://github.com/slorber))
  - [#9091](https://github.com/facebook/docusaurus/pull/9091) fix(mdx-loader): loader error message should display stacktrace if no extra MDX details ([@slorber](https://github.com/slorber))
  - [#8960](https://github.com/facebook/docusaurus/pull/8960) fix: allow html syntax in MDX v2 with format md ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`
  - [#9385](https://github.com/facebook/docusaurus/pull/9385) fix(theme): avoid rendering empty search container if site has no search plugin ([@slorber](https://github.com/slorber))
  - [#9183](https://github.com/facebook/docusaurus/pull/9183) fix(theme): make Prism code block language / additionalLanguages case insensitive ([@heysujal](https://github.com/heysujal))
  - [#9216](https://github.com/facebook/docusaurus/pull/9216) fix(theme): fix typo in swizzle component config ([@sixhobbits](https://github.com/sixhobbits))
  - [#9093](https://github.com/facebook/docusaurus/pull/9093) fix(theme): support details/summary in CommonMark + add md dogfood test cases ([@slorber](https://github.com/slorber))
- `docusaurus-mdx-loader`, `docusaurus-utils`
  - [#9369](https://github.com/facebook/docusaurus/pull/9369) fix(mdx-loader): prevent Open Graph images from being inserted as base64 ([@Zwyx](https://github.com/Zwyx))
- `docusaurus-theme-translations`
  - [#9362](https://github.com/facebook/docusaurus/pull/9362) fix(theme-translations): add Japanese translation for "warning" ([@tats-u](https://github.com/tats-u))
  - [#9321](https://github.com/facebook/docusaurus/pull/9321) fix(theme-translations): add missing zh-Hans messages ([@chudongvip](https://github.com/chudongvip))
  - [#9338](https://github.com/facebook/docusaurus/pull/9338) fix(theme-translations): complete and fix hungarian translations ([@la55u](https://github.com/la55u))
  - [#9292](https://github.com/facebook/docusaurus/pull/9292) fix(theme-translations): add missing Spanish theme translations ([@Villanuevand](https://github.com/Villanuevand))
  - [#9021](https://github.com/facebook/docusaurus/pull/9021) fix(theme-transalations): fix Swedish translation of "last updated" ([@gazab](https://github.com/gazab))
- `docusaurus-theme-classic`, `docusaurus-theme-translations`
  - [#9308](https://github.com/facebook/docusaurus/pull/9308) fix(theme): make warning a first-class admonition, and deprecate caution admonition ([@slorber](https://github.com/slorber))
  - [#9269](https://github.com/facebook/docusaurus/pull/9269) fix(theme): improve docs sidebar category caret aria-label accessibility ([@pinakipb2](https://github.com/pinakipb2))
- Other
  - [#9260](https://github.com/facebook/docusaurus/pull/9260) fix(website): fix showcase search input ([@biplavmz](https://github.com/biplavmz))
  - [#8193](https://github.com/facebook/docusaurus/pull/8193) fix(website): mobile scroll on homepage announcement ([@maliMirkec](https://github.com/maliMirkec))
  - [#8042](https://github.com/facebook/docusaurus/pull/8042) fix(website): fix blog post social card ([@slorber](https://github.com/slorber))
- `create-docusaurus`
  - [#9217](https://github.com/facebook/docusaurus/pull/9217) fix(create-docusaurus): increase Browserslist support query in dev ([@slorber](https://github.com/slorber))
- `docusaurus-utils`, `docusaurus`
  - [#9160](https://github.com/facebook/docusaurus/pull/9160) fix(core): handle single quotes inside file paths ([@Josh-Cena](https://github.com/Josh-Cena))
- `docusaurus-plugin-debug`
  - [#9116](https://github.com/facebook/docusaurus/pull/9116) fix(debug-plugin): upgrade react-json-view to maintained React-18 compatible fork ([@slorber](https://github.com/slorber))
- `docusaurus-utils`
  - [#9046](https://github.com/facebook/docusaurus/pull/9046) fix(utils): better handling of code blocks in link replacement ([@Josh-Cena](https://github.com/Josh-Cena))
  - [#8927](https://github.com/facebook/docusaurus/pull/8927) fix(utils): make Markdown link replacement much more rigorous ([@Josh-Cena](https://github.com/Josh-Cena))
  - [#7864](https://github.com/facebook/docusaurus/pull/7864) fix(utils): always match exclusion root dirs as complete folder paths ([@Josh-Cena](https://github.com/Josh-Cena))
  - [#7801](https://github.com/facebook/docusaurus/pull/7801) fix(utils): recognize ~~~ as code fences in link replacement ([@Josh-Cena](https://github.com/Josh-Cena))
- `docusaurus-plugin-pwa`, `docusaurus`
  - [#8872](https://github.com/facebook/docusaurus/pull/8872) fix(core): better error logging on SSR/dev failures + log stacktraces and error causes ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-utils-validation`, `docusaurus`
  - [#8258](https://github.com/facebook/docusaurus/pull/8258) fix(docusaurus-utils-validation): baseUrl + routeBasePath: allow empty string, normalized as "/" ([@Djunnni](https://github.com/Djunnni))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#8319](https://github.com/facebook/docusaurus/pull/8319) fix(docs,theme): auto-generated category index should not display unlisted content ([@slorber](https://github.com/slorber))
- `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`
  - [#8015](https://github.com/facebook/docusaurus/pull/8015) fix(live-codeblock): add error boundary to live code preview ([@rashidmya](https://github.com/rashidmya))
- `docusaurus-mdx-loader`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-utils-validation`, `docusaurus`
  - [#7945](https://github.com/facebook/docusaurus/pull/7945) refactor(theme): split admonitions, make swizzle easier, better retrocompatibility ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-docs`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus`
  - [#7966](https://github.com/facebook/docusaurus/pull/7966) fix(plugin-docs,theme): refactor docs plugin routes and component tree ([@slorber](https://github.com/slorber))

#### :zap: Performance

- `docusaurus`
  - [#9051](https://github.com/facebook/docusaurus/pull/9051) perf(core): use React 18 startTransition for hydration ([@sanjaiyan-dev](https://github.com/sanjaiyan-dev))
  - [#8081](https://github.com/facebook/docusaurus/pull/8081) perf(core): move scripts to document head + defer ([@sanjaiyan-dev](https://github.com/sanjaiyan-dev))
- `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus`
  - [#8972](https://github.com/facebook/docusaurus/pull/8972) fix: remove useless js-loader in front of mdx-loader ([@slorber](https://github.com/slorber))

#### :nail_care: Polish

- `docusaurus-theme-classic`
  - [#9438](https://github.com/facebook/docusaurus/pull/9438) refactor(blog-plugin): blog archive reverse ordering of posts ([@slorber](https://github.com/slorber))
  - [#9184](https://github.com/facebook/docusaurus/pull/9184) fix(theme): change schema.org itemType prop urls from http to https ([@thedevwonder](https://github.com/thedevwonder))
- `docusaurus`
  - [#9381](https://github.com/facebook/docusaurus/pull/9381) feat(core): throw error when official docusaurus dependencies use different versions ([@JorensM](https://github.com/JorensM))
- `docusaurus-theme-translations`
  - [#9302](https://github.com/facebook/docusaurus/pull/9302) chore(theme-translations): complete zh-Hant translations ([@qwerzl](https://github.com/qwerzl))
  - [#9025](https://github.com/facebook/docusaurus/pull/9025) chore(theme-translations): complete it translations ([@bitpredator](https://github.com/bitpredator))
- `create-docusaurus`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus`
  - [#9133](https://github.com/facebook/docusaurus/pull/9133) fix(init): change initial site URL to one that is safe for the future ([@tats-u](https://github.com/tats-u))
- `docusaurus-theme-classic`, `docusaurus-theme-common`
  - [#8150](https://github.com/facebook/docusaurus/pull/8150) fix(theme-classic): polish admonition details, render title-only admonitions ([@attitude](https://github.com/attitude))
- `docusaurus-plugin-google-gtag`
  - [#8143](https://github.com/facebook/docusaurus/pull/8143) refactor(plugin-gtag): update gtag plugin to modern SPA recommendations ([@lanegoolsby](https://github.com/lanegoolsby))
- `docusaurus-mdx-loader`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-utils-validation`, `docusaurus`
  - [#7945](https://github.com/facebook/docusaurus/pull/7945) refactor(theme): split admonitions, make swizzle easier, better retrocompatibility ([@slorber](https://github.com/slorber))

#### :memo: Documentation

- Other
  - [#9452](https://github.com/facebook/docusaurus/pull/9452) docs: v3 upgrade guide should mention MDX v1 compat options ([@slorber](https://github.com/slorber))
  - [#9430](https://github.com/facebook/docusaurus/pull/9430) docs: update Kinsta deployment documentation ([@palmiak](https://github.com/palmiak))
  - [#9417](https://github.com/facebook/docusaurus/pull/9417) docs: add Docusaurus v3.0 upgrade guide ([@slorber](https://github.com/slorber))
  - [#9396](https://github.com/facebook/docusaurus/pull/9396) docs: fix typos in website/docs/i18n/i18n-git.mdx ([@suravshrestha](https://github.com/suravshrestha))
  - [#9397](https://github.com/facebook/docusaurus/pull/9397) docs: fix typos in website/docs/migration/migration-manual.mdx ([@suravshrestha](https://github.com/suravshrestha))
  - [#9388](https://github.com/facebook/docusaurus/pull/9388) docs: fix algolia crowler config template link for v3 ([@slorber](https://github.com/slorber))
  - [#9377](https://github.com/facebook/docusaurus/pull/9377) docs(deployment): add permissions config to github action file in v2.4.3 ([@chillinPanda](https://github.com/chillinPanda))
  - [#9333](https://github.com/facebook/docusaurus/pull/9333) docs: "Preparing your site for Docusaurus v3" blog post ([@slorber](https://github.com/slorber))
  - [#9330](https://github.com/facebook/docusaurus/pull/9330) docs: "Upgrading frontend dependencies with confidence" blog post ([@slorber](https://github.com/slorber))
  - [#9288](https://github.com/facebook/docusaurus/pull/9288) docs: fix bad link for create doc ([@forresst](https://github.com/forresst))
  - [#9267](https://github.com/facebook/docusaurus/pull/9267) docs: fix typo in docs-introduction ([@HyeokjinKang](https://github.com/HyeokjinKang))
  - [#9247](https://github.com/facebook/docusaurus/pull/9247) docs: Reword comparison between React authoring and CSS authoring ([@hidde](https://github.com/hidde))
  - [#9223](https://github.com/facebook/docusaurus/pull/9223) docs: fix grammatical error, rewrite sentence to make clearer ([@thatrobotdev](https://github.com/thatrobotdev))
  - [#9233](https://github.com/facebook/docusaurus/pull/9233) docs(website): Add a "clearAll" Feature to site showcase ([@biplavmz](https://github.com/biplavmz))
  - [#9180](https://github.com/facebook/docusaurus/pull/9180) docs: remove 'import type' declaration in javascript snippet ([@oluwatobiss](https://github.com/oluwatobiss))
  - [#9177](https://github.com/facebook/docusaurus/pull/9177) docs: improve the opening sentence's clarity ([@oluwatobiss](https://github.com/oluwatobiss))
  - [#9149](https://github.com/facebook/docusaurus/pull/9149) docs: improve yarn deps upgrade command ([@webbertakken](https://github.com/webbertakken))
  - [#9139](https://github.com/facebook/docusaurus/pull/9139) docs: add Flightcontrol as a deployment option ([@ModupeD](https://github.com/ModupeD))
  - [#9082](https://github.com/facebook/docusaurus/pull/9082) docs: fix themeConfig.prism.defaultLanguage table api ref docs ([@razzeee](https://github.com/razzeee))
  - [#9074](https://github.com/facebook/docusaurus/pull/9074) docs: fix filenames in docs/swizzling.mdx ([@shwaka](https://github.com/shwaka))
  - [#9065](https://github.com/facebook/docusaurus/pull/9065) docs: update link for commonly used languages ([@heysujal](https://github.com/heysujal))
  - [#9055](https://github.com/facebook/docusaurus/pull/9055) docs: update outdated links in showcase ([@manuel-rw](https://github.com/manuel-rw))
  - [#9063](https://github.com/facebook/docusaurus/pull/9063) docs: add @markprompt/docusaurus-theme-search ([@schneegansm](https://github.com/schneegansm))
  - [#9033](https://github.com/facebook/docusaurus/pull/9033) docs: update info for community plugin docusaurus2-graphql-doc-generator ([@edno](https://github.com/edno))
  - [#9044](https://github.com/facebook/docusaurus/pull/9044) docs: fix prism theme broken link in code blocks docs ([@adithyaakrishna](https://github.com/adithyaakrishna))
  - [#9043](https://github.com/facebook/docusaurus/pull/9043) docs: fix grammar typo in swizzling.mdx ([@adampatterson](https://github.com/adampatterson))
  - [#9018](https://github.com/facebook/docusaurus/pull/9018) docs: fix link to rehype ([@Mogyuchi](https://github.com/Mogyuchi))
  - [#8993](https://github.com/facebook/docusaurus/pull/8993) docs: fix broken link in code blocks docs ([@NamanGarg2075](https://github.com/NamanGarg2075))
  - [#8975](https://github.com/facebook/docusaurus/pull/8975) docs: update link in md code blocks section ([@rbarbazz](https://github.com/rbarbazz))
  - [#8976](https://github.com/facebook/docusaurus/pull/8976) docs: update broken links theme configuration page ([@rbarbazz](https://github.com/rbarbazz))
  - [#8904](https://github.com/facebook/docusaurus/pull/8904) docs: fix broken link to Prism includeLangs.js default list of languages ([@conlacda](https://github.com/conlacda))
  - [#8951](https://github.com/facebook/docusaurus/pull/8951) docs: mention equivalent config syntaxes ([@thadguidry](https://github.com/thadguidry))
  - [#8950](https://github.com/facebook/docusaurus/pull/8950) docs: bidirectional link between api config and guide config ([@thadguidry](https://github.com/thadguidry))
  - [#8953](https://github.com/facebook/docusaurus/pull/8953) docs: mention blog truncating marker edge case ([@allyw2002](https://github.com/allyw2002))
  - [#8941](https://github.com/facebook/docusaurus/pull/8941) docs: rewrite some docs for mdx v2 ([@slorber](https://github.com/slorber))
  - [#8943](https://github.com/facebook/docusaurus/pull/8943) docs: mention docusaurus.community site in resources ([@thadguidry](https://github.com/thadguidry))
  - [#8920](https://github.com/facebook/docusaurus/pull/8920) docs: mdx-js is using v2 for next edition ([@jhcao23](https://github.com/jhcao23))
  - [#8888](https://github.com/facebook/docusaurus/pull/8888) docs: improve sidebar items custom props docs ([@slorber](https://github.com/slorber))
  - [#8877](https://github.com/facebook/docusaurus/pull/8877) docs: add "permissions.content: write" to GH workflow examples ([@e-minguez](https://github.com/e-minguez))
  - [#8845](https://github.com/facebook/docusaurus/pull/8845) docs: add description on blog post file/folder naming conventions and date extraction patterns ([@rojakcoder](https://github.com/rojakcoder))
  - [#8865](https://github.com/facebook/docusaurus/pull/8865) docs: correct small grammar error ([@werner33](https://github.com/werner33))
  - [#8830](https://github.com/facebook/docusaurus/pull/8830) docs: link to mermaid config types ([@PaulRBerg](https://github.com/PaulRBerg))
  - [#8804](https://github.com/facebook/docusaurus/pull/8804) docs: update suggestion for OSS meta projects ([@antonk52](https://github.com/antonk52))
  - [#8788](https://github.com/facebook/docusaurus/pull/8788) docs: remove problematic mdx2 anchor id docs for MDX 2 migration ([@slorber](https://github.com/slorber))
  - [#8780](https://github.com/facebook/docusaurus/pull/8780) docs: fix localhost url without link ([@slorber](https://github.com/slorber))
  - [#8779](https://github.com/facebook/docusaurus/pull/8779) docs: v2 docs should discourage the usage of a lower-case MDX component (will not work in v3) ([@slorber](https://github.com/slorber))
  - [#8761](https://github.com/facebook/docusaurus/pull/8761) docs: add mention that themeConfig.footer.copyright supports html strings ([@fxpby](https://github.com/fxpby))
  - [#8723](https://github.com/facebook/docusaurus/pull/8723) docs: add TypeScript playgrounds to docusaurus.new + Playground page ([@slorber](https://github.com/slorber))
  - [#8709](https://github.com/facebook/docusaurus/pull/8709) docs: add dark mode version of BrowserStack logo ([@fredrikstave](https://github.com/fredrikstave))
  - [#8642](https://github.com/facebook/docusaurus/pull/8642) docs: clarify query string behavior ([@homotechsual](https://github.com/homotechsual))
  - [#8576](https://github.com/facebook/docusaurus/pull/8576) docs(playground): use CodeSandbox cloud sandboxes ([@danilowoz](https://github.com/danilowoz))
  - [#8543](https://github.com/facebook/docusaurus/pull/8543) docs: add link to pluralization docs ([@homotechsual](https://github.com/homotechsual))
  - [#8556](https://github.com/facebook/docusaurus/pull/8556) docs: document plugin-content-pages wrapperClassName frontmatter. ([@homotechsual](https://github.com/homotechsual))
  - [#8548](https://github.com/facebook/docusaurus/pull/8548) docs: fix typo 'validationOptions' ([@gracefullight](https://github.com/gracefullight))
  - [#8509](https://github.com/facebook/docusaurus/pull/8509) docs(website): fix broken external links wrongly modified to use the .mdx extension (ex: github README.mdx) ([@Kesyau](https://github.com/Kesyau))
  - [#8507](https://github.com/facebook/docusaurus/pull/8507) docs: blog + community + dogfood docs should use .mdx extension ([@slorber](https://github.com/slorber))
  - [#8490](https://github.com/facebook/docusaurus/pull/8490) docs(website): use .mdx extension for every docs ([@slorber](https://github.com/slorber))
  - [#8484](https://github.com/facebook/docusaurus/pull/8484) docs: `plugin-content-sitemap` -> `plugin-sitemap` ([@chubei](https://github.com/chubei))
  - [#8454](https://github.com/facebook/docusaurus/pull/8454) fix(docs): Update link for tooljet website(broken) ([@shawshankkumar](https://github.com/shawshankkumar))
  - [#8443](https://github.com/facebook/docusaurus/pull/8443) docs: fix website home testimonials broken image URLs ([@abhinandanwadwa](https://github.com/abhinandanwadwa))
  - [#8438](https://github.com/facebook/docusaurus/pull/8438) docs: add hyperlink to swizzling in Search page ([@dandv](https://github.com/dandv))
  - [#8431](https://github.com/facebook/docusaurus/pull/8431) docs: add diagrams page to 2.2.0 sidebar ([@homotechsual](https://github.com/homotechsual))
  - [#8307](https://github.com/facebook/docusaurus/pull/8307) docs: clarify additionalLanguages with custom language definitions. ([@homotechsual](https://github.com/homotechsual))
  - [#8390](https://github.com/facebook/docusaurus/pull/8390) docs: changed actions/checkout version from 2 to 3 ([@cm-igarashi-ryosuke](https://github.com/cm-igarashi-ryosuke))
  - [#8262](https://github.com/facebook/docusaurus/pull/8262) docs: fix links to external plugin description ([@scubamaggo](https://github.com/scubamaggo))
  - [#8375](https://github.com/facebook/docusaurus/pull/8375) docs: add Kinsta to deployment page ([@palmiak](https://github.com/palmiak))
  - [#8417](https://github.com/facebook/docusaurus/pull/8417) docs: document theme-mermaid in API sidebar ([@homotechsual](https://github.com/homotechsual))
  - [#8392](https://github.com/facebook/docusaurus/pull/8392) docs: add i18n guide doc should link to i18n core config doc ([@mcallisto](https://github.com/mcallisto))
  - [#8388](https://github.com/facebook/docusaurus/pull/8388) docs: point to where commit types are listed ([@dandv](https://github.com/dandv))
  - [#8352](https://github.com/facebook/docusaurus/pull/8352) docs: actually demo the zero-width space workaround in MDX ([@waldyrious](https://github.com/waldyrious))
  - [#8363](https://github.com/facebook/docusaurus/pull/8363) docs: fix unclosed admonition code block ([@Zwyx](https://github.com/Zwyx))
  - [#8364](https://github.com/facebook/docusaurus/pull/8364) docs: autogenerated page comment does not matching dirName in examples ([@HumbleDeer](https://github.com/HumbleDeer))
  - [#8359](https://github.com/facebook/docusaurus/pull/8359) docs: fix anchor link `#customFields` ([@Zwyx](https://github.com/Zwyx))
  - [#8320](https://github.com/facebook/docusaurus/pull/8320) docs: remove blog.johnnyreilly.com Google Analytics tag from docs part 2 ([@johnnyreilly](https://github.com/johnnyreilly))
  - [#8335](https://github.com/facebook/docusaurus/pull/8335) docs: use Mermaid diagram for routing page ([@Mysterious-Dev](https://github.com/Mysterious-Dev))
  - [#8313](https://github.com/facebook/docusaurus/pull/8313) docs: link to migration guide from Blogger to Docusaurus / remove blog.johnnyreilly.com Google Analytics tag from docs ([@johnnyreilly](https://github.com/johnnyreilly))
  - [#8292](https://github.com/facebook/docusaurus/pull/8292) docs: document tag types for insertHtmlContent ([@homotechsual](https://github.com/homotechsual))
  - [#8272](https://github.com/facebook/docusaurus/pull/8272) docs: fix mermaid theme options typo ([@ntucker](https://github.com/ntucker))
  - [#8209](https://github.com/facebook/docusaurus/pull/8209) docs: removing community resource docusaurus-plugin-relative-paths ([@ShahriarKh](https://github.com/ShahriarKh))
  - [#8146](https://github.com/facebook/docusaurus/pull/8146) docs(content-docs): add api doc for displayed_sidebar front matter ([@slorber](https://github.com/slorber))
  - [#8115](https://github.com/facebook/docusaurus/pull/8115) docs: add caveat about using Translate in string contexts ([@Josh-Cena](https://github.com/Josh-Cena))
  - [#8053](https://github.com/facebook/docusaurus/pull/8053) docs: document usage of docs `frontMatter.custom_edit_url: null` ([@homotechsual](https://github.com/homotechsual))
  - [#8010](https://github.com/facebook/docusaurus/pull/8010) docs(showcase): add 74 new showcase sites ([@slorber](https://github.com/slorber))
  - [#7955](https://github.com/facebook/docusaurus/pull/7955) docs: add docusaurus-post-generator to community resource list ([@moojing](https://github.com/moojing))
  - [#7906](https://github.com/facebook/docusaurus/pull/7906) docs: add TOC heading level options to guide ([@Josh-Cena](https://github.com/Josh-Cena))
  - [#7884](https://github.com/facebook/docusaurus/pull/7884) docs: add baseUrl to example tsconfig ([@Foosballfan](https://github.com/Foosballfan))
  - [#7835](https://github.com/facebook/docusaurus/pull/7835) docs: update workbox doc link ([@hslee2008](https://github.com/hslee2008))
  - [#7799](https://github.com/facebook/docusaurus/pull/7799) docs: formally document how admonitions can be customized ([@Josh-Cena](https://github.com/Josh-Cena))
  - [#7796](https://github.com/facebook/docusaurus/pull/7796) docs: modify the description of deploying to Netlify ([@Oreoxmt](https://github.com/Oreoxmt))
- `docusaurus-logger`
  - [#9210](https://github.com/facebook/docusaurus/pull/9210) docs: add the missing import logger statement ([@Josh-Cena](https://github.com/Josh-Cena))
  - [#8047](https://github.com/facebook/docusaurus/pull/8047) docs: improve alt messages ([@Josh-Cena](https://github.com/Josh-Cena))
- `create-docusaurus`
  - [#8944](https://github.com/facebook/docusaurus/pull/8944) polish(create-docusaurus): add comment in config to mention different ways to declare config + doc link ([@thadguidry](https://github.com/thadguidry))
  - [#8323](https://github.com/facebook/docusaurus/pull/8323) docs: fix typo 'internalization' ([@dandv](https://github.com/dandv))
- `docusaurus-plugin-ideal-image`
  - [#8630](https://github.com/facebook/docusaurus/pull/8630) docs: normalize README for ideal-image plugin ([@Mysterious-Dev](https://github.com/Mysterious-Dev))
- `docusaurus-mdx-loader`
  - [#8419](https://github.com/facebook/docusaurus/pull/8419) docs: document siteConfig.markdown + better mdx-loader retrocompat ([@slorber](https://github.com/slorber))

#### :robot: Dependencies

- Other
  - [#9440](https://github.com/facebook/docusaurus/pull/9440) chore(deps): bump actions/setup-node from 3 to 4 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9441](https://github.com/facebook/docusaurus/pull/9441) chore(deps): bump actions/checkout from 4.1.0 to 4.1.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9367](https://github.com/facebook/docusaurus/pull/9367) chore(deps): bump postcss from 8.4.26 to 8.4.31 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9344](https://github.com/facebook/docusaurus/pull/9344) chore(deps): bump actions/checkout from 4.0.0 to 4.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9298](https://github.com/facebook/docusaurus/pull/9298) chore(deps): bump actions/dependency-review-action from 3.0.8 to 3.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9277](https://github.com/facebook/docusaurus/pull/9277) chore(deps): bump actions/checkout from 3 to 4 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9251](https://github.com/facebook/docusaurus/pull/9251) chore(deps): bump actions/dependency-review-action from 3.0.7 to 3.0.8 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9250](https://github.com/facebook/docusaurus/pull/9250) chore(deps): bump marocchino/sticky-pull-request-comment from 2.7.0 to 2.8.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9227](https://github.com/facebook/docusaurus/pull/9227) chore(deps): bump actions/dependency-review-action from 3.0.6 to 3.0.7 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9174](https://github.com/facebook/docusaurus/pull/9174) chore(deps): bump marocchino/sticky-pull-request-comment from 2.6.2 to 2.7.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9096](https://github.com/facebook/docusaurus/pull/9096) chore(deps): bump semver from 7.3.8 to 7.5.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9061](https://github.com/facebook/docusaurus/pull/9061) chore(deps): bump github/codeql-action from 2.3.6 to 2.13.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9038](https://github.com/facebook/docusaurus/pull/9038) chore(deps): bump github/codeql-action from 2.3.5 to 2.3.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9039](https://github.com/facebook/docusaurus/pull/9039) chore(deps): bump actions/dependency-review-action from 3.0.4 to 3.0.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#9019](https://github.com/facebook/docusaurus/pull/9019) chore(deps): bump github/codeql-action from 2.3.3 to 2.3.5 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8964](https://github.com/facebook/docusaurus/pull/8964) chore(deps): bump github/codeql-action from 2.3.2 to 2.3.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8955](https://github.com/facebook/docusaurus/pull/8955) chore(deps): bump github/codeql-action from 2.3.0 to 2.3.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8922](https://github.com/facebook/docusaurus/pull/8922) chore(deps): bump marocchino/sticky-pull-request-comment from 2.5.0 to 2.6.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8923](https://github.com/facebook/docusaurus/pull/8923) chore(deps): bump treosh/lighthouse-ci-action from 9.6.8 to 10.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8924](https://github.com/facebook/docusaurus/pull/8924) chore(deps): bump github/codeql-action from 2.2.12 to 2.3.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8899](https://github.com/facebook/docusaurus/pull/8899) chore(deps): bump github/codeql-action from 2.2.11 to 2.2.12 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8900](https://github.com/facebook/docusaurus/pull/8900) chore(deps): bump actions/checkout from 3.5.0 to 3.5.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8879](https://github.com/facebook/docusaurus/pull/8879) chore(deps): bump actions/github-script from 6.4.0 to 6.4.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8878](https://github.com/facebook/docusaurus/pull/8878) chore(deps): bump github/codeql-action from 2.2.9 to 2.2.11 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8836](https://github.com/facebook/docusaurus/pull/8836) chore(deps): bump github/codeql-action from 2.2.7 to 2.2.9 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8837](https://github.com/facebook/docusaurus/pull/8837) chore(deps): bump actions/checkout from 3.4.0 to 3.5.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8797](https://github.com/facebook/docusaurus/pull/8797) chore(deps): bump actions/checkout from 3.3.0 to 3.4.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8796](https://github.com/facebook/docusaurus/pull/8796) chore(deps): bump actions/dependency-review-action from 3.0.3 to 3.0.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8795](https://github.com/facebook/docusaurus/pull/8795) chore(deps): bump github/codeql-action from 2.2.6 to 2.2.7 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8766](https://github.com/facebook/docusaurus/pull/8766) chore(deps): bump treosh/lighthouse-ci-action from 9.3.1 to 9.6.8 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8767](https://github.com/facebook/docusaurus/pull/8767) chore(deps): bump github/codeql-action from 2.2.5 to 2.2.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8739](https://github.com/facebook/docusaurus/pull/8739) chore(deps): bump github/codeql-action from 2.2.4 to 2.2.5 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8663](https://github.com/facebook/docusaurus/pull/8663) chore(deps): bump marocchino/sticky-pull-request-comment from 2.3.1 to 2.5.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8662](https://github.com/facebook/docusaurus/pull/8662) chore(deps): bump github/codeql-action from 2.2.2 to 2.2.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8638](https://github.com/facebook/docusaurus/pull/8638) chore(deps): bump github/codeql-action from 2.2.1 to 2.2.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8624](https://github.com/facebook/docusaurus/pull/8624) chore(deps): bump http-cache-semantics from 4.1.0 to 4.1.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8604](https://github.com/facebook/docusaurus/pull/8604) chore(deps): bump actions/github-script from 6.3.3 to 6.4.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8605](https://github.com/facebook/docusaurus/pull/8605) chore(deps): bump github/codeql-action from 2.1.39 to 2.2.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8572](https://github.com/facebook/docusaurus/pull/8572) chore(deps): bump github/codeql-action from 2.1.38 to 2.1.39 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8553](https://github.com/facebook/docusaurus/pull/8553) chore(deps): bump github/codeql-action from 2.1.37 to 2.1.38 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8531](https://github.com/facebook/docusaurus/pull/8531) chore(deps): bump actions/checkout from 3.2.0 to 3.3.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8532](https://github.com/facebook/docusaurus/pull/8532) chore(deps): bump actions/dependency-review-action from 3.0.2 to 3.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8533](https://github.com/facebook/docusaurus/pull/8533) chore(deps): bump actions/setup-node from 3.5.1 to 3.6.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8496](https://github.com/facebook/docusaurus/pull/8496) chore(deps): bump jakepartusch/wait-for-netlify-action from 1.3 to 1.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8464](https://github.com/facebook/docusaurus/pull/8464) chore(deps): bump actions/dependency-review-action from 3.0.1 to 3.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8440](https://github.com/facebook/docusaurus/pull/8440) chore(deps): bump github/codeql-action from 2.1.36 to 2.1.37 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8435](https://github.com/facebook/docusaurus/pull/8435) chore(deps): bump github/codeql-action from 2.1.35 to 2.1.36 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8434](https://github.com/facebook/docusaurus/pull/8434) chore(deps): bump actions/checkout from 3.1.0 to 3.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8412](https://github.com/facebook/docusaurus/pull/8412) chore(deps): bump github/codeql-action from 2.1.32 to 2.1.35 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8385](https://github.com/facebook/docusaurus/pull/8385) chore(deps): bump marocchino/sticky-pull-request-comment from 2.3.0 to 2.3.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8360](https://github.com/facebook/docusaurus/pull/8360) chore(deps): bump actions/dependency-review-action from 3.0.0 to 3.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8341](https://github.com/facebook/docusaurus/pull/8341) chore(deps): bump github/codeql-action from 2.1.31 to 2.1.32 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8340](https://github.com/facebook/docusaurus/pull/8340) chore(deps): bump actions/dependency-review-action from 2.5.1 to 3.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8339](https://github.com/facebook/docusaurus/pull/8339) chore(deps): bump treosh/lighthouse-ci-action from 9.3.0 to 9.3.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8295](https://github.com/facebook/docusaurus/pull/8295) chore(deps): bump github/codeql-action from 2.1.29 to 2.1.31 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8271](https://github.com/facebook/docusaurus/pull/8271) chore(deps): bump github/codeql-action from 2.1.28 to 2.1.29 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8270](https://github.com/facebook/docusaurus/pull/8270) chore(deps): bump marocchino/sticky-pull-request-comment from 2.2.1 to 2.3.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8240](https://github.com/facebook/docusaurus/pull/8240) chore(deps): bump actions/dependency-review-action from 2.5.0 to 2.5.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8241](https://github.com/facebook/docusaurus/pull/8241) chore(deps): bump github/codeql-action from 2.1.27 to 2.1.28 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8221](https://github.com/facebook/docusaurus/pull/8221) chore(deps): bump marocchino/sticky-pull-request-comment from 2.2.0 to 2.2.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8220](https://github.com/facebook/docusaurus/pull/8220) chore(deps): bump actions/dependency-review-action from 2.4.0 to 2.5.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8219](https://github.com/facebook/docusaurus/pull/8219) chore(deps): bump actions/github-script from 6.3.1 to 6.3.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8222](https://github.com/facebook/docusaurus/pull/8222) chore(deps): bump actions/setup-node from 3.5.0 to 3.5.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8200](https://github.com/facebook/docusaurus/pull/8200) chore(deps): bump github/codeql-action from 2.1.26 to 2.1.27 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8199](https://github.com/facebook/docusaurus/pull/8199) chore(deps): bump actions/checkout from 3.0.2 to 3.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8169](https://github.com/facebook/docusaurus/pull/8169) chore(deps): bump github/codeql-action from 2.1.22 to 2.1.26 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8170](https://github.com/facebook/docusaurus/pull/8170) chore(deps): bump actions/setup-node from 3.4.1 to 3.5.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8167](https://github.com/facebook/docusaurus/pull/8167) chore(deps): bump actions/github-script from 6.2.0 to 6.3.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8168](https://github.com/facebook/docusaurus/pull/8168) chore(deps): bump actions/dependency-review-action from 2.1.0 to 2.4.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8064](https://github.com/facebook/docusaurus/pull/8064) chore: bump react-medium-image-zoom ([@Josh-Cena](https://github.com/Josh-Cena))
  - [#8051](https://github.com/facebook/docusaurus/pull/8051) chore(deps): bump github/codeql-action from 2.1.21 to 2.1.22 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8019](https://github.com/facebook/docusaurus/pull/8019) chore(deps): bump actions/github-script from 6.1.1 to 6.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#8020](https://github.com/facebook/docusaurus/pull/8020) chore(deps): bump github/codeql-action from 2.1.20 to 2.1.21 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#7988](https://github.com/facebook/docusaurus/pull/7988) chore(deps): bump actions/dependency-review-action from 2.0.4 to 2.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#7987](https://github.com/facebook/docusaurus/pull/7987) chore(deps): bump github/codeql-action from 2.1.18 to 2.1.20 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#7957](https://github.com/facebook/docusaurus/pull/7957) chore(deps): bump actions/github-script from 6.1.0 to 6.1.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#7925](https://github.com/facebook/docusaurus/pull/7925) chore(deps): bump github/codeql-action from 2.1.17 to 2.1.18 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#7879](https://github.com/facebook/docusaurus/pull/7879) chore(deps): bump github/codeql-action from 2.1.16 to 2.1.17 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#7804](https://github.com/facebook/docusaurus/pull/7804) chore(deps): bump github/codeql-action from 2.1.15 to 2.1.16 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#7805](https://github.com/facebook/docusaurus/pull/7805) chore(deps): bump actions/dependency-review-action from 2.0.2 to 2.0.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
  - [#7806](https://github.com/facebook/docusaurus/pull/7806) chore(deps): bump actions/setup-node from 3.4.0 to 3.4.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- `create-docusaurus`, `docusaurus-cssnano-preset`, `docusaurus-logger`, `docusaurus-mdx-loader`, `docusaurus-migrate`, `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-debug`, `docusaurus-plugin-google-analytics`, `docusaurus-plugin-google-gtag`, `docusaurus-plugin-google-tag-manager`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-plugin-sitemap`, `docusaurus-remark-plugin-npm2yarn`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-mermaid`, `docusaurus-theme-search-algolia`, `docusaurus-theme-translations`, `docusaurus-types`, `docusaurus-utils-common`, `docusaurus-utils-validation`, `docusaurus-utils`, `docusaurus`, `eslint-plugin`, `lqip-loader`, `stylelint-copyright`
  - [#9148](https://github.com/facebook/docusaurus/pull/9148) chore: upgrade dependencies (non-major) ([@Josh-Cena](https://github.com/Josh-Cena))
  - [#8749](https://github.com/facebook/docusaurus/pull/8749) chore: upgrade dependencies (non-major) ([@Josh-Cena](https://github.com/Josh-Cena))
  - [#8534](https://github.com/facebook/docusaurus/pull/8534) chore: upgrade dependencies ([@Josh-Cena](https://github.com/Josh-Cena))
- `create-docusaurus`
  - [#8926](https://github.com/facebook/docusaurus/pull/8926) chore: upgrade TypeScript to v5.0 ([@Josh-Cena](https://github.com/Josh-Cena))
- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-migrate`, `docusaurus-plugin-client-redirects`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-debug`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-plugin-sitemap`, `docusaurus-theme-classic`, `docusaurus-theme-common`, `docusaurus-theme-live-codeblock`, `docusaurus-theme-search-algolia`, `docusaurus-theme-translations`, `docusaurus-utils`, `docusaurus`
  - [#8537](https://github.com/facebook/docusaurus/pull/8537) chore: bump dependencies major versions ([@Josh-Cena](https://github.com/Josh-Cena))
- `create-docusaurus`, `docusaurus-cssnano-preset`, `docusaurus-logger`, `docusaurus-mdx-loader`, `docusaurus-migrate`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-theme-classic`, `docusaurus-theme-search-algolia`, `docusaurus-utils-validation`, `docusaurus-utils`, `docusaurus`, `eslint-plugin`, `lqip-loader`, `stylelint-copyright`
  - [#7993](https://github.com/facebook/docusaurus/pull/7993) chore: upgrade dependencies ([@Josh-Cena](https://github.com/Josh-Cena))
- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-migrate`, `docusaurus-plugin-content-blog`, `docusaurus-plugin-content-docs`, `docusaurus-plugin-content-pages`, `docusaurus-plugin-ideal-image`, `docusaurus-plugin-pwa`, `docusaurus-theme-search-algolia`, `docusaurus-types`, `docusaurus-utils`, `docusaurus`, `eslint-plugin`
  - [#7883](https://github.com/facebook/docusaurus/pull/7883) chore: upgrade dependencies ([@Josh-Cena](https://github.com/Josh-Cena))
- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-migrate`, `docusaurus-plugin-pwa`, `docusaurus-theme-search-algolia`, `docusaurus-utils`, `docusaurus`, `eslint-plugin`
  - [#7822](https://github.com/facebook/docusaurus/pull/7822) chore: upgrade dependencies ([@Josh-Cena](https://github.com/Josh-Cena))
- `create-docusaurus`, `docusaurus-mdx-loader`, `docusaurus-plugin-pwa`, `docusaurus`, `eslint-plugin`
  - [#7794](https://github.com/facebook/docusaurus/pull/7794) chore: upgrade dependencies ([@Josh-Cena](https://github.com/Josh-Cena))

#### :wrench: Maintenance

- `docusaurus-migrate`
  - [#9400](https://github.com/facebook/docusaurus/pull/9400) chore: remove docusaurus-migrate ([@slorber](https://github.com/slorber))
- `docusaurus-theme-search-algolia`
  - [#9320](https://github.com/facebook/docusaurus/pull/9320) chore(theme-search-algolia): revert docsearch package range downgrade after bugfix release ([@slorber](https://github.com/slorber))
- `docusaurus-theme-translations`
  - [#9304](https://github.com/facebook/docusaurus/pull/9304) chore(theme-translations): complete French translations ([@forresst](https://github.com/forresst))
- Other
  - [#9264](https://github.com/facebook/docusaurus/pull/9264) ci: only install Chromium for Playwright Argos tests ([@mxschmitt](https://github.com/mxschmitt))
  - [#9245](https://github.com/facebook/docusaurus/pull/9245) chore: bump devcontainer to Ubuntu 22.04 to resolve arm64 incompatibility ([@AFRUITPIE](https://github.com/AFRUITPIE))
  - [#8947](https://github.com/facebook/docusaurus/pull/8947) test: add visual regression tests with Argos CI ([@slorber](https://github.com/slorber))
  - [#8911](https://github.com/facebook/docusaurus/pull/8911) chore: migrate website config to createConfigAsync ([@slorber](https://github.com/slorber))
  - [#8578](https://github.com/facebook/docusaurus/pull/8578) docs: fix dead anchor for issue reporting guidelines in template ([@Sainan](https://github.com/Sainan))
  - [#8447](https://github.com/facebook/docusaurus/pull/8447) chore: update lerna to v6.2.0 ([@AgentEnder](https://github.com/AgentEnder))
  - [#7967](https://github.com/facebook/docusaurus/pull/7967) test: improve e2e verdaccio configuration ([@juanpicado](https://github.com/juanpicado))
  - [#7863](https://github.com/facebook/docusaurus/pull/7863) docs: publish 2.0.0 release blog post + adapt website for the launch ([@slorber](https://github.com/slorber))
  - [#7828](https://github.com/facebook/docusaurus/pull/7828) misc: change showcase submission process, use GitHub discussion ([@slorber](https://github.com/slorber))
- `docusaurus-plugin-content-blog`
  - [#9195](https://github.com/facebook/docusaurus/pull/9195) test(blog-plugin): fix ability to generate proper blog website fixture build snapshot ([@slorber](https://github.com/slorber))
- `create-docusaurus`, `docusaurus-theme-classic`
  - [#9024](https://github.com/facebook/docusaurus/pull/9024) docs: remove Meta Data Policy footer link on website ([@KarthickSakthi](https://github.com/KarthickSakthi))
- `docusaurus`
  - [#8660](https://github.com/facebook/docusaurus/pull/8660) chore: bump update-notifier ([@layershifter](https://github.com/layershifter))

#### Committers: 132

- 0x24Karthick ([@KarthickSakthi](https://github.com/KarthickSakthi))
- Abhinandan Wadhwa ([@abhinandanwadwa](https://github.com/abhinandanwadwa))
- Abinash Satapathy ([@Abinashbunty](https://github.com/Abinashbunty))
- Adam Patterson ([@adampatterson](https://github.com/adampatterson))
- Adithya Krishna ([@adithyaakrishna](https://github.com/adithyaakrishna))
- Ahmad Shrif ([@amdshrif](https://github.com/amdshrif))
- Ahmed Mustafa Malik ([@amm98d](https://github.com/amm98d))
- Akshay Bhalotia ([@akshaybhalotia](https://github.com/akshaybhalotia))
- Alex ([@sashashura](https://github.com/sashashura))
- Alexander Nguyen ([@GalexyN](https://github.com/GalexyN))
- Alexey Pyltsyn ([@lex111](https://github.com/lex111))
- Andrew Lyons ([@andrewnicols](https://github.com/andrewnicols))
- Andrés Villanueva ([@Villanuevand](https://github.com/Villanuevand))
- Anna ([@HumbleDeer](https://github.com/HumbleDeer))
- Anton Kastritskii ([@antonk52](https://github.com/antonk52))
- Antony Onipko ([@antonyoni](https://github.com/antonyoni))
- Aolin ([@Oreoxmt](https://github.com/Oreoxmt))
- Aqueeb ([@aqueeb](https://github.com/aqueeb))
- Bei Chu ([@chubei](https://github.com/chubei))
- Billy Chan ([@billy1624](https://github.com/billy1624))
- Biplav Kumar Mazumdar ([@biplavmz](https://github.com/biplavmz))
- Bruce ([@recallwei](https://github.com/recallwei))
- Charles Killer ([@Foosballfan](https://github.com/Foosballfan))
- Chongyi Zheng ([@harryzcy](https://github.com/harryzcy))
- Chua Chee How ([@rojakcoder](https://github.com/rojakcoder))
- Clément Vannicatte ([@shortcuts](https://github.com/shortcuts))
- Colin McDonnell ([@colinhacks](https://github.com/colinhacks))
- Coupy ([@HyeokjinKang](https://github.com/HyeokjinKang))
- Craigory Coppola ([@AgentEnder](https://github.com/AgentEnder))
- Dan Dascalescu ([@dandv](https://github.com/dandv))
- Dan Roscigno ([@DanRoscigno](https://github.com/DanRoscigno))
- Danilo Woznica ([@danilowoz](https://github.com/danilowoz))
- David J. Felix ([@DavidJFelix](https://github.com/DavidJFelix))
- Debbie O'Brien ([@debs-obrien](https://github.com/debs-obrien))
- Devansu Yadav ([@Devansu-Yadav](https://github.com/Devansu-Yadav))
- Dinh Bao Dang ([@chillinPanda](https://github.com/chillinPanda))
- Dongjoon Lee ([@Djunnni](https://github.com/Djunnni))
- Eduardo Mínguez ([@e-minguez](https://github.com/e-minguez))
- Eunkwang Shin ([@gracefullight](https://github.com/gracefullight))
- Forresst ([@forresst](https://github.com/forresst))
- Francesco Ciulla ([@FrancescoXX](https://github.com/FrancescoXX))
- Fredrik Stave ([@fredrikstave](https://github.com/fredrikstave))
- Fxpby ([@fxpby](https://github.com/fxpby))
- Gabriel Csapo ([@gabrielcsapo](https://github.com/gabrielcsapo))
- Gareth Dwyer ([@sixhobbits](https://github.com/sixhobbits))
- Greg Bergé ([@gregberge](https://github.com/gregberge))
- Grégory Heitz ([@edno](https://github.com/edno))
- Gustav Tonér ([@gazab](https://github.com/gazab))
- Hayden Hong ([@AFRUITPIE](https://github.com/AFRUITPIE))
- Hidde de Vries ([@hidde](https://github.com/hidde))
- Hyunseung ([@hslee2008](https://github.com/hslee2008))
- JJ Style ([@jj-style](https://github.com/jj-style))
- James Kerrane ([@thatrobotdev](https://github.com/thatrobotdev))
- Jean Humann ([@jean-humann](https://github.com/jean-humann))
- Jesper Engberg ([@jeengbe](https://github.com/jeengbe))
- Jody Heavener ([@jodyheavener](https://github.com/jodyheavener))
- Joe Williams ([@BubbaJoe](https://github.com/BubbaJoe))
- John Cao ([@jhcao23](https://github.com/jhcao23))
- John Reilly ([@johnnyreilly](https://github.com/johnnyreilly))
- Jordan Manley ([@werner33](https://github.com/werner33))
- Jorens Merenjanu ([@JorensM](https://github.com/JorensM))
- Joshua Chen ([@Josh-Cena](https://github.com/Josh-Cena))
- Juan Picado ([@juanpicado](https://github.com/juanpicado))
- Kolja ([@razzeee](https://github.com/razzeee))
- Lane Goolsby ([@lanegoolsby](https://github.com/lanegoolsby))
- Lorenzo Lewis ([@lorenzolewis](https://github.com/lorenzolewis))
- Maciek Palmowski ([@palmiak](https://github.com/palmiak))
- Manuel ([@manuel-rw](https://github.com/manuel-rw))
- Marco Kuper ([@scubamaggo](https://github.com/scubamaggo))
- Marco Stroppel ([@mstroppel](https://github.com/mstroppel))
- Marie ([@schneegansm](https://github.com/schneegansm))
- Markshawn ([@MarkShawn2020](https://github.com/MarkShawn2020))
- Martin Adamko ([@attitude](https://github.com/attitude))
- Max Schmitt ([@mxschmitt](https://github.com/mxschmitt))
- Michael Remediakis ([@mickremedi](https://github.com/mickremedi))
- Mikey O'Toole ([@homotechsual](https://github.com/homotechsual))
- ModupeD ([@ModupeD](https://github.com/ModupeD))
- Mu-Jing-Tsai ([@moojing](https://github.com/moojing))
- Mysterious_Dev ([@Mysterious-Dev](https://github.com/Mysterious-Dev))
- Naffy Dharni ([@knownasnaffy](https://github.com/knownasnaffy))
- Naman Garg ([@NamanGarg2075](https://github.com/NamanGarg2075))
- Nathaniel Tucker ([@ntucker](https://github.com/ntucker))
- Oleksandr Fediashov ([@layershifter](https://github.com/layershifter))
- Oluwatobi Sofela ([@oluwatobiss](https://github.com/oluwatobiss))
- Paul Razvan Berg ([@PaulRBerg](https://github.com/PaulRBerg))
- Pinaki Bhattacharjee ([@pinakipb2](https://github.com/pinakipb2))
- Raphaël Barbazza ([@rbarbazz](https://github.com/rbarbazz))
- Rashid ([@rashidmya](https://github.com/rashidmya))
- Ryosuke Igarashi ([@cm-igarashi-ryosuke](https://github.com/cm-igarashi-ryosuke))
- SADIK KUZU ([@sadikkuzu](https://github.com/sadikkuzu))
- Sanjaiyan Parthipan ([@sanjaiyan-dev](https://github.com/sanjaiyan-dev))
- Serenus ([@Kesyau](https://github.com/Kesyau))
- Shahriar ([@ShahriarKh](https://github.com/ShahriarKh))
- Shashank Kumar ([@shawshankkumar](https://github.com/shawshankkumar))
- Shun Wakatsuki ([@shwaka](https://github.com/shwaka))
- Silvestar Bistrović ([@maliMirkec](https://github.com/maliMirkec))
- Sujal Gupta ([@heysujal](https://github.com/heysujal))
- Sunghyun Cho ([@anaclumos](https://github.com/anaclumos))
- Surav Shrestha ([@suravshrestha](https://github.com/suravshrestha))
- Sébastien Lorber ([@slorber](https://github.com/slorber))
- Tamal Anwar Chowdhury ([@tamalchowdhury](https://github.com/tamalchowdhury))
- Tarun Chauhan ([@tarunrajput](https://github.com/tarunrajput))
- Tatsunori Uchino ([@tats-u](https://github.com/tats-u))
- Thad Guidry ([@thadguidry](https://github.com/thadguidry))
- Tom Mrazauskas ([@mrazauskas](https://github.com/mrazauskas))
- Viktor Malmedal ([@JohnVicke](https://github.com/JohnVicke))
- Waldir Pimenta ([@waldyrious](https://github.com/waldyrious))
- Wan Sim ([@0420syj](https://github.com/0420syj))
- Webber Takken ([@webbertakken](https://github.com/webbertakken))
- Will Ceolin ([@wceolin](https://github.com/wceolin))
- Yangshun Tay ([@yangshun](https://github.com/yangshun))
- Zwyx ([@Zwyx](https://github.com/Zwyx))
- [@Dr-Electron](https://github.com/Dr-Electron)
- [@FlorinaPacurar](https://github.com/FlorinaPacurar)
- [@Mogyuchi](https://github.com/Mogyuchi)
- [@Sainan](https://github.com/Sainan)
- [@VinceCYLiao](https://github.com/VinceCYLiao)
- [@allyw2002](https://github.com/allyw2002)
- [@bitpredator](https://github.com/bitpredator)
- [@conlacda](https://github.com/conlacda)
- [@dawei-wang](https://github.com/dawei-wang)
- [@la55u](https://github.com/la55u)
- [@mcallisto](https://github.com/mcallisto)
- [@prateekbytes](https://github.com/prateekbytes)
- [@qwerzl](https://github.com/qwerzl)
- [@rsteele6](https://github.com/rsteele6)
- [@samatt14](https://github.com/samatt14)
- [@thedevwonder](https://github.com/thedevwonder)
- [@yosukekato165](https://github.com/yosukekato165)
- ozaki ([@OzakIOne](https://github.com/OzakIOne))
- sykp241095 ([@sykp241095](https://github.com/sykp241095))
- 初冬 ([@chudongvip](https://github.com/chudongvip))
