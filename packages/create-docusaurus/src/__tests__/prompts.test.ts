/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import {PassThrough} from 'node:stream';
import prompts from 'prompts';
import {askPreferredLanguage, prompt} from '../prompts';

function createQuestion() {
  return {
    type: 'text',
    name: 'siteName',
    message: 'What should we name this site?',
    stdin: new PassThrough(),
    stdout: new PassThrough(),
  } as const;
}

const answerHint = 'the [siteName] argument';

describe('prompt', () => {
  it('returns the answers', async () => {
    prompts.inject(['my-site']);
    const onCancel = vi.fn();

    await expect(
      prompt(createQuestion(), {onCancel, answerHint}),
    ).resolves.toEqual({siteName: 'my-site'});
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when the prompt is cancelled', async () => {
    prompts.inject([new Error('cancelled')]);
    const onCancel = vi.fn();

    await expect(
      prompt(createQuestion(), {onCancel, answerHint}),
    ).resolves.toEqual({});
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('throws when stdin is closed before an answer', async () => {
    const question = createQuestion();
    const onCancel = vi.fn();

    const answers = prompt(question, {onCancel, answerHint});
    question.stdin.end();
    process.emit('beforeExit', 0);

    await expect(answers).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Can't answer the prompt "What should we name this site?": stdin is closed. Answer it with the [siteName] argument.]`,
    );
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe('askPreferredLanguage', () => {
  it('returns the answer', async () => {
    prompts.inject(['typescript']);

    await expect(askPreferredLanguage()).resolves.toBe('typescript');
  });

  it('exits with code 1 when the prompt is cancelled', async () => {
    prompts.inject([new Error('cancelled')]);
    using exit = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as () => never);
    using error = vi.spyOn(console, 'error').mockImplementation(() => {});

    await askPreferredLanguage();

    expect(exit).toHaveBeenCalledExactlyOnceWith(1);
    expect(error.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[ERROR] A language is required.",
        ],
      ]
    `);
  });
});
