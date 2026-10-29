/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {renderHook} from '@testing-library/react';
import {DocusaurusContextProvider} from '../docusaurusContext';
import useDocusaurusContext from '../exports/useDocusaurusContext';

// This test currently isn't quite useful because the @generated aliases point
// to the empty modules. Maybe we can point that to fixtures in the future.
describe('DocusaurusContextProvider', () => {
  const {result} = renderHook(() => useDocusaurusContext(), {
    wrapper: ({children}) => (
      <DocusaurusContextProvider>{children}</DocusaurusContextProvider>
    ),
  });
  const value = result.current;

  it('returns right value', () => {
    expect(value).toMatchInlineSnapshot(`
      {
        "codeTranslations": {},
        "globalData": {},
        "i18n": {},
        "siteConfig": {},
        "siteMetadata": {},
      }
    `);
  });
});
