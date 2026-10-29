/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'node:path';

import npm2yarn from '@docusaurus/remark-plugin-npm2yarn';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import configTabs from './src/remark/configTabs';

import versions from './versions.json';
import VersionsArchived from './versionsArchived.json';
import {
  dogfoodingPluginInstances,
  dogfoodingThemeInstances,
  dogfoodingRedirects,
  dogfoodingTransformFrontMatter,
} from './_dogfooding/dogfooding.config';

import ConfigLocalized from './docusaurus.config.localized.json';

import PrismLight from './src/utils/prismLight';
import PrismDark from './src/utils/prismDark';

import {isArgosBuild, argosBuildPlugin} from './_dogfooding/argosBuild';
import type {Config, DocusaurusConfig, VcsPreset} from '@docusaurus/types';

import type * as Preset from '@docusaurus/preset-classic';
import type {Options as DocsOptions} from '@docusaurus/plugin-content-docs';
import type {Options as BlogOptions} from '@docusaurus/plugin-content-blog';
import type {Options as PageOptions} from '@docusaurus/plugin-content-pages';
import type {Options as IdealImageOptions} from '@docusaurus/plugin-ideal-image';
import type {Options as ClientRedirectsOptions} from '@docusaurus/plugin-client-redirects';
import type {ThemeConfig as LiveCodeBlockThemeConfig} from '@docusaurus/theme-live-codeblock';

type ThemeConfig = Preset.ThemeConfig & LiveCodeBlockThemeConfig;

const ArchivedVersionsDropdownItems = Object.entries(VersionsArchived).splice(
  0,
  5,
);

function isPrerelease(version: string) {
  return (
    version.includes('-') ||
    version.includes('alpha') ||
    version.includes('beta') ||
    version.includes('rc')
  );
}

function getLastStableVersion() {
  const lastStableVersion = versions.find((version) => !isPrerelease(version));
  if (!lastStableVersion) {
    throw new Error('unexpected, no stable Docusaurus version?');
  }
  return lastStableVersion;
}
const announcedVersion = getAnnouncedVersion();

function getLastStableVersionTuple(): [string, string, string] {
  const lastStableVersion = getLastStableVersion();
  const parts = lastStableVersion.split('.');
  if (parts.length !== 3) {
    throw new Error(`Unexpected stable version name: ${lastStableVersion}`);
  }
  return [parts[0]!, parts[1]!, parts[2]!];
}

// The version announced on the homepage hero and announcement banner
// 3.3.2 => 3.3
// 3.0.5 => 3.0
function getAnnouncedVersion() {
  const [major, minor] = getLastStableVersionTuple();
  return `${major}.${minor}`;
}

// This probably only makes sense for the alpha/beta/rc phase, temporary
function getNextVersionName() {
  return 'Canary';
  /*
  const expectedPrefix = '2.0.0-rc.';

  const lastReleasedVersion = versions[0];
  if (!lastReleasedVersion || !lastReleasedVersion.includes(expectedPrefix)) {
    throw new Error(
      'this code is only meant to be used during the 2.0 alpha/beta/rc phase.',
    );
  }
  const version = parseInt(lastReleasedVersion.replace(expectedPrefix, ''), 10);
  return `${expectedPrefix}${version + 1}`;

   */
}

// Artificial way to crash the SSR rendering and test errors
// See website/_dogfooding/_pages tests/crashTest.tsx
// Test with: DOCUSAURUS_CRASH_TEST=true pnpm build:website:fast
const crashTest = process.env.DOCUSAURUS_CRASH_TEST === 'true';

// By default, we use Docusaurus Faster
// DOCUSAURUS_SLOWER=true is useful for benchmarking faster against slower
// hyperfine --prepare 'pnpm clear:website' --runs 3 'DOCUSAURUS_SLOWER=true pnpm build:website:fast' 'pnpm build:website:fast'
const isSlower = process.env.DOCUSAURUS_SLOWER === 'true';
if (isSlower) {
  console.log('🐢 Using slower Docusaurus build');
}

const router = process.env
  .DOCUSAURUS_ROUTER as DocusaurusConfig['future']['experimental_router'];

const vcs = process.env.DOCUSAURUS_SITE_VCS as VcsPreset;

const isDev = process.env.NODE_ENV === 'development';

// See https://docs.netlify.com/configure-builds/environment-variables/
const isProductionDeployment =
  !!process.env.NETLIFY && process.env.CONTEXT === 'production';

const isDeployPreview =
  !!process.env.NETLIFY && process.env.CONTEXT === 'deploy-preview';

// Netlify branch deploy like "docusaurus-v2"
const isBranchDeploy =
  !!process.env.NETLIFY && process.env.CONTEXT === 'branch-deploy';

// Used to debug production build issues faster
const isBuildFast = !!process.env.BUILD_FAST;

const baseUrl = process.env.BASE_URL ?? '/';

// Special deployment for staging locales until they get enough translations
// https://app.netlify.com/sites/docusaurus-i18n-staging
// https://docusaurus-i18n-staging.netlify.app/
const isI18nStaging = process.env.I18N_STAGING === 'true';

const isVersioningDisabled = !!process.env.DISABLE_VERSIONING || isI18nStaging;

const isRsdoctor = process.env.RSDOCTOR === 'true';

/*
const TwitterSvg =
  '<svg style="fill: #1DA1F2; vertical-align: middle; margin-left: 3px;" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path></svg>';
*/

const defaultLocale = 'en';

function getLocalizedConfigValue(key: keyof typeof ConfigLocalized) {
  const currentLocale = process.env.DOCUSAURUS_CURRENT_LOCALE ?? defaultLocale;
  const values = ConfigLocalized[key];
  if (!values) {
    throw new Error(`Localized config key=${key} not found`);
  }
  const value = values[currentLocale] ?? values[defaultLocale];
  if (!value) {
    throw new Error(
      `Localized value for config key=${key} not found for both currentLocale=${currentLocale} or defaultLocale=${defaultLocale}`,
    );
  }
  return value;
}

// By default, we don't want to run "git log" commands on i18n sites
// This makes localized sites build much slower on Netlify
// See also https://github.com/facebook/docusaurus/issues/11208
// const showLastUpdate = process.env.DOCUSAURUS_CURRENT_LOCALE === defaultLocale;
const showLastUpdate = true;

export default async function createConfigAsync() {
  return {
    title: 'Docusaurus',
    tagline: getLocalizedConfigValue('tagline'),
    organizationName: 'facebook',
    projectName: 'docusaurus',
    baseUrl,
    baseUrlIssueBanner: true,
    url: 'https://docusaurus.io',
    vcs,
    // Deprecated: dogfood the Webpack/Babel opt-out for benchmarking
    webpack: isSlower,
    future: {
      experimental_router: router,
    },
    // Dogfood both settings:
    // - force trailing slashes for deploy previews
    // - avoid trailing slashes in prod
    trailingSlash: isDeployPreview,
    stylesheets: [
      {
        href: '/katex/katex.min.css',
        type: 'text/css',
      },
    ],
    i18n: {
      defaultLocale,

      localeConfigs: {
        [defaultLocale]: {
          // Forces the translation process to run for default locale
          // Permits to dogfood translation key conflicts detection
          translate: true,
        },
      },

      locales:
        isDeployPreview || isBranchDeploy
          ? // Deploy preview and branch deploys: keep them fast!
            [defaultLocale]
          : isI18nStaging
            ? // Staging locales: https://docusaurus-i18n-staging.netlify.app/
              [defaultLocale, 'ja']
            : // Production locales
              [defaultLocale, 'fr', 'pt-BR', 'ko', 'zh-CN'],
    },
    markdown: {
      format: 'detect',
      mermaid: true,
      hooks: {
        onBrokenMarkdownLinks: 'warn',
      },
      mdx1Compat: {
        // Needed for us until Crowdin improves support
        // See https://github.com/facebook/docusaurus/pull/11847#issuecomment-4183213345
        admonitions: true,
      },
      remarkRehypeOptions: {
        footnoteLabel: getLocalizedConfigValue('remarkRehypeOptions_footnotes'),
      },
      parseFrontMatter: async (params) => {
        const result = await params.defaultParseFrontMatter(params);
        return {
          ...result,
          frontMatter: dogfoodingTransformFrontMatter(result.frontMatter),
        };
      },
      preprocessor: ({filePath, fileContent}) => {
        let result = fileContent;

        // This fixes Crowdin bug altering MDX comments on i18n sites...
        // https://github.com/facebook/docusaurus/pull/9220
        result = result.replaceAll('{/_', '{/*');
        result = result.replaceAll('_/}', '*/}');

        const showDevLink = false;

        if (isDev && showDevLink) {
          const isPartial = path.basename(filePath).startsWith('_');
          if (!isPartial) {
            // "vscode://file/${projectPath}${filePath}:${line}:${column}",
            // "webstorm://open?file=${projectPath}${filePath}&line=${line}&column=${column}",
            const vscodeLink = `vscode://file/${filePath}`;
            const webstormLink = `webstorm://open?file=${filePath}`;
            const intellijLink = `idea://open?file=${filePath}`;
            result = `${result}\n\n---\n\n**DEV**: open this file in [VSCode](<${vscodeLink}>) | [WebStorm](<${webstormLink}>) | [IntelliJ](<${intellijLink}>)\n`;
          }
        }

        return result;
      },
    },
    onBrokenLinks:
      isVersioningDisabled ||
      process.env.DOCUSAURUS_CURRENT_LOCALE !== defaultLocale
        ? 'warn'
        : 'throw',
    onBrokenAnchors:
      isVersioningDisabled ||
      process.env.DOCUSAURUS_CURRENT_LOCALE !== defaultLocale
        ? 'warn'
        : 'throw',
    favicon: 'img/docusaurus.ico',
    customFields: {
      crashTest,
      isDeployPreview,
      description:
        'An optimized site generator in React. Docusaurus helps you to move fast and write content. Build documentation websites, blogs, marketing pages, and more.',
      announcedVersion,
    },
    staticDirectories: [
      'static',
      path.join(__dirname, '_dogfooding/_asset-tests'),
      // Adding a non-existent static directory. If user deleted `static`
      // without specifying `staticDirectories: []`, build should still work
      path.join(__dirname, '_dogfooding/non-existent'),
    ],
    themes: ['live-codeblock', ...dogfoodingThemeInstances],
    plugins: [
      function disableExpensiveBundlerOptimizationPlugin() {
        return {
          name: 'disable-expensive-bundler-optimizations',
          configureWebpack(_config, isServer) {
            // This optimization is expensive and only reduces by 3% the JS
            // Let's skip it for local and deploy preview builds
            // See also https://github.com/facebook/docusaurus/discussions/11199
            return {
              optimization: {
                concatenateModules: isProductionDeployment ? !isServer : false,
              },
            };
          },
        };
      },
      isRsdoctor && [
        'rsdoctor',
        {
          rsdoctorOptions: {
            linter: {
              // See https://rsdoctor.rs/guide/usage/rule-config
              rules: {
                'ecma-version-check': 'off',
                'duplicate-package': 'off',
              },
            },
          },
        },
      ],
      [
        './src/plugins/changelog/index.ts',
        {
          blogTitle: 'Docusaurus changelog',
          // Not useful, but permits to run git commands earlier
          // Otherwise the sitemap plugin will run them in postBuild()
          showLastUpdateAuthor: showLastUpdate,
          showLastUpdateTime: showLastUpdate,
          blogDescription:
            'Keep yourself up-to-date about new features in every release',
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'Changelog',
          routeBasePath: '/changelog',
          showReadingTime: false,
          postsPerPage: 20,
          archiveBasePath: null,
          authorsMapPath: 'authors.json',
          feedOptions: {
            type: 'all',
            title: 'Docusaurus changelog',
            description:
              'Keep yourself up-to-date about new features in every release',
            copyright: `Copyright © ${new Date().getFullYear()} Facebook, Inc.`,
            language: defaultLocale,
          },
          onInlineAuthors: 'warn',
        },
      ],
      [
        'content-docs',
        {
          id: 'community',
          path: 'community',
          routeBasePath: 'community',
          editUrl: ({locale, versionDocsDirPath, docPath}) => {
            if (locale !== defaultLocale) {
              return `https://crowdin.com/project/docusaurus-v2/${locale}`;
            }
            return `https://github.com/facebook/docusaurus/edit/main/website/${versionDocsDirPath}/${docPath}`;
          },
          remarkPlugins: [npm2yarn],
          editCurrentVersion: true,
          sidebarPath: './sidebarsCommunity.js',
          showLastUpdateAuthor: showLastUpdate,
          showLastUpdateTime: showLastUpdate,
        } satisfies DocsOptions,
      ],
      !process.env.DOCUSAURUS_SKIP_BUNDLING &&
        !isArgosBuild && [
          'client-redirects',
          {
            fromExtensions: ['html'],
            createRedirects(routePath) {
              // Redirect to /docs from /docs/introduction (now docs root doc)
              if (routePath === '/docs' || routePath === '/docs/') {
                return [`${routePath}/introduction`];
              }
              return [];
            },
            redirects: [
              {
                from: ['/docs/support', '/docs/next/support'],
                to: '/community/support',
              },
              {
                from: ['/docs/team', '/docs/next/team'],
                to: '/community/team',
              },
              {
                from: ['/docs/resources', '/docs/next/resources'],
                to: '/community/resources',
              },
              {
                from: '/docs/api/misc/docusaurus-init',
                to: '/docs/api/misc/create-docusaurus',
              },
              ...dogfoodingRedirects,
            ],
          } satisfies ClientRedirectsOptions,
        ],
      [
        'ideal-image',
        {
          quality: 70,
          max: 1030,
          min: 640,
          steps: 2,
          // Use false to debug, but it incurs huge perf costs
          disableInDev: true,
        } satisfies IdealImageOptions,
      ],
      [
        'pwa',
        {
          // debug: isDeployPreview,
          offlineModeActivationStrategies: [
            'appInstalled',
            'standalone',
            'queryString',
          ],
          // swRegister: false,
          swCustom: require.resolve('./src/sw.js'), // TODO make it possible to use relative path
          pwaHead: [
            {
              tagName: 'link',
              rel: 'icon',
              href: 'img/docusaurus.png',
            },
            {
              tagName: 'link',
              rel: 'manifest',
              href: 'manifest.json',
            },
            {
              tagName: 'meta',
              name: 'theme-color',
              content: 'rgb(37, 194, 160)',
            },
            {
              tagName: 'meta',
              name: 'apple-mobile-web-app-capable',
              content: 'yes',
            },
            {
              tagName: 'meta',
              name: 'apple-mobile-web-app-status-bar-style',
              content: '#000',
            },
            {
              tagName: 'link',
              rel: 'apple-touch-icon',
              href: 'img/docusaurus.png',
            },
            {
              tagName: 'link',
              rel: 'mask-icon',
              href: 'img/docusaurus.png',
              color: 'rgb(62, 204, 94)',
            },
            {
              tagName: 'meta',
              name: 'msapplication-TileImage',
              content: 'img/docusaurus.png',
            },
            {
              tagName: 'meta',
              name: 'msapplication-TileColor',
              content: '#000',
            },
          ],
        },
      ],
      '@docusaurus/theme-mermaid',
      './src/plugins/featureRequests/FeatureRequestsPlugin.js',
      ...dogfoodingPluginInstances,
      argosBuildPlugin,
    ],
    presets: [
      [
        'classic',
        {
          debug: true, // force debug plugin usage
          docs: {
            // routeBasePath: '/',
            path: 'docs',
            sidebarPath: 'sidebars.ts',
            // sidebarCollapsible: false,
            // sidebarCollapsed: true,
            editUrl: ({locale, docPath}) => {
              if (locale !== defaultLocale) {
                return `https://crowdin.com/project/docusaurus-v2/${locale}`;
              }
              // We want users to submit updates to the upstream/next version!
              // Otherwise we risk losing the update on the next release.
              const nextVersionDocsDirPath = 'docs';
              return `https://github.com/facebook/docusaurus/edit/main/website/${nextVersionDocsDirPath}/${docPath}`;
            },
            admonitions: {
              keywords: ['my-custom-admonition'],
            },
            showLastUpdateAuthor: showLastUpdate,
            showLastUpdateTime: showLastUpdate,
            remarkPlugins: [[npm2yarn, {sync: true}], remarkMath, configTabs],
            rehypePlugins: [rehypeKatex],
            disableVersioning: isVersioningDisabled,
            lastVersion:
              isDev ||
              isVersioningDisabled ||
              isDeployPreview ||
              isBranchDeploy ||
              isBuildFast
                ? 'current'
                : getLastStableVersion(),

            onlyIncludeVersions: (() => {
              if (isBuildFast) {
                return ['current'];
              } else if (
                !isVersioningDisabled &&
                (isDev || isDeployPreview || isBranchDeploy)
              ) {
                return ['current', ...versions.slice(0, 2)];
              }
              return undefined;
            })(),
            versions: {
              current: {
                label: `${getNextVersionName()} 🚧`,
              },
            },
          },
          blog: {
            // routeBasePath: '/',
            path: 'blog',
            showLastUpdateAuthor: showLastUpdate,
            showLastUpdateTime: showLastUpdate,
            editUrl: ({locale, blogDirPath, blogPath}) => {
              if (locale !== defaultLocale) {
                return `https://crowdin.com/project/docusaurus-v2/${locale}`;
              }
              return `https://github.com/facebook/docusaurus/edit/main/website/${blogDirPath}/${blogPath}`;
            },
            remarkPlugins: [npm2yarn],
            postsPerPage: 5,
            feedOptions: {
              type: 'all',
              description:
                'Keep up to date with upcoming Docusaurus releases and articles by following our feed!',
              copyright: `Copyright © ${new Date().getFullYear()} Facebook, Inc.`,
              xslt: true,
            },
            blogTitle: 'Docusaurus blog',
            blogDescription: 'Read blog posts about Docusaurus from the team',
            blogSidebarCount: 'ALL',
            blogSidebarTitle: 'All our posts',
            onUntruncatedBlogPosts:
              process.env.DOCUSAURUS_CURRENT_LOCALE !== defaultLocale
                ? 'warn'
                : 'throw',
            onInlineTags:
              process.env.DOCUSAURUS_CURRENT_LOCALE !== defaultLocale
                ? 'warn'
                : 'throw',
          } satisfies BlogOptions,
          pages: {
            remarkPlugins: [npm2yarn],
            editUrl: ({locale, pagesPath}) => {
              if (locale !== defaultLocale) {
                return `https://crowdin.com/project/docusaurus-v2/${locale}`;
              }
              return `https://github.com/facebook/docusaurus/edit/main/website/src/pages/${pagesPath}`;
            },
            showLastUpdateAuthor: showLastUpdate,
            showLastUpdateTime: showLastUpdate,
          } satisfies PageOptions,
          theme: {
            customCss: [
              './src/css/custom.css',
              // relative paths are relative to site dir
              './_dogfooding/dogfooding.css',
            ],
          },
          gtag: !(isDeployPreview || isBranchDeploy)
            ? {
                trackingID: ['G-E5CR2Q1NRE'],
              }
            : undefined,
          sitemap: {
            ignorePatterns: isArgosBuild
              ? undefined
              : // Note: /tests/docs already has noIndex: true
                ['/tests/{blog,pages}/**'],
            lastmod: showLastUpdate ? 'date' : null,
          },
        } satisfies Preset.Options,
      ],
    ],

    themeConfig: {
      liveCodeBlock: {
        playgroundPosition: 'bottom',
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      announcementBar: {
        id: `announcementBar-v${announcedVersion}`,
        // content: `⭐️ If you like Docusaurus, give it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/facebook/docusaurus">GitHub</a> and follow us on <a target="_blank" rel="noopener noreferrer" href="https://x.com/docusaurus">X ${TwitterSvg}</a>`,
        content: `🎉️ <b><a target="_blank" href="https://docusaurus.io/blog/releases/${announcedVersion}">Docusaurus v${announcedVersion}</a> is out!</b> 🥳️`,
      },
      prism: {
        additionalLanguages: [
          'java',
          'latex',
          'haskell',
          'matlab',
          'PHp',
          'powershell',
          'bash',
          'diff',
          'json',
          'scss',
        ],
        magicComments: [
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-next-line',
            block: {start: 'highlight-start', end: 'highlight-end'},
          },
          {
            className: 'code-block-error-line',
            line: 'This will error',
          },
        ],
        theme: PrismLight,
        darkTheme: PrismDark,
      },
      image: 'img/docusaurus-social-card.jpg',
      // metadata: [{name: 'twitter:card', content: 'summary'}],
      algolia: {
        appId: 'X1Z85QJPUV',
        apiKey: 'bf7211c161e8205da2f933a02534105a',
        indexName: 'docusaurus-2',

        // TODO Docusaurus v4: remove after we drop DocSearch v3
        //  temporary, for DocSearch v3/v4 conditional Ask AI integration
        //  see https://github.com/facebook/docusaurus/pull/11327
        ...(require('@docsearch/react').version.startsWith('4.')
          ? {
              askAi: {
                // cSpell:ignore IMYF
                assistantId: 'RgIMYFUmTfrN',
                indexName: 'docusaurus-markdown',
                suggestedQuestions: true,
              },
            }
          : {}),

        replaceSearchResultPathname:
          isDev || isDeployPreview
            ? {
                from: /^\/docs\/next/g.source,
                to: '/docs',
              }
            : undefined,
      },
      navbar: {
        hideOnScroll: true,
        title: 'Docusaurus',
        logo: {
          alt: '',
          src: 'img/docusaurus.svg',
          srcDark: 'img/docusaurus_keytar.svg',
          width: 32,
          height: 32,
        },
        items: [
          {
            type: 'doc',
            position: 'left',
            docId: 'introduction',
            label: 'Docs',
          },
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'api',
            label: 'API',
          },
          {to: 'blog', label: 'Blog', position: 'left'},
          {to: 'showcase', label: 'Showcase', position: 'left'},
          {
            to: '/community/support',
            label: 'Community',
            position: 'left',
            activeBaseRegex: `/community/`,
          },
          // This item links to a draft doc: only displayed in dev
          {
            type: 'doc',
            docId: 'index',
            label: 'Tests',
            docsPluginId: 'docs-tests',
          },
          isDev && {to: '/__docusaurus/debug', label: 'Debug'},
          // Custom item for dogfooding: only displayed in /tests/ routes
          {
            type: 'custom-dogfood-navbar-item',
            content: '😉',
          },
          // Right
          {
            type: 'docsVersionDropdown',
            position: 'right',
            dropdownActiveClassDisabled: true,
            dropdownItemsAfter: [
              {
                type: 'html',
                value: '<hr class="dropdown-separator">',
              },
              {
                type: 'html',
                className: 'dropdown-archived-versions',
                value: '<b>Archived versions</b>',
              },
              ...ArchivedVersionsDropdownItems.map(
                ([versionName, versionUrl]) => ({
                  label: versionName,
                  href: versionUrl,
                }),
              ),
              {
                href: 'https://v1.docusaurus.io',
                label: '1.x.x',
              },
              {
                type: 'html',
                value: '<hr class="dropdown-separator">',
              },
              {
                to: '/versions',
                label: 'All versions',
              },
            ],
          },
          {
            type: 'localeDropdown',
            position: 'right',
            dropdownItemsAfter: [
              {
                type: 'html',
                value: '<hr style="margin: 0.3rem 0;">',
              },
              {
                href: 'https://github.com/facebook/docusaurus/issues/3526',
                label: 'Help Us Translate',
              },
            ],
          },
          {
            href: 'https://github.com/facebook/docusaurus',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
        ]
          // TODO fix type
          .filter(Boolean) as NonNullable<
          Preset.ThemeConfig['navbar']
        >['items'],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Learn',
            items: [
              {
                label: 'Introduction',
                to: 'docs',
              },
              {
                label: 'Installation',
                to: 'docs/installation',
              },
              {
                label: 'Upgrading',
                to: 'docs/migration',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Feature Requests',
                to: '/feature-requests',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Help',
                to: '/community/support',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: 'blog',
              },
              {
                label: 'Changelog',
                to: '/changelog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
              {
                label: 'X',
                href: 'https://x.com/docusaurus',
              },
              {
                html: `
                <a href="https://www.netlify.com" target="_blank" rel="noreferrer noopener" aria-label="Deploys by Netlify">
                  <img src="/img/footer/badge-netlify.svg" alt="Deploys by Netlify" width="114" height="51" />
                </a>
              `,
              },
              {
                html: `
                <a href="https://argos-ci.com" target="_blank" rel="noreferrer noopener" aria-label="Covered by Argos">
                  <img src="/img/footer/badge-argos.svg" alt="Covered by Argos" width="133" height="20" />
                </a>
              `,
              },
            ],
          },
          {
            title: 'Legal',
            className: 'footer-column-legal',
            // Don't remove the privacy and terms, it's a legal requirement.
            items: [
              {
                label: 'Privacy',
                className: 'footer-item-privacy',
                href: 'https://opensource.facebook.com/legal/privacy/',
              },
              {
                label: 'Terms',
                href: 'https://opensource.facebook.com/legal/terms/',
              },
              {
                label: 'Cookie Policy',
                href: 'https://opensource.facebook.com/legal/cookie-policy/',
              },
            ],
          },
        ],
        logo: {
          alt: 'Meta Open Source Logo',
          src: '/img/meta_opensource_logo_negative.svg',
          href: 'https://opensource.fb.com',
          width: 480,
          height: 103,
        },
        copyright: `Copyright © ${new Date().getFullYear()} Meta Platforms, Inc. Built with Docusaurus.`,
      },
    } satisfies ThemeConfig,
  } satisfies Config;
}
