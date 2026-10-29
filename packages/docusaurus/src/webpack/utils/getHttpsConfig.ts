/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import crypto from 'node:crypto';
import logger from '@docusaurus/logger';
import {fs, pathExists, realpath} from '@docusaurus/fs';

// Ensure the certificate and key provided are valid and if not
// throw an easy to debug error.
//
// Works for any key type (RSA, ECDSA, EdDSA, ...) — parses both PEMs and
// checks that the public key embedded in the cert matches the public key
// derived from the private key.
function validateKeyAndCerts({cert, key}: {cert: CryptoFile; key: CryptoFile}) {
  let certPublicKey: crypto.KeyObject;
  try {
    certPublicKey = new crypto.X509Certificate(cert.content).publicKey;
  } catch (error) {
    throw new Error(
      logger.interpolate`The certificate path=${cert.path} is invalid.`,
      {cause: error},
    );
  }

  let keyPublicKey: crypto.KeyObject;
  try {
    keyPublicKey = crypto.createPublicKey(crypto.createPrivateKey(key.content));
  } catch (error) {
    throw new Error(
      logger.interpolate`The certificate key path=${key.path} is invalid.`,
      {cause: error},
    );
  }

  if (!certPublicKey.equals(keyPublicKey)) {
    throw new Error(
      logger.interpolate`The certificate path=${cert.path} and key path=${key.path} do not match.`,
    );
  }
}

type HttpsConfigOptions = {
  https: boolean;
  sslCert: string;
  sslKey: string;
};

function getExplicitHttps(
  options: Partial<HttpsConfigOptions>,
): boolean | undefined {
  return (
    options.https ??
    (typeof process.env.DOCUSAURUS_HTTPS !== 'undefined'
      ? process.env.DOCUSAURUS_HTTPS == 'true'
      : undefined)
  );
}

type CryptoFile = {
  path: string;
  content: Buffer;
  source: string;
};

async function readCryptoFile(
  filepath: string,
  source: string,
): Promise<CryptoFile> {
  if (!(await pathExists(filepath))) {
    throw new Error(
      logger.interpolate`You specified ${source}, but file at path path=${filepath} can't be found.`,
    );
  }
  try {
    return {
      path: filepath,
      source,
      content: await fs.readFile(filepath),
    };
  } catch (error) {
    throw new Error(
      logger.interpolate`You specified ${source}, but file at path path=${filepath} can't be read.`,
      {cause: error},
    );
  }
}

function getCert(
  options: Partial<HttpsConfigOptions>,
  cwd: string,
): Promise<CryptoFile> | null {
  if (options.sslCert) {
    return readCryptoFile(
      path.resolve(cwd, options.sslCert),
      'CLI arg --ssl-cert',
    );
  }
  if (process.env.DOCUSAURUS_SSL_CRT_FILE) {
    return readCryptoFile(
      path.resolve(cwd, process.env.DOCUSAURUS_SSL_CRT_FILE),
      'env DOCUSAURUS_SSL_CRT_FILE',
    );
  }
  return null;
}

function getKeyFile(
  options: Partial<HttpsConfigOptions>,
  cwd: string,
): Promise<CryptoFile> | null {
  if (options.sslKey) {
    return readCryptoFile(
      path.resolve(cwd, options.sslKey),
      'CLI arg --ssl-key',
    );
  }
  if (process.env.DOCUSAURUS_SSL_KEY_FILE) {
    return readCryptoFile(
      path.resolve(cwd, process.env.DOCUSAURUS_SSL_KEY_FILE),
      'env DOCUSAURUS_SSL_KEY_FILE',
    );
  }
  return null;
}

function ensureCertKeyBothProvided(
  cert: CryptoFile | null,
  key: CryptoFile | null,
) {
  if ((cert || key) && !(cert && key)) {
    const fileProvided = (cert ?? key)!;
    throw new Error(
      logger.interpolate`HTTPS support require proving a certificate and key at the same time.
You only provided a ${cert ? 'certificate' : 'key'} (with ${fileProvided.source}) at path path=${fileProvided.path}.`,
    );
  }
}

export type HttpsConfig = boolean | {cert: Buffer; key: Buffer};

// Get the https config
// Return cert files if provided via CLI or env, otherwise just true or false.
// CLI options take precedence over env vars.
export default async function getHttpsConfig(
  options: Partial<HttpsConfigOptions> = {},
): Promise<HttpsConfig> {
  const cwd = await realpath(process.cwd());

  const [cert, key] = await Promise.all([
    getCert(options, cwd),
    getKeyFile(options, cwd),
  ]);

  // Providing both cert/key implies HTTPS
  const inferredHttps = !!(cert && key);
  const https = getExplicitHttps(options) ?? inferredHttps;

  if (https && cert && key) {
    validateKeyAndCerts({
      cert,
      key,
    });
    return {
      cert: cert.content,
      key: key.content,
    };
  }

  ensureCertKeyBothProvided(cert, key);

  // Apparently we can have https without cert/key (historical)
  // although I don't know how this works 🤷‍♂️
  return https;
}
