/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {Prism} from 'prism-react-renderer';
import prismIncludeLanguages from '../prism-include-languages';

const siteConfig = vi.hoisted(() => ({
  themeConfig: {prism: {additionalLanguages: [] as string[]}},
}));

vi.mock('@generated/docusaurus.config', () => ({default: siteConfig}));

function includeLanguages(additionalLanguages: string[]) {
  siteConfig.themeConfig.prism.additionalLanguages = additionalLanguages;
  prismIncludeLanguages(Prism);
}

describe('prismIncludeLanguages', () => {
  afterEach(() => {
    delete (globalThis as {Prism?: unknown}).Prism;
  });

  it('registers additional languages and their dependencies', () => {
    includeLanguages(['java', 'twig']);

    expect(Prism.languages.java).toBeDefined();
    expect(Prism.languages.twig).toBeDefined();
    expect(Prism.languages['markup-templating']).toBeDefined();
  });

  it('keeps Prism on globalThis for languages reading it in hooks', () => {
    // twig and liquid hooks read globalThis.Prism, for all languages
    includeLanguages(['twig', 'liquid']);

    expect(globalThis.Prism).toBe(Prism);
    expect(Prism.highlight('const a = 1;', Prism.languages.js!, 'js')).toBe(
      '<span class="token keyword">const</span> a <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>',
    );
  });

  it('restores the Prism instance another library put on globalThis', () => {
    const OtherPrism = {} as typeof Prism;
    globalThis.Prism = OtherPrism;

    includeLanguages(['java']);

    expect(globalThis.Prism).toBe(OtherPrism);
    expect(Prism.languages.java).toBeDefined();
  });
});
