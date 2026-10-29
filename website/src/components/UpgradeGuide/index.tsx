/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {
  useLatestVersion,
  useActiveDocContext,
  useVersions,
} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import useIsBrowser from '@docusaurus/useIsBrowser';
import Translate from '@docusaurus/Translate';
import Admonition from '@theme/Admonition';
import CodeBlock from '@theme/CodeBlock';

const docsPluginId = undefined; // Default docs plugin instance

function PackageJson() {
  const latestVersion = useLatestVersion(docsPluginId);
  const allVersions = useVersions(docsPluginId);
  // Only happens in deploy preview / local dev, but still nice
  const versionName =
    latestVersion.name === 'current' && allVersions.length > 1
      ? allVersions[1]!.name
      : latestVersion.name;
  return (
    <CodeBlock language="json" title="package.json">{`{
  "dependencies": {
    "@docusaurus/core": "${versionName}",
    "@docusaurus/preset-classic": "${versionName}",
    // ...
  }
}`}</CodeBlock>
  );
}

function VersionNotice() {
  const latestVersion = useLatestVersion(docsPluginId);
  const activeVersion = useActiveDocContext(docsPluginId).activeVersion!;
  const isBrowser = useIsBrowser();
  // It's possible that the user is browsing a snapshot version
  // which is only detectable once we are in the browser
  if (isBrowser) {
    const location = window.location.hostname;
    if (
      location.includes('netlify.app') &&
      !location.includes('deploy-preview')
    ) {
      return (
        <Admonition type="warning">
          <p>
            <Translate
              id="upgradeGuide.archivedVersion.notice"
              values={{
                mainSiteLink: (
                  <Link href="https://docusaurus.io/docs/installation">
                    <Translate id="upgradeGuide.archivedVersion.notice.mainSiteLink.label">
                      main site
                    </Translate>
                  </Link>
                ),
              }}>
              {
                'You are browsing an archived version and the snippet below is outdated. Please go to the {mainSiteLink} and follow the instructions there to upgrade to the latest version.'
              }
            </Translate>
          </p>
        </Admonition>
      );
    }
  }
  if (activeVersion.name === 'current') {
    return (
      <Admonition type="info">
        <p>
          <Translate
            id="upgradeGuide.unreleasedVersion.notice"
            values={{
              canaryDocLink: (
                <Link href="/community/canary">
                  <Translate
                    id="upgradeGuide.unreleasedVersion.notice.canaryDocLink.label"
                    // eslint-disable-next-line @docusaurus/no-untranslated-text
                    values={{canaryTag: <code>@canary</code>}}>
                    {'{canaryTag} release'}
                  </Translate>
                </Link>
              ),
            }}>
            {
              'You are browsing the documentation of an unreleased version. If you want to use any unreleased feature, you can use the {canaryDocLink}.'
            }
          </Translate>
        </p>
      </Admonition>
    );
  }
  if (activeVersion.name !== latestVersion.name) {
    return (
      <Admonition type="warning">
        <p>
          <Translate id="upgradeGuide.outdatedVersion.notice">
            You are browsing the documentation of an outdated version. The
            snippet below shows how to upgrade to the latest version.
          </Translate>
        </p>
      </Admonition>
    );
  }
  return null;
}

export default function UpgradeGuide(): ReactNode {
  return (
    <>
      <VersionNotice />
      <PackageJson />
    </>
  );
}
