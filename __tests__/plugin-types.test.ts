/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

describe('plugin types', () => {
  it('supports devServer without a consumer importing webpack-dev-server', () => {
    const fixture = fileURLToPath(
      new URL('./__fixtures__/configureWebpack/index.ts', import.meta.url),
    );
    // Compile separately: other tests import webpack-dev-server, which augments
    // webpack Configuration and would hide missing imports in our public types.
    const program = ts.createProgram([fixture], {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      esModuleInterop: true,
    });
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      );
    expect(diagnostics).toEqual([]);
  });
});
