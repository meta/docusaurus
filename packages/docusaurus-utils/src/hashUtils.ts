/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {getHashes, hash} from 'node:crypto';
import _ from 'lodash';
import {shortName, isNameTooLong} from './pathUtils';

// FIPS mode forbids MD5, see https://github.com/meta/docusaurus/pull/13007
const hashAlgorithm = getHashes().includes('md5') ? 'md5' : 'sha256';

/** Hashes with MD5, or SHA-256 when MD5 is not available. */
export function hashString(data: string | Buffer): string {
  return hash(hashAlgorithm, data);
}

/** Creates a hash with `hashString` and truncates it to the given length. */
export function simpleHash(str: string, length: number): string {
  return hashString(str).substring(0, length);
}

// Based on https://github.com/gatsbyjs/gatsby/pull/21518/files
/**
 * Given an input string, convert to kebab-case and append a hash, avoiding name
 * collision. Also removes part of the string if its larger than the allowed
 * filename per OS, avoiding `ERRNAMETOOLONG` error.
 */
export function docuHash(
  strInput: string,
  options?: {
    // String that contributes to the hash value
    // but does not contribute to the returned string
    hashExtra?: string;
    // Length of the hash to append
    hashLength?: number;
  },
): string {
  // TODO check this historical behavior
  //  I'm not sure it makes sense to keep it...
  if (strInput === '/' && typeof options?.hashExtra === 'undefined') {
    return 'index';
  }
  const str = strInput === '/' ? 'index' : strInput;

  const hashExtra = options?.hashExtra ?? '';
  const hashLength = options?.hashLength ?? 3;

  const stringToHash = str + hashExtra;
  const shortHash = simpleHash(stringToHash, hashLength);
  const parsedPath = `${_.kebabCase(str)}-${shortHash}`;
  if (isNameTooLong(parsedPath)) {
    return `${shortName(_.kebabCase(str))}-${shortHash}`;
  }
  return parsedPath;
}
