/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from '@docusaurus/logger';
import {createJiti} from 'jiti';

const DEBUG = false;

const jiti = createJiti(__filename, {
  // Transpilation cache, can be safely enabled
  fsCache: true,
  // Bypass Node.js runtime require cache for hot reloads
  moduleCache: false,

  interopDefault: true,
  debug: DEBUG,
});

/*
jiti is able to load ESM, CJS, JSON, TS modules
 */
export async function loadFreshModule(
  modulePath: string,
  options?: {
    default?: true; // Use this when only the default export matters
  },
): Promise<unknown> {
  if (typeof modulePath !== 'string') {
    throw new Error(
      logger.interpolate`Invalid module path of type "name=${typeof modulePath}" with value "name=${modulePath}"`,
    );
  }
  try {
    const module = await jiti.import(modulePath, {
      default: options?.default,
    });

    if (DEBUG) {
      console.log('Jiti module loaded', {
        modulePath,
        options,
        type: typeof module,
        keys:
          module && typeof module === 'object'
            ? Object.keys(module)
            : undefined,
        module,
      });
    }

    return module;
  } catch (error) {
    throw new Error(
      logger.interpolate`Docusaurus could not load module at path path=${modulePath}`,
      {cause: error},
    );
  }
}
