/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {removeTrailingSlash} from '@docusaurus/utils-common';
import {normalizePluginOptions} from '@docusaurus/utils-validation';
import collectRedirects from '../collectRedirects';
import {validateOptions} from '../options';
import type {DocusaurusConfig} from '@docusaurus/types';
import type {Options} from '../options';
import type {PluginContext} from '../types';

function createTestPluginContext(
  options?: Options,
  relativeRoutesPaths: string[] = [],
  siteConfig: Partial<DocusaurusConfig> = {},
): PluginContext {
  return {
    outDir: '/tmp',
    baseUrl: 'https://docusaurus.io',
    relativeRoutesPaths,
    options: validateOptions({validate: normalizePluginOptions, options}),
    siteConfig: {onDuplicateRoutes: 'warn', ...siteConfig} as DocusaurusConfig,
  };
}

describe('collectRedirects', () => {
  it('collects no redirect for undefined config', () => {
    expect(
      collectRedirects(
        createTestPluginContext(undefined, ['/', '/path']),
        undefined,
      ),
    ).toEqual([]);
  });

  it('collects no redirect for empty config', () => {
    expect(collectRedirects(createTestPluginContext({}), undefined)).toEqual(
      [],
    );
  });

  it('collects redirects from html/exe extension', () => {
    expect(
      collectRedirects(
        createTestPluginContext(
          {
            fromExtensions: ['html', 'exe'],
          },
          ['/', '/somePath', '/otherPath.html'],
        ),
        undefined,
      ),
    ).toEqual([
      {
        from: '/somePath.html',
        to: '/somePath',
      },
      {
        from: '/somePath.exe',
        to: '/somePath',
      },
    ]);
  });

  it('collects redirects to html/exe extension', () => {
    expect(
      collectRedirects(
        createTestPluginContext(
          {
            toExtensions: ['html', 'exe'],
          },
          ['/', '/somePath', '/otherPath.html'],
        ),
        undefined,
      ),
    ).toEqual([
      {
        from: '/otherPath',
        to: '/otherPath.html',
      },
    ]);
  });

  it('collects redirects from plugin option redirects', () => {
    expect(
      collectRedirects(
        createTestPluginContext(
          {
            redirects: [
              {
                from: '/someLegacyPath',
                to: '/somePath',
              },
              {
                from: '/someLegacyPath2',
                to: '/some Path2',
              },
              {
                from: '/someLegacyPath3',
                to: '/some%20Path3',
              },
              {
                from: ['/someLegacyPathArray1', '/someLegacyPathArray2'],
                to: '/',
              },

              {
                from: '/localQS',
                to: '/somePath?a=1&b=2',
              },
              {
                from: '/localAnchor',
                to: '/somePath#anchor',
              },
              {
                from: '/localQSAnchor',
                to: '/somePath?a=1&b=2#anchor',
              },

              {
                from: '/absolute',
                to: 'https://docusaurus.io/somePath',
              },
              {
                from: '/absoluteQS',
                to: 'https://docusaurus.io/somePath?a=1&b=2',
              },
              {
                from: '/absoluteAnchor',
                to: 'https://docusaurus.io/somePath#anchor',
              },
              {
                from: '/absoluteQSAnchor',
                to: 'https://docusaurus.io/somePath?a=1&b=2#anchor',
              },
            ],
          },
          ['/', '/somePath', '/some%20Path2', '/some Path3'],
        ),
        undefined,
      ),
    ).toEqual([
      {
        from: '/someLegacyPath',
        to: '/somePath',
      },
      {
        from: '/someLegacyPath2',
        to: '/some Path2',
      },
      {
        from: '/someLegacyPath3',
        to: '/some%20Path3',
      },
      {
        from: '/someLegacyPathArray1',
        to: '/',
      },
      {
        from: '/someLegacyPathArray2',
        to: '/',
      },
      {
        from: '/localQS',
        to: '/somePath?a=1&b=2',
      },
      {
        from: '/localAnchor',
        to: '/somePath#anchor',
      },
      {
        from: '/localQSAnchor',
        to: '/somePath?a=1&b=2#anchor',
      },

      {
        from: '/absolute',
        to: 'https://docusaurus.io/somePath',
      },
      {
        from: '/absoluteQS',
        to: 'https://docusaurus.io/somePath?a=1&b=2',
      },
      {
        from: '/absoluteAnchor',
        to: 'https://docusaurus.io/somePath#anchor',
      },
      {
        from: '/absoluteQSAnchor',
        to: 'https://docusaurus.io/somePath?a=1&b=2#anchor',
      },
    ]);
  });

  it('collects redirects from plugin option redirects with trailingSlash=true', () => {
    expect(
      collectRedirects(
        createTestPluginContext(
          {
            redirects: [
              {
                from: '/someLegacyPath',
                to: '/somePath',
              },
              {
                from: ['/someLegacyPathArray1', '/someLegacyPathArray2'],
                to: '/',
              },
            ],
          },
          ['/', '/somePath/'],
        ),
        true,
      ),
    ).toEqual([
      {
        from: '/someLegacyPath',
        to: '/somePath/',
      },
      {
        from: '/someLegacyPathArray1',
        to: '/',
      },
      {
        from: '/someLegacyPathArray2',
        to: '/',
      },
    ]);
  });

  it('preserves external redirect targets with trailingSlash=true', () => {
    expect(
      collectRedirects(
        createTestPluginContext(
          {
            redirects: [
              {
                from: '/someLegacyPath',
                to: 'https://example.com/somePath?a=1#x',
              },
            ],
          },
          ['/'],
        ),
        true,
      ),
    ).toEqual([
      {
        from: '/someLegacyPath',
        to: 'https://example.com/somePath?a=1#x',
      },
    ]);
  });

  it('collects redirects from plugin option redirects with trailingSlash=false', () => {
    expect(
      collectRedirects(
        createTestPluginContext(
          {
            redirects: [
              {
                from: '/someLegacyPath',
                to: '/somePath/',
              },
              {
                from: ['/someLegacyPathArray1', '/someLegacyPathArray2'],
                to: '/',
              },
            ],
          },
          ['/', '/somePath'],
        ),
        false,
      ),
    ).toEqual([
      {
        from: '/someLegacyPath',
        to: '/somePath',
      },
      {
        from: '/someLegacyPathArray1',
        to: '/',
      },
      {
        from: '/someLegacyPathArray2',
        to: '/',
      },
    ]);
  });

  it('preserves external redirect targets with trailingSlash=false', () => {
    expect(
      collectRedirects(
        createTestPluginContext(
          {
            redirects: [
              {
                from: '/someLegacyPath',
                to: 'https://example.com/somePath/?a=1#x',
              },
            ],
          },
          ['/'],
        ),
        false,
      ),
    ).toEqual([
      {
        from: '/someLegacyPath',
        to: 'https://example.com/somePath/?a=1#x',
      },
    ]);
  });

  it('throw if plugin option redirects contain invalid to paths', () => {
    expect(() =>
      collectRedirects(
        createTestPluginContext(
          {
            redirects: [
              {
                from: '/someLegacyPath',
                to: '/',
              },
              {
                from: '/someLegacyPath',
                to: '/this/path/does/not/exist2',
              },
              {
                from: '/someLegacyPath',
                to: '/this/path/does/not/exist3',
              },
              {
                from: '/someLegacyPath',
                to: '/this/path/does/not/exist4?a=b#anchor',
              },
            ],
          },
          ['/', '/someExistingPath', '/anotherExistingPath'],
        ),
        undefined,
      ),
    ).toThrowErrorMatchingSnapshot();
  });

  it('tolerates mismatched trailing slash if option is undefined', () => {
    expect(
      collectRedirects(
        createTestPluginContext(
          {
            redirects: [
              {
                from: '/someLegacyPath',
                to: '/somePath',
              },
            ],
          },
          ['/', '/somePath/'],
          {trailingSlash: undefined},
        ),
        undefined,
      ),
    ).toEqual([
      {
        from: '/someLegacyPath',
        to: '/somePath',
      },
    ]);
  });

  it('throw if plugin option redirects contain to paths with mismatching trailing slash', () => {
    expect(() =>
      collectRedirects(
        createTestPluginContext(
          {
            redirects: [
              {
                from: '/someLegacyPath',
                to: '/someExistingPath/',
              },
            ],
          },
          ['/', '/someExistingPath', '/anotherExistingPath'],
          {trailingSlash: false},
        ),
        undefined,
      ),
    ).toThrowErrorMatchingSnapshot();

    expect(() =>
      collectRedirects(
        createTestPluginContext(
          {
            redirects: [
              {
                from: '/someLegacyPath',
                to: '/someExistingPath',
              },
            ],
          },
          ['/', '/someExistingPath/', '/anotherExistingPath/'],
          {trailingSlash: true},
        ),
        undefined,
      ),
    ).toThrowErrorMatchingSnapshot();
  });

  it('collects redirects with custom redirect creator', () => {
    expect(
      collectRedirects(
        createTestPluginContext(
          {
            createRedirects: (routePath) => [
              `${removeTrailingSlash(routePath)}/some/path/suffix1`,
              `${removeTrailingSlash(routePath)}/some/other/path/suffix2`,
            ],
          },
          ['/', '/testPath', '/otherPath.html'],
        ),
        undefined,
      ),
    ).toEqual([
      {
        from: '/some/path/suffix1',
        to: '/',
      },
      {
        from: '/some/other/path/suffix2',
        to: '/',
      },

      {
        from: '/testPath/some/path/suffix1',
        to: '/testPath',
      },
      {
        from: '/testPath/some/other/path/suffix2',
        to: '/testPath',
      },

      {
        from: '/otherPath.html/some/path/suffix1',
        to: '/otherPath.html',
      },
      {
        from: '/otherPath.html/some/other/path/suffix2',
        to: '/otherPath.html',
      },
    ]);
  });

  it('allows returning string / undefined', () => {
    expect(
      collectRedirects(
        createTestPluginContext(
          {
            createRedirects: (routePath) => {
              if (routePath === '/') {
                return `${routePath}foo`;
              }
              return undefined;
            },
          },
          ['/', '/testPath', '/otherPath.html'],
        ),
        undefined,
      ),
    ).toEqual([{from: '/foo', to: '/'}]);
  });

  it('throws if redirect creator creates invalid redirects', () => {
    expect(() =>
      collectRedirects(
        createTestPluginContext(
          {
            createRedirects: (routePath) => {
              if (routePath === '/') {
                return [
                  `https://google.com/`,
                  `//abc`,
                  `/def?queryString=toto`,
                ];
              }
              return undefined;
            },
          },
          ['/'],
        ),
        undefined,
      ),
    ).toThrowErrorMatchingSnapshot();
  });

  it('throws if redirect creator creates array of array redirect', () => {
    expect(() =>
      collectRedirects(
        createTestPluginContext(
          {
            // @ts-expect-error: for test
            createRedirects(routePath) {
              if (routePath === '/') {
                return [[`/fromPath`]];
              }
              return undefined;
            },
          },
          ['/'],
        ),
        undefined,
      ),
    ).toThrowErrorMatchingSnapshot();
  });

  it('filters unwanted redirects', () => {
    expect(
      collectRedirects(
        createTestPluginContext(
          {
            fromExtensions: ['html', 'exe'],
            toExtensions: ['html', 'exe'],
          },
          [
            '/',
            '/somePath',
            '/somePath.html',
            '/somePath.exe',
            '/fromShouldWork.html',
            '/toShouldWork',
          ],
        ),
        undefined,
      ),
    ).toEqual([
      {
        from: '/toShouldWork.html',
        to: '/toShouldWork',
      },
      {
        from: '/toShouldWork.exe',
        to: '/toShouldWork',
      },
      {
        from: '/fromShouldWork',
        to: '/fromShouldWork.html',
      },
    ]);
  });

  it('throws when creating duplicate redirect routes and onDuplicateRoutes=throw', () => {
    expect(() =>
      collectRedirects(
        createTestPluginContext(
          {
            createRedirects() {
              return '/random-path';
            },
          },
          ['/path-one', '/path-two'],
          {onDuplicateRoutes: 'throw'},
        ),
        undefined,
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: @docusaurus/plugin-client-redirects: multiple redirects are created with the same "from" pathname: "/random-path"
      It is not possible to redirect the same pathname to multiple destinations:
      - {"from":"/random-path","to":"/path-one"}
      - {"from":"/random-path","to":"/path-two"}]
    `);
    expect(() =>
      collectRedirects(
        createTestPluginContext(
          {
            redirects: [
              {from: '/path-three', to: '/path-one'},
              {from: '/path-two', to: '/path-one'},
            ],
          },
          ['/path-one', '/path-two'],
          {onDuplicateRoutes: 'throw'},
        ),
        undefined,
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: @docusaurus/plugin-client-redirects: some redirects would override existing paths, and will be ignored:
      - {"from":"/path-two","to":"/path-one"}]
    `);
  });
});
