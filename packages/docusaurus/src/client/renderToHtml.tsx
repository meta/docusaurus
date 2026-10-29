/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {renderToPipeableStream} from 'react-dom/server';
import {PassThrough} from 'node:stream';
import {text} from 'node:stream/consumers';

// See also https://github.com/facebook/react/issues/31134
// See also https://github.com/facebook/docusaurus/issues/9985#issuecomment-2396367797
export async function renderToHtml(app: ReactNode): Promise<string> {
  return new Promise((resolve, reject) => {
    const passThrough = new PassThrough();
    const {pipe} = renderToPipeableStream(app, {
      onError(error) {
        reject(error);
      },
      onAllReady() {
        pipe(passThrough);
        text(passThrough).then(resolve, reject);
      },
    });
  });
}
