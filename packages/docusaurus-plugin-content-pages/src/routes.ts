/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {aliasedSitePathToRelativePath, docuHash} from '@docusaurus/utils';
import type {
  PluginContentLoadedActions,
  RouteConfig,
  RouteMetadata,
} from '@docusaurus/types';
import type {
  PluginOptions,
  Metadata,
  LoadedContent,
  MDXPageMetadata,
} from '@docusaurus/plugin-content-pages';

type CreateAllRoutesParam = {
  content: LoadedContent;
  options: PluginOptions;
  actions: PluginContentLoadedActions;
};

function createPageRouteMetadata(metadata: Metadata): RouteMetadata {
  const lastUpdatedAt =
    metadata.type === 'mdx' ? metadata.lastUpdatedAt : undefined;
  return {
    sourceFilePath: aliasedSitePathToRelativePath(metadata.source),
    lastUpdatedAt,
  };
}

export async function createAllRoutes(
  param: CreateAllRoutesParam,
): Promise<void> {
  const routes = await buildAllRoutes(param);
  routes.forEach(param.actions.addRoute);
}

async function buildAllRoutes({
  content,
  actions,
  options,
}: CreateAllRoutesParam): Promise<RouteConfig[]> {
  const {createData} = actions;

  async function buildMDXPageRoute(
    metadata: MDXPageMetadata,
  ): Promise<RouteConfig> {
    await createData(
      // Note that this created data path must be in sync with
      // metadataPath provided to mdx-loader.
      `${docuHash(metadata.source)}.json`,
      metadata,
    );
    return {
      path: metadata.permalink,
      component: options.mdxPageComponent,
      exact: true,
      metadata: createPageRouteMetadata(metadata),
      modules: {
        content: metadata.source,
      },
    };
  }

  async function buildJSXRoute(metadata: Metadata): Promise<RouteConfig> {
    return {
      path: metadata.permalink,
      component: metadata.source,
      exact: true,
      metadata: createPageRouteMetadata(metadata),
      modules: {
        config: `@generated/docusaurus.config`,
      },
    };
  }

  async function buildPageRoute(metadata: Metadata): Promise<RouteConfig> {
    return metadata.type === 'mdx'
      ? buildMDXPageRoute(metadata)
      : buildJSXRoute(metadata);
  }

  return Promise.all(content.map(buildPageRoute));
}
