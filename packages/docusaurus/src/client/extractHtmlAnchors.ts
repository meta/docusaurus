/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Matches the `id` attribute of any HTML element: <h2 id="anchor">,
// <div id="anchor"/>, <a id="anchor">...
// Any element with an `id` is a valid fragment navigation target in browsers.
const IdAttributeRegex = /\sid=(["'])(.*?)\1/gi;

// Matches legacy named anchors: <a name="anchor">, <a name="anchor"/>
// The `name` attribute on `<a>` is obsolete as per the HTML5 spec, but browsers
// still honor it as a fragment navigation target, so we keep supporting it.
const AnchorNameAttributeRegex = /<a\b[^<>]*\sname=(["'])(.*?)\1/gi;

const NamedHtmlEntities: {[entityName: string]: string} = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
};

// Attribute values extracted from HTML are HTML-escaped (React escapes them
// during SSR). We decode them back so that they can be compared with the
// raw anchor values collected through the useBrokenLinks() API.
function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(#x?[0-9a-fA-F]+|amp|lt|gt|quot);/g,
    (entity: string, code: string) => {
      if (code in NamedHtmlEntities) {
        return NamedHtmlEntities[code]!;
      }
      const isHexadecimal = /^#x/i.test(code);
      const charCode = parseInt(
        code.slice(isHexadecimal ? 2 : 1),
        isHexadecimal ? 16 : 10,
      );
      return Number.isNaN(charCode) ? entity : String.fromCodePoint(charCode);
    },
  );
}

function extractAnchors(regex: RegExp, html: string): string[] {
  const anchors: string[] = [];
  // The regexes are global: reset lastIndex in case of reuse
  regex.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const anchor = decodeHtmlEntities(match[2]!);
    if (anchor !== '') {
      anchors.push(anchor);
    }
  }
  return anchors;
}

/**
 * Extracts all the anchor targets of a rendered HTML page: the `id` attribute
 * of any element, as well as legacy `<a name="...">` anchors.
 *
 * This is the source of truth browsers use for fragment (`#anchor`) navigation,
 * and allows the broken anchors checker to automatically support arbitrary
 * anchors such as `<div id="anchor"/>` or `<a name="anchor"/>` in MDX/React
 * pages, without requiring explicit collection through useBrokenLinks().
 *
 * See https://github.com/facebook/docusaurus/issues/9808
 */
export function extractHtmlAnchors(html: string): string[] {
  const anchors = new Set<string>([
    ...extractAnchors(IdAttributeRegex, html),
    ...extractAnchors(AnchorNameAttributeRegex, html),
  ]);
  return [...anchors];
}
