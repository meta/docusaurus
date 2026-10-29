/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import logger from '@docusaurus/logger';
import type {SSGError, SSGResult, SSGSuccess} from './ssgRenderer';
import type {SiteCollectedData} from '../common';

// Consolidated successful SSG result of rendering all pathnames of a site
export type SSGGlobalResult = {
  collectedData: SiteCollectedData;
  // Don't include heavy un-needed data here
  // We want to release heap memory as soon as we can
};

function printSSGWarnings(results: SSGSuccess[]): void {
  // Escape hatch because SWC is quite aggressive to report errors
  // See https://github.com/facebook/docusaurus/pull/10554
  // See https://github.com/swc-project/swc/discussions/9616#discussioncomment-10846201
  if (process.env.DOCUSAURUS_IGNORE_SSG_WARNINGS === 'true') {
    return;
  }

  const resultsWithWarnings = results
    .map((success) => {
      return {
        ...success,
        warnings: success.result.warnings,
      };
    })
    .filter((result) => result.warnings.length > 0);

  if (resultsWithWarnings.length) {
    const message = `Docusaurus static site generation process emitted warnings for ${
      resultsWithWarnings.length
    } path${resultsWithWarnings.length ? 's' : ''}
This is non-critical and can be disabled with DOCUSAURUS_IGNORE_SSG_WARNINGS=true
Troubleshooting guide: https://github.com/facebook/docusaurus/discussions/10580

- ${resultsWithWarnings
      .map(
        (result) => `${logger.path(result.pathname)}:
  - ${result.warnings.join('\n  - ')}
`,
      )
      .join('\n- ')}`;

    logger.warn(message);
  }
}

function throwSSGError(ssgErrors: SSGError[]): never {
  const message = `Docusaurus static site generation failed for ${
    ssgErrors.length
  } path${ssgErrors.length ? 's' : ''}:\n- ${ssgErrors
    .map((ssgError) => logger.path(ssgError.pathname))
    .join('\n- ')}`;

  // Note logging this error properly require using inspect(error,{depth})
  // See https://github.com/nodejs/node/issues/51637
  throw new Error(message, {
    cause: new AggregateError(ssgErrors.map((ssgError) => ssgError.error)),
  });
}

export async function createGlobalSSGResult(
  ssgResults: SSGResult[],
): Promise<SSGGlobalResult> {
  const [ssgSuccesses, ssgErrors] = _.partition(
    ssgResults,
    (result) => result.success,
  );

  // For now, only success results emit warnings
  // For errors, we throw without warnings
  printSSGWarnings(ssgSuccesses);

  if (ssgErrors.length > 0) {
    throwSSGError(ssgErrors);
  }

  // If we only have SSG successes, we can consolidate those in a single result
  const collectedData: SiteCollectedData = _.chain(ssgSuccesses)
    .keyBy((success) => success.pathname)
    .mapValues((ssgSuccess) => ssgSuccess.result.collectedData)
    .value();

  return {collectedData};
}
