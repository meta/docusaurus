/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module '@docusaurus/theme-search-algolia' {
  import type {DeepPartial, Overwrite, Optional} from 'utility-types';

  import type {
    DocSearchProps,
    DocSearchAskAi,
    DocSearchIndex,
    AskAiSearchParameters,
  } from '@docsearch/react';

  // `tools` won't currently work as they require functions
  // NOTE: Agent Studio doesn't support `facetFilters` for search parameters,
  // we allow them here since they are converted into `filters` before being
  // passed to the modal. Ideally this should be resolved at the package level.
  export type AskAiConfig = Omit<DocSearchAskAi, 'tools'> & {
    searchParameters?: Record<string, AskAiSearchParameters>;
  };

  // DocSearch props that Docusaurus exposes directly through props forwarding
  type DocusaurusDocSearchProps = Pick<
    DocSearchProps,
    | 'appId'
    | 'apiKey'
    | 'placeholder'
    | 'translations'
    | 'insights'
    | 'initialQuery'
    | 'indices'
    // TODO Enable once DocSearch releases fix for facets with multiple
    // selected values. Currently the contextual search facets do no work.
    // https://github.com/algolia/docsearch/issues/3037
    // | 'facets'
    | 'resultBadgeKey'
  > & {
    // Docusaurus normalizes the AskAI config to an object
    askAi?: AskAiConfig;
  };

  export type ThemeConfigAlgolia = DocusaurusDocSearchProps & {
    // Docusaurus custom options, not coming from DocSearch
    contextualSearch: boolean;
    externalUrlRegex?: string;
    searchPagePath: string | false | null;
    replaceSearchResultPathname?: {
      from: string;
      to: string;
    };
  };

  export type ThemeConfig = {
    algolia: ThemeConfigAlgolia;
  };

  type UserAlgoliaConfig = Overwrite<
    DeepPartial<Omit<ThemeConfigAlgolia, 'indices'>>,
    {
      // Required fields:
      appId: ThemeConfigAlgolia['appId'];
      apiKey: ThemeConfigAlgolia['apiKey'];
      // askAi also accepts a shorter string form
      askAi?:
        | string
        | Optional<
            AskAiConfig,
            'indices' | 'appId' | 'apiKey' | 'searchParameters'
          >;
    }
  > &
    // Single index shorthand, or multiple indices (exclusive)
    (
      | {
          indexName: string;
          searchParameters?: DocSearchIndex['searchParameters'];
          indices?: never;
        }
      | {
          indices: ThemeConfigAlgolia['indices'];
          indexName?: never;
          searchParameters?: never;
        }
    );

  export type UserThemeConfig = {
    algolia?: UserAlgoliaConfig;
  };
}

declare module '@theme/SearchPage' {
  import type {ReactNode} from 'react';

  export default function SearchPage(): ReactNode;
}

declare module '@theme/SearchBar' {
  import type {ReactNode} from 'react';

  export default function SearchBar(): ReactNode;
}

declare module '@theme/SearchTranslations' {
  import type {DocSearchTranslations} from '@docsearch/react';

  const translations: DocSearchTranslations;
  export default translations;
}
