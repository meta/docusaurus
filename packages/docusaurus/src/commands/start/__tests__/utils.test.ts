/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import path from 'node:path';
import {createOpenUrlContext} from '../utils';
import type {StartCLIOptions} from '../start';

vi.mock('../../../server/getHostPort', () => ({
  getHostPort: async () => ({host: 'localhost', port: 3000}),
}));

describe('createOpenUrlContext', () => {
  function getCertFixture(name: string) {
    return path.join(
      __dirname,
      '../../../webpack/utils/__tests__/__fixtures__/getHttpsConfig',
      name,
    );
  }

  async function getOpenUrl(cliOptions: StartCLIOptions) {
    const context = await createOpenUrlContext({cliOptions});
    return context.getOpenUrl({baseUrl: '/baseUrl/', router: 'browser'});
  }

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns an http url by default', async () => {
    await expect(getOpenUrl({})).resolves.toBe(
      'http://localhost:3000/baseUrl/',
    );
  });

  it('returns an https url with --https', async () => {
    await expect(getOpenUrl({https: true})).resolves.toBe(
      'https://localhost:3000/baseUrl/',
    );
  });

  it('returns an https url with --ssl-cert and --ssl-key', async () => {
    await expect(
      getOpenUrl({
        sslCert: getCertFixture('host.crt'),
        sslKey: getCertFixture('host.key'),
      }),
    ).resolves.toBe('https://localhost:3000/baseUrl/');
  });

  it('returns an https url with DOCUSAURUS_HTTPS=true', async () => {
    vi.stubEnv('DOCUSAURUS_HTTPS', 'true');
    await expect(getOpenUrl({})).resolves.toBe(
      'https://localhost:3000/baseUrl/',
    );
  });

  it('returns an http url with DOCUSAURUS_HTTPS=false', async () => {
    vi.stubEnv('DOCUSAURUS_HTTPS', 'false');
    await expect(getOpenUrl({})).resolves.toBe(
      'http://localhost:3000/baseUrl/',
    );
  });

  it('shares the resolved HTTPS config with the dev server', async () => {
    const context = await createOpenUrlContext({
      cliOptions: {
        sslCert: getCertFixture('host.crt'),
        sslKey: getCertFixture('host.key'),
      },
    });
    expect(context.httpsConfig).toEqual({
      cert: expect.any(Buffer),
      key: expect.any(Buffer),
    });
  });
});
