/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type Env = 'production' | 'development';

/**
 * To easily work on draft/unlisted in dev mode, use this env variable!
 * SIMULATE_PRODUCTION_VISIBILITY=true pnpm start:website
 */
const simulateProductionVisibility =
  process.env.SIMULATE_PRODUCTION_VISIBILITY === 'true';

/**
 * draft/unlisted is a production-only concept
 * In dev it is ignored and all content files are included
 */
function isProduction(env: Env | undefined): boolean {
  return (
    simulateProductionVisibility ||
    (env ?? process.env.NODE_ENV) === 'production'
  );
}

/**
 * A draft content will not be included in the production build
 */
export function isDraft({
  frontMatter,
  env,
}: {
  frontMatter: {draft?: boolean};
  env?: Env;
}): boolean {
  return (isProduction(env) && frontMatter.draft) ?? false;
}

/**
 * An unlisted content will be included in the production build, but hidden.
 * It is excluded from sitemap, has noIndex, does not appear in lists etc...
 * Only users having the link can find it.
 */
export function isUnlisted({
  frontMatter,
  env,
}: {
  frontMatter: {unlisted?: boolean};
  env?: Env;
}): boolean {
  return (isProduction(env) && frontMatter.unlisted) ?? false;
}
