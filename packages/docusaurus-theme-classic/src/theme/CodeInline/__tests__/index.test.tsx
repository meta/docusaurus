/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import CodeInline from '../index';
import styles from '../styles.module.css';

describe('CodeInline', () => {
  it('uses the baseline alignment class', () => {
    const {container} = render(<CodeInline>npm install</CodeInline>);
    const code = container.querySelector('code');

    expect(code).toHaveTextContent('npm install');
    expect(code).toHaveClass(styles.codeInline);
  });
});
