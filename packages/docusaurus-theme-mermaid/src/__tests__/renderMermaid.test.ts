/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi, beforeEach} from 'vitest';
import {renderMermaid, resetRenderQueueForTest} from '../client/index';
import * as loadMermaidModule from '../client/loadMermaid';
import type {MermaidConfig, RenderResult} from 'mermaid';

describe('renderMermaid', () => {
  beforeEach(() => {
    resetRenderQueueForTest();
    vi.restoreAllMocks();
  });

  it('serialize concurrent renders so initialize and render never overlap', async () => {
    const executionTrace: string[] = [];
    let activeRenders = 0;
    let maxConcurrentRenders = 0;

    const mockMermaid = {
      initialize: vi.fn((config: MermaidConfig) => {
        executionTrace.push(`initialize:${config.theme}`);
      }),
      render: vi.fn(async (id: string, text: string): Promise<RenderResult> => {
        activeRenders++;
        if (activeRenders > maxConcurrentRenders) {
          maxConcurrentRenders = activeRenders;
        }
        executionTrace.push(`render:start:${id}`);

        // Simulate async layout/rendering time
        await new Promise((resolve) => setTimeout(resolve, 20));

        executionTrace.push(`render:end:${id}`);
        activeRenders--;
        return {
          svg: `<svg id="${id}">${text}</svg>`,
          diagramType: 'flowchart',
        };
      }),
    };

    vi.spyOn(loadMermaidModule, 'loadMermaid').mockResolvedValue(
      mockMermaid as unknown as typeof loadMermaidModule.loadMermaid extends () => Promise<
        infer M
      >
        ? M
        : never,
    );

    // Call 3 renders concurrently without awaiting
    const p1 = renderMermaid({
      id: 'd1',
      text: 'graph TD; A-->B',
      config: {theme: 'default'},
    });
    const p2 = renderMermaid({
      id: 'd2',
      text: 'graph TD; C-->D',
      config: {theme: 'forest'},
    });
    const p3 = renderMermaid({
      id: 'd3',
      text: 'graph TD; E-->F',
      config: {theme: 'dark'},
    });

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    expect(r1.svg).toBe('<svg id="d1">graph TD; A-->B</svg>');
    expect(r2.svg).toBe('<svg id="d2">graph TD; C-->D</svg>');
    expect(r3.svg).toBe('<svg id="d3">graph TD; E-->F</svg>');

    // Must never have more than 1 render in flight simultaneously
    expect(maxConcurrentRenders).toBe(1);

    // Strict sequential execution:
    // initialize -> render start -> render end -> initialize next...
    expect(executionTrace).toEqual([
      'initialize:default',
      'render:start:d1',
      'render:end:d1',
      'initialize:forest',
      'render:start:d2',
      'render:end:d2',
      'initialize:dark',
      'render:start:d3',
      'render:end:d3',
    ]);
  });

  it('continue executing queued renders even if an earlier render throws', async () => {
    const mockMermaid = {
      initialize: vi.fn(),
      render: vi.fn(async (id: string, text: string): Promise<RenderResult> => {
        if (id === 'failing-diagram') {
          throw new Error('Syntax error in diagram');
        }
        return {
          svg: `<svg id="${id}">${text}</svg>`,
          diagramType: 'flowchart',
        };
      }),
    };

    vi.spyOn(loadMermaidModule, 'loadMermaid').mockResolvedValue(
      mockMermaid as unknown as typeof loadMermaidModule.loadMermaid extends () => Promise<
        infer M
      >
        ? M
        : never,
    );

    const p1 = renderMermaid({
      id: 'failing-diagram',
      text: 'syntax error',
      config: {theme: 'default'},
    });
    const p2 = renderMermaid({
      id: 'succeeding-diagram',
      text: 'graph TD; A-->B',
      config: {theme: 'default'},
    });

    await expect(p1).rejects.toThrow('Syntax error in diagram');
    const r2 = await p2;
    expect(r2.svg).toBe('<svg id="succeeding-diagram">graph TD; A-->B</svg>');
  });

  it('clean up error container from document on error if present', async () => {
    const removeFn = vi.fn();
    const getElementByIdSpy = vi.fn().mockReturnValue({remove: removeFn});
    vi.stubGlobal('document', {getElementById: getElementByIdSpy});

    const mockMermaid = {
      initialize: vi.fn(),
      render: vi.fn(async () => {
        throw new Error('Render failed');
      }),
    };

    vi.spyOn(loadMermaidModule, 'loadMermaid').mockResolvedValue(
      mockMermaid as unknown as typeof loadMermaidModule.loadMermaid extends () => Promise<
        infer M
      >
        ? M
        : never,
    );

    // Verify handling of React useId() IDs containing colons (e.g. :r0:-0)
    // Non-alphanumeric characters are sanitized to underscores for CSS selector compatibility
    await expect(
      renderMermaid({
        id: ':r0:-0',
        text: 'invalid',
        config: {theme: 'default'},
      }),
    ).rejects.toThrow('Render failed');

    expect(mockMermaid.render).toHaveBeenCalledWith('_r0_-0', 'invalid');
    expect(getElementByIdSpy).toHaveBeenCalledWith('d_r0_-0');
    expect(removeFn).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
