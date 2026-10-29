/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import {DEFAULT_PARSE_FRONT_MATTER} from '@docusaurus/utils';
import {mdxLoader} from '../loader';
import type {CrossCompilerCache, Options} from '../options';
import type {SimpleProcessor} from '../processor';
import type {WebpackCompilerName} from '@docusaurus/utils';
import type {LoaderContext} from 'webpack';

describe('mdxLoader', () => {
  it('compiles MDX only once for client/server with cloned loader options', async () => {
    const processor = createFakeProcessor();
    const options = createOptions({processor});

    const [clientResult, serverResult] = await Promise.all([
      runLoader({compilerName: 'client', options: cloneOptions(options)}),
      runLoader({compilerName: 'server', options: cloneOptions(options)}),
    ]);

    expect(processor.process).toHaveBeenCalledTimes(1);
    expect(serverResult).toEqual(clientResult);
  });
});

function createFakeProcessor(): SimpleProcessor {
  return {
    process: vi.fn(async () => ({content: 'export default "MDX";', data: {}})),
  };
}

function createOptions({processor}: {processor: SimpleProcessor}): Options {
  const crossCompilerCache: CrossCompilerCache = new Map();
  return {
    siteDir: __dirname,
    staticDirs: [],
    markdownConfig: {
      format: 'mdx',
      parseFrontMatter: DEFAULT_PARSE_FRONT_MATTER,
      mermaid: false,
      emoji: true,
      mdx1Compat: {comments: true, admonitions: true, headingIds: true},
      anchors: {maintainCase: false},
      remarkRehypeOptions: undefined,
      hooks: {
        onBrokenMarkdownLinks: 'throw',
        onBrokenMarkdownImages: 'throw',
        onUnusedMarkdownDirectives: 'throw',
      },
    },
    processors: {mdProcessor: processor, mdxProcessor: processor},
    getCrossCompilerCache: () => crossCompilerCache,
  };
}

// Emulates tools that deep-clone the loader options, such as Rsdoctor v1:
// objects (including Maps) become plain objects, functions are kept as is
function cloneOptions<T>(value: T): T {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(cloneOptions) as T;
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, cloneOptions(item)]),
  ) as T;
}

function runLoader({
  compilerName,
  options,
}: {
  compilerName: WebpackCompilerName;
  options: Options;
}): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const loaderContext = {
      _compiler: {name: compilerName},
      resource: '/site/docs/doc.mdx',
      resourcePath: '/site/docs/doc.mdx',
      getOptions: () => options,
      addDependency: () => {},
      async:
        () => (error: Error | null | undefined, result?: string | Buffer) =>
          error ? reject(error) : resolve(result?.toString()),
    } as unknown as LoaderContext<Options>;

    mdxLoader.call(loaderContext, '# Title');
  });
}
