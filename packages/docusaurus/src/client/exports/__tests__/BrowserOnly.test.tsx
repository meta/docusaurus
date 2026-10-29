/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom

import {afterEach, describe, expect, it, vi} from 'vitest';
import React, {Suspense, act, type ReactNode} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import BrowserOnly from '../BrowserOnly';
import useIsBrowser from '../useIsBrowser';
import {renderToHtml} from '../../renderToHtml';

function htmlToElement(html: string): Element {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container.firstElementChild!;
}

describe('<BrowserOnly>', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('client', () => {
    it('rejects react element children', () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() =>
        render(
          <BrowserOnly>
            {/* @ts-expect-error: test invalid children */}
            <span>{window.location.href}</span>
          </BrowserOnly>,
        ),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: Docusaurus error: The children of <BrowserOnly> must be a "render function", e.g. <BrowserOnly>{() => <span>{window.location.href}</span>}</BrowserOnly>.
        Current type: React element]
      `);
    });

    it('rejects string children', () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        // @ts-expect-error: test invalid children
        render(<BrowserOnly> </BrowserOnly>);
      }).toThrowErrorMatchingInlineSnapshot(`
        [Error: Docusaurus error: The children of <BrowserOnly> must be a "render function", e.g. <BrowserOnly>{() => <span>{window.location.href}</span>}</BrowserOnly>.
        Current type: string]
      `);
    });

    it('renders children', () => {
      const {container} = render(
        <BrowserOnly fallback={<span>Loading</span>}>
          {() => <span>{window.location.href}</span>}
        </BrowserOnly>,
      );
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <span>
          https://docusaurus.io/
        </span>
      `);
    });

    it('renders children with useIsBrowser() true', () => {
      function IsBrowser() {
        return <span>isBrowser={String(useIsBrowser())}</span>;
      }
      const {container} = render(
        <BrowserOnly>{() => <IsBrowser />}</BrowserOnly>,
      );
      expect(container).toHaveTextContent(/^isBrowser=true$/);
    });

    it('renders fallback while children suspend', async () => {
      let resolveLazy!: () => void;
      const Lazy = React.lazy(
        () =>
          new Promise<{default: () => ReactNode}>((resolve) => {
            resolveLazy = () => resolve({default: () => <span>Loaded</span>});
          }),
      );
      const {container} = render(
        <Suspense fallback={<span>Parent fallback</span>}>
          <span>Sibling</span>
          <BrowserOnly fallback={<span>Loading</span>}>
            {() => <Lazy />}
          </BrowserOnly>
        </Suspense>,
      );
      // Suspending children do not hide siblings behind parent fallback
      expect(container).toMatchInlineSnapshot(`
        <div>
          <span>
            Sibling
          </span>
          <span>
            Loading
          </span>
        </div>
      `);
      await act(async () => resolveLazy());
      expect(container).toMatchInlineSnapshot(`
        <div>
          <span>
            Sibling
          </span>
          <span>
            Loaded
          </span>
        </div>
      `);
    });
  });

  describe('server', () => {
    it('renders fallback and never calls children', async () => {
      const children = vi.fn(() => <span>Client content</span>);
      const html = await renderToHtml(
        <div>
          <BrowserOnly fallback={<span>Loading</span>}>{children}</BrowserOnly>
        </div>,
      );
      expect(children).not.toHaveBeenCalled();
      expect(htmlToElement(html)).toHaveTextContent(/^Loading$/);
    });

    it('renders nothing without fallback', async () => {
      const html = await renderToHtml(
        <div>
          <BrowserOnly>{() => <span>Client content</span>}</BrowserOnly>
        </div>,
      );
      const element = htmlToElement(html);
      expect(element).toHaveTextContent(/^$/);
      expect(element.children).toHaveLength(1);
      expect(element.firstElementChild!.tagName).toBe('TEMPLATE');
    });

    it('does not validate children', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      await expect(
        renderToHtml(
          <BrowserOnly fallback={<span>Loading</span>}>
            {/* @ts-expect-error: test invalid children */}
            <span>Invalid</span>
          </BrowserOnly>,
        ),
      ).resolves.toContain('<span>Loading</span>');
    });
  });

  describe('hydration', () => {
    it('hydrates server fallback and renders children', async () => {
      function App() {
        return (
          <div>
            <p>Before</p>
            <BrowserOnly fallback={<span>Loading</span>}>
              {() => <span>{window.location.href}</span>}
            </BrowserOnly>
            <p>After</p>
          </div>
        );
      }
      const container = document.createElement('div');
      container.innerHTML = await renderToHtml(<App />);
      expect(container).toHaveTextContent('BeforeLoadingAfter');

      const consoleError = vi.spyOn(console, 'error');
      const onRecoverableError = vi.fn();
      await act(async () => {
        hydrateRoot(container, <App />, {onRecoverableError});
      });

      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
      expect(container.innerHTML).toMatchInlineSnapshot(
        `"<div><p>Before</p><span>https://docusaurus.io/</span><p>After</p></div>"`,
      );
    });
  });
});
