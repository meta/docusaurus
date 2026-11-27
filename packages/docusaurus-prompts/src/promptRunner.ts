/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import prompts, {type PromptObject} from 'prompts';
import {logger} from '@docusaurus/logger';

export type PromptQuestion = PromptObject & {
  message: string;
  name: string;
};

/**
 * Why a prompt couldn't be answered: the user cancelled it (Ctrl+C), or stdin
 * is closed (like in CI) and no answer can ever come.
 */
type NoAnswerReason = 'cancelled' | 'stdin is closed';

class NoAnswerError extends Error {
  reason: NoAnswerReason;

  constructor(reason: NoAnswerReason) {
    super(reason);
    this.reason = reason;
  }
}

// Injected answers let tests answer prompts without depending on the
// underlying prompts library. An injected `Error` simulates a cancellation.
let injectedAnswers: unknown[] | undefined;

export function injectAnswers(answers: unknown[]): void {
  injectedAnswers = [...answers];
}

export function resetInjectedAnswers(): void {
  injectedAnswers = undefined;
}

/**
 * Run one prompt and return its answer. Exits with code 1 when there is no
 * answer (Ctrl+C, closed stdin): the CLI can't continue without it.
 */
export async function runPrompt<Answer>(
  question: PromptQuestion,
  answerHint?: string,
): Promise<Answer> {
  if (injectedAnswers) {
    return shiftInjectedAnswer(question, answerHint) as Answer;
  }
  return runLibraryPrompt<Answer>(question, answerHint);
}

function shiftInjectedAnswer(
  question: PromptQuestion,
  answerHint: string | undefined,
): unknown {
  if (injectedAnswers!.length === 0) {
    throw new Error(
      `No more injected answers for the prompt "${question.message}".`,
    );
  }
  const answer = injectedAnswers!.shift()!;
  if (!(answer instanceof Error)) {
    return answer;
  }
  // An injected `Error` simulates a cancellation (Ctrl+C)
  exitOnNoAnswer(question.message, answerHint, 'cancelled');
}

async function runLibraryPrompt<Answer>(
  question: PromptQuestion,
  answerHint: string | undefined,
): Promise<Answer> {
  const noAnswer = Promise.withResolvers<never>();
  // The event loop drains when stdin is closed before the prompt is answered,
  // and the prompt never settles
  // See https://github.com/terkelg/prompts/issues/316
  const onBeforeExit = () =>
    noAnswer.reject(new NoAnswerError('stdin is closed'));

  process.once('beforeExit', onBeforeExit);
  try {
    const answers = (await Promise.race([
      prompts(question),
      noAnswer.promise,
    ])) as Record<string, Answer | undefined>;
    const answer = answers[question.name];
    if (answer === undefined) {
      exitOnNoAnswer(question.message, answerHint, 'cancelled');
    }
    return answer;
  } catch (err) {
    if (!(err instanceof NoAnswerError)) {
      throw err;
    }
    exitOnNoAnswer(question.message, answerHint, err.reason);
  } finally {
    process.off('beforeExit', onBeforeExit);
  }
}

function exitOnNoAnswer(
  message: string,
  answerHint: string | undefined,
  reason: NoAnswerReason,
): never {
  const hint = answerHint ? ` Answer it with ${answerHint}.` : '';
  logger.error(`Can't answer the prompt "${message}": ${reason}.${hint}`);
  process.exit(1);
}
