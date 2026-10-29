/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @vitest-environment jsdom

import {describe, expect, it, vi} from 'vitest';
import type {ReactNode} from 'react';
import {render as renderRTL} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {fromPartial} from '@total-typescript/shoehorn';
import {MemoryRouter, StaticRouter} from 'react-router-dom';
import Link from '../Link';
import ExecutionEnvironment from '../ExecutionEnvironment';
import {Context} from '../../docusaurusContext';
import type {DocusaurusContext} from '@docusaurus/types';

window.docusaurus = {
  prefetch: vi.fn(),
  preload: vi.fn(),
};

type Options = {
  trailingSlash: boolean | undefined;
  baseUrl: string;
  router: DocusaurusContext['siteConfig']['future']['experimental_router'];
  currentLocation: string;
};

const defaultOptions: Options = {
  trailingSlash: undefined,
  baseUrl: '/',
  router: 'browser',
  // currentLocation is nested on purpose, shows relative link resolution
  currentLocation: '/sub/category/currentPathname',
};

function createDocusaurusContext(
  partialOptions: Partial<Options>,
): DocusaurusContext {
  const options: Options = {...defaultOptions, ...partialOptions};
  return fromPartial({
    siteConfig: {
      baseUrl: options.baseUrl,
      trailingSlash: options.trailingSlash,
      future: {
        experimental_router: options.router,
      },
    },
  });
}

function createLinkRenderer(defaultRendererOptions: Partial<Options> = {}) {
  return (linkJsx: ReactNode, testOptions: Partial<Options> = {}) => {
    const options: Options = {
      ...defaultOptions,
      ...defaultRendererOptions,
      ...testOptions,
    };
    const docusaurusContext = createDocusaurusContext(options);
    return renderRTL(
      <StaticRouter location={options.currentLocation} context={{}}>
        <Context value={docusaurusContext}>{linkJsx}</Context>
      </StaticRouter>,
    );
  };
}

describe('<Link>', () => {
  it('reuses and disposes its intersection observer across renders', () => {
    const canUseIntersectionObserver =
      ExecutionEnvironment.canUseIntersectionObserver;
    const observers: IntersectionObserver[] = [];
    const createIntersectionObserver = vi.fn(function IntersectionObserver() {
      const observer = fromPartial<IntersectionObserver>({
        disconnect: vi.fn(),
        observe: vi.fn(),
        unobserve: vi.fn(),
      });
      observers.push(observer);
      return observer;
    });
    vi.stubGlobal('IntersectionObserver', createIntersectionObserver);
    ExecutionEnvironment.canUseIntersectionObserver = true;

    const context = createDocusaurusContext(defaultOptions);
    function Wrapper({children}: {children: ReactNode}) {
      return (
        <MemoryRouter initialEntries={[defaultOptions.currentLocation]}>
          <Context value={context}>{children}</Context>
        </MemoryRouter>
      );
    }

    try {
      const {rerender, unmount} = renderRTL(<Link to="/docs/intro" />, {
        wrapper: Wrapper,
      });
      expect(createIntersectionObserver).toHaveBeenCalledTimes(1);

      rerender(<Link to="/docs/intro" />);
      expect(createIntersectionObserver).toHaveBeenCalledTimes(1);
      expect(observers[0]!.disconnect).not.toHaveBeenCalled();

      rerender(<Link to="/docs/api" />);
      expect(createIntersectionObserver).toHaveBeenCalledTimes(2);
      expect(observers[0]!.disconnect).toHaveBeenCalledTimes(1);
      expect(observers[1]!.disconnect).not.toHaveBeenCalled();

      unmount();
      expect(observers[1]!.disconnect).toHaveBeenCalledTimes(1);
    } finally {
      ExecutionEnvironment.canUseIntersectionObserver =
        canUseIntersectionObserver;
      vi.unstubAllGlobals();
    }
  });

  describe('using "browser" router', () => {
    const render = createLinkRenderer({router: 'browser'});

    it("can render '/docs/intro'", () => {
      const {container} = render(<Link to="/docs/intro" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/docs/intro"
        />
      `);
    });

    it("can render '/docs/intro' with baseUrl /baseUrl/", () => {
      const {container} = render(<Link to="/docs/intro" />, {
        baseUrl: '/baseUrl/',
      });

      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/baseUrl/docs/intro"
        />
      `);
    });

    it("can render '/docs/intro' with baseUrl /docs/", () => {
      const {container} = render(<Link to="/docs/intro" />, {
        baseUrl: '/docs/',
      });

      // TODO Docusaurus v4 ?
      //  Change weird historical baseUrl behavior
      //  we should link to /docs/docs/intro, not /docs/intro
      //  see https://github.com/facebook/docusaurus/issues/6294
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/docs/intro"
        />
      `);
    });

    it("can render '/docs/intro' with trailingSlash true", () => {
      const {container} = render(<Link to="/docs/intro" />, {
        trailingSlash: true,
      });
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/docs/intro/"
        />
      `);
    });

    it("can render '/docs/intro/' with trailingSlash false", () => {
      const {container} = render(<Link to="/docs/intro/" />, {
        trailingSlash: false,
      });
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/docs/intro"
        />
      `);
    });

    it("can render '#anchor'", () => {
      const {container} = render(<Link to="#anchor" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="regular"
          href="#anchor"
        />
      `);
    });

    it("can render '/docs/intro#anchor'", () => {
      const {container} = render(<Link to="/docs/intro#anchor" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/docs/intro#anchor"
        />
      `);
    });

    it("can render '/docs/intro/#anchor'", () => {
      const {container} = render(<Link to="/docs/intro/#anchor" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/docs/intro/#anchor"
        />
      `);
    });

    it("can render '/pathname?qs#anchor'", () => {
      const {container} = render(<Link to="/pathname?qs#anchor" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/pathname?qs#anchor"
        />
      `);
    });

    it("can render ''", () => {
      const {container} = render(<Link to="" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="regular"
        />
      `);
    });

    it("can render 'relativeDoc'", () => {
      const {container} = render(<Link to="relativeDoc" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/sub/category/relativeDoc"
        />
      `);
    });

    it("can render './relativeDoc'", () => {
      const {container} = render(<Link to="./relativeDoc" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/sub/category/relativeDoc"
        />
      `);
    });

    it("can render './../relativeDoc?qs#anchor'", () => {
      const {container} = render(<Link to="./../relativeDoc?qs#anchor" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/sub/relativeDoc?qs#anchor"
        />
      `);
    });

    it("can render 'https://example.com/xyz'", () => {
      const {container} = render(<Link to="https://example.com/xyz" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="regular"
          href="https://example.com/xyz"
          rel="noopener noreferrer"
          target="_blank"
        />
      `);
    });

    it("can render 'pathname:///docs/intro'", () => {
      const {container} = render(<Link to="pathname:///docs/intro" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="regular"
          href="/docs/intro"
          rel="noopener noreferrer"
          target="_blank"
        />
      `);
    });

    it("can render 'pathname://docs/intro'", () => {
      const {container} = render(<Link to="pathname://docs/intro" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="regular"
          href="docs/intro"
          rel="noopener noreferrer"
          target="_blank"
        />
      `);
    });

    it("can render 'pathname:///docs/intro' with baseUrl /baseUrl/", () => {
      const {container} = render(<Link to="pathname:///docs/intro" />, {
        baseUrl: '/baseUrl/',
      });
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="regular"
          href="/baseUrl/docs/intro"
          rel="noopener noreferrer"
          target="_blank"
        />
      `);
    });

    it("can render 'pathname:///docs/intro' with target _self", () => {
      const {container} = render(
        <Link to="pathname:///docs/intro" target="_self" />,
      );
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="regular"
          href="/docs/intro"
          rel="noopener noreferrer"
          target="_self"
        />
      `);
    });

    it("can render 'pathname:///docs/intro with trailingSlash: true", () => {
      const {container} = render(<Link to="pathname:///docs/intro" />, {
        trailingSlash: true,
      });
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="regular"
          href="/docs/intro"
          rel="noopener noreferrer"
          target="_blank"
        />
      `);
    });
  });

  describe('using "hash" router', () => {
    const render = createLinkRenderer({router: 'hash'});

    it("can render '/docs/intro'", () => {
      const {container} = render(<Link to="/docs/intro" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/docs/intro"
        />
      `);
    });

    it("can render '#anchor'", () => {
      // It's important to use React Router link for hash router anchors
      // See https://github.com/facebook/docusaurus/pull/10311
      const {container} = render(<Link to="#anchor" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/sub/category/currentPathname#anchor"
        />
      `);
    });

    it("can render './relativeDoc'", () => {
      // Not sure to remember exactly what's this edge case about
      // still worth it to capture behavior in tests
      const {container} = render(<Link to="./relativeDoc" />);
      expect(container.firstElementChild).toMatchInlineSnapshot(`
        <a
          data-test-link-type="react-router"
          href="/relativeDoc"
        />
      `);
    });
  });
});
