/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from '@docusaurus/logger';
import {askSelect, askSearch} from '@docusaurus/prompts';
import {actionStatusSuffix, PartiallySafeHint} from './common';
import type {ThemeComponents} from './components';
import type {SwizzleAction, SwizzleComponentConfig} from '@docusaurus/types';

const ExitTitle = logger.yellow('[Exit]');
const ExitChoice = '[Exit]';

export async function askThemeName(themeNames: string[]): Promise<string> {
  const themeName = await askSelect<string>({
    message: 'Select a theme to swizzle:',
    choices: themeNames
      .map((theme) => ({name: theme, value: theme}))
      .concat({name: ExitTitle, value: ExitChoice}),
    answerHint: 'the [theme] argument',
  });
  if (themeName === ExitChoice) {
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

  const componentName = await askSearch<string>({
    message: `
Select or type the component to swizzle.
${PartiallySafeHint} = not safe for all swizzle actions
`,
    choices: themeComponents.all
      .map((compName) => ({
        name: formatComponentName(compName),
        value: compName,
      }))
      .concat({name: ExitTitle, value: ExitChoice}),
    answerHint: 'the [theme] [component] arguments',
  });
  logger.newLine();

  if (componentName === ExitChoice) {
    return process.exit(0);
  }

  return componentName;
}

export async function askSwizzleDangerousComponent(): Promise<boolean> {
  const switchToDanger = await askSelect<boolean | typeof ExitChoice>({
    message: `Do you really want to swizzle this unsafe internal component?`,
    choices: [
      {name: logger.green('NO: cancel and stay safe'), value: false},
      {
        name: logger.red('YES: I know what I am doing!'),
        value: true,
      },
      {name: ExitTitle, value: ExitChoice},
    ],
    answerHint: 'the --danger option',
  });

  if (switchToDanger === ExitChoice) {
    return process.exit(0);
  }

  return switchToDanger;
}

export async function askSwizzleAction(
  componentConfig: SwizzleComponentConfig,
): Promise<SwizzleAction> {
  const action = await askSelect<SwizzleAction | typeof ExitChoice>({
    message: `Which swizzle action do you want to do?`,
    choices: [
      {
        name: `${logger.bold('Wrap')}${actionStatusSuffix(
          componentConfig.actions.wrap,
        )}`,
        value: 'wrap',
      },
      {
        name: `${logger.bold('Eject')}${actionStatusSuffix(
          componentConfig.actions.eject,
        )}`,
        value: 'eject',
      },
      {name: ExitTitle, value: ExitChoice},
    ],
  });

  if (action === ExitChoice) {
    return process.exit(0);
  }

  return action;
}

export async function askSwizzlePreferredLanguage(): Promise<
  'javascript' | 'typescript'
> {
  const language = await askSelect<
    'javascript' | 'typescript' | typeof ExitChoice
  >({
    message: 'Which language do you want to use?',
    choices: [
      {name: logger.bold('JavaScript'), value: 'javascript'},
      {name: logger.bold('TypeScript'), value: 'typescript'},
      {name: ExitTitle, value: ExitChoice},
    ],
    answerHint: 'the --javascript or --typescript option',
  });

  if (language === ExitChoice) {
    process.exit(0);
  }

  return language;
}
