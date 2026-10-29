/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {isValidElement, type ReactNode} from 'react';
import type {
  InterpolateProps,
  InterpolateValues,
} from '@docusaurus/Interpolate';

/*
Minimal implementation of a React interpolate component.
We don't ship a markdown parser nor a feature-complete i18n library on purpose.
More details here: https://github.com/facebook/docusaurus/pull/4295
*/

// If all the values are plain strings, then interpolate returns a simple string
export function interpolate<Str extends string>(
  text: Str,
  values?: InterpolateValues<Str, string | number>,
): string;

// If values contain any ReactNode, then the return is a ReactNode
export function interpolate<Str extends string, Value extends ReactNode>(
  text: Str,
  values?: InterpolateValues<Str, Value>,
): ReactNode;

export function interpolate<Str extends string, Value extends ReactNode>(
  text: Str,
  values?: InterpolateValues<Str, Value>,
): ReactNode {
  // eslint-disable-next-line prefer-named-capture-group
  const segments = text.split(/(\{\w+\})/).map((seg, index) => {
    // Odd indices (1, 3, 5...) of the segments are (potentially) interpolatable
    if (index % 2 === 1) {
      const value = values?.[seg.slice(1, -1) as keyof typeof values];
      if (value !== undefined) {
        return value;
      }
      // No match: add warning? There's no way to "escape" interpolation though
    }
    return seg;
  });
  if (segments.some((seg) => isValidElement(seg))) {
    return segments
      .map((seg, index) =>
        isValidElement(seg) ? React.cloneElement(seg, {key: index}) : seg,
      )
      .filter((seg) => seg !== '');
  }
  return segments.join('');
}

export default function Interpolate<Str extends string>({
  children,
  values,
}: InterpolateProps<Str>): ReactNode {
  if (typeof children !== 'string') {
    throw new Error(
      `The Docusaurus <Interpolate> component only accept simple string values. Received: ${
        isValidElement(children) ? 'React element' : typeof children
      }`,
    );
  }
  return <>{interpolate(children, values)}</>;
}
