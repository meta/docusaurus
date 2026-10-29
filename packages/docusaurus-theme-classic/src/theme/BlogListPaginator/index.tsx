/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import PaginatorNavLink from '@theme/PaginatorNavLink';
import type {Props} from '@theme/BlogListPaginator';

export default function BlogListPaginator(props: Props): ReactNode {
  const {metadata} = props;
  const {previousPage, nextPage} = metadata;

  return (
    <nav
      className="pagination-nav"
      aria-label={translate({
        id: 'theme.blog.paginator.navAriaLabel',
        message: 'Blog list page navigation',
        description: 'The ARIA label for the blog pagination',
      })}>
      {previousPage && (
        <PaginatorNavLink
          permalink={previousPage}
          title={
            <Translate
              id="theme.blog.paginator.newerEntries"
              description="The label used to navigate to the newer blog posts page (previous page)">
              Newer entries
            </Translate>
          }
        />
      )}
      {nextPage && (
        <PaginatorNavLink
          permalink={nextPage}
          title={
            <Translate
              id="theme.blog.paginator.olderEntries"
              description="The label used to navigate to the older blog posts page (next page)">
              Older entries
            </Translate>
          }
          isNext
        />
      )}
    </nav>
  );
}
