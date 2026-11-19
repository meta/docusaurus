/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import prompts, {type Answers, type PromptObject} from 'prompts';
import {logger} from '@docusaurus/logger';

/**
 * Same as `prompts()`, but throws when no answer can come, like when stdin is
 * closed in CI. Otherwise, the CLI exits with code 0 without creating the site.
 */
export async function prompt<T extends string>(
  question: PromptObject<T> & {message: string},
  {onCancel, answerHint}: {onCancel: () => void; answerHint: string},
): Promise<Answers<T>> {
  const noAnswer = Promise.withResolvers<never>();
  // The event loop drains when stdin is closed before the prompt is answered
  // See https://github.com/terkelg/prompts/issues/316
  const onBeforeExit = () =>
    noAnswer.reject(
      new Error(
        `Can't answer the prompt "${question.message}": stdin is closed. Answer it with ${answerHint}.`,
      ),
    );

  process.once('beforeExit', onBeforeExit);
  try {
    return await Promise.race([
      prompts(question, {onCancel}),
      noAnswer.promise,
    ]);
  } finally {
    process.off('beforeExit', onBeforeExit);
  }
}

export async function askPreferredLanguage(): Promise<
  'javascript' | 'typescript'
> {
  const {language} = await prompt(
    {
      type: 'select',
      name: 'language',
      message: 'Which language do you want to use?',
      choices: [
        {title: logger.bold('JavaScript'), value: 'javascript'},
        {title: logger.bold('TypeScript'), value: 'typescript'},
      ],
    },
    {
      onCancel() {
        logger.error('A language is required.');
        process.exit(1);
      },
      answerHint: 'the --javascript or --typescript option',
    },
  );
  return language;
}

export async function askForCustomGitCloneCommand(): Promise<string> {
  const {command} = (await prompt(
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
      answerHint: 'a --git-strategy option other than custom',
    },
  )) as {command?: string};
  return command ?? 'git clone';
}
