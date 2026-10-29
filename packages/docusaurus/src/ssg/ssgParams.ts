/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {DOCUSAURUS_VERSION} from '@docusaurus/utils';
import {PerfLogger} from '@docusaurus/logger';
import {readJSON} from '@docusaurus/fs';
import DefaultSSGTemplate from './ssgTemplate.html';
import type {Manifest} from 'react-loadable-ssr-addon-v5-slorber';
import type {Props} from '@docusaurus/types';

// Keep these params serializable
// This makes it possible to use workers
export type SSGParams = {
  trailingSlash: boolean | undefined;
  manifest: Manifest;
  headTags: string;
  preBodyTags: string;
  postBodyTags: string;
  outDir: string;
  baseUrl: string;
  DOCUSAURUS_VERSION: string;

  serverBundlePath: string;
  ssgTemplateContent: string;
};

export async function createSSGParams({
  props,
  serverBundlePath,
  clientManifestPath,
}: {
  props: Props;
  serverBundlePath: string;
  clientManifestPath: string;
}): Promise<SSGParams> {
  const manifest: Manifest = await PerfLogger.async(
    'Read client manifest',
    () => readJSON(clientManifestPath) as Promise<Manifest>,
  );

  const params: SSGParams = {
    trailingSlash: props.siteConfig.trailingSlash,
    outDir: props.outDir,
    baseUrl: props.baseUrl,
    manifest,
    headTags: props.headTags,
    preBodyTags: props.preBodyTags,
    postBodyTags: props.postBodyTags,
    ssgTemplateContent: props.siteConfig.ssgTemplate ?? DefaultSSGTemplate,
    DOCUSAURUS_VERSION,
    serverBundlePath,
  };

  // Useless but ensures that SSG params remain serializable
  return structuredClone(params);
}
