/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {LiveError, LivePreview} from 'react-live';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {ErrorBoundaryErrorMessageFallback} from '@docusaurus/theme-common';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import Translate from '@docusaurus/Translate';
import PlaygroundHeader from '@theme/Playground/Header';

import styles from './styles.module.css';

function Loader() {
  // Is it worth improving/translating?
  // eslint-disable-next-line @docusaurus/no-untranslated-text
  return <div>Loading...</div>;
}

function PlaygroundLivePreview(): ReactNode {
  // No SSR for the live preview
  // See https://github.com/facebook/docusaurus/issues/5747
  return (
    <BrowserOnly fallback={<Loader />}>
      {() => (
        <>
          <ErrorBoundary
            fallback={(params) => (
              <ErrorBoundaryErrorMessageFallback {...params} />
            )}>
            <LivePreview />
          </ErrorBoundary>
          <LiveError />
        </>
      )}
    </BrowserOnly>
  );
}

export default function PlaygroundPreview(): ReactNode {
  return (
    <>
      <PlaygroundHeader>
        <Translate
          id="theme.Playground.result"
          description="The result label of the live codeblocks">
          Result
        </Translate>
      </PlaygroundHeader>
      <div className={styles.playgroundPreview}>
        <PlaygroundLivePreview />
      </div>
    </>
  );
}
