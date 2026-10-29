/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Poor man's protocol detection
// Spec: https://datatracker.ietf.org/doc/html/rfc3986#section-3.1
// In particular: scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
export function hasProtocol(url: string): boolean {
  return /^(?:[A-Z][A-Z\d+.-]*:|\/\/)/i.test(url);
}

export default function isInternalUrl(url?: string): boolean {
  return typeof url !== 'undefined' && !hasProtocol(url);
}
