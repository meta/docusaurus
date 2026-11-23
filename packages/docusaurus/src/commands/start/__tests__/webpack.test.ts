/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {createDevServerConfig} from '../webpack';
import {DevHtmlFilename} from '../../../webpack/plugins/DevHtmlPlugin';
import type {Props} from '@docusaurus/types';

describe('createDevServerConfig', () => {
  function createTestProps(baseUrl: string = '/'): Props {
    return {
      baseUrl,
      siteDir: '/site',
      siteConfig: {
        staticDirectories: [],
        future: {
          experimental_router: 'browser',
        },
      },
    } as unknown as Props;
  }

  it('configures historyApiFallback rewrite with DevHtmlFilename for root baseUrl', () => {
    const config = createDevServerConfig({
      props: createTestProps('/'),
      cliOptions: {},
      host: 'localhost',
      port: 3000,
      httpsConfig: false,
    });

    expect(config.historyApiFallback).toEqual({
      rewrites: [{from: /\/*/, to: `/${DevHtmlFilename}`}],
    });
  });

  it('configures historyApiFallback rewrite with DevHtmlFilename for subpath baseUrl', () => {
    const config = createDevServerConfig({
      props: createTestProps('/subpath/'),
      cliOptions: {},
      host: 'localhost',
      port: 3000,
      httpsConfig: false,
    });

    expect(config.historyApiFallback).toEqual({
      rewrites: [{from: /\/*/, to: `/subpath/${DevHtmlFilename}`}],
    });
  });
});
