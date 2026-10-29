/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Translate from '@docusaurus/Translate';

export function UnlistedBannerTitle(): ReactNode {
  return (
    <Translate
      id="theme.contentVisibility.unlistedBanner.title"
      description="The unlisted content banner title">
      Unlisted page
    </Translate>
  );
}

export function UnlistedBannerMessage(): ReactNode {
  return (
    <Translate
      id="theme.contentVisibility.unlistedBanner.message"
      description="The unlisted content banner message">
      This page is unlisted. Search engines will not index it, and only users
      having a direct link can access it.
    </Translate>
  );
}

export function DraftBannerTitle(): ReactNode {
  return (
    <Translate
      id="theme.contentVisibility.draftBanner.title"
      description="The draft content banner title">
      Draft page
    </Translate>
  );
}

export function DraftBannerMessage(): ReactNode {
  return (
    <Translate
      id="theme.contentVisibility.draftBanner.message"
      description="The draft content banner message">
      This page is a draft. It will only be visible in dev and be excluded from
      the production build.
    </Translate>
  );
}
