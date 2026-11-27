/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {logger} from '@docusaurus/logger';
import {askInput, askSelect} from '@docusaurus/prompts';

export async function askPreferredLanguage(): Promise<
  'javascript' | 'typescript'
> {
  return askSelect<'javascript' | 'typescript'>({
    message: 'Which language do you want to use?',
    choices: [
      {name: logger.bold('JavaScript'), value: 'javascript'},
      {name: logger.bold('TypeScript'), value: 'typescript'},
    ],
    answerHint: 'the --javascript or --typescript option',
  });
}

export async function askForCustomGitCloneCommand(): Promise<string> {
  const command = await askInput({
    message:
      'Write your own git clone command. The repository URL and destination directory will be supplied. E.g. "git clone --depth 10"',
    answerHint: 'a --git-strategy option other than custom',
  });
  return command || 'git clone';
}
