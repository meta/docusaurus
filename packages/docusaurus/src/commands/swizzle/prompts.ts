/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from '@docusaurus/logger';
import prompts, {type Choice} from 'prompts';
import {actionStatusSuffix, PartiallySafeHint} from './common';
import type {ThemeComponents} from './components';
import type {SwizzleAction, SwizzleComponentConfig} from '@docusaurus/types';

const ExitTitle = logger.yellow('[Exit]');

export async function askThemeName(themeNames: string[]): Promise<string> {
  const {themeName} = (await prompts({
    type: 'select',
    name: 'themeName',
    message: 'Select a theme to swizzle:',
    choices: themeNames
      .map((theme) => ({title: theme, value: theme}))
      .concat({title: ExitTitle, value: '[Exit]'}),
  })) as {themeName?: string};
  if (!themeName || themeName === '[Exit]') {
    process.exit(0);
  }
  return themeName;
}

export async function askComponentName(
  themeComponents: ThemeComponents,
): Promise<string> {
  function formatComponentName(componentName: string): string {
    const anySafe = themeComponents.hasAnySafeAction(componentName);
    const allSafe = themeComponents.hasAllSafeAction(componentName);
    const safestStatus = anySafe ? 'safe' : 'unsafe'; // Not 100% accurate but good enough for now.
    const partiallySafe = anySafe && !allSafe;
    return `${componentName}${actionStatusSuffix(safestStatus, {
      partiallySafe,
    })}`;
  }

  const {componentName} = (await prompts({
    type: 'autocomplete',
    name: 'componentName',
    message: `
Select or type the component to swizzle.
${PartiallySafeHint} = not safe for all swizzle actions
`,
    // This doesn't work well in small-height terminals (like IDE)
    // limit: 30,
    // This does not work well and messes up with terminal scroll position
    // limit: Number.POSITIVE_INFINITY,
    choices: themeComponents.all
      .map((compName) => ({
        title: formatComponentName(compName),
        value: compName,
      }))
      .concat({title: ExitTitle, value: '[Exit]'}),
    async suggest(input: string, choices) {
      return choices.filter((choice) =>
        choice.title.toLowerCase().includes(input.toLowerCase()),
      );
    },
  })) as {componentName?: string};
  logger.newLine();

  if (!componentName || componentName === '[Exit]') {
    return process.exit(0);
  }

  return componentName;
}

export async function askSwizzleDangerousComponent(): Promise<boolean> {
  const {switchToDanger} = (await prompts({
    type: 'select',
    name: 'switchToDanger',
    message: `Do you really want to swizzle this unsafe internal component?`,
    choices: [
      {title: logger.green('NO: cancel and stay safe'), value: false},
      {
        title: logger.red('YES: I know what I am doing!'),
        value: true,
      },
      {title: ExitTitle, value: '[Exit]'},
    ],
  })) as {switchToDanger?: boolean | '[Exit]'};

  if (typeof switchToDanger === 'undefined' || switchToDanger === '[Exit]') {
    return process.exit(0);
  }

  return !!switchToDanger;
}

export async function askSwizzleAction(
  componentConfig: SwizzleComponentConfig,
): Promise<SwizzleAction> {
  const {action} = (await prompts({
    type: 'select',
    name: 'action',
    message: `Which swizzle action do you want to do?`,
    choices: [
      {
        title: `${logger.bold('Wrap')}${actionStatusSuffix(
          componentConfig.actions.wrap,
        )}`,
        value: 'wrap',
      },
      {
        title: `${logger.bold('Eject')}${actionStatusSuffix(
          componentConfig.actions.eject,
        )}`,
        value: 'eject',
      },
      {title: ExitTitle, value: '[Exit]'},
    ],
  })) as {action?: SwizzleAction | '[Exit]'};

  if (typeof action === 'undefined' || action === '[Exit]') {
    return process.exit(0);
  }

  return action;
}

export async function askSwizzlePreferredLanguage(): Promise<
  'javascript' | 'typescript'
> {
  const choices: Choice[] = [
    {title: logger.bold('JavaScript'), value: 'javascript'},
    {title: logger.bold('TypeScript'), value: 'typescript'},
    {title: logger.yellow('[Exit]'), value: '[Exit]'},
  ];

  const {language} = await prompts(
    {
      type: 'select',
      name: 'language',
      message: 'Which language do you want to use?',
      choices,
    },
    {
      onCancel() {
        process.exit(0);
      },
    },
  );

  if (typeof language === 'undefined' || language === '[Exit]') {
    process.exit(0);
  }

  return language;
}
