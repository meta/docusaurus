/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Translate from '@docusaurus/Translate';
import {
  ErrorBoundaryError,
  ErrorBoundaryTryAgainButton,
} from '@docusaurus/theme-common';
import type {Props} from '@theme/Error';
import Heading from '@theme/Heading';

export default function ErrorPageContent({error, tryAgain}: Props): ReactNode {
  return (
    <main className="container margin-vert--xl">
      <div className="row">
        <div className="col col--6 col--offset-3">
          <Heading as="h1" className="hero__title">
            <Translate
              id="theme.ErrorPageContent.title"
              description="The title of the fallback page when the page crashed">
              This page crashed.
            </Translate>
          </Heading>
          <div className="margin-vert--lg">
            <ErrorBoundaryTryAgainButton
              onClick={tryAgain}
              className="button button--primary shadow--lw"
            />
          </div>
          <hr />
          <div className="margin-vert--md">
            <ErrorBoundaryError error={error} />
          </div>
        </div>
      </div>
    </main>
  );
}
