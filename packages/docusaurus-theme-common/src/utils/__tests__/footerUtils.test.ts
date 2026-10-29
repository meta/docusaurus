/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {isMultiColumnFooterLinks} from '../footerUtils';

describe('isMultiColumnFooterLinks', () => {
  it('works', () => {
    expect(
      isMultiColumnFooterLinks([
        {
          title: 'section',
          items: [
            {href: '/foo', label: 'Foo'},
            {href: '/bar', label: 'Bar'},
          ],
        },
        {
          title: 'section2',
          items: [
            {href: '/foo', label: 'Foo2'},
            {href: '/bar', label: 'Bar2'},
          ],
        },
      ]),
    ).toBe(true);
    expect(
      isMultiColumnFooterLinks([
        {href: '/foo', label: 'Foo'},
        {href: '/bar', label: 'Bar'},
      ]),
    ).toBe(false);
  });
});
