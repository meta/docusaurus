/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import logger from '../index';

describe('logger', () => {
  // Force chalk to ANSI level 3 in tests, so output is colored in snapshots
  beforeAll(() => {
    vi.stubEnv('FORCE_COLOR', '3');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  describe('formatters', () => {
    it('path', () => {
      expect(logger.path('keepAnsi')).toMatchInlineSnapshot(
        `"<cyan><underline>"keepAnsi"</underline></color>"`,
      );
    });
    it('url', () => {
      expect(
        logger.url('https://docusaurus.io/keepAnsi'),
      ).toMatchInlineSnapshot(
        `"<cyan><underline>https://docusaurus.io/keepAnsi</underline></color>"`,
      );
    });
    it('id', () => {
      expect(logger.name('keepAnsi')).toMatchInlineSnapshot(
        `"<blue><bold>keepAnsi</intensity></color>"`,
      );
    });
    it('code', () => {
      expect(logger.code('keepAnsi')).toMatchInlineSnapshot(
        `"<cyan>\`keepAnsi\`</color>"`,
      );
    });
    it('subdue', () => {
      expect(logger.subdue('keepAnsi')).toMatchInlineSnapshot(
        `"<gray>keepAnsi</color>"`,
      );
    });
  });

  describe('interpolate', () => {
    it('formats text with variables & arrays', () => {
      const name = 'Josh';
      const items = [1, 'hi', 'Hmmm'];
      expect(
        logger.interpolate`(keepAnsi) Hello ${name}! Here are your goodies:${items}`,
      ).toMatchInlineSnapshot(`
      "(keepAnsi) Hello Josh! Here are your goodies:
      - 1
      - hi
      - Hmmm"
    `);
    });
    it('recognizes valid flags', () => {
      expect(
        logger.interpolate`(keepAnsi) The package at path=${'packages/docusaurus'} has number=${10} files. name=${'Babel'} is exported here subdue=${'(as a preset)'} that you can with code=${"require.resolve('@docusaurus/core/lib/babel/preset')"}`,
      ).toMatchInlineSnapshot(
        `"(keepAnsi) The package at <cyan><underline>"packages/docusaurus"</underline></color> has <yellow>10</color> files. <blue><bold>Babel</intensity></color> is exported here <gray>(as a preset)</color> that you can with <cyan>\`require.resolve('@docusaurus/core/lib/babel/preset')\`</color>"`,
      );
    });
    it('interpolates arrays with flags', () => {
      expect(
        logger.interpolate`(keepAnsi) The following commands are available:code=${[
          'docusaurus start',
          'docusaurus build',
          'docusaurus deploy',
        ]}`,
      ).toMatchInlineSnapshot(`
      "(keepAnsi) The following commands are available:
      - <cyan>\`docusaurus start\`</color>
      - <cyan>\`docusaurus build\`</color>
      - <cyan>\`docusaurus deploy\`</color>"
    `);
    });
    it('prints detached flags as-is', () => {
      expect(
        logger.interpolate`(keepAnsi) You can use placeholders like code= ${'and it will'} be replaced with the succeeding arguments`,
      ).toMatchInlineSnapshot(
        `"(keepAnsi) You can use placeholders like code= and it will be replaced with the succeeding arguments"`,
      );
    });
    it('throws with bad flags', () => {
      expect(
        () =>
          logger.interpolate`(keepAnsi) I mistyped this: cde=${'this code'} and I will be damned`,
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Bad Docusaurus logging message. This is likely an internal bug, please report it.]`,
      );
    });
  });

  describe('info', () => {
    it('prints objects', () => {
      using info = vi.spyOn(console, 'info');
      logger.info({a: 1});
      logger.info(undefined);
      logger.info([1, 2, 3]);
      logger.info(new Date(2021, 10, 13));
      expect(info.mock.calls).toMatchSnapshot();
    });
  });

  describe('warn', () => {
    it('prints objects', () => {
      using warn = vi.spyOn(console, 'warn');
      logger.warn({a: 1});
      logger.warn(undefined);
      logger.warn([1, 2, 3]);
      logger.warn(new Date(2021, 10, 13));
      expect(warn.mock.calls).toMatchSnapshot();
    });
  });

  describe('error', () => {
    it('prints objects', () => {
      using error = vi.spyOn(console, 'error');
      logger.error({a: 1});
      logger.error(undefined);
      logger.error([1, 2, 3]);
      logger.error(new Date(2021, 10, 13));
      expect(error.mock.calls).toMatchSnapshot();
    });
  });

  describe('success', () => {
    it('prints objects', () => {
      using log = vi.spyOn(console, 'log');
      logger.success({a: 1});
      logger.success(undefined);
      logger.success([1, 2, 3]);
      logger.success(new Date(2021, 10, 13));
      expect(log.mock.calls).toMatchSnapshot();
    });
  });

  describe('report', () => {
    it('works with all severities', () => {
      using log = vi.spyOn(console, 'info');
      using warn = vi.spyOn(console, 'warn');
      logger.report('ignore')('hey');
      logger.report('log')('hey');
      logger.report('warn')('hey');
      expect(() =>
        logger.report('throw')('hey'),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: hey]`);
      expect(() =>
        // @ts-expect-error: for test
        logger.report('foo')('hey'),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Unexpected "reportingSeverity" value: foo.]`,
      );
      expect(log).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[INFO\].* hey/),
      );
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(
        expect.stringMatching(/.*\[WARNING\].* hey/),
      );
    });
  });
});
