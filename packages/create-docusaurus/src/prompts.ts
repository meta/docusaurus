/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import prompts from 'prompts';
import {logger} from '@docusaurus/logger';

export async function askPreferredLanguage(): Promise<
  'javascript' | 'typescript'
> {
  const {language} = await prompts({
    type: 'select',
    name: 'language',
    message: 'Which language do you want to use?',
    choices: [
      {title: logger.bold('JavaScript'), value: 'javascript'},
      {title: logger.bold('TypeScript'), value: 'typescript'},
    ],
  });
  if (!language) {
    process.exit(0);
  }
  return language;
}

export async function askForCustomGitCloneCommand(): Promise<string> {
  const {command} = (await prompts(
    {
      type: 'text',
      name: 'command',
      message:
        'Write your own git clone command. The repository URL and destination directory will be supplied. E.g. "git clone --depth 10"',
    },
    {
      onCancel() {
        logger.info`Falling back to code=${'git clone'}`;
      },
    },
  )) as {command?: string};
  return command ?? 'git clone';
}
