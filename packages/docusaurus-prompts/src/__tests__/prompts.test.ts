/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {PassThrough} from 'node:stream';
import prompts from 'prompts';
import {
  askConfirm,
  askInput,
  askSelect,
  askSearch,
  injectAnswers,
} from '../index';
import {
  resetInjectedAnswers,
  runPrompt,
  type PromptQuestion,
} from '../promptRunner';

const mockExit = () =>
  vi.spyOn(process, 'exit').mockImplementation((() => {}) as () => never);
const mockConsoleError = () =>
  vi.spyOn(console, 'error').mockImplementation(() => {});

// The prompts library needs a stdin/stdout to attach to, even when answers
// are injected or stdin is closed on purpose.
function createQuestion(): PromptQuestion & {
  stdin: PassThrough;
  stdout: PassThrough;
} {
  return {
    type: 'text',
    name: 'answer',
    message: 'What should we name this site?',
    stdin: new PassThrough(),
    stdout: new PassThrough(),
  };
}

describe('@docusaurus/prompts', () => {
  afterEach(() => {
    resetInjectedAnswers();
  });

  describe('injected answers', () => {
    it('askSelect returns the choice value', async () => {
      injectAnswers(['typescript']);
      await expect(
        askSelect({
          message: 'Which language do you want to use?',
          choices: [
            {name: 'JavaScript', value: 'javascript'},
            {name: 'TypeScript', value: 'typescript'},
          ],
          answerHint: 'the --javascript or --typescript option',
        }),
      ).resolves.toBe('typescript');
    });

    it('askInput returns the answer', async () => {
      injectAnswers(['my-site']);
      await expect(
        askInput({message: 'What should we name this site?'}),
      ).resolves.toBe('my-site');
    });

    it('askConfirm returns the answer', async () => {
      injectAnswers([true]);
      await expect(
        askConfirm({message: 'Do you want to continue?', initial: true}),
      ).resolves.toBe(true);
    });

    it('askSearch returns the choice value', async () => {
      injectAnswers(['HomePage']);
      await expect(
        askSearch({
          message: 'Select or type the component to swizzle.',
          choices: [
            {name: 'HomePage', value: 'HomePage'},
            {name: 'Footer', value: 'Footer'},
          ],
        }),
      ).resolves.toBe('HomePage');
    });

    it('exits with code 1 when the injected answer is an Error', async () => {
      injectAnswers([new Error('cancelled')]);
      using exit = mockExit();
      using error = mockConsoleError();

      await askSelect({
        message: 'Select a template below...',
        choices: [{name: 'classic', value: 'classic'}],
        answerHint: 'the [template] argument',
      });

      expect(exit).toHaveBeenCalledExactlyOnceWith(1);
      expect(error).toHaveBeenCalledExactlyOnceWith(
        '[ERROR] Can\'t answer the prompt "Select a template below...": cancelled. Answer it with the [template] argument.',
      );
    });

    it('omits the hint from the error when there is none', async () => {
      injectAnswers([new Error('cancelled')]);
      using exit = mockExit();
      using error = mockConsoleError();

      await askConfirm({message: 'Do you want to continue?'});

      expect(exit).toHaveBeenCalledExactlyOnceWith(1);
      expect(error).toHaveBeenCalledExactlyOnceWith(
        '[ERROR] Can\'t answer the prompt "Do you want to continue?": cancelled.',
      );
    });

    it('throws when the injected answers are exhausted', async () => {
      injectAnswers([]);
      await expect(
        askInput({message: 'What should we name this site?'}),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: No more injected answers for the prompt "What should we name this site?".]`,
      );
    });
  });

  describe('runPrompt', () => {
    it('returns the answer', async () => {
      prompts.inject(['my-site']);

      await expect(runPrompt<string>(createQuestion())).resolves.toBe(
        'my-site',
      );
    });

    it('exits with code 1 when the prompt is cancelled', async () => {
      prompts.inject([new Error('cancelled')]);
      using exit = mockExit();
      using error = mockConsoleError();

      await runPrompt(createQuestion(), 'the [siteName] argument');

      expect(exit).toHaveBeenCalledExactlyOnceWith(1);
      expect(error).toHaveBeenCalledExactlyOnceWith(
        '[ERROR] Can\'t answer the prompt "What should we name this site?": cancelled. Answer it with the [siteName] argument.',
      );
    });

    it('exits with code 1 when stdin is closed before an answer', async () => {
      const question = createQuestion();

      using exit = mockExit();
      using error = mockConsoleError();
      const answer = runPrompt(question, 'the [siteName] argument');
      question.stdin.end();
      process.emit('beforeExit', 0);
      await answer;

      expect(exit).toHaveBeenCalledExactlyOnceWith(1);
      expect(error).toHaveBeenCalledExactlyOnceWith(
        '[ERROR] Can\'t answer the prompt "What should we name this site?": stdin is closed. Answer it with the [siteName] argument.',
      );
    });
  });
});
