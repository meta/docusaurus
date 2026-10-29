/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {
  RouterType,
  ThemeConfig,
  DocusaurusConfig,
  FutureConfig,
  WebpackConfig,
  StorageConfig,
  VcsConfig,
  VcsPreset,
  VcsChangeInfo,
  VscInitializeParams,
  Config,
} from './config';

export {
  MDX1CompatOptions,
  MarkdownConfig,
  MarkdownHooks,
  DefaultParseFrontMatter,
  ParseFrontMatter,
  OnBrokenMarkdownLinksFunction,
  OnBrokenMarkdownImagesFunction,
  OnUnusedMarkdownDirectivesFunction,
} from './markdown';

export {ReportingSeverity} from './reporting';

export {
  SiteMetadata,
  DocusaurusContext,
  GlobalData,
  LoadContext,
  SiteStorage,
  Props,
} from './context';

export {ClientModule} from './clientModule';

export {
  SwizzleAction,
  SwizzleActionStatus,
  SwizzleConfig,
  SwizzleComponentConfig,
  WrapperProps,
} from './swizzle';

export {
  I18nConfig,
  I18nLocaleConfig,
  I18n,
  CodeTranslations,
  TranslationFileContent,
  TranslationMessage,
  TranslationFile,
} from './i18n';

export {
  Plugin,
  PluginIdentifier,
  InitializedPlugin,
  LoadedPlugin,
  PluginModule,
  PluginOptions,
  PluginConfig,
  PluginContentLoadedActions,
  PluginVersionInformation,
  Preset,
  PresetConfig,
  PresetConfigDefined,
  PresetModule,
  OptionValidationContext,
  ThemeConfigValidationContext,
  Validate,
  ValidationSchema,
  AllContent,
  RouteBuildMetadata,
  ConfigureWebpackUtils,
  PostCssOptions,
  HtmlTagObject,
  HtmlTags,
} from './plugin';

export {CurrentBundler} from './bundler';

export {
  RouteConfig,
  PluginRouteConfig,
  RouteMetadata,
  RouteContext,
  PluginRouteContext,
  Registry,
  RouteChunkNames,
  RouteModules,
  Module,
  ChunkNames,
} from './routing';

export {UseDataOptions} from './utils';
