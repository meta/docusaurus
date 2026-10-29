/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createProcessors} from './processor';
import type {CrossCompilerCache, Options} from './options';
import type {RuleSetRule, RuleSetUseItem} from 'webpack';

// Escape hatch to disable the MDX cross-compiler cache, just in case
// TODO Docusaurus v5: remove this escape hatch env variable
const DisableCrossCompilerCache =
  process.env.DOCUSAURUS_NO_MDX_CROSS_COMPILER_CACHE === 'true';

function normalizeOptions(optionsInput: Options): Options {
  // Skip eager processor creation in tests
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return optionsInput;
  }

  let options = optionsInput;

  // We create the processor earlier here, to avoid the lazy processor creating
  // Lazy creation messes-up with Rsdoctor ability to measure mdx-loader perf
  if (!options.processors) {
    options = {...options, processors: createProcessors({options})};
  }

  // Cross-compiler cache permits to compile client/server MDX only once
  // We don't want to cache in dev mode (docusaurus start)
  // We only have multiple compilers in production mode (docusaurus build)
  // TODO wrong but good enough for now (example: "docusaurus build --dev")
  if (!DisableCrossCompilerCache && process.env.NODE_ENV === 'production') {
    const crossCompilerCache: CrossCompilerCache = new Map();
    options = {
      ...options,
      getCrossCompilerCache: () => crossCompilerCache,
    };
  }

  return options;
}

export function createMDXLoaderItem(options: Options): RuleSetUseItem {
  return {
    loader: require.resolve('./index'),
    options: normalizeOptions(options),
  };
}

export function createMDXLoaderRule({
  include,
  options,
}: {
  include: RuleSetRule['include'];
  options: Options;
}): RuleSetRule {
  return {
    test: /\.mdx?$/i,
    include,
    with: {type: {not: 'text'}},
    use: [createMDXLoaderItem(options)],
  };
}
