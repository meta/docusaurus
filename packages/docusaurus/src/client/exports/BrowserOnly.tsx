/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Suspense, isValidElement, use, type ReactNode} from 'react';
import {browser} from 'react-dom';
import type {Props} from '@docusaurus/BrowserOnly';

function BrowserOnlyContent({children}: Pick<Props, 'children'>): ReactNode {
  // On the server, this bails out to the closest Suspense boundary fallback
  // On the client, this is a no-op
  use(browser());

  if (
    typeof children !== 'function' &&
    process.env.NODE_ENV === 'development'
  ) {
    throw new Error(`Docusaurus error: The children of <BrowserOnly> must be a "render function", e.g. <BrowserOnly>{() => <span>{window.location.href}</span>}</BrowserOnly>.
Current type: ${isValidElement(children) ? 'React element' : typeof children}`);
  }
  return <>{children?.()}</>;
}

export default function BrowserOnly({children, fallback}: Props): ReactNode {
  return (
    <Suspense fallback={fallback ?? null}>
      <BrowserOnlyContent>{children}</BrowserOnlyContent>
    </Suspense>
  );
}
