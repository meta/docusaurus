/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {mkdtempDisposable, realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import dedent from 'dedent';
import {outputFile} from '@docusaurus/fs';
import {loadFreshModule} from '../moduleUtils';

async function createTmpDir() {
  return mkdtempDisposable(
    path.join(await realpath(tmpdir()), 'docusaurus-tmp-'),
  );
}

async function moduleGraphHelpers() {
  const dir = await createTmpDir();

  async function fileHelper(name: string, initialContent?: string) {
    const filePath = path.resolve(dir.path, name);
    if (initialContent) {
      await outputFile(filePath, initialContent);
    }
    return {
      filePath,
      write: (content: string) => outputFile(filePath, content),
      load: (withDefault: boolean) => loadModule(filePath, withDefault),
    };
  }

  return {fileHelper, [Symbol.asyncDispose]: dir[Symbol.asyncDispose]};
}

async function loadModule(modulePath: string, withDefault: boolean) {
  const result = (await loadFreshModule(
    modulePath,
    withDefault ? {default: true} : undefined,
  )) as object;

  // Because Jiti uses an internal proxy for interopDefault
  // Spreading converts the proxy to an object compatible with test matchers
  const obj = {...result};
  // console.log(modulePath, obj);
  return obj;
}

async function loadFixtureModule(
  fixtureName: string,
  withDefault: boolean,
): Promise<{default?: unknown; [key: string]: unknown}> {
  return loadModule(
    path.resolve(__dirname, '__fixtures__/moduleUtils', fixtureName),
    withDefault,
  );
}

describe('loadFreshModule', () => {
  describe('can load CJS user module', () => {
    async function testUserFixture(fixtureName: string) {
      const userFixturePath = `user/${fixtureName}`;

      await expect(loadFixtureModule(userFixturePath, true)).resolves.toEqual({
        birthYear: 1986,
        firstName: 'Sebastien',
        lastName: 'Lorber',
      });

      // Note: Jiti 2+ doesn't seem to behave exactly the same as Jiti 1 on our
      // fancy CJS module fixtures mixing "module.exports" + exports.named
      // I doubt this is a problem in practice, but we'll see
      // Maybe we'll drop support for CJS config modules in the future?
      // See https://github.com/facebook/docusaurus/pull/12045
      /*
      await expect(loadFixtureModule(userFixturePath, false)).resolves.toEqual({
        default: {
          birthYear: 1986,
          firstName: 'Sebastien',
          lastName: 'Lorber',
        },
      });
       */
    }

    it('for .cjs.js', async () => {
      await testUserFixture('user.cjs.js');
    });

    it('for .cjs.ts', async () => {
      await testUserFixture('user.cjs.ts');
    });

    it('for .cjs', async () => {
      await testUserFixture('user.cjs');
    });
  });

  describe('can load ESM user module', () => {
    async function testUserFixture(fixtureName: string) {
      const userFixturePath = `user/${fixtureName}`;

      await expect(loadFixtureModule(userFixturePath, true)).resolves.toEqual({
        birthYear: 1986,
        firstName: 'Sebastien',
        lastName: 'Lorber',
      });

      await expect(loadFixtureModule(userFixturePath, false)).resolves.toEqual({
        default: {
          birthYear: 1986,
          firstName: 'Sebastien',
          lastName: 'Lorber',
        },
        someNamedExport: 42,
      });
    }

    it('for .esm.js', async () => {
      await testUserFixture('user.esm.js');
    });

    it('for .esm.ts', async () => {
      await testUserFixture('user.esm.ts');
    });

    it('for .mjs', async () => {
      await testUserFixture('user.mjs');
    });
  });

  describe('module graph', () => {
    it('can load and reload fresh module graph', async () => {
      await using helpers = await moduleGraphHelpers();
      const {fileHelper} = helpers;

      const dependency1 = await fileHelper(
        'dependency1.js',
        /* language=js */
        dedent`
          export const dep1Export = "dep1 val1";

          export default {dep1Val: "dep1 val2"}
        `,
      );

      const dependency2 = await fileHelper(
        'dependency2.ts',
        /* language=ts */
        dedent`
          export const dep2Export = "dep2 val1";

          export default {dep2Val: "dep2 val2"} satisfies {dep2Val: string}
        `,
      );

      const entryFile = await fileHelper(
        'entry.js',
        /* language=js */
        dedent`
        import dependency1 from "./dependency1";
        import * as dependency2 from "./dependency2";

        export default {
          someEntryValue: "entryVal",
          dependency1,
          dependency2
        };
        `,
      );

      // Should be able to read the initial module graph
      await expect(entryFile.load(true)).resolves.toEqual({
        someEntryValue: 'entryVal',
        dependency1: {
          dep1Val: 'dep1 val2',
        },
        dependency2: {
          dep2Export: 'dep2 val1',
          default: {
            dep2Val: 'dep2 val2',
          },
        },
      });
      await expect(entryFile.load(false)).resolves.toEqual({
        default: {
          someEntryValue: 'entryVal',
          dependency1: {
            // dep1Export: 'dep1 val1', // Expected: not using "* as"
            dep1Val: 'dep1 val2',
          },
          dependency2: {
            dep2Export: 'dep2 val1',

            default: {
              dep2Val: 'dep2 val2',
            },
          },
        },
      });

      await expect(dependency1.load(true)).resolves.toEqual({
        dep1Val: 'dep1 val2',
      });

      await expect(dependency1.load(false)).resolves.toEqual({
        dep1Export: 'dep1 val1',
        default: {
          dep1Val: 'dep1 val2',
        },
      });

      await expect(dependency2.load(true)).resolves.toEqual({
        dep2Val: 'dep2 val2',
      });
      await expect(dependency2.load(false)).resolves.toEqual({
        dep2Export: 'dep2 val1',
        default: {
          dep2Val: 'dep2 val2',
        },
      });

      // Should be able to read the module graph again after updates
      await dependency1.write(
        /* language=js */
        dedent`
          export const dep1Export = "dep1 val1 updated";

          export default {dep1Val: "dep1 val2 updated"}
        `,
      );

      await expect(entryFile.load(true)).resolves.toEqual({
        someEntryValue: 'entryVal',
        dependency1: {
          // dep1Export: 'dep1 val1 updated', // Expected: not using "* as"
          dep1Val: 'dep1 val2 updated',
        },
        dependency2: {
          dep2Export: 'dep2 val1',
          default: {
            dep2Val: 'dep2 val2',
          },
        },
      });
      await expect(entryFile.load(false)).resolves.toEqual({
        default: {
          someEntryValue: 'entryVal',
          dependency1: {
            // dep1Export: 'dep1 val1 updated', // Expected: not using "* as"
            dep1Val: 'dep1 val2 updated',
          },
          dependency2: {
            dep2Export: 'dep2 val1',
            default: {
              dep2Val: 'dep2 val2',
            },
          },
        },
      });

      await expect(dependency1.load(true)).resolves.toEqual({
        dep1Val: 'dep1 val2 updated',
      });
      await expect(dependency1.load(false)).resolves.toEqual({
        dep1Export: 'dep1 val1 updated',
        default: {
          dep1Val: 'dep1 val2 updated',
        },
      });

      await expect(dependency2.load(true)).resolves.toEqual({
        dep2Val: 'dep2 val2',
      });
      await expect(dependency2.load(false)).resolves.toEqual({
        dep2Export: 'dep2 val1',
        default: {
          dep2Val: 'dep2 val2',
        },
      });

      // Should be able to read the module graph again after updates
      await dependency2.write(
        /* language=ts */
        dedent`
          export const dep2Export = "dep2 val1 updated";

          export default {dep2Val: "dep2 val2 updated"} satisfies {dep2Val: string}
        `,
      );

      await expect(entryFile.load(true)).resolves.toEqual({
        someEntryValue: 'entryVal',
        dependency1: {
          // dep1Export: 'dep1 val1 updated', // Expected: not using "* as"
          dep1Val: 'dep1 val2 updated',
        },
        dependency2: {
          dep2Export: 'dep2 val1 updated',
          default: {
            dep2Val: 'dep2 val2 updated',
          },
        },
      });
      await expect(entryFile.load(false)).resolves.toEqual({
        default: {
          someEntryValue: 'entryVal',
          dependency1: {
            // dep1Export: 'dep1 val1 updated', // Expected: not using "* as"
            dep1Val: 'dep1 val2 updated',
          },
          dependency2: {
            dep2Export: 'dep2 val1 updated',
            default: {
              dep2Val: 'dep2 val2 updated',
            },
          },
        },
      });

      await expect(dependency1.load(true)).resolves.toEqual({
        // dep1Export: 'dep1 val1 updated', // Expected: not using "* as"
        dep1Val: 'dep1 val2 updated',
      });
      await expect(dependency1.load(false)).resolves.toEqual({
        dep1Export: 'dep1 val1 updated',
        default: {
          dep1Val: 'dep1 val2 updated',
        },
      });

      await expect(dependency2.load(true)).resolves.toEqual({
        dep2Val: 'dep2 val2 updated',
      });
      await expect(dependency2.load(false)).resolves.toEqual({
        dep2Export: 'dep2 val1 updated',
        default: {
          dep2Val: 'dep2 val2 updated',
        },
      });

      // Should be able to read the module graph again after entry updates
      await entryFile.write(
        /* language=js */
        dedent`
        import * as dependency1 from "./dependency1";
        import dependency2 from "./dependency2";

        export default {
          someEntryValue: "entryVal updated",
          dependency1,
          dependency2,
          newAttribute: "is there"
        }
        `,
      );

      await expect(entryFile.load(true)).resolves.toEqual({
        someEntryValue: 'entryVal updated',
        newAttribute: 'is there',
        dependency1: {
          dep1Export: 'dep1 val1 updated',
          default: {
            dep1Val: 'dep1 val2 updated',
          },
        },
        dependency2: {
          dep2Val: 'dep2 val2 updated',
        },
      });
      await expect(entryFile.load(false)).resolves.toEqual({
        default: {
          someEntryValue: 'entryVal updated',
          newAttribute: 'is there',
          dependency1: {
            dep1Export: 'dep1 val1 updated',
            default: {
              dep1Val: 'dep1 val2 updated',
            },
          },
          dependency2: {
            dep2Val: 'dep2 val2 updated',
          },
        },
      });

      await expect(dependency1.load(true)).resolves.toEqual({
        dep1Val: 'dep1 val2 updated',
      });
      await expect(dependency1.load(false)).resolves.toEqual({
        dep1Export: 'dep1 val1 updated',
        default: {
          dep1Val: 'dep1 val2 updated',
        },
      });

      await expect(dependency2.load(true)).resolves.toEqual({
        dep2Val: 'dep2 val2 updated',
      });
      await expect(dependency2.load(false)).resolves.toEqual({
        dep2Export: 'dep2 val1 updated',
        default: {
          dep2Val: 'dep2 val2 updated',
        },
      });
    });
  });

  describe('invalid module path param', () => {
    it('throws if module path does not exist', async () => {
      await expect(() =>
        loadFreshModule('/some/unknown/module/path.js'),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `
        [Error: Docusaurus could not load module at path "/some/unknown/module/path.js"]
        Cause: [Error: Cannot find module '/some/unknown/module/path.js'
        Require stack:
        - <PROJECT_ROOT>/packages/docusaurus-utils/src/moduleUtils.ts]
      `,
      );
    });

    it('throws if module path is undefined', async () => {
      await expect(() =>
        // @ts-expect-error: undefined is invalid
        loadFreshModule(undefined),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid module path of type "undefined" with value "undefined"]`,
      );
    });

    it('throws if module path is null', async () => {
      await expect(() =>
        // @ts-expect-error: null is invalid
        loadFreshModule(null),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid module path of type "object" with value "null"]`,
      );
    });

    it('throws if module path is number', async () => {
      await expect(() =>
        // @ts-expect-error: number is invalid
        loadFreshModule(42),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid module path of type "number" with value "42"]`,
      );
    });

    it('throws if module path is object', async () => {
      await expect(() =>
        // @ts-expect-error: object is invalid
        loadFreshModule({}),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Invalid module path of type "object" with value "[object Object]"]`,
      );
    });
  });
});
