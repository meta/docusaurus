/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import type {Props} from '@theme/BlogPostItem/Footer/ReadMoreLink';

function ReadMoreLabel() {
  return (
    <b>
      <Translate
        id="theme.blog.post.readMore"
        description="The label used in blog post item excerpts to link to full blog posts">
        Read more
      </Translate>
    </b>
  );
}

export default function BlogPostItemFooterReadMoreLink(
  props: Props,
): ReactNode {
  const {blogPostTitle, ...linkProps} = props;
  return (
    <Link
      aria-label={translate(
        {
          message: 'Read more about {title}',
          id: 'theme.blog.post.readMoreLabel',
          description:
            'The ARIA label for the link to full blog posts from excerpts',
        },
        {title: blogPostTitle},
      )}
      {...linkProps}>
      <ReadMoreLabel />
    </Link>
  );
}
