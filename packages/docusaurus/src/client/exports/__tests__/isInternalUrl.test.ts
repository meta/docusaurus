/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import isInternalUrl from '../isInternalUrl';

describe('isInternalUrl', () => {
  it('returns true for empty links', () => {
    expect(isInternalUrl('')).toBeTruthy();
  });

  it('returns true for root relative links', () => {
    expect(isInternalUrl('/foo/bar')).toBeTruthy();
  });

  it('returns true for relative links', () => {
    expect(isInternalUrl('foo/bar')).toBeTruthy();
  });

  it('returns false for HTTP links', () => {
    expect(isInternalUrl('http://foo.com')).toBeFalsy();
  });

  it('returns false for HTTPS links', () => {
    expect(isInternalUrl('https://foo.com')).toBeFalsy();
  });

  it('returns false for relative protocol links', () => {
    expect(isInternalUrl('//foo.com')).toBeFalsy();
  });

  it('returns false for telephone links', () => {
    expect(isInternalUrl('tel:+1234567890')).toBeFalsy();
  });

  it('returns false for mailto links', () => {
    expect(isInternalUrl('mailto:someone@example.com')).toBeFalsy();
  });

  it('returns false for undefined links', () => {
    expect(isInternalUrl(undefined)).toBeFalsy();
  });

  describe('custom scheme links', () => {
    it('returns true for invalid protocol schemes', () => {
      expect(isInternalUrl('+customScheme://')).toBeTruthy();
      expect(isInternalUrl('+customScheme://whatever')).toBeTruthy();
      expect(isInternalUrl('+customScheme:whatever')).toBeTruthy();

      expect(isInternalUrl('.customScheme://')).toBeTruthy();
      expect(isInternalUrl('.customScheme://whatever')).toBeTruthy();
      expect(isInternalUrl('.customScheme:whatever')).toBeTruthy();

      expect(isInternalUrl('-customScheme://')).toBeTruthy();
      expect(isInternalUrl('-customScheme://whatever')).toBeTruthy();
      expect(isInternalUrl('-customScheme:whatever')).toBeTruthy();

      expect(isInternalUrl('custom_scheme://')).toBeTruthy();
      expect(isInternalUrl('custom_scheme://whatever')).toBeTruthy();
      expect(isInternalUrl('custom_scheme:whatever')).toBeTruthy();

      expect(isInternalUrl('custom scheme://')).toBeTruthy();
      expect(isInternalUrl('custom scheme://whatever')).toBeTruthy();
      expect(isInternalUrl('custom scheme:whatever')).toBeTruthy();

      expect(isInternalUrl('custom$scheme://')).toBeTruthy();
      expect(isInternalUrl('custom$scheme://whatever')).toBeTruthy();
      expect(isInternalUrl('custom$scheme:whatever')).toBeTruthy();
    });

    it('returns false valid protocol schemes', () => {
      expect(isInternalUrl('customScheme://')).toBeFalsy();
      expect(isInternalUrl('customScheme://whatever')).toBeFalsy();
      expect(isInternalUrl('customScheme:whatever')).toBeFalsy();

      expect(isInternalUrl('custom-scheme://')).toBeFalsy();
      expect(isInternalUrl('custom-scheme://whatever')).toBeFalsy();
      expect(isInternalUrl('custom-scheme:whatever')).toBeFalsy();

      expect(isInternalUrl('custom.scheme://')).toBeFalsy();
      expect(isInternalUrl('custom.scheme://whatever')).toBeFalsy();
      expect(isInternalUrl('custom.scheme:whatever')).toBeFalsy();

      expect(isInternalUrl('custom-sch.eme+-.://')).toBeFalsy();
      expect(isInternalUrl('custom-sch.eme+-.://whatever')).toBeFalsy();
      expect(isInternalUrl('custom-sch.eme+-.:whatever')).toBeFalsy();
    });
  });
});
