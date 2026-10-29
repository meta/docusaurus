/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import applyTrailingSlash, {
  addTrailingSlash,
  type ApplyTrailingSlashParams,
  addLeadingSlash,
  removeTrailingSlash,
} from '../applyTrailingSlash';

function params(
  trailingSlash: boolean | undefined,
  baseUrl: string = '/',
): ApplyTrailingSlashParams {
  return {trailingSlash, baseUrl};
}

describe('applyTrailingSlash', () => {
  it('applies to empty', () => {
    expect(applyTrailingSlash('', params(true))).toBe('/');
    expect(applyTrailingSlash('', params(false))).toBe('');
    expect(applyTrailingSlash('', params(undefined))).toBe('');
  });

  it('does not apply to /', () => {
    expect(applyTrailingSlash('/', params(true))).toBe('/');
    expect(applyTrailingSlash('/', params(false))).toBe('/');
    expect(applyTrailingSlash('/', params(undefined))).toBe('/');

    expect(applyTrailingSlash('/?query#anchor', params(true))).toBe(
      '/?query#anchor',
    );
    expect(applyTrailingSlash('/?query#anchor', params(false))).toBe(
      '/?query#anchor',
    );
    expect(applyTrailingSlash('/?query#anchor', params(undefined))).toBe(
      '/?query#anchor',
    );
  });

  it('does not apply to /baseUrl/', () => {
    const baseUrl = '/baseUrl/';
    expect(applyTrailingSlash('/baseUrl/', params(true, baseUrl))).toBe(
      '/baseUrl/',
    );
    expect(applyTrailingSlash('/baseUrl/', params(false, baseUrl))).toBe(
      '/baseUrl/',
    );
    expect(applyTrailingSlash('/baseUrl/', params(undefined, baseUrl))).toBe(
      '/baseUrl/',
    );

    expect(
      applyTrailingSlash('/baseUrl/?query#anchor', params(true, baseUrl)),
    ).toBe('/baseUrl/?query#anchor');
    expect(
      applyTrailingSlash('/baseUrl/?query#anchor', params(false, baseUrl)),
    ).toBe('/baseUrl/?query#anchor');
    expect(
      applyTrailingSlash('/baseUrl/?query#anchor', params(undefined, baseUrl)),
    ).toBe('/baseUrl/?query#anchor');
  });

  it('does not apply to #anchor links', () => {
    expect(applyTrailingSlash('#', params(true))).toBe('#');
    expect(applyTrailingSlash('#', params(false))).toBe('#');
    expect(applyTrailingSlash('#', params(undefined))).toBe('#');
    expect(applyTrailingSlash('#anchor', params(true))).toBe('#anchor');
    expect(applyTrailingSlash('#anchor', params(false))).toBe('#anchor');
    expect(applyTrailingSlash('#anchor', params(undefined))).toBe('#anchor');
  });

  it('applies to simple paths', () => {
    expect(applyTrailingSlash('abc', params(true))).toBe('abc/');
    expect(applyTrailingSlash('abc', params(false))).toBe('abc');
    expect(applyTrailingSlash('abc', params(undefined))).toBe('abc');
    expect(applyTrailingSlash('abc/', params(true))).toBe('abc/');
    expect(applyTrailingSlash('abc/', params(false))).toBe('abc');
    expect(applyTrailingSlash('abc/', params(undefined))).toBe('abc/');
    expect(applyTrailingSlash('/abc', params(true))).toBe('/abc/');
    expect(applyTrailingSlash('/abc', params(false))).toBe('/abc');
    expect(applyTrailingSlash('/abc', params(undefined))).toBe('/abc');
    expect(applyTrailingSlash('/abc/', params(true))).toBe('/abc/');
    expect(applyTrailingSlash('/abc/', params(false))).toBe('/abc');
    expect(applyTrailingSlash('/abc/', params(undefined))).toBe('/abc/');
  });

  it('keeps dollar signs in the pathname', () => {
    // Regression test for edge case bug
    // see https://github.com/facebook/docusaurus/pull/12219
    expect(applyTrailingSlash('/docs/a$$b', params(true))).toBe('/docs/a$$b/');
    expect(applyTrailingSlash('/docs/a$&b', params(true))).toBe('/docs/a$&b/');
    expect(applyTrailingSlash("/docs/a$'b", params(true))).toBe("/docs/a$'b/");
    expect(applyTrailingSlash('/docs/a$$b/', params(false))).toBe('/docs/a$$b');
  });

  it('applies to path with #anchor', () => {
    expect(applyTrailingSlash('/abc#anchor', params(true))).toBe(
      '/abc/#anchor',
    );
    expect(applyTrailingSlash('/abc#anchor', params(false))).toBe(
      '/abc#anchor',
    );
    expect(applyTrailingSlash('/abc#anchor', params(undefined))).toBe(
      '/abc#anchor',
    );
    expect(applyTrailingSlash('/abc/#anchor', params(true))).toBe(
      '/abc/#anchor',
    );
    expect(applyTrailingSlash('/abc/#anchor', params(false))).toBe(
      '/abc#anchor',
    );
    expect(applyTrailingSlash('/abc/#anchor', params(undefined))).toBe(
      '/abc/#anchor',
    );
  });

  it('applies to path with ?search', () => {
    expect(applyTrailingSlash('/abc?search', params(true))).toBe(
      '/abc/?search',
    );
    expect(applyTrailingSlash('/abc?search', params(false))).toBe(
      '/abc?search',
    );
    expect(applyTrailingSlash('/abc?search', params(undefined))).toBe(
      '/abc?search',
    );
    expect(applyTrailingSlash('/abc/?search', params(true))).toBe(
      '/abc/?search',
    );
    expect(applyTrailingSlash('/abc/?search', params(false))).toBe(
      '/abc?search',
    );
    expect(applyTrailingSlash('/abc/?search', params(undefined))).toBe(
      '/abc/?search',
    );
  });

  it('applies to path with ?search#anchor', () => {
    expect(applyTrailingSlash('/abc?search#anchor', params(true))).toBe(
      '/abc/?search#anchor',
    );
    expect(applyTrailingSlash('/abc?search#anchor', params(false))).toBe(
      '/abc?search#anchor',
    );
    expect(applyTrailingSlash('/abc?search#anchor', params(undefined))).toBe(
      '/abc?search#anchor',
    );
    expect(applyTrailingSlash('/abc/?search#anchor', params(true))).toBe(
      '/abc/?search#anchor',
    );
    expect(applyTrailingSlash('/abc/?search#anchor', params(false))).toBe(
      '/abc?search#anchor',
    );
    expect(applyTrailingSlash('/abc/?search#anchor', params(undefined))).toBe(
      '/abc/?search#anchor',
    );
  });

  it('applies to fully qualified urls', () => {
    expect(
      applyTrailingSlash('https://xyz.com/abc?search#anchor', params(true)),
    ).toBe('https://xyz.com/abc/?search#anchor');
    expect(
      applyTrailingSlash('https://xyz.com/abc?search#anchor', params(false)),
    ).toBe('https://xyz.com/abc?search#anchor');
    expect(
      applyTrailingSlash(
        'https://xyz.com/abc?search#anchor',
        params(undefined),
      ),
    ).toBe('https://xyz.com/abc?search#anchor');
    expect(
      applyTrailingSlash('https://xyz.com/abc/?search#anchor', params(true)),
    ).toBe('https://xyz.com/abc/?search#anchor');
    expect(
      applyTrailingSlash('https://xyz.com/abc/?search#anchor', params(false)),
    ).toBe('https://xyz.com/abc?search#anchor');
    expect(
      applyTrailingSlash(
        'https://xyz.com/abc/?search#anchor',
        params(undefined),
      ),
    ).toBe('https://xyz.com/abc/?search#anchor');
  });
});

describe('addTrailingSlash', () => {
  it('is no-op for path with trailing slash', () => {
    expect(addTrailingSlash('/abcd/')).toBe('/abcd/');
  });
  it('adds / for path without trailing slash', () => {
    expect(addTrailingSlash('/abcd')).toBe('/abcd/');
  });
});

describe('addLeadingSlash', () => {
  it('is no-op for path with leading slash', () => {
    expect(addLeadingSlash('/abc')).toBe('/abc');
  });
  it('adds / for path without leading slash', () => {
    expect(addLeadingSlash('abc')).toBe('/abc');
  });
});

describe('removeTrailingSlash', () => {
  it('is no-op for path without trailing slash', () => {
    expect(removeTrailingSlash('/abcd')).toBe('/abcd');
  });
  it('removes / for path with trailing slash', () => {
    expect(removeTrailingSlash('/abcd/')).toBe('/abcd');
  });
});
