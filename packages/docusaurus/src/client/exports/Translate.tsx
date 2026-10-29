/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {interpolate, type InterpolateValues} from '@docusaurus/Interpolate';
// Can't read it from context, due to exposing imperative API
import codeTranslations from '@generated/codeTranslations';
import type {TranslateParam, TranslateProps} from '@docusaurus/Translate';

function getLocalizedMessage({
  id,
  message,
}: {
  message?: string;
  id?: string;
}): string {
  if (typeof id === 'undefined' && typeof message === 'undefined') {
    throw new Error(
      'Docusaurus translation declarations must have at least a translation id or a default translation message',
    );
  }

  return codeTranslations[(id ?? message)!] ?? message ?? id!;
}

// Imperative translation API is useful for some edge-cases:
// - translating page titles (meta)
// - translating string props (input placeholders, image alt, aria labels...)
export function translate<Str extends string>(
  {message, id}: TranslateParam<Str>,
  values?: InterpolateValues<Str, string | number>,
): string {
  const localizedMessage = getLocalizedMessage({message, id});
  return interpolate(localizedMessage, values);
}

// Maybe we'll want to improve this component with additional features
// Like toggling a translation mode that adds a little translation button near
// the text?
export default function Translate<Str extends string>({
  children,
  id,
  values,
}: TranslateProps<Str>): ReactNode {
  if (children && typeof children !== 'string') {
    console.warn('Illegal <Translate> children', children);
    throw new Error(
      'The Docusaurus <Translate> component only accept simple string values',
    );
  }

  const localizedMessage: string = getLocalizedMessage({message: children, id});
  return <>{interpolate(localizedMessage, values)}</>;
}
