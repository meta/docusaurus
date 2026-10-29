/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module '@docusaurus/plugin-content-pages' {
  import type {MDXOptions} from '@docusaurus/mdx-loader';
  import type {
    LoadContext,
    Plugin,
    OptionValidationContext,
  } from '@docusaurus/types';
  import type {FrontMatterLastUpdate, LastUpdateData} from '@docusaurus/utils';

  export type Assets = {
    image?: string;
  };

  export type PluginOptions = MDXOptions & {
    id: string;
    path: string;
    routeBasePath: string;
    include: string[];
    exclude: string[];
    mdxPageComponent: string;
    showLastUpdateTime: boolean;
    showLastUpdateAuthor: boolean;
    editUrl?: string | EditUrlFunction;
    editLocalizedFiles?: boolean;
  };

  export type Options = Partial<PluginOptions>;

  export type PageFrontMatter = {
    readonly title?: string;
    readonly description?: string;
    readonly image?: string;
    readonly slug?: string;
    readonly keywords?: string[];
    readonly wrapperClassName?: string;
    readonly hide_table_of_contents?: string;
    readonly toc_min_heading_level?: number;
    readonly toc_max_heading_level?: number;
    readonly draft?: boolean;
    readonly unlisted?: boolean;
    readonly last_update?: FrontMatterLastUpdate;
  };

  export type JSXPageMetadata = {
    type: 'jsx';
    permalink: string;
    source: string;
  };

  export type MDXPageMetadata = LastUpdateData & {
    type: 'mdx';
    permalink: string;
    source: string;
    frontMatter: PageFrontMatter & {[key: string]: unknown};
    editUrl?: string;
    title?: string;
    description?: string;
    unlisted: boolean;
  };

  export type EditUrlFunction = (editUrlParams: {
    /**
     * The root content directory containing this post file, relative to the
     * site path. Usually the same as `options.path` but can be localized
     */
    pagesDirPath: string;
    /** Path to this pages file, relative to `pagesDirPath`. */
    pagesPath: string;
    /** @see {@link PagesPostMetadata.permalink} */
    permalink: string;
    /** Locale name. */
    locale: string;
  }) => string | undefined;

  export type Metadata = JSXPageMetadata | MDXPageMetadata;

  export type LoadedContent = Metadata[];

  export default function pluginContentPages(
    context: LoadContext,
    options: PluginOptions,
  ): Plugin<LoadedContent | null>;

  export function validateOptions(
    args: OptionValidationContext<Options | undefined, PluginOptions>,
  ): PluginOptions;
}

declare module '@theme/MDXPage' {
  import type {ReactNode} from 'react';
  import type {LoadedMDXContent} from '@docusaurus/mdx-loader';
  import type {
    MDXPageMetadata,
    PageFrontMatter,
    Assets,
  } from '@docusaurus/plugin-content-pages';

  export interface Props {
    readonly content: LoadedMDXContent<
      PageFrontMatter,
      MDXPageMetadata,
      Assets
    >;
  }

  export default function MDXPage(props: Props): ReactNode;
}
