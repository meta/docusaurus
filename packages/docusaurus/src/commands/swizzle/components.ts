/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import _ from 'lodash';
import logger from '@docusaurus/logger';
import {posixPath} from '@docusaurus/utils';
import {fs, pathExists} from '@docusaurus/fs';
import {askComponentName} from './prompts';
import {findClosestValue, findStringIgnoringCase} from './common';
import {helpTables, themeComponentsTable} from './tables';
import {SwizzleActions} from './actions';
import type {
  SwizzleAction,
  SwizzleActionStatus,
  SwizzleComponentConfig,
  SwizzleConfig,
} from '@docusaurus/types';

export type ThemeComponents = {
  themeName: string;
  all: string[];
  getConfig: (component: string) => SwizzleComponentConfig;
  getDescription: (component: string) => string;
  getActionStatus: (
    component: string,
    action: SwizzleAction,
  ) => SwizzleActionStatus;
  isSafeAction: (component: string, action: SwizzleAction) => boolean;
  hasAnySafeAction: (component: string) => boolean;
  hasAllSafeAction: (component: string) => boolean;
};

const formatComponentName = (componentName: string): string =>
  componentName.replace(/[/\\]index\.[jt]sx?/, '').replace(/\.[jt]sx?/, '');

function sortComponentNames(componentNames: string[]): string[] {
  return componentNames.sort(); // Algo may change?
}

/**
 * Expand a list of components to include and return parent folders.
 * If a folder is not directly a component (no Folder/index.tsx file),
 * we still want to be able to swizzle --eject that folder.
 * See https://github.com/facebook/docusaurus/pull/7175#issuecomment-1103757218
 *
 * @param componentNames the original list of component names
 */
export function getMissingIntermediateComponentFolderNames(
  componentNames: string[],
): string[] {
  function getAllIntermediatePaths(componentName: string): string[] {
    const paths = componentName.split('/');
    return _.range(1, paths.length + 1).map((i) => paths.slice(0, i).join('/'));
  }

  const expandedComponentNames = _.uniq(
    componentNames.flatMap((componentName) =>
      getAllIntermediatePaths(componentName),
    ),
  );

  return _.difference(expandedComponentNames, componentNames);
}

const skipReadDirNames = ['__test__', '__tests__', '__mocks__', '__fixtures__'];

export async function readComponentNames(themePath: string): Promise<string[]> {
  type File = {file: string; fullPath: string; isDir: boolean};
  type ComponentFile = File & {componentName: string};

  if (!(await pathExists(themePath))) {
    return [];
  }

  async function walk(dir: string): Promise<ComponentFile[]> {
    const files: File[] = await Promise.all(
      (await fs.readdir(dir)).flatMap(async (file) => {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);
        const isDir = stat.isDirectory();
        return {file, fullPath, isDir};
      }),
    );

    return (
      await Promise.all(
        files.map(async (file) => {
          if (file.isDir) {
            if (skipReadDirNames.includes(file.file)) {
              return [];
            }
            return walk(file.fullPath);
          } else if (
            // TODO can probably be refactored
            /(?<!\.d)\.[jt]sx?$/.test(file.fullPath) &&
            !/(?<!\.d)\.(?:test|tests|story|stories)\.[jt]sx?$/.test(
              file.fullPath,
            )
          ) {
            const componentName = formatComponentName(
              posixPath(path.relative(themePath, file.fullPath)),
            );
            return [{...file, componentName}];
          }
          return [];
        }),
      )
    ).flat();
  }

  const componentFiles = await walk(themePath);

  const componentNames = componentFiles.map((f) => f.componentName);

  return sortComponentNames(componentNames);
}

function listComponentNames(themeComponents: ThemeComponents): string {
  if (themeComponents.all.length === 0) {
    return 'No component to swizzle.';
  }
  return `${themeComponentsTable(themeComponents)}

${helpTables()}
`;
}

export async function getThemeComponents({
  themeName,
  themePath,
  swizzleConfig,
}: {
  themeName: string;
  themePath: string;
  swizzleConfig: SwizzleConfig;
}): Promise<ThemeComponents> {
  const FallbackSwizzleActionStatus: SwizzleActionStatus = 'unsafe';
  const FallbackSwizzleComponentDescription = 'N/A';
  const FallbackSwizzleComponentConfig: SwizzleComponentConfig = {
    actions: {
      wrap: FallbackSwizzleActionStatus,
      eject: FallbackSwizzleActionStatus,
    },
    description: FallbackSwizzleComponentDescription,
  };
  const FallbackIntermediateFolderSwizzleComponentConfig: SwizzleComponentConfig =
    {
      actions: {
        // It doesn't make sense to wrap an intermediate folder
        // because it has not any index component
        wrap: 'forbidden',
        eject: FallbackSwizzleActionStatus,
      },
      description: FallbackSwizzleComponentDescription,
    };

  const allInitialComponents = await readComponentNames(themePath);

  const missingIntermediateComponentFolderNames =
    getMissingIntermediateComponentFolderNames(allInitialComponents);

  const allComponents = sortComponentNames(
    allInitialComponents.concat(missingIntermediateComponentFolderNames),
  );

  function getConfig(component: string): SwizzleComponentConfig {
    if (!allComponents.includes(component)) {
      throw new Error(
        `Can't get component config: component doesn't exist: ${component}`,
      );
    }
    const config = swizzleConfig.components[component];
    if (config) {
      return config;
    }
    const isIntermediateFolder =
      missingIntermediateComponentFolderNames.includes(component);
    if (isIntermediateFolder) {
      return FallbackIntermediateFolderSwizzleComponentConfig;
    }
    return (
      swizzleConfig.components[component] ?? FallbackSwizzleComponentConfig
    );
  }

  function getDescription(component: string): string {
    return (
      getConfig(component).description ?? FallbackSwizzleComponentDescription
    );
  }

  function getActionStatus(
    component: string,
    action: SwizzleAction,
  ): SwizzleActionStatus {
    return getConfig(component).actions[action] ?? FallbackSwizzleActionStatus;
  }

  function isSafeAction(component: string, action: SwizzleAction): boolean {
    return getActionStatus(component, action) === 'safe';
  }

  function hasAllSafeAction(component: string): boolean {
    return SwizzleActions.every((action) => isSafeAction(component, action));
  }

  function hasAnySafeAction(component: string): boolean {
    return SwizzleActions.some((action) => isSafeAction(component, action));
  }

  // Present the safest components first
  const orderedComponents = _.orderBy(
    allComponents,
    [
      hasAllSafeAction,
      (component) => isSafeAction(component, 'wrap'),
      (component) => isSafeAction(component, 'eject'),
      (component) => component,
    ],
    ['desc', 'desc', 'desc', 'asc'],
  );

  return {
    themeName,
    all: orderedComponents,
    getConfig,
    getDescription,
    getActionStatus,
    isSafeAction,
    hasAnySafeAction,
    hasAllSafeAction,
  };
}

// Returns a valid value if recovering is possible
function handleInvalidComponentNameParam({
  componentNameParam,
  themeComponents,
}: {
  componentNameParam: string;
  themeComponents: ThemeComponents;
}): string {
  // Trying to recover invalid value
  // We look for potential matches that only differ in casing.
  const differentCaseMatch = findStringIgnoringCase(
    componentNameParam,
    themeComponents.all,
  );
  if (differentCaseMatch) {
    logger.warn`Component name=${componentNameParam} doesn't exist.`;
    logger.info`name=${differentCaseMatch} will be used instead of name=${componentNameParam}.`;
    return differentCaseMatch;
  }

  // No recovery value is possible: print error
  logger.error`Component name=${componentNameParam} not found.`;
  const suggestion = findClosestValue(componentNameParam, themeComponents.all);
  if (suggestion) {
    logger.info`Did you mean name=${suggestion}? ${
      !themeComponents.hasAnySafeAction(suggestion)
        ? `Note: this component is an unsafe internal component and can only be swizzled with ${logger.code('--danger')} or explicit confirmation.`
        : ''
    }`;
  } else {
    logger.info(listComponentNames(themeComponents));
  }
  return process.exit(1);
}

async function handleComponentNameParam({
  componentNameParam,
  themeComponents,
}: {
  componentNameParam: string;
  themeComponents: ThemeComponents;
}): Promise<string> {
  const isValidName = themeComponents.all.includes(componentNameParam);
  if (!isValidName) {
    return handleInvalidComponentNameParam({
      componentNameParam,
      themeComponents,
    });
  }
  return componentNameParam;
}

export async function getComponentName({
  componentNameParam,
  themeComponents,
  list,
}: {
  componentNameParam: string | undefined;
  themeComponents: ThemeComponents;
  list: boolean | undefined;
}): Promise<string> {
  if (list) {
    logger.info(listComponentNames(themeComponents));
    return process.exit(0);
  }
  const componentName: string = componentNameParam
    ? await handleComponentNameParam({
        componentNameParam,
        themeComponents,
      })
    : await askComponentName(themeComponents);

  return componentName;
}
