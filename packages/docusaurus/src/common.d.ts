/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This file is for types that are common between client/server
// In particular the interface between SSG and serverEntry code

import type {RouteBuildMetadata} from '@docusaurus/types';

export type AppRenderResult = {
  html: string;
  collectedData: PageCollectedDataInternal;
};

export type AppRenderer = {
  render: (params: {pathname: string}) => Promise<AppRenderResult>;
};

// Attributes we need internally, for the SSG html template
// They are not exposed to the user in postBuild({routesBuildMetadata})
export type RouteBuildMetadataInternal = {
  htmlAttributes: string;
  bodyAttributes: string;
  title: string;
  meta: string;
  link: string;
  script: string;
};

export type PageCollectedMetadata = {
  public: RouteBuildMetadata;
};

// This data structure must remain serializable!
// See why: https://github.com/facebook/docusaurus/pull/10826
export type PageCollectedMetadataInternal = PageCollectedMetadata & {
  internal: RouteBuildMetadataInternal;
};

export type PageCollectedDataInternal = {
  metadata: PageCollectedMetadataInternal;
  modules: string[];
  links: string[];
  anchors: string[];
};

// Keep this data structure as small as possible
// See https://github.com/facebook/docusaurus/pull/11162
export type PageCollectedData = {
  metadata: PageCollectedMetadata;
  links: string[];
  anchors: string[];
};

// Keep this data structure as small as possible
// See https://github.com/facebook/docusaurus/pull/11162
export type SiteCollectedData = {
  [pathname: string]: PageCollectedData;
};
