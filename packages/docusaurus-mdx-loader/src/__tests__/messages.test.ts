/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import {reportMDXMessages} from '../messages';
import type {SimpleProcessorResult} from '../processor';

const filePath = '/site/docs/test.md';

async function createMessages(
  entries: {reason: string; place?: {line: number; column: number}}[],
): Promise<SimpleProcessorResult['messages']> {
  const {VFile} = await import('vfile');
  const file = new VFile({path: filePath});
  entries.forEach(({reason, place}) => {
    file.message(reason, place ? {place} : undefined);
  });
  return file.messages;
}

describe('reportMDXMessages', () => {
  it('warns about each message reported by Remark plugins', async () => {
    using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    reportMDXMessages({
      messages: await createMessages([
        {reason: 'Some warning', place: {line: 3, column: 5}},
        {reason: 'Another warning'},
      ]),
      filePath,
      compilerName: 'client',
    });

    expect(warn).toHaveBeenCalledTimes(1);
    const message = warn.mock.calls[0]![0] as string;
    expect(message).toContain('Some warning');
    expect(message).toContain('3:5');
    expect(message).toContain('Another warning');
  });

  it('does not warn when no message is reported', async () => {
    using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    reportMDXMessages({
      messages: await createMessages([]),
      filePath,
      compilerName: 'client',
    });

    expect(warn).not.toHaveBeenCalled();
  });

  it('does not warn for the server compiler, avoiding duplicate warnings', async () => {
    using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    reportMDXMessages({
      messages: await createMessages([{reason: 'Some warning'}]),
      filePath,
      compilerName: 'server',
    });

    expect(warn).not.toHaveBeenCalled();
  });
});
