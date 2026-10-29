/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {logger} from '@docusaurus/logger';

import classicTheme from '@docusaurus/theme-classic';

// Unsafe imports
import {
  readComponentNames,
  getMissingIntermediateComponentFolderNames,
} from '@docusaurus/core/lib/commands/swizzle/components.js';
import {normalizeSwizzleConfig} from '@docusaurus/core/lib/commands/swizzle/config.js';
import {wrap, eject} from '@docusaurus/core/lib/commands/swizzle/actions.js';

const swizzleConfig = normalizeSwizzleConfig(classicTheme.getSwizzleConfig());

/** @type {"eject" | "wrap"} */
const action = process.env.SWIZZLE_ACTION ?? 'eject';
const typescript = process.env.SWIZZLE_TYPESCRIPT === 'true';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const classicThemePathBase = path.join(
  dirname,
  '../../packages/docusaurus-theme-classic',
);

const themePath = typescript
  ? path.join(classicThemePathBase, 'src/theme')
  : path.join(classicThemePathBase, 'lib/theme');

const toPath = path.join(dirname, '_swizzle_theme_tests');

console.log('\n');
console.log('Swizzle test script');
console.log('Args', {
  action,
  typescript,
  dirname,
  themePath,
  toPath,
  swizzleConfig,
});
console.log('\n');

await fs.rm(toPath, {recursive: true, force: true});

function filterComponentNames(componentNames) {
  // TODO temp workaround: non-comps should be forbidden to wrap
  if (action === 'wrap') {
    const WrapBlocklist = [
      'Layout', // Due to theme-fallback?
    ];

    return componentNames.filter((componentName) => {
      const blocked = WrapBlocklist.includes(componentName);
      if (blocked) {
        logger.warn(`${componentName} is blocked and will not be wrapped`);
      }
      return !blocked;
    });
  }
  return componentNames;
}

async function getAllComponentNames() {
  const names = await readComponentNames(themePath);
  const allNames = names.concat(
    await getMissingIntermediateComponentFolderNames(names),
  );
  return filterComponentNames(allNames);
}

const componentNames = await getAllComponentNames();
console.log('componentNames', componentNames);

const componentsNotFound = Object.keys(swizzleConfig.components).filter(
  (componentName) => !componentNames.includes(componentName),
);
if (componentsNotFound.length > 0) {
  logger.error(
    `${
      componentsNotFound.length
    } components exist in the swizzle config but do not exist in practice.
Please double-check or clean up these components from the config:
- ${componentsNotFound.join('\n- ')}
`,
  );
  process.exit(1);
}

/**
 * @param {string} componentName
 */
function getActionStatus(componentName) {
  const actionStatus =
    swizzleConfig.components[componentName]?.actions[action] ?? 'unsafe';
  return actionStatus;
}

for (const componentName of componentNames) {
  const executeAction = () => {
    const baseParams = {
      action,
      siteDir: toPath,
      themePath,
      componentName,
      typescript,
    };
    switch (action) {
      case 'wrap':
        return wrap({
          ...baseParams,
          importType: 'init', // For these tests, "theme-original" imports are causing an expected infinite loop
        });
      case 'eject':
        return eject(baseParams);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  };

  const actionStatus = getActionStatus(componentName);

  if (actionStatus === 'forbidden') {
    logger.warn(
      `${componentName} is marked as forbidden for action ${action} => skipping`,
    );
    continue;
  }

  const result = await executeAction();

  const safetyLog =
    actionStatus === 'unsafe' ? logger.red('unsafe') : logger.green('safe');

  console.log(
    `${componentName} ${action} (${safetyLog}) => ${
      result.createdFiles.length
    } file${result.createdFiles.length > 1 ? 's' : ''} written`,
  );
}

logger.success(`
End of the Swizzle test script.
Now try to build the site and see if it works!
`);

const componentsWithMissingConfigs = componentNames.filter(
  (componentName) => !swizzleConfig.components[componentName],
);

// TODO require theme exhaustive config, fail fast?
// (at least for our classic theme?)
// TODO provide util so that theme authors can also check exhaustiveness?
if (componentsWithMissingConfigs.length > 0) {
  logger.warn(
    `${componentsWithMissingConfigs.length} components have no swizzle config.
Sample: ${componentsWithMissingConfigs.slice(0, 5).join(', ')} ...
`,
  );
}
