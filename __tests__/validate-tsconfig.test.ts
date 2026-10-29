/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, it} from 'vitest';
import {glob} from '@docusaurus/glob';
import {Joi} from '@docusaurus/utils-validation';
import {readJSON} from '@docusaurus/fs';

type TsconfigFile = {
  file: string;
  content: {
    extends?: string;
    compilerOptions: {
      [key: string]: unknown;
    };
  };
};

async function getTsconfigFiles(): Promise<TsconfigFile[]> {
  const files = await glob('packages/*/tsconfig.*');
  return Promise.all(
    files.map((file) =>
      readJSON(file).then((content) => ({
        file,
        content: content as TsconfigFile['content'],
      })),
    ),
  );
}

const tsconfigSchema = Joi.object({
  extends: Joi.valid(
    '../../tsconfig.base.json',
    '../../tsconfig.base.client.json',
  ),
}).unknown();

describe('tsconfig files', () => {
  it('contain all required fields', async () => {
    const tsconfigFiles = await getTsconfigFiles();

    tsconfigFiles
      // Ignore noEmit configs
      .forEach((file) => {
        try {
          Joi.attempt(file.content, tsconfigSchema);
        } catch (e) {
          (e as Error).message +=
            `\n${file.file} does not match the required schema.`;
          throw e;
        }
      });
  });
});
