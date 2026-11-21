/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {runPrompt, injectAnswers, resetInjectedAnswers} from './promptRunner';

export {injectAnswers, resetInjectedAnswers};

export type PromptChoice<Value> = {
  name: string;
  value: Value;
};

type PromptOptions = {
  message: string;
  // Named in the error when there is no answer (Ctrl+C, closed stdin)
  answerHint?: string;
};

export async function askSelect<Value>(
  options: PromptOptions & {choices: PromptChoice<Value>[]},
): Promise<Value> {
  return runPrompt<Value>(
    {
      type: 'select',
      name: 'answer',
      message: options.message,
      choices: options.choices.map(({name, value}) => ({title: name, value})),
    },
    options.answerHint,
  );
}

export async function askInput(
  options: PromptOptions & {
    initial?: string;
    validate?: (value: string) => boolean | string | Promise<boolean | string>;
  },
): Promise<string> {
  return runPrompt<string>(
    {
      type: 'text',
      name: 'answer',
      message: options.message,
      initial: options.initial,
      validate: options.validate,
    },
    options.answerHint,
  );
}

export async function askConfirm(
  options: PromptOptions & {initial?: boolean},
): Promise<boolean> {
  return runPrompt<boolean>(
    {
      type: 'confirm',
      name: 'answer',
      message: options.message,
      initial: options.initial,
    },
    options.answerHint,
  );
}

export async function askSearch<Value>(
  options: PromptOptions & {choices: PromptChoice<Value>[]},
): Promise<Value> {
  return runPrompt<Value>(
    {
      type: 'autocomplete',
      name: 'answer',
      message: options.message,
      choices: options.choices.map(({name, value}) => ({title: name, value})),
      // Don't set `limit`: it doesn't work well in small-height terminals
      // (like IDEs), and `Number.POSITIVE_INFINITY` messes up the terminal
      // scroll position
      async suggest(input, choices) {
        return choices.filter((choice) =>
          choice.title.toLowerCase().includes(input.toLowerCase()),
        );
      },
    },
    options.answerHint,
  );
}
