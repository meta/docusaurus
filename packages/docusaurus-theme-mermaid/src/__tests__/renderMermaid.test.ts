/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @vitest-environment jsdom
 */

import {describe, expect, it, vi} from 'vitest';
import {renderMermaid} from '../client/index';
import * as loadMermaidModule from '../client/loadMermaid';
import type {MermaidConfig} from 'mermaid';

describe('renderMermaid serialization', () => {
  it('serializes concurrent renderMermaid calls', async () => {
    const executionOrder: string[] = [];

    const fakeMermaid = {
      initialize: vi.fn((config: MermaidConfig) => {
        executionOrder.push(`initialize-${config.theme}`);
      }),
      render: vi.fn(async (id: string, text: string) => {
        executionOrder.push(`render-start-${id}`);
        // Simulate asynchronous rendering work
        await new Promise((resolve) => setTimeout(resolve, 20));
        executionOrder.push(`render-end-${id}`);
        return {svg: `<svg>${text}</svg>`, bindFunctions: vi.fn()};
      }),
    };

    vi.spyOn(loadMermaidModule, 'loadMermaid').mockResolvedValue(
      fakeMermaid as unknown as import('mermaid').Mermaid,
    );

    const config1: MermaidConfig = {theme: 'default' as const};
    const config2: MermaidConfig = {theme: 'dark' as const};

    // Trigger two renders in parallel
    const [result1, result2] = await Promise.all([
      renderMermaid({id: 'diag-1', text: 'flowchart TD; A-->B', config: config1}),
      renderMermaid({id: 'diag-2', text: 'flowchart TD; C-->D', config: config2}),
    ]);

    expect(result1.svg).toBe('<svg>flowchart TD; A-->B</svg>');
    expect(result2.svg).toBe('<svg>flowchart TD; C-->D</svg>');

    // The second initialize must happen strictly after the first render-end
    expect(executionOrder).toEqual([
      'initialize-default',
      'render-start-diag-1',
      'render-end-diag-1',
      'initialize-dark',
      'render-start-diag-2',
      'render-end-diag-2',
    ]);
  });

  it('continues queue execution if a previous render fails', async () => {
    let callCount = 0;
    const fakeMermaid = {
      initialize: vi.fn(),
      render: vi.fn(async (id: string, text: string) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Mermaid syntax error');
        }
        return {svg: `<svg>${text}</svg>`, bindFunctions: vi.fn()};
      }),
    };

    vi.spyOn(loadMermaidModule, 'loadMermaid').mockResolvedValue(
      fakeMermaid as unknown as import('mermaid').Mermaid,
    );

    const config: MermaidConfig = {theme: 'default' as const};

    const firstPromise = renderMermaid({id: 'diag-fail', text: 'invalid text', config});
    const secondPromise = renderMermaid({id: 'diag-success', text: 'valid text', config});

    await expect(firstPromise).rejects.toThrow('Mermaid syntax error');
    const secondResult = await secondPromise;
    expect(secondResult.svg).toBe('<svg>valid text</svg>');
  });
});
