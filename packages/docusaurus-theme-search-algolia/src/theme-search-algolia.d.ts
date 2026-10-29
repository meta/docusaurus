/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// TODO Docusaurus v4: remove after we drop support for DocSearch v3
declare module '@docsearch/react/button';
declare module '@docsearch/react/useDocSearchKeyboardEvents';
declare module '@docsearch/react/version';

declare module '@docusaurus/theme-search-algolia' {
  import type {DeepPartial, Overwrite, Optional} from 'utility-types';

  import type {DocSearchProps} from '@docsearch/react';
  import type {FacetFilters} from 'algoliasearch/lite';

  // The config after normalization (e.g. AskAI string -> object)
  // This matches DocSearch v4.3+ AskAi configuration
  export type AskAiConfig = {
    indexName: string;
    apiKey: string;
    appId: string;
    assistantId: string;
    searchParameters?: {
      facetFilters?: FacetFilters;
    };
    suggestedQuestions?: boolean;
  };

  // DocSearch props that Docusaurus exposes directly through props forwarding
  type DocusaurusDocSearchProps = Pick<
    DocSearchProps,
    | 'appId'
    | 'apiKey'
    | 'indexName'
    | 'placeholder'
    | 'translations'
    | 'searchParameters'
    | 'insights'
    | 'initialQuery'
  > & {
    // Docusaurus normalizes the AskAI config to an object
    askAi?: AskAiConfig;
  };

  export type ThemeConfigAlgolia = DocusaurusDocSearchProps & {
    // TODO Docusaurus v4: upgrade to DocSearch v4, migrate indexName to indices
    indexName: string;

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

  export type UserThemeConfig = {
    algolia?: Overwrite<
      DeepPartial<ThemeConfigAlgolia>,
      {
        // Required fields:
        appId: ThemeConfigAlgolia['appId'];
        apiKey: ThemeConfigAlgolia['apiKey'];
        indexName: ThemeConfigAlgolia['indexName'];
        // askAi also accepts a shorter string form
        askAi?:
          | string
          | Optional<AskAiConfig, 'indexName' | 'appId' | 'apiKey'>;
      }
    >;
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

  const translations: DocSearchTranslations & {
    placeholder: string;
    // TODO Docusaurus v4: cleanup after we drop support for DocSearch v3
    modal?: {
      searchBox?: {
        placeholderText?: string;
        placeholderTextAskAi?: string;
      };
    };
  };
  export default translations;
}
