/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default function JsxTests(): React.JSX.Element {
  return (
    <ul>
      <li>
        Small image (inlined as data URL):{' '}
        <img
          id="jsx-small-image"
          alt="Open source logo"
          src={new URL('../img/oss_logo.png', import.meta.url).href}
        />
      </li>
      <li>
        Large image (emitted as file):{' '}
        <img
          id="jsx-large-image"
          alt="Docusaurus social card"
          width={300}
          src={
            new URL(
              '../../../static/img/docusaurus-social-card.png',
              import.meta.url,
            ).href
          }
        />
      </li>
      <li>
        Large image with the <code>@site</code> alias:{' '}
        <img
          id="jsx-site-alias-image"
          alt="Docusaurus social card"
          width={300}
          src={
            new URL(
              '@site/static/img/docusaurus-social-card.png',
              import.meta.url,
            ).href
          }
        />
      </li>
      <li>
        SVG image (not transformed into a React component):{' '}
        <img
          id="jsx-svg-image"
          alt="Docusaurus mascot"
          width={100}
          src={new URL('../svg/mascot.svg', import.meta.url).href}
        />
      </li>
      <li>
        {/* Assets are not routes: a regular link is expected here */}
        {/* eslint-disable-next-line @docusaurus/no-html-links */}
        <a
          id="jsx-pdf-link"
          target="_blank"
          rel="noreferrer"
          href={
            new URL('../../_asset-tests/someFile.pdf', import.meta.url).href
          }>
          PDF file link
        </a>
      </li>
    </ul>
  );
}
