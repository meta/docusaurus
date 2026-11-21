/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {extractHtmlAnchors} from '../extractHtmlAnchors';

describe('extractHtmlAnchors', () => {
  it('extracts id attributes of arbitrary elements', () => {
    expect(
      extractHtmlAnchors(`
        <h2 id="heading-anchor">Heading</h2>
        <div id="div-anchor"/>
        <span id='single-quote-anchor'>text</span>
        <a id="link-id-anchor" href="#">link</a>
      `),
    ).toEqual([
      'heading-anchor',
      'div-anchor',
      'single-quote-anchor',
      'link-id-anchor',
    ]);
  });

  it('extracts legacy named anchors', () => {
    expect(
      extractHtmlAnchors(`
        <a name="anchor">Some Text</a>
        <a name="self-closing-anchor"/>
        <A NAME="uppercase-anchor"></A>
      `),
    ).toEqual(['anchor', 'self-closing-anchor', 'uppercase-anchor']);
  });

  it('extracts both id and name anchors from the same page', () => {
    expect(
      extractHtmlAnchors(`
        <article>
          <h2 id="section">Section</h2>
          <a name="named">Named</a>
        </article>
      `),
    ).toEqual(['section', 'named']);
  });

  it('deduplicates anchors', () => {
    expect(
      extractHtmlAnchors(`
        <h2 id="same">One</h2>
        <h3 id="same">Two</h3>
        <a name="same">Three</a>
      `),
    ).toEqual(['same']);
  });

  it('ignores empty anchors', () => {
    expect(
      extractHtmlAnchors(`
        <div id="">Empty</div>
        <a name="">Empty</a>
      `),
    ).toEqual([]);
  });

  it('does not match id-like substrings of other attributes', () => {
    expect(
      extractHtmlAnchors(`
        <div data-id="not-an-anchor">text</div>
        <div aria-labelledby="not-an-anchor">text</div>
        <input name="not-an-anchor"/>
      `),
    ).toEqual([]);
  });

  it('does not match id-looking text content', () => {
    // React escapes quotes in text content, but let's be safe anyway
    expect(extractHtmlAnchors(`<p>use id=&quot;foo&quot; here</p>`)).toEqual(
      [],
    );
  });

  it('decodes HTML entities in anchor values', () => {
    expect(
      extractHtmlAnchors(`<div id="a&amp;b&quot;c&#x27;d&#39;e">text</div>`),
    ).toEqual([`a&b"c'd'e`]);
  });

  it('returns an empty array when there are no anchors', () => {
    expect(extractHtmlAnchors('<div><p>No anchors here</p></div>')).toEqual([]);
  });
});
