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

import Translate, {translate} from '../Translate';

describe('translate', () => {
  it('accepts id and uses it as fallback', () => {
    expect(translate({id: 'some-id'})).toBe('some-id');
  });

  it('accepts message and uses it as fallback', () => {
    expect(translate({message: 'some-message'})).toBe('some-message');
  });

  it('accepts id+message and uses message as fallback', () => {
    expect(translate({id: 'some-id', message: 'some-message'})).toBe(
      'some-message',
    );
  });

  it('rejects when no id or message', () => {
    // TODO tests are not resolving type defs correctly. We need to include test
    // files in a tsconfig file
    // @ts-expect-error: TS should protect when both id/message are missing
    expect(() => translate({})).toThrowErrorMatchingInlineSnapshot(
      `[Error: Docusaurus translation declarations must have at least a translation id or a default translation message]`,
    );
  });
});

describe('<Translate>', () => {
  it('loads and displays greeting', async () => {
    const {container} = render(<Translate id="some-id" />);
    expect(container).toHaveTextContent('some-id');
  });

  it('accepts message and uses it as fallback', () => {
    const {container} = render(<Translate>some-message</Translate>);
    expect(container).toHaveTextContent('some-message');
  });

  it('accepts id+message and uses message as fallback', () => {
    const {container} = render(
      <Translate id="some-id">some-message</Translate>,
    );
    expect(container).toHaveTextContent('some-message');
  });

  it('rejects when no id or message', () => {
    // @ts-expect-error: test missing id and message
    expect(() => render(<Translate />)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Docusaurus translation declarations must have at least a translation id or a default translation message]`,
    );
  });

  it('rejects when children is not a string', () => {
    expect(() =>
      render(
        // eslint-disable-next-line @docusaurus/string-literal-i18n-messages
        <Translate id="foo">
          {/* @ts-expect-error: test invalid children */}
          <span>aaa</span>
        </Translate>,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: The Docusaurus <Translate> component only accept simple string values]`,
    );
  });
});
