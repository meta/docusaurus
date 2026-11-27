/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import logger from '@docusaurus/logger';
import {
  docuHash,
  normalizeUrl,
  aliasedSitePathToRelativePath,
  groupTaggedItems,
  getTagVisibility,
} from '@docusaurus/utils';
import {
  toTagDocListProp,
  toTagsListTagsProp,
  toVersionMetadataProp,
} from './props';
import type {
  PluginContentLoadedActions,
  RouteConfig,
  RouteMetadata,
} from '@docusaurus/types';
import type {FullVersion, VersionTag, VersionTags} from './types';
import type {
  CategoryGeneratedIndexMetadata,
  DocMetadata,
  PluginOptions,
} from '@docusaurus/plugin-content-docs';

function createDocRouteMetadata(docMeta: DocMetadata): RouteMetadata {
  return {
    sourceFilePath: aliasedSitePathToRelativePath(docMeta.source),
    lastUpdatedAt: docMeta.lastUpdatedAt,
  };
}

async function buildVersionCategoryGeneratedIndexRoutes({
  version,
  options,
}: BuildVersionRoutesParam): Promise<RouteConfig[]> {
  async function buildCategoryGeneratedIndexRoute(
    categoryGeneratedIndex: CategoryGeneratedIndexMetadata,
  ): Promise<RouteConfig> {
    return {
      path: categoryGeneratedIndex.permalink,
      component: options.docCategoryGeneratedIndexComponent,
      exact: true,
      props: {
        categoryGeneratedIndex,
      },
      // Same as doc, this sidebar route attribute permits to associate this
      // subpage to the given sidebar
      ...(categoryGeneratedIndex.sidebar && {
        sidebar: categoryGeneratedIndex.sidebar,
      }),
    };
  }

  return Promise.all(
    version.categoryGeneratedIndices.map(buildCategoryGeneratedIndexRoute),
  );
}

async function buildVersionDocRoutes({
  version,
  actions,
  options,
}: BuildVersionRoutesParam): Promise<RouteConfig[]> {
  return Promise.all(
    version.docs.map(async (doc) => {
      await actions.createData(
        // Note that this created data path must be in sync with
        // metadataPath provided to mdx-loader.
        `${docuHash(doc.source)}.json`,
        doc,
      );

      const docRoute: RouteConfig = {
        path: doc.permalink,
        component: options.docItemComponent,
        exact: true,
        modules: {
          content: doc.source,
        },
        metadata: createDocRouteMetadata(doc),
        // Because the parent (DocRoot) comp need to access it easily
        // This permits to render the sidebar once without unmount/remount when
        // navigating (and preserve sidebar state)
        ...(doc.sidebar && {
          sidebar: doc.sidebar,
        }),
      };

      return docRoute;
    }),
  );
}

async function buildVersionSidebarRoute(param: BuildVersionRoutesParam) {
  const [docRoutes, categoryGeneratedIndexRoutes] = await Promise.all([
    buildVersionDocRoutes(param),
    buildVersionCategoryGeneratedIndexRoutes(param),
  ]);
  const subRoutes = [...docRoutes, ...categoryGeneratedIndexRoutes];
  return {
    path: param.version.path,
    exact: false,
    component: param.options.docRootComponent,
    routes: subRoutes,
  };
}
function getVersionTags(docs: DocMetadata[]): VersionTags {
  const groups = groupTaggedItems(docs, (doc) => doc.tags);
  return _.mapValues(groups, ({tag, items: tagDocs}) => {
    const tagVisibility = getTagVisibility({
      items: tagDocs,
      isUnlisted: (item) => item.unlisted,
    });
    return {
      inline: tag.inline,
      label: tag.label,
      permalink: tag.permalink,
      description: tag.description,
      docIds: tagVisibility.listedItems.map((item) => item.id),
      unlisted: tagVisibility.unlisted,
    };
  });
}

async function buildVersionTagsRoutes(
  param: BuildVersionRoutesParam,
): Promise<RouteConfig[]> {
  const {version, options} = param;
  const versionTags = getVersionTags(version.docs);

  async function buildTagsListRoute(): Promise<RouteConfig | null> {
    const tags = toTagsListTagsProp(versionTags);
    // Don't create a tags list page if there's no tag
    if (tags.length === 0) {
      return null;
    }
    return {
      path: version.tagsPath,
      exact: true,
      component: options.docTagsListComponent,
      props: {
        tags,
      },
    };
  }

  async function buildTagDocListRoute(tag: VersionTag): Promise<RouteConfig> {
    return {
      path: tag.permalink,
      component: options.docTagDocListComponent,
      exact: true,
      props: {
        tag: toTagDocListProp({
          allTagsPath: version.tagsPath,
          tag,
          docs: version.docs,
        }),
      },
    };
  }

  const [tagsListRoute, allTagsDocListRoutes] = await Promise.all([
    buildTagsListRoute(),
    Promise.all(Object.values(versionTags).map(buildTagDocListRoute)),
  ]);

  return _.compact([tagsListRoute, ...allTagsDocListRoutes]);
}

type BuildVersionRoutesParam = Omit<BuildAllRoutesParam, 'versions'> & {
  version: FullVersion;
};

async function buildVersionRoutes(
  param: BuildVersionRoutesParam,
): Promise<RouteConfig> {
  const {version, options, actions} = param;

  async function buildVersionSubRoutes() {
    const [sidebarRoute, tagsRoutes] = await Promise.all([
      buildVersionSidebarRoute(param),
      buildVersionTagsRoutes(param),
    ]);

    return [sidebarRoute, ...tagsRoutes];
  }

  // The version metadata is provided to the whole version subtree through the
  // route context, see useDocsVersion()
  async function createVersionMetadataModule(): Promise<string> {
    return actions.createData(
      `version-${docuHash(version.versionName)}.json`,
      toVersionMetadataProp(options.id, version),
    );
  }

  async function doBuildVersionRoutes(): Promise<RouteConfig> {
    const [versionMetadataModulePath, subRoutes] = await Promise.all([
      createVersionMetadataModule(),
      buildVersionSubRoutes(),
    ]);
    return {
      path: version.path,
      exact: false,
      component: options.docVersionRootComponent,
      routes: subRoutes,
      context: {
        docsVersion: versionMetadataModulePath,
      },
      priority: version.routePriority,
    };
  }

  try {
    return await doBuildVersionRoutes();
  } catch (err) {
    logger.error`Can't create version routes for version name=${version.versionName}`;
    throw err;
  }
}

type BuildAllRoutesParam = Omit<CreateAllRoutesParam, 'actions'> & {
  actions: Omit<PluginContentLoadedActions, 'addRoute' | 'setGlobalData'>;
};

// TODO we want this buildAllRoutes function to be easily testable
// Ideally, we should avoid side effects here (ie not injecting actions)
export async function buildAllRoutes(
  param: BuildAllRoutesParam,
): Promise<RouteConfig[]> {
  const subRoutes = await Promise.all(
    param.versions.map((version) =>
      buildVersionRoutes({
        ...param,
        version,
      }),
    ),
  );

  // all docs routes are wrapped under a single parent route, this ensures
  // the theme layout never unmounts/remounts when navigating between versions
  return [
    {
      path: normalizeUrl([param.baseUrl, param.options.routeBasePath]),
      exact: false,
      component: param.options.docsRootComponent,
      routes: subRoutes,
    },
  ];
}

type CreateAllRoutesParam = {
  baseUrl: string;
  versions: FullVersion[];
  options: PluginOptions;
  actions: PluginContentLoadedActions;
};

export async function createAllRoutes(
  param: CreateAllRoutesParam,
): Promise<void> {
  const routes = await buildAllRoutes(param);
  routes.forEach(param.actions.addRoute);
}
