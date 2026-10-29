/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import inspector from 'node:inspector';
import {fs} from '@docusaurus/fs';
import type {Compiler} from 'webpack';

// Bundle CPU profiling plugin, contributed by the Rspack team
// Can be opened in https://www.speedscope.app/
// See also https://github.com/jerrykingxyz/docusaurus/pull/1
// See also https://github.com/facebook/docusaurus/pull/10985
export class BundlerCPUProfilerPlugin {
  output: string;

  constructor(output?: string) {
    this.output = output ?? './bundler-cpu-profile.json';
  }

  apply(compiler: Compiler): void {
    const session = new inspector.Session();
    session.connect();
    session.post('Profiler.enable');
    session.post('Profiler.start');

    // In dev/watch mode, we restart the profiler before each compilation
    compiler.hooks.watchRun.tapPromise(
      BundlerCPUProfilerPlugin.name,
      async () => {
        session.post('Profiler.start');
      },
    );

    compiler.hooks.done.tapPromise(BundlerCPUProfilerPlugin.name, async () => {
      session.post('Profiler.stop', (error, param) => {
        if (error) {
          console.error('Failed to generate JS CPU profile:', error);
          return;
        }
        fs.writeFile(this.output, JSON.stringify(param.profile)).catch(
          console.error,
        );
      });
    });
  }
}
