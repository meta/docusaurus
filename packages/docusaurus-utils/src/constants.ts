/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** Node major version, directly read from env. */
export const NODE_MAJOR_VERSION = parseInt(
  process.versions.node.split('.')[0]!,
  10,
);
/** Node minor version, directly read from env. */
export const NODE_MINOR_VERSION = parseInt(
  process.versions.node.split('.')[1]!,
  10,
);

/** Docusaurus core version. */
export const DOCUSAURUS_VERSION =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  (require('../package.json') as {version: string}).version;

/**
 * Can be overridden with cli option `--out-dir`. Code should generally use
 * `context.outDir` instead (which is always absolute and localized).
 */
export const DEFAULT_BUILD_DIR_NAME = 'build';

/**
 * Can be overridden with cli option `--config`. Code should generally use
 * `context.siteConfigPath` instead (which is always absolute).
 *
 * This does not have extensions, so that we can substitute different ones
 * when resolving the path.
 */
export const DEFAULT_CONFIG_FILE_NAME = 'docusaurus.config';

/** Can be absolute or relative to site directory. */
export const BABEL_CONFIG_FILE_NAME =
  process.env.DOCUSAURUS_BABEL_CONFIG_FILE_NAME ?? 'babel.config.js';

/**
 * Can be absolute or relative to site directory. Code should generally use
 * `context.generatedFilesDir` instead (which is always absolute).
 */
export const GENERATED_FILES_DIR_NAME =
  process.env.DOCUSAURUS_GENERATED_FILES_DIR_NAME ?? '.docusaurus';

/**
 * We would assume all of the site's JS code lives in here and not outside.
 * Relative to the site directory.
 */
export const SRC_DIR_NAME = 'src';

/**
 * Can be overridden with `config.staticDirectories`. Code should use
 * `context.siteConfig.staticDirectories` instead (which is always absolute).
 */
export const DEFAULT_STATIC_DIR_NAME = 'static';

/**
 * Files here are handled by webpack, hashed (can be cached aggressively).
 * Relative to the build output folder.
 */
export const OUTPUT_STATIC_ASSETS_DIR_NAME = 'assets';

/**
 * Components in this directory will receive the `@theme` alias and be able to
 * shadow default theme components.
 */
export const THEME_PATH = `${SRC_DIR_NAME}/theme`;

/**
 * All translation-related data live here, relative to site directory. Content
 * will be namespaced by locale.
 */
export const DEFAULT_I18N_DIR_NAME = 'i18n';

/**
 * Translations for React code.
 */
export const CODE_TRANSLATIONS_FILE_NAME = 'code.json';

/** Dev server opens on this port by default. */
export const DEFAULT_PORT = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 3000;

/** Default plugin ID. */
export const DEFAULT_PLUGIN_ID = 'default';

/**
 * Max size in bytes under which assets (images, fonts, medias) are inlined in
 * the bundles as base64 data URLs, instead of being emitted as separate files.
 * Overrides the default max size when the `DOCUSAURUS_ASSET_INLINE_MAX_SIZE`
 * env variable is set.
 *
 * @see https://github.com/facebook/docusaurus/issues/5493
 */
export const ASSET_INLINE_MAX_SIZE: number | undefined = process.env
  .DOCUSAURUS_ASSET_INLINE_MAX_SIZE
  ? parseInt(process.env.DOCUSAURUS_ASSET_INLINE_MAX_SIZE, 10)
  : undefined;
