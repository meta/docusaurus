/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {injectAnswers, resetInjectedAnswers} from '@docusaurus/prompts';
import {askForCustomGitCloneCommand, askPreferredLanguage} from '../prompts';

const mockExit = () =>
  vi.spyOn(process, 'exit').mockImplementation((() => {}) as () => never);
const mockConsoleError = () =>
  vi.spyOn(console, 'error').mockImplementation(() => {});

describe('create-docusaurus prompts', () => {
  afterEach(() => {
    resetInjectedAnswers();
  });

  describe('askPreferredLanguage', () => {
    it('returns the answer', async () => {
      injectAnswers(['typescript']);

      await expect(askPreferredLanguage()).resolves.toBe('typescript');
    });

    it('exits with code 1 when there is no answer', async () => {
      injectAnswers([new Error('cancelled')]);
      using exit = mockExit();
      using error = mockConsoleError();

      await askPreferredLanguage();

      expect(exit).toHaveBeenCalledExactlyOnceWith(1);
      expect(error).toHaveBeenCalledExactlyOnceWith(
        '[ERROR] Can\'t answer the prompt "Which language do you want to use?": cancelled. Answer it with the --javascript or --typescript option.',
      );
    });
  });

  describe('askForCustomGitCloneCommand', () => {
    it('returns the answer', async () => {
      injectAnswers(['git clone --depth 10']);

      await expect(askForCustomGitCloneCommand()).resolves.toBe(
        'git clone --depth 10',
      );
    });

    it('falls back to git clone when the answer is empty', async () => {
      injectAnswers(['']);

      await expect(askForCustomGitCloneCommand()).resolves.toBe('git clone');
    });

    it('exits with code 1 when there is no answer', async () => {
      injectAnswers([new Error('cancelled')]);
      using exit = mockExit();
      using error = mockConsoleError();

      await askForCustomGitCloneCommand();

      expect(exit).toHaveBeenCalledExactlyOnceWith(1);
      expect(error).toHaveBeenCalledExactlyOnceWith(
        '[ERROR] Can\'t answer the prompt "Write your own git clone command. The repository URL and destination directory will be supplied. E.g. "git clone --depth 10"": cancelled. Answer it with a --git-strategy option other than custom.',
      );
    });
  });
});
