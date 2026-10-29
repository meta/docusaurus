/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ComponentProps, type ReactNode} from 'react';
import Translate from '@docusaurus/Translate';
import {getErrorCausalChain} from '@docusaurus/utils-common';
import type {Props as ErrorProps} from '@theme/Error';
import styles from './errorBoundaryUtils.module.css';

export function ErrorBoundaryTryAgainButton(
  props: ComponentProps<'button'>,
): ReactNode {
  return (
    <button type="button" {...props}>
      <Translate
        id="theme.ErrorPageContent.tryAgain"
        description="The label of the button to try again rendering when the React error boundary captures an error">
        Try again
      </Translate>
    </button>
  );
}

// A very simple reusable ErrorBoundary fallback component
export function ErrorBoundaryErrorMessageFallback({
  error,
  tryAgain,
}: ErrorProps): ReactNode {
  return (
    <div className={styles.errorBoundaryFallback}>
      <p>{error.message}</p>
      <ErrorBoundaryTryAgainButton onClick={tryAgain} />
    </div>
  );
}

export function ErrorBoundaryError({error}: {error: Error}): ReactNode {
  const causalChain = getErrorCausalChain(error);
  const fullMessage = causalChain.map((e) => e.message).join('\n\nCause:\n');
  return <p className={styles.errorBoundaryError}>{fullMessage}</p>;
}

/**
 * This component is useful to wrap a low-level error into a more meaningful
 * error with extra context, using the ES error-cause feature.
 *
 * <ErrorCauseBoundary
 *   onError={(error) => new Error("extra context message",{cause: error})}
 * >
 *   <RiskyComponent>
 * </ErrorCauseBoundary>
 */
export class ErrorCauseBoundary extends React.Component<
  {
    children: React.ReactNode;
    onError: (error: Error, errorInfo: React.ErrorInfo) => Error;
  },
  unknown
> {
  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): never {
    throw this.props.onError(error, errorInfo);
  }

  override render(): React.ReactNode {
    return this.props.children;
  }
}
