/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {CodeTranslations, TranslationFile} from './i18n';
import type {RuleSetRule, Configuration as WebpackConfiguration} from 'webpack';
import type {CustomizeRuleString} from 'webpack-merge/dist/types';
import type {Command} from 'commander';
import type Joi from 'joi';
import type {ThemeConfig} from './config';
import type {LoadContext, Props} from './context';
import type {SwizzleConfig} from './swizzle';
import type {RouteConfig} from './routing';
import type {CurrentBundler} from './bundler';

export type PluginOptions = {id?: string} & {[key: string]: unknown};

export type PluginConfig<Content = unknown> =
  | string
  | [string, PluginOptions]
  | [PluginModule<Content>, PluginOptions]
  | PluginModule<Content>
  | false
  | null;

export type PresetConfigDefined = string | [string, {[key: string]: unknown}];

export type PresetConfig = PresetConfigDefined | false | null;

/**
 * - `type: 'package'`, plugin is in a different package.
 * - `type: 'project'`, plugin is in the same docusaurus project.
 * - `type: 'local'`, none of the plugin's ancestor directories contains a
 * package.json.
 * - `type: 'synthetic'`, docusaurus generated internal plugin.
 */
export type PluginVersionInformation =
  | {
      readonly type: 'package';
      readonly name?: string;
      readonly version?: string;
    }
  | {readonly type: 'project'}
  | {readonly type: 'local'}
  | {readonly type: 'synthetic'};

export type PluginContentLoadedActions = {
  addRoute: (config: RouteConfig) => void;
  createData: (name: string, data: string | object) => Promise<string>;
  setGlobalData: (data: unknown) => void;
};

export type ConfigureWebpackUtils = {
  currentBundler: CurrentBundler;
  getStyleLoaders: (
    isServer: boolean,
    cssOptions: {[key: string]: unknown},
  ) => RuleSetRule[];
  getJSLoader: (options: {isServer: boolean}) => RuleSetRule;
};

export type AllContent = {
  [pluginName: string]: {
    [pluginID: string]: unknown;
  };
};

// TODO improve type (not exposed by postcss-loader)
export type PostCssOptions = {plugins: unknown[]; [key: string]: unknown};

export type ValidationSchema<T> = Joi.ObjectSchema<T>;

export type Validate<In, Out> = (
  validationSchema: ValidationSchema<Out>,
  options: In,
) => Out;

export type OptionValidationContext<In, Out> = {
  validate: Validate<In, Out>;
  options: In;
};

export type ThemeConfigValidationContext<In, Out = In> = {
  validate: Validate<In, Out>;
  themeConfig: In;
};

export type HtmlTagObject = {
  /**
   * Attributes of the html tag.
   * E.g. `{ disabled: true, value: "demo", rel: "preconnect" }`
   */
  attributes?: Partial<{[key: string]: string | boolean}>;
  /** The tag name, e.g. `div`, `script`, `link`, `meta` */
  tagName: string;
  /** The inner HTML */
  innerHTML?: string;
  /** Allow custom html elements, e.g. `<custom-element>` */
  customElement?: boolean;
};

export type HtmlTags = string | HtmlTagObject | (string | HtmlTagObject)[];

export type ConfigureWebpackResult = WebpackConfiguration & {
  mergeStrategy?: {
    [key: string]: CustomizeRuleString;
  };
};

export type RouteBuildMetadata = {
  // We'll add extra metadata on a case by case basis here
  // For now the only need is our sitemap plugin to filter noindex pages
  noIndex: boolean;
};

export type Plugin<Content = unknown> = {
  name: string;
  loadContent?: () => Promise<Content> | Content;
  contentLoaded?: (args: {
    /** The content loaded by this plugin instance */
    content: Content; //
    actions: PluginContentLoadedActions;
  }) => Promise<void> | void;
  allContentLoaded?: (args: {
    allContent: AllContent;
    actions: PluginContentLoadedActions;
  }) => Promise<void> | void;
  postBuild?: (
    props: Props & {
      content: Content;
      routesBuildMetadata: {[location: string]: RouteBuildMetadata};
    },
  ) => Promise<void> | void;
  // TODO Docusaurus v4 ?
  //  refactor the configureWebpack API surface: use an object instead of
  //  multiple params (requires breaking change)
  configureWebpack?: (
    config: WebpackConfiguration,
    isServer: boolean,
    configureWebpackUtils: ConfigureWebpackUtils,
    content: Content,
  ) => ConfigureWebpackResult | void;
  configurePostCss?: (options: PostCssOptions) => PostCssOptions;
  getThemePath?: () => string;
  getTypeScriptThemePath?: () => string;
  getPathsToWatch?: () => string[];
  getClientModules?: () => string[];
  extendCli?: (cli: Command) => void;
  injectHtmlTags?: (args: {content: Content}) => {
    headTags?: HtmlTags;
    preBodyTags?: HtmlTags;
    postBodyTags?: HtmlTags;
  };
  // TODO before/afterDevServer implementation

  // translations
  getTranslationFiles?: (args: {
    content: Content;
  }) => Promise<TranslationFile[]> | TranslationFile[];
  getDefaultCodeTranslationMessages?: () =>
    | Promise<{[id: string]: string}>
    | {[id: string]: string};
  translateContent?: (args: {
    /** The content loaded by this plugin instance. */
    content: Content;
    translationFiles: TranslationFile[];
  }) => Content;
  translateThemeConfig?: (args: {
    themeConfig: ThemeConfig;
    translationFiles: TranslationFile[];
  }) => ThemeConfig;
};

/**
 * Data required to uniquely identify a plugin
 * The name or instance id alone is not enough
 */
export type PluginIdentifier = {
  readonly name: string;
  readonly id: string;
};

export type InitializedPlugin = Plugin & {
  readonly options: Required<PluginOptions>;
  readonly version: PluginVersionInformation;
  /** The absolute path to the folder containing the entry point file. */
  readonly path: string;
};

export type LoadedPlugin = InitializedPlugin & {
  readonly content: unknown;
  readonly globalData: unknown;
  readonly routes: RouteConfig[];
  readonly defaultCodeTranslations: CodeTranslations;
};

export type PluginModule<Content = unknown> = {
  (
    context: LoadContext,
    options: unknown,
  ): Plugin<Content> | null | Promise<Plugin<Content> | null>;

  validateOptions?: <T, U>(data: OptionValidationContext<T, U>) => U;
  validateThemeConfig?: <T>(data: ThemeConfigValidationContext<T>) => T;

  // TODO Docusaurus v5: remove the deprecated getSwizzleComponentList() API
  /**
   * @deprecated Use `getSwizzleConfig` instead.
   */
  getSwizzleComponentList?: () => string[] | undefined;
  getSwizzleConfig?: () => SwizzleConfig | undefined;
};

export type Preset = {
  plugins?: PluginConfig[];
  themes?: PluginConfig[];
};

export type PresetModule = {
  (context: LoadContext, presetOptions: unknown): Preset;
};
