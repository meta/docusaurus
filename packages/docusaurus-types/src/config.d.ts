/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {SiteStorage} from './context';
import type {RuleSetRule} from 'webpack';
import type {DeepPartial, Overwrite} from 'utility-types';
import type {I18nConfig} from './i18n';
import type {PluginConfig, PresetConfig, HtmlTagObject} from './plugin';
import type {ReportingSeverity} from './reporting';
import type {MarkdownConfig} from './markdown';

export type RouterType = 'browser' | 'hash';

export type ThemeConfig = {
  [key: string]: unknown;
};

export type StorageConfig = {
  type: SiteStorage['type'];
  namespace: boolean | string;
};

export type WebpackConfig = {
  /**
   * Configuration for alternative JS loaders. "babel" will use the built-in
   * Babel loader and preset; otherwise, you can provide your custom Webpack
   * rule set.
   */
  jsLoader?: 'babel' | ((options: {isServer: boolean}) => RuleSetRule);
};

// VCS (Version Control System) info about a given change, e.g., a git commit.
// The agnostic term "VCS" is used instead of "git" to acknowledge the existence
// of other version control systems, and external systems like CMSs and i18n
// translation SaaS (e.g., Crowdin)
export type VcsChangeInfo = {timestamp: number; author: string};

export type VscInitializeParams = {
  siteDir: string;
  // TODO could it be useful to provide all plugins getPathsToWatch() here?
  //  this could give the opportunity to find out all VCS roots ahead of times
  //  this is mostly useful for multi-git-repo setups, can be added later
};

// VCS (Version Control System) config hooks to get file change info.
// This lets you override and customize the default Docusaurus behavior.
// This can be useful to optimize calls or when using something else than git
// See https://github.com/facebook/docusaurus/issues/11208
// See https://github.com/e18e/ecosystem-issues/issues/216
export type VcsConfig = {
  /**
   * Initialize the VCS system.
   * This is notably useful to pre-read eagerly a full Git repository so that
   * all the files first/last update info can be retrieved efficiently later
   *
   * Note: for now, this function is synchronous on purpose, it can be used to
   * start warming up the VCS by reading eagerly, but we don't want to delay
   * the rest of the Docusaurus start/build process. Instead of awaiting the
   * init promise, you can create/store it and await it later during reads.
   *
   * @param params Initialization params that can be useful to warm up the VCS
   */
  initialize: (params: VscInitializeParams) => void;
  getFileCreationInfo: (filePath: string) => Promise<VcsChangeInfo | null>;
  getFileLastUpdateInfo: (filePath: string) => Promise<VcsChangeInfo | null>;
};

/**
 * List of pre-built VcsConfig that Docusaurus provides.
 */
export type VcsPreset =
  | 'git-ad-hoc'
  | 'git-eager'
  | 'hardcoded'
  | 'disabled'
  | 'default'
  | 'default-v3';

export type FutureConfig = {
  /**
   * Docusaurus can work with 2 router types.
   *
   * - The "browser" router is the main/default router of Docusaurus.
   *   It will use the browser history and regular urls to navigate from
   *   one page to another. A static file will be emitted for each page.
   *
   * - The "hash" router can be useful in very specific situations (such as
   *   distributing your app for offline-first usage), but should be avoided
   *   in most cases. All pages paths will be prefixed with a /#/.
   *   It will opt out of static site generation, only emit a single index.html
   *   entry point, and use the browser hash for routing. The Docusaurus site
   *   content will be rendered client-side, like a regular single page
   *   application.
   *   @see https://github.com/facebook/docusaurus/issues/3825
   */
  experimental_router: RouterType;
};

/**
 * Docusaurus config, after validation/normalization.
 */
export type DocusaurusConfig = {
  /**
   * Title for your website. Will be used in metadata and as browser tab title.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#title
   */
  title: string;
  /**
   * URL for your website. This can also be considered the top-level hostname.
   * For example, `https://facebook.github.io` is the URL of
   * https://facebook.github.io/metro/, and `https://docusaurus.io` is the URL
   * for https://docusaurus.io.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#url
   */
  url: string;
  /**
   * Can be considered as the path after the host. For example, `/metro/` is the
   * base URL of https://facebook.github.io/metro/. For URLs that have no path,
   * it should be set to `/`. Always has both leading and trailing slash.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#baseUrl
   */
  baseUrl: string;
  /**
   * Path to your site favicon; must be a URL that can be used in link's href.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#favicon
   */
  favicon?: string;
  /**
   * Allow to customize the presence/absence of a trailing slash at the end of
   * URLs/links, and how static HTML files are generated:
   *
   * - `undefined` (default): keeps URLs untouched, and emit
   *   `/docs/myDoc/index.html` for `/docs/myDoc.md`
   * - `true`: add trailing slashes to URLs/links, and emit
   *   `/docs/myDoc/index.html` for `/docs/myDoc.md`
   * - `false`: remove trailing slashes from URLs/links, and emit
   *   `/docs/myDoc.html` for `/docs/myDoc.md`
   *
   * @see https://github.com/slorber/trailing-slash-guide
   * @see https://docusaurus.io/docs/api/docusaurus-config#trailingSlash
   * @default undefined
   */
  trailingSlash: boolean | undefined;
  /**
   * The i18n configuration object to [localize your
   * site](https://docusaurus.io/docs/i18n/introduction).
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#i18n
   */
  i18n: I18nConfig;
  /**
   * Site-wide browser storage options.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#storage
   */
  storage: StorageConfig;
  /**
   * The Version Control System (VCS) implementation used to read file info
   * (creation/last update date/author).
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#vcs
   */
  vcs: VcsConfig;
  /**
   * Docusaurus future flags and experimental features.
   * Similar to Remix future flags, see https://remix.run/blog/future-flags
   */
  future: FutureConfig;
  /**
   * This option adds `<meta name="robots" content="noindex, nofollow">` to
   * every page to tell search engines to avoid indexing your site.
   *
   * @see https://moz.com/learn/seo/robots-meta-directives
   * @see https://docusaurus.io/docs/api/docusaurus-config#noIndex
   * @default false
   */
  noIndex: boolean;
  /**
   * The behavior of Docusaurus when it detects any broken link.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#onBrokenLinks
   * @default "throw"
   */
  onBrokenLinks: ReportingSeverity;
  /**
   * The behavior of Docusaurus when it detects any broken anchor.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#onBrokenAnchors
   * @default "throw"
   */
  onBrokenAnchors: ReportingSeverity;
  /**
   * The behavior of Docusaurus when it detects any [duplicate
   * routes](https://docusaurus.io/docs/creating-pages#duplicate-routes).
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#onDuplicateRoutes
   * @default "warn"
   */
  onDuplicateRoutes: ReportingSeverity;
  /**
   * The tagline for your website.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#tagline
   * @default ""
   */
  tagline: string;
  /**
   * The GitHub user or organization that owns the repository. You don't need
   * this if you are not using the `docusaurus deploy` command.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#organizationName
   */
  organizationName?: string;
  /**
   * The name of the GitHub repository. You don't need this if you are not using
   * the `docusaurus deploy` command.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#projectName
   */
  projectName?: string;
  /**
   * The name of the branch to deploy the static files to. You don't need this
   * if you are not using the `docusaurus deploy` command.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#deploymentBranch
   */
  deploymentBranch?: string;
  /**
   * The hostname of your server. Useful if you are using GitHub Enterprise. You
   * don't need this if you are not using the `docusaurus deploy` command.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#githubHost
   */
  githubHost?: string;
  /**
   * The port of your server. Useful if you are using GitHub Enterprise. You
   * don't need this if you are not using the `docusaurus deploy` command.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#githubPort
   */
  githubPort?: string;
  /**
   * The [theme configuration](https://docusaurus.io/docs/api/themes/configuration)
   * object to customize your site UI like navbar and footer.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#themeConfig
   * @default {}
   */
  themeConfig: ThemeConfig;
  /**
   * List of plugins.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#plugins
   * @default []
   */
  plugins: PluginConfig[];
  /**
   * List of themes.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#themes
   * @default []
   */
  themes: PluginConfig[];
  /**
   * List of presets.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#presets
   * @default []
   */
  presets: PresetConfig[];
  /**
   * Docusaurus guards `docusaurus.config.js` from unknown fields. To add a
   * custom field, define it on `customFields`.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#customFields
   * @default {}
   */
  customFields?: {
    [key: string]: unknown;
  };
  /**
   * An array of paths, relative to the site's directory or absolute. Files
   * under these paths will be copied to the build output as-is.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#staticDirectories
   * @default ["static"]
   */
  staticDirectories: string[];
  /**
   * An array of tags that will be inserted in the HTML `<head>`.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#head
   * @default []
   */
  headTags: HtmlTagObject[];
  /**
   * An array of scripts to load. The values can be either strings or plain
   * objects of attribute-value maps. The `<script>` tags will be inserted in
   * the HTML `<head>`.
   *
   * Note that `<script>` added here are render-blocking, so you might want to
   * add `async: true`/`defer: true` to the objects.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#scripts
   * @default []
   */
  scripts: (
    | string
    | {
        src: string;
        [key: string]: string | boolean | undefined;
      }
  )[];
  /**
   * An array of CSS sources to load. The values can be either strings or plain
   * objects of attribute-value maps. The `<link>` tags will be inserted in the
   * HTML `<head>`.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#stylesheets
   * @default []
   */
  stylesheets: (
    | string
    | {
        href: string;
        [key: string]: string | boolean | undefined;
      }
  )[];
  /**
   * An array of [client modules](https://docusaurus.io/docs/advanced/client#client-modules)
   * to load globally on your site.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#clientModules
   * @default []
   */
  clientModules: string[];
  /**
   * An HTML template written in [Eta's syntax](https://eta.js.org/docs/syntax#syntax-overview)
   * that will be used to render your application. This can be used to set
   * custom attributes on the `body` tags, additional `meta` tags, customize the
   * `viewport`, etc. Please note that Docusaurus will rely on the template to
   * be correctly structured in order to function properly, once you do
   * customize it, you will have to make sure that your template is compliant
   * with the requirements from upstream.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#ssgTemplate
   */
  ssgTemplate?: string;
  /**
   * Will be used as title delimiter in the generated `<title>` tag.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#titleDelimiter
   * @default "|"
   */
  titleDelimiter: string;
  /**
   * When enabled, will show a banner in case your site can't load its CSS or
   * JavaScript files, which is a very common issue, often related to a wrong
   * `baseUrl` in site config.
   *
   * @see https://docusaurus.io/docs/api/docusaurus-config#baseUrlIssueBanner
   * @default true
   */
  baseUrlIssueBanner: boolean;
  // TODO Docusaurus v5: remove Webpack and Babel support
  /**
   * Docusaurus uses Rspack by default.
   * When provided, Docusaurus uses Webpack and Babel instead.
   * @deprecated Webpack and Babel support will be removed in Docusaurus v5
   */
  webpack?: WebpackConfig;
  /** Markdown-related options. */
  markdown: MarkdownConfig;
};

/**
 * Docusaurus config, as provided by the user (partial/un-normalized). This type
 * is used to provide type-safety / IDE auto-complete on the config file.
 * @see https://docusaurus.io/docs/typescript-support
 */
export type Config = Overwrite<
  DeepPartial<DocusaurusConfig>,
  {
    title: DocusaurusConfig['title'];
    url: DocusaurusConfig['url'];
    baseUrl: DocusaurusConfig['baseUrl'];
    vcs?: VcsPreset | VcsConfig | boolean;
    // TODO Docusaurus v5: remove Webpack and Babel support
    /**
     * Docusaurus uses Rspack by default.
     * Use `true` or an object to use Webpack and Babel instead.
     * @deprecated Webpack and Babel support will be removed in Docusaurus v5
     */
    webpack?: boolean | WebpackConfig;
    future?: DeepPartial<FutureConfig>;
  }
>;
