/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import path from 'node:path';
import getHttpsConfig from '../getHttpsConfig';

describe('getHttpsConfig', () => {
  function getFixture(name: string) {
    return path.join(__dirname, '__fixtures__/getHttpsConfig', name);
  }

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const configMatcher = {
    key: expect.any(Buffer),
    cert: expect.any(Buffer),
  };

  it('returns false - empty config/env', async () => {
    await expect(getHttpsConfig()).resolves.toBe(false);
  });

  describe('env', () => {
    it('returns false - !https', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'false');
      await expect(getHttpsConfig()).resolves.toBe(false);
    });

    it('returns true - https, !cert, !key', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'true');
      await expect(getHttpsConfig()).resolves.toBe(true);
    });

    it('returns config - !https, cert, key', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'false');
      vi.stubEnv('DOCUSAURUS_SSL_CRT_FILE', getFixture('host.crt'));
      vi.stubEnv('DOCUSAURUS_SSL_KEY_FILE', getFixture('host.key'));
      await expect(getHttpsConfig()).resolves.toEqual(false);
    });

    it('returns config - -https, cert, key', async () => {
      vi.stubEnv('DOCUSAURUS_SSL_CRT_FILE', getFixture('host.crt'));
      vi.stubEnv('DOCUSAURUS_SSL_KEY_FILE', getFixture('host.key'));
      await expect(getHttpsConfig()).resolves.toEqual(configMatcher);
    });

    it('returns config - https, cert, key', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'true');
      vi.stubEnv('DOCUSAURUS_SSL_CRT_FILE', getFixture('host.crt'));
      vi.stubEnv('DOCUSAURUS_SSL_KEY_FILE', getFixture('host.key'));
      await expect(getHttpsConfig()).resolves.toEqual(configMatcher);
    });

    it('returns config - https, ECDSA cert, ECDSA key', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'true');
      vi.stubEnv('DOCUSAURUS_SSL_CRT_FILE', getFixture('host-ec.crt'));
      vi.stubEnv('DOCUSAURUS_SSL_KEY_FILE', getFixture('host-ec.key'));
      await expect(getHttpsConfig()).resolves.toEqual(configMatcher);
    });

    it('throws for non-existent cert', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'true');
      vi.stubEnv('DOCUSAURUS_SSL_CRT_FILE', getFixture('nonexistent.crt'));
      vi.stubEnv('DOCUSAURUS_SSL_KEY_FILE', getFixture('host.key'));
      await expect(getHttpsConfig()).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: You specified env DOCUSAURUS_SSL_CRT_FILE, but file at path "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/nonexistent.crt" can't be found.]`,
      );
    });

    it('throws for invalid cert', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'true');
      vi.stubEnv('DOCUSAURUS_SSL_CRT_FILE', getFixture('invalid.crt'));
      vi.stubEnv('DOCUSAURUS_SSL_KEY_FILE', getFixture('host.key'));
      await expect(getHttpsConfig()).rejects
        .toThrowErrorMatchingInlineSnapshot(`
        [Error: The certificate "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/invalid.crt" is invalid.]
        Cause: [Error: error:0480006C:PEM routines::no start line]
      `);
    });

    it('throws for non-existent key', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'true');
      vi.stubEnv('DOCUSAURUS_SSL_CRT_FILE', getFixture('host.crt'));
      vi.stubEnv('DOCUSAURUS_SSL_KEY_FILE', getFixture('nonexistent.key'));
      await expect(getHttpsConfig()).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: You specified env DOCUSAURUS_SSL_KEY_FILE, but file at path "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/nonexistent.key" can't be found.]`,
      );
    });

    it('throws for invalid key', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'true');
      vi.stubEnv('DOCUSAURUS_SSL_CRT_FILE', getFixture('host.crt'));
      vi.stubEnv('DOCUSAURUS_SSL_KEY_FILE', getFixture('invalid.key'));
      await expect(getHttpsConfig()).rejects.toThrowErrorMatchingInlineSnapshot(
        `
        [Error: The certificate key "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/invalid.key" is invalid.]
        Cause: [Error: error:1E08010C:DECODER routines::unsupported]
      `,
      );
    });

    it('throws for cert without key', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'true');
      vi.stubEnv('DOCUSAURUS_SSL_CRT_FILE', getFixture('host.crt'));
      await expect(getHttpsConfig()).rejects
        .toThrowErrorMatchingInlineSnapshot(`
        [Error: HTTPS support require proving a certificate and key at the same time.
        You only provided a certificate (with env DOCUSAURUS_SSL_CRT_FILE) at path "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/host.crt".]
      `);
    });

    it('throws for key without cert', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'true');
      vi.stubEnv('DOCUSAURUS_SSL_KEY_FILE', getFixture('host.key'));
      await expect(getHttpsConfig()).rejects
        .toThrowErrorMatchingInlineSnapshot(`
        [Error: HTTPS support require proving a certificate and key at the same time.
        You only provided a key (with env DOCUSAURUS_SSL_KEY_FILE) at path "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/host.key".]
      `);
    });

    it('throws when cert and key do not match', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'true');
      vi.stubEnv('DOCUSAURUS_SSL_CRT_FILE', getFixture('host-ec.crt'));
      vi.stubEnv('DOCUSAURUS_SSL_KEY_FILE', getFixture('other-ec.key'));
      await expect(getHttpsConfig()).rejects.toMatchInlineSnapshot(
        `[Error: The certificate "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/host-ec.crt" and key "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/other-ec.key" do not match.]`,
      );
    });
  });

  describe('options', () => {
    it('returns false - !https', async () => {
      await expect(getHttpsConfig({https: false})).resolves.toBe(false);
    });

    it('returns true - https, !cert, !key', async () => {
      await expect(getHttpsConfig({https: true})).resolves.toBe(true);
    });

    it('returns config - !https, cert, key', async () => {
      await expect(
        getHttpsConfig({
          https: false,
          sslCert: getFixture('host.crt'),
          sslKey: getFixture('host.key'),
        }),
      ).resolves.toEqual(false);
    });

    it('returns config - -https, cert, key', async () => {
      await expect(
        getHttpsConfig({
          sslCert: getFixture('host.crt'),
          sslKey: getFixture('host.key'),
        }),
      ).resolves.toEqual(configMatcher);
    });

    it('returns config - https, cert, key', async () => {
      await expect(
        getHttpsConfig({
          https: true,
          sslCert: getFixture('host.crt'),
          sslKey: getFixture('host.key'),
        }),
      ).resolves.toEqual(configMatcher);
    });

    it('returns config - https, ECDSA cert, ECDSA key', async () => {
      await expect(
        getHttpsConfig({
          https: true,
          sslCert: getFixture('host-ec.crt'),
          sslKey: getFixture('host-ec.key'),
        }),
      ).resolves.toEqual(configMatcher);
    });

    it('throws for non-existent cert', async () => {
      await expect(
        getHttpsConfig({
          https: true,
          sslCert: getFixture('nonexistent.crt'),
          sslKey: getFixture('host.key'),
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: You specified CLI arg --ssl-cert, but file at path "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/nonexistent.crt" can't be found.]`,
      );
    });

    it('throws for invalid cert', async () => {
      await expect(
        getHttpsConfig({
          https: true,
          sslCert: getFixture('invalid.crt'),
          sslKey: getFixture('host.key'),
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Error: The certificate "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/invalid.crt" is invalid.]
        Cause: [Error: error:0480006C:PEM routines::no start line]
      `);
    });

    it('throws for non-existent key', async () => {
      await expect(
        getHttpsConfig({
          https: true,
          sslCert: getFixture('host.crt'),
          sslKey: getFixture('nonexistent.key'),
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: You specified CLI arg --ssl-key, but file at path "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/nonexistent.key" can't be found.]`,
      );
    });

    it('throws for invalid key', async () => {
      await expect(
        getHttpsConfig({
          https: true,
          sslCert: getFixture('host.crt'),
          sslKey: getFixture('invalid.key'),
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `
        [Error: The certificate key "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/invalid.key" is invalid.]
        Cause: [Error: error:1E08010C:DECODER routines::unsupported]
      `,
      );
    });

    it('throws for cert without key', async () => {
      await expect(
        getHttpsConfig({
          https: true,
          sslCert: getFixture('host.crt'),
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Error: HTTPS support require proving a certificate and key at the same time.
        You only provided a certificate (with CLI arg --ssl-cert) at path "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/host.crt".]
      `);
    });

    it('throws for key without cert', async () => {
      await expect(
        getHttpsConfig({
          https: true,
          sslKey: getFixture('host.key'),
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [Error: HTTPS support require proving a certificate and key at the same time.
        You only provided a key (with CLI arg --ssl-key) at path "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/host.key".]
      `);
    });

    it('throws when cert and key do not match', async () => {
      await expect(
        getHttpsConfig({
          https: true,
          sslCert: getFixture('host-ec.crt'),
          sslKey: getFixture('other-ec.key'),
        }),
      ).rejects.toMatchInlineSnapshot(
        `[Error: The certificate "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/host-ec.crt" and key "<PROJECT_ROOT>/packages/docusaurus/src/webpack/utils/__tests__/__fixtures__/getHttpsConfig/other-ec.key" do not match.]`,
      );
    });
  });

  describe('mixed', () => {
    it('cLI options take precedence over env vars', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'false');
      vi.stubEnv('DOCUSAURUS_SSL_CRT_FILE', getFixture('nonexistent.crt'));
      vi.stubEnv('DOCUSAURUS_SSL_KEY_FILE', getFixture('invalid.key'));
      // CLI override should succeed despite the broken env-var key pair.
      await expect(
        getHttpsConfig({
          https: true,
          sslCert: getFixture('host-ec.crt'),
          sslKey: getFixture('host-ec.key'),
        }),
      ).resolves.toEqual(configMatcher);
    });

    it('ignores unprefixed env vars', async () => {
      vi.stubEnv('HTTPS', 'true');
      vi.stubEnv('SSL_CRT_FILE', getFixture('host-ec.crt'));
      vi.stubEnv('SSL_KEY_FILE', getFixture('host-ec.key'));
      await expect(getHttpsConfig()).resolves.toBe(false);
    });

    it('supports mixing env vars and CLI options', async () => {
      vi.stubEnv('DOCUSAURUS_HTTPS', 'true');
      vi.stubEnv('DOCUSAURUS_SSL_CRT_FILE', getFixture('host-ec.crt'));
      await expect(
        getHttpsConfig({
          sslKey: getFixture('host-ec.key'),
        }),
      ).resolves.toEqual(configMatcher);
    });
  });
});
