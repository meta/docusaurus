/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import Head from '@docusaurus/Head';
import {
  ThemeClassNames,
  UnlistedBannerTitle,
  UnlistedBannerMessage,
} from '@docusaurus/theme-common';
import Admonition from '@theme/Admonition';
import type {Props} from '@theme/ContentVisibility/Unlisted';

function UnlistedMetadata(): ReactNode {
  return (
    <Head>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  );
}

function UnlistedBanner({className}: Props) {
  return (
    <Admonition
      type="warning"
      title={<UnlistedBannerTitle />}
      className={clsx(className, ThemeClassNames.common.unlistedBanner)}>
      <UnlistedBannerMessage />
    </Admonition>
  );
}

export default function Unlisted(props: Props): ReactNode {
  return (
    <>
      {/*
      Unlisted metadata declared here for simplicity.
      Ensures we never forget to add the correct noindex metadata.
      Also gives a central place for user to swizzle override default metadata.
      */}
      <UnlistedMetadata />
      <UnlistedBanner {...props} />
    </>
  );
}
