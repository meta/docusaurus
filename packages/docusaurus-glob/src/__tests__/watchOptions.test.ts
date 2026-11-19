/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {describeWatchModes, posixPath} from './watchTestUtils';
import type {WatchOptions} from '../watchUtils';

describe('watch() options', () => {
  describeWatchModes((createWatcher) => {
    it('emits absolute paths without cwd option', async () => {
      await using w = await createWatcher({
        files: ['docs/a.md'],
        paths: ({siteDir}) => path.join(siteDir, 'docs/**/*.md'),
        options: () => ({cwd: undefined}),
      });
      await w
        .change('docs/a.md')
        .emits([`change ${posixPath(path.join(w.siteDir, 'docs/a.md'))}`]);
    });

    it('does not emit events for existing files', async () => {
      await using w = await createWatcher({
        files: ['docs/a.md', 'docs/sub/b.mdx', 'sidebars.js'],
        paths: ['docs/**/*.{md,mdx}', 'sidebars.js', 'docs'],
        // ignoreInitial: true is hardcoded, even if the lib option is passed
        options: () => ({ignoreInitial: false}) as WatchOptions,
      });
      expect(w.initialEvents).toEqual([]);
    });
  });
});
