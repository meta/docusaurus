/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {HelmetProvider} from 'react-helmet-async';

import Head from '../Head';

describe('Head', () => {
  it('does exactly what Helmet does', () => {
    const helmetContext = {};

    const {container} = render(
      <HelmetProvider context={helmetContext}>
        <Head>
          <meta property="og:type" content="article" />
          <meta property="og:description" content="some description" />
        </Head>
        <Head>
          <meta
            property="og:description"
            content="some description overridden"
          />
        </Head>
        <Head>
          <meta property="duplicated?" content="this property is duplicated" />
          <meta property="duplicated?" content="another one" />
        </Head>
        <div>Content</div>
      </HelmetProvider>,
    );

    expect(container.firstElementChild).toMatchInlineSnapshot(`
      <div>
        Content
      </div>
    `);
    expect(helmetContext).toMatchInlineSnapshot(`
      {
        "helmet": <html>
          <head>
            <meta
              content="article"
              data-rh={true}
              property="og:type"
            />
            <meta
              content="some description overridden"
              data-rh={true}
              property="og:description"
            />
            <meta
              content="this property is duplicated"
              data-rh={true}
              property="duplicated?"
            />
            <meta
              content="another one"
              data-rh={true}
              property="duplicated?"
            />
            <title
              data-rh={true}
            />
          </head>
          <body />
        </html>,
      }
    `);
  });
});
