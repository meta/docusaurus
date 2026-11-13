/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export {useAlgoliaThemeConfig} from './useAlgoliaThemeConfig';
export {
  useAlgoliaContextualFacetFilters,
  useAlgoliaContextualFacetFiltersIfEnabled,
} from './useAlgoliaContextualFacetFilters';
export {useSearchResultUrlProcessor} from './useSearchResultUrlProcessor';
export {useAlgoliaAskAi} from './useAlgoliaAskAi';
export {useSearchQueryString, useSearchLinkCreator} from './searchPage';
// TODO Docusaurus v5: remove this re-export, use @docsearch/react/utils
export {mergeFacetFilters} from '@docsearch/react/utils';
export {useNormalizeIndices} from './useNormalizeIndices';
export type {DocSearchProps} from './types';
