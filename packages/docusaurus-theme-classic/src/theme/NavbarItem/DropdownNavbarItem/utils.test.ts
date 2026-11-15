/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import type {LinkLikeNavbarItemProps} from '@theme/NavbarItem';
import {containsActiveItems} from './utils';

const asItem = (item: Record<string, unknown>) =>
  item as unknown as LinkLikeNavbarItemProps;

describe('containsActiveItems', () => {
  it('returns true when a child targets the current path', () => {
    expect(
      containsActiveItems(
        [asItem({to: '/docs/getting-started'})],
        '/docs/getting-started',
      ),
    ).toBe(true);
  });

  it('returns true when a child activeBaseRegex matches the current path', () => {
    expect(
      containsActiveItems(
        [asItem({activeBaseRegex: '^/docs/'})],
        '/docs/getting-started',
      ),
    ).toBe(true);
  });

  it('returns true when a child activeBasePath matches the current path prefix', () => {
    expect(
      containsActiveItems(
        [asItem({activeBasePath: '/docs'})],
        '/docs/getting-started',
      ),
    ).toBe(true);
  });

  it('returns false when activeBasePath does not match the current path', () => {
    expect(
      containsActiveItems(
        [asItem({activeBasePath: '/docs'})],
        '/blog/hello-world',
      ),
    ).toBe(false);
  });

  it('returns false when no child matches the current path', () => {
    expect(
      containsActiveItems([asItem({to: '/blog'})], '/docs/getting-started'),
    ).toBe(false);
  });

  it('returns true when at least one of multiple children matches', () => {
    expect(
      containsActiveItems(
        [asItem({to: '/blog'}), asItem({to: '/docs/getting-started'})],
        '/docs/getting-started',
      ),
    ).toBe(true);
  });

  it('returns false when none of multiple children match', () => {
    expect(
      containsActiveItems(
        [asItem({to: '/blog'}), asItem({to: '/community'})],
        '/docs/getting-started',
      ),
    ).toBe(false);
  });

  it('returns false for an empty items array', () => {
    expect(containsActiveItems([], '/docs/getting-started')).toBe(false);
  });

  it('returns false when activeBaseRegex does not match the current path', () => {
    expect(
      containsActiveItems(
        [asItem({activeBaseRegex: '^/blog/'})],
        '/docs/getting-started',
      ),
    ).toBe(false);
  });

  it('returns true when trailing slash differs but path matches via isSamePath', () => {
    expect(
      containsActiveItems(
        [asItem({to: '/docs/getting-started/'})],
        '/docs/getting-started',
      ),
    ).toBe(true);
  });

  it('returns true when item has both to (non-matching) and activeBasePath (matching)', () => {
    expect(
      containsActiveItems(
        [asItem({to: '/docs', activeBasePath: '/docs'})],
        '/docs/getting-started',
      ),
    ).toBe(true);
  });
});
