/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import stylelint from 'stylelint';
import plugin from '../index';

// createPlugin() returns a union type, our plugin is not wrapped in "default"
const {ruleName} = plugin as Extract<typeof plugin, {ruleName: string}>;

type TestSuite = {
  ruleName: string;
  fix: boolean;
  accept: TestCase[];
  reject: TestCase[];
};

type TestCase = {
  code: string;
  description?: string;
  fixed?: string;
  message?: string;
  line?: number;
  column?: number;
};

function getOutputCss(output: stylelint.LinterResult) {
  const result = output.results[0]!._postcssResult!;
  return result.root.toString(result.opts!.syntax);
}

function testStylelintRule(config: stylelint.Config, tests: TestSuite) {
  describe(`${tests.ruleName}`, () => {
    const checkTestCaseContent = (testCase: TestCase) =>
      testCase.description ?? testCase.code;

    describe('accept cases', () => {
      tests.accept.forEach((testCase) => {
        it(`${checkTestCaseContent(testCase)}`, async () => {
          const options: stylelint.LinterOptions = {
            code: testCase.code,
            config,
          };

          const output = await stylelint.lint(options);
          expect(output.results[0]!.warnings).toEqual([]);
          if (!tests.fix) {
            return;
          }
          const fixedOutput = await stylelint.lint({...options, fix: true});
          const fixedCode = getOutputCss(fixedOutput);
          expect(fixedCode).toBe(testCase.code);
        });
      });
    });

    describe('reject cases', () => {
      tests.reject.forEach((testCase) => {
        it(`${checkTestCaseContent(testCase)}`, async () => {
          const options = {
            code: testCase.code,
            config,
          };

          const output = await stylelint.lint(options);
          const {warnings} = output.results[0]!;
          const warning = warnings[0]!;
          expect(warnings.length).toBeGreaterThanOrEqual(1);
          expect(testCase.message).not.toBeNull();
          if (testCase.message != null) {
            // eslint-disable-next-line vitest/no-conditional-expect
            expect(warning.text).toBe(testCase.message);
          }
          if (testCase.line != null) {
            // eslint-disable-next-line vitest/no-conditional-expect
            expect(warning.line).toBe(testCase.line);
          }
          if (testCase.column != null) {
            // eslint-disable-next-line vitest/no-conditional-expect
            expect(warning.column).toBe(testCase.column);
          }
          if (!tests.fix) {
            return;
          }
          if (!testCase.fixed) {
            throw new Error(
              'If using { fix: true } in test tests, all reject cases must have { fixed: .. }',
            );
          }
          const fixedOutput = await stylelint.lint({...options, fix: true});
          const fixedCode = getOutputCss(fixedOutput);
          expect(fixedCode).toBe(testCase.fixed);
        });
      });
    });
  });
}

testStylelintRule(
  {
    plugins: [path.join(__dirname, '../../lib/index.js')],
    rules: {
      [ruleName]: [true, {header: '*\n * Copyright'}],
    },
  },
  {
    ruleName,
    fix: true,
    accept: [
      {
        code: `
/**
 * Copyright
 */
.foo {}`,
      },
      {
        code: `/**
 * Copyright
 */

.foo {}`,
      },
      {
        code: `/**
 * Copyright
 */
.foo {}`,
      },
    ],
    reject: [
      {
        code: `.foo {}`,
        fixed: `/**
 * Copyright
 */
.foo {}`,
        message:
          'Missing copyright in the header comment (docusaurus/copyright-header)',
        line: 1,
        column: 1,
      },
      {
        code: `
.foo {}`,
        fixed: `/**
 * Copyright
 */
.foo {}`,
        message:
          'Missing copyright in the header comment (docusaurus/copyright-header)',
        line: 1,
        column: 1,
      },
      {
        code: `/**
* Copyright
*/

.foo {}`,
        fixed: `/**
 * Copyright
 */

/**
* Copyright
*/

.foo {}`,
        message:
          'Missing copyright in the header comment (docusaurus/copyright-header)',
        line: 1,
        column: 1,
      },
      {
        code: `/**
 * Copyleft
 */

.foo {}`,
        fixed: `/**
 * Copyright
 */

/**
 * Copyleft
 */

.foo {}`,
        message:
          'Missing copyright in the header comment (docusaurus/copyright-header)',
        line: 1,
        column: 1,
      },
      {
        code: `/**
 * Copyleft
 */

/**
 * Copyright
 */
 .foo {}`,
        fixed: `/**
 * Copyright
 */

/**
 * Copyleft
 */

/**
 * Copyright
 */
 .foo {}`,
        message:
          'Missing copyright in the header comment (docusaurus/copyright-header)',
        line: 1,
        column: 1,
      },
    ],
  },
);
