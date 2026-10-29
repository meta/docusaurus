/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {HtmlClassNameProvider, PageMetadata} from '@docusaurus/theme-common';
import {
  getDocsVersionSearchTag,
  useDocsVersion,
} from '@docusaurus/plugin-content-docs/client';
import renderRoutes from '@docusaurus/renderRoutes';
import SearchMetadata from '@theme/SearchMetadata';

import type {Props} from '@theme/DocVersionRoot';

function DocVersionRootMetadata(): ReactNode {
  const version = useDocsVersion();
  return (
    <>
      <SearchMetadata
        version={version.version}
        tag={getDocsVersionSearchTag(version.pluginId, version.version)}
      />
      <PageMetadata>
        {version.noIndex && <meta name="robots" content="noindex, nofollow" />}
      </PageMetadata>
    </>
  );
}

function DocVersionRootContent(props: Props): ReactNode {
  const version = useDocsVersion();
  return (
    <HtmlClassNameProvider className={version.className}>
      {renderRoutes(props.route.routes!)}
    </HtmlClassNameProvider>
  );
}
export default function DocVersionRoot(props: Props): ReactNode {
  return (
    <>
      <DocVersionRootMetadata />
      <DocVersionRootContent {...props} />
    </>
  );
}
