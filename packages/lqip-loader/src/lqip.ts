/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import logger from '@docusaurus/logger';
import sharp from 'sharp';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {version} = require('../package.json') as {version: string};

const ERROR_EXT = `Error: Input file is missing or uses unsupported image format, lqip v${version}`;

const SUPPORTED_MIMES: {[ext: string]: string} = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
};

/**
 * It returns a Base64 image string with required formatting to work on the web
 * (<img src=".." /> or in CSS url('..'))
 */
const toBase64 = (extMimeType: string, data: Buffer): string =>
  `data:${extMimeType};base64,${data.toString('base64')}`;

export async function base64(file: string): Promise<string> {
  let extension = path.extname(file);
  extension = extension.split('.').pop()!;
  const mime = SUPPORTED_MIMES[extension];

  if (!mime) {
    throw new Error(ERROR_EXT);
  }

  try {
    const data = await sharp(file).resize(10).toBuffer();
    return toBase64(mime, data);
  } catch (err) {
    logger.error`Generation of base64 failed for image path=${file}.`;
    throw err;
  }
}
