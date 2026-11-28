/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {select} from 'd3-selection';
import {describe, expect, it, vi} from 'vitest';
import {loadMermaid} from '../loadMermaid';

const mermaidImport = vi.hoisted(() => ({
  onLoad: vi.fn(),
}));

vi.mock('mermaid', () => {
  mermaidImport.onLoad();
  return {default: {}};
});

describe('loadMermaid', () => {
  it('registers D3 transitions before importing Mermaid', async () => {
    const selection = select(null);
    const getTransition = () =>
      (selection as unknown as {transition?: unknown}).transition;

    expect(getTransition()).toBeUndefined();

    mermaidImport.onLoad.mockImplementation(() => {
      expect(getTransition()).toBeTypeOf('function');
    });

    await expect(loadMermaid()).resolves.toEqual({});
    expect(mermaidImport.onLoad).toHaveBeenCalledOnce();
  });
});
