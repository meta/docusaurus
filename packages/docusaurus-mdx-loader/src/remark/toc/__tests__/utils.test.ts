/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {toHeadingHTMLValue} from '../utils';
import type {Heading} from 'mdast';

describe('toHeadingHTMLValue', () => {
  it('converts a simple heading', () => {
    const heading: Heading = {
      type: 'heading',
      depth: 2,
      children: [
        {
          type: 'text',
          value: 'Some heading text',
        },
      ],
    };

    expect(toHeadingHTMLValue(heading)).toMatchInlineSnapshot(
      `"Some heading text"`,
    );
  });

  it('converts a heading with b tag', () => {
    const heading: Heading = {
      type: 'heading',
      depth: 2,
      children: [
        {
          type: 'mdxJsxTextElement',
          name: 'b',
          attributes: [],
          children: [
            {
              type: 'text',
              value: 'Some title',
            },
          ],
        },
      ],
    };

    expect(toHeadingHTMLValue(heading)).toMatchInlineSnapshot(
      `"<b>Some title</b>"`,
    );
  });

  it('converts a heading with span tag + className', () => {
    const heading: Heading = {
      type: 'heading',
      depth: 2,
      children: [
        {
          type: 'mdxJsxTextElement',
          name: 'span',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'className',
              value: 'my-class',
            },
          ],
          children: [
            {
              type: 'text',
              value: 'Some title',
            },
          ],
        },
      ],
    };

    expect(toHeadingHTMLValue(heading)).toMatchInlineSnapshot(
      `"<span class="my-class">Some title</span>"`,
    );
  });

  it('converts a heading - remove img tag', () => {
    const heading: Heading = {
      type: 'heading',
      depth: 2,
      children: [
        {
          type: 'mdxJsxTextElement',
          name: 'img',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'src',
              value: '/img/slash-introducing.svg',
            },
            {
              type: 'mdxJsxAttribute',
              name: 'height',
              value: '32',
            },
            {
              type: 'mdxJsxAttribute',
              name: 'alt',
              value: 'test',
            },
          ],
          children: [],
        },
        {
          type: 'text',
          value: ' Some title',
        },
      ],
    };

    expect(toHeadingHTMLValue(heading)).toMatchInlineSnapshot(`"Some title"`);
  });
});
