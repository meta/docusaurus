/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// /!\ don't remove this export, as we recommend plugin authors to use it
export {default as Joi} from './Joi';
export {JoiFrontMatter} from './JoiFrontMatter';

export {
  printWarning,
  normalizePluginOptions,
  normalizeThemeConfig,
  validateFrontMatter,
} from './validationUtils';
export {
  PluginIdSchema,
  RemarkPluginsSchema,
  RehypePluginsSchema,
  RecmaPluginsSchema,
  AdmonitionsSchema,
  RouteBasePathSchema,
  URISchema,
  PathnameSchema,
  FrontMatterTagsSchema,
  FrontMatterTOCHeadingLevels,
  ContentVisibilitySchema,
  FrontMatterLastUpdateErrorMessage,
  FrontMatterLastUpdateSchema,
} from './validationSchemas';
export {getTagsFilePathsToWatch, getTagsFile} from './tagsFile';
