/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Changed the text labels.

import type {ReactNode} from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import PaginatorNavLink from '@theme/PaginatorNavLink';
import type {Props} from '@theme/BlogPostPaginator';

export default function ChangelogPaginator(props: Props): ReactNode {
  const {nextItem, prevItem} = props;

  return (
    <nav
      className="pagination-nav docusaurus-mt-lg"
      aria-label={translate({
        id: 'theme.changelog.post.paginator.navAriaLabel',
        message: 'Changelog item navigation',
        description: 'The ARIA label for the changelog pagination',
      })}>
      {prevItem && (
        <PaginatorNavLink
          {...prevItem}
          subLabel={
            <Translate
              id="theme.changelog.post.paginator.newerRelease"
              description="The changelog button label to navigate to the newer release">
              Newer release
            </Translate>
          }
        />
      )}
      {nextItem && (
        <PaginatorNavLink
          {...nextItem}
          subLabel={
            <Translate
              id="theme.changelog.post.paginator.olderRelease"
              description="The changelog button label to navigate to the older release">
              Older release
            </Translate>
          }
          isNext
        />
      )}
    </nav>
  );
}
