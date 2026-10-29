/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it, vi} from 'vitest';
import {renderHook} from '@testing-library/react';
import {Context} from '@docusaurus/core/src/client/docusaurusContext';
import {usePluralForm} from '../usePluralForm';
import type {DocusaurusContext} from '@docusaurus/types';

describe('usePluralForm', () => {
  const createUsePluralFormMock = (context: DocusaurusContext) => () =>
    renderHook(() => usePluralForm(), {
      wrapper: ({children}) => <Context value={context}>{children}</Context>,
    }).result.current;

  it('returns the right plural', () => {
    const mockUsePluralForm = createUsePluralFormMock({
      i18n: {
        currentLocale: 'en',
      },
    } as DocusaurusContext);
    expect(mockUsePluralForm().selectMessage(1, 'one|many')).toBe('one');
    expect(mockUsePluralForm().selectMessage(10, 'one|many')).toBe('many');
  });

  it('warns against too many plurals', () => {
    const mockUsePluralForm = createUsePluralFormMock({
      i18n: {
        currentLocale: 'zh-Hans',
      },
    } as DocusaurusContext);
    using error = vi.spyOn(console, 'error');
    expect(mockUsePluralForm().selectMessage(1, 'one|many')).toBe('one');
    expect(mockUsePluralForm().selectMessage(10, 'one|many')).toBe('one');
    expect(error.mock.calls[0]![0]).toMatchInlineSnapshot(
      `"For locale=zh-Hans, a maximum of 1 plural forms are expected (other), but the message contains 2: one|many"`,
    );
  });

  it('uses the last with not enough plurals', () => {
    const mockUsePluralForm = createUsePluralFormMock({
      i18n: {
        currentLocale: 'en',
      },
    } as DocusaurusContext);
    expect(mockUsePluralForm().selectMessage(10, 'many')).toBe('many');
  });

  it('falls back when Intl.PluralForms is not available', () => {
    const mockUsePluralForm = createUsePluralFormMock({
      i18n: {
        currentLocale: 'zh-Hans',
      },
    } as DocusaurusContext);
    using error = vi.spyOn(console, 'error');
    using pluralMock = vi
      .spyOn(Intl, 'PluralRules')
      .mockImplementation(() => undefined);

    expect(mockUsePluralForm().selectMessage(1, 'one|many')).toBe('one');
    expect(error.mock.calls).toHaveLength(1);
    expect(error.mock.calls[0]![0]).toMatchInlineSnapshot(`
      "Failed to use Intl.PluralRules for locale "zh-Hans".
      Docusaurus will fallback to the default (English) implementation.
      Error: () => undefined is not a constructor
      "
    `);

    expect(mockUsePluralForm().selectMessage(10, 'one|many')).toBe('many');
    expect(error.mock.calls).toHaveLength(2);
    expect(error.mock.calls[1]![0]).toMatchInlineSnapshot(`
      "Failed to use Intl.PluralRules for locale "zh-Hans".
      Docusaurus will fallback to the default (English) implementation.
      Error: () => undefined is not a constructor
      "
    `);

    error.mockRestore();
    pluralMock.mockRestore();
  });
});
