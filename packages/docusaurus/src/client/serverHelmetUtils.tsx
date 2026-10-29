/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactElement} from 'react';
import type {PageCollectedMetadataInternal} from '../common';
import type {HelmetServerState} from 'react-helmet-async';

type BuildMetaTag = {name?: string; content?: string};

function getBuildMetaTags(helmet: HelmetServerState): BuildMetaTag[] {
  // @ts-expect-error: see  https://github.com/staylor/react-helmet-async/pull/167
  const metaElements: ReactElement<BuildMetaTag>[] =
    helmet.meta.toComponent() ?? [];
  return metaElements.map((el) => el.props);
}

function isNoIndexTag(tag: BuildMetaTag): boolean {
  if (!tag.name || !tag.content) {
    return false;
  }
  return (
    // meta name is not case-sensitive
    tag.name.toLowerCase() === 'robots' &&
    // Robots directives are not case-sensitive
    tag.content.toLowerCase().includes('noindex')
  );
}

export function toPageCollectedMetadataInternal({
  helmet,
}: {
  helmet: HelmetServerState;
}): PageCollectedMetadataInternal {
  const tags = getBuildMetaTags(helmet);
  const noIndex = tags.some(isNoIndexTag);

  return {
    public: {
      noIndex,
    },
    internal: {
      htmlAttributes: helmet.htmlAttributes.toString(),
      bodyAttributes: helmet.bodyAttributes.toString(),
      title: helmet.title.toString(),
      meta: helmet.meta.toString(),
      link: helmet.link.toString(),
      script: helmet.script.toString(),
    },
  };
}
