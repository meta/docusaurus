/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import path from 'node:path';
import {Command} from 'commander';
import {createCLIProgram} from '../cli';
import * as buildCommand from '../build/build';
import * as startCommand from '../start/start';
import * as serveCommand from '../serve';
import * as writeHeadingIdsCommand from '../writeHeadingIds';

const ExitOverrideError = new Error('exitOverride');

async function testCommand(args: string[]) {
  const cliArgs: [string, string, ...string[]] = [
    'node',
    'docusaurus',
    ...args,
  ];
  const siteDir = path.resolve(__dirname, '__fixtures__', 'site');

  let stdout = '';
  let stderr = '';
  const log = vi.spyOn(console, 'log').mockImplementation((msg: string) => {
    stdout += msg;
  });

  const command = new Command().configureOutput({
    writeOut: (str) => {
      stdout += str;
    },
    writeErr: (str) => {
      stderr += str;
    },
  });

  let exit: undefined | {code: string; exitCode: number};
  command.exitOverride((err) => {
    exit = {code: err.code, exitCode: err.exitCode};
    throw ExitOverrideError;
  });

  try {
    const cli = await createCLIProgram({
      cli: command,
      cliArgs,
      siteDir,
      config: undefined,
    });

    await cli.parseAsync(cliArgs);
  } catch (e) {
    if (e !== ExitOverrideError) {
      throw e;
    }
  } finally {
    log.mockRestore();
  }

  return {
    exit,
    stdout,
    stderr,
  };
}

describe('CLI', () => {
  describe('general', () => {
    describe('help', () => {
      it('docusaurus --help', async () => {
        const result = await testCommand(['--help']);

        expect(result).toMatchInlineSnapshot(`
          {
            "exit": {
              "code": "commander.helpDisplayed",
              "exitCode": 0,
            },
            "stderr": "",
            "stdout": "Usage: docusaurus <command> [options]

          Options:
            -V, --version                                            output the version number
            -h, --help                                               display help for command

          Commands:
            build [options] [siteDir]                                Build website.
            swizzle [options] [themeName] [componentName] [siteDir]  Wraps or ejects the original theme files into website folder for customization.
            deploy [options] [siteDir]                               Deploy website to GitHub pages.
            start [options] [siteDir]                                Start the development server.
            serve [options] [siteDir]                                Serve website locally.
            clear [siteDir]                                          Remove build artifacts.
            write-translations [options] [siteDir]                   Extract required translations of your site.
            write-heading-ids [options] [siteDir] [files...]         Generate heading ids in Markdown content.
            cliPlugin:test [options]                                 Run test cli command
          ",
          }
        `);
      });

      it('docusaurus -h', async () => {
        const result = await testCommand(['-h']);

        expect(result).toMatchInlineSnapshot(`
          {
            "exit": {
              "code": "commander.helpDisplayed",
              "exitCode": 0,
            },
            "stderr": "",
            "stdout": "Usage: docusaurus <command> [options]

          Options:
            -V, --version                                            output the version number
            -h, --help                                               display help for command

          Commands:
            build [options] [siteDir]                                Build website.
            swizzle [options] [themeName] [componentName] [siteDir]  Wraps or ejects the original theme files into website folder for customization.
            deploy [options] [siteDir]                               Deploy website to GitHub pages.
            start [options] [siteDir]                                Start the development server.
            serve [options] [siteDir]                                Serve website locally.
            clear [siteDir]                                          Remove build artifacts.
            write-translations [options] [siteDir]                   Extract required translations of your site.
            write-heading-ids [options] [siteDir] [files...]         Generate heading ids in Markdown content.
            cliPlugin:test [options]                                 Run test cli command
          ",
          }
        `);
      });
    });

    describe('version', () => {
      it('docusaurus --version', async () => {
        const result = await testCommand(['--version']);

        expect(result).toMatchInlineSnapshot(`
          {
            "exit": {
              "code": "commander.version",
              "exitCode": 0,
            },
            "stderr": "",
            "stdout": "<CURRENT_VERSION>
          ",
          }
        `);
      });

      it('docusaurus -V', async () => {
        const result = await testCommand(['-V']);

        expect(result).toMatchInlineSnapshot(`
          {
            "exit": {
              "code": "commander.version",
              "exitCode": 0,
            },
            "stderr": "",
            "stdout": "<CURRENT_VERSION>
          ",
          }
        `);
      });
    });

    describe('errors', () => {
      it('docusaurus', async () => {
        await expect(
          testCommand([]),
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `[Error: Missing Docusaurus CLI command.]`,
        );
      });

      it('docusaurus unknown', async () => {
        await expect(
          testCommand(['unknown']),
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `[Error: Unknown Docusaurus CLI command \`unknown\`]`,
        );
      });

      it('docusaurus --unknown', async () => {
        const result = await testCommand(['--unknown']);
        expect(result).toMatchInlineSnapshot(`
          {
            "exit": {
              "code": "commander.unknownOption",
              "exitCode": 1,
            },
            "stderr": "error: unknown option '--unknown'
          ",
            "stdout": "",
          }
        `);
      });
    });
  });

  describe('extendCLI', () => {
    it('preserves legacy action callbacks with default options', async () => {
      const result = await testCommand(['cliPlugin:legacy', 'input', 'extra']);
      expect(result.exit).toBeUndefined();
      expect(result.stderr).toBe('');
      expect(JSON.parse(result.stdout)).toEqual({
        input: 'input',
        label: 'default',
        cache: true,
        options: {label: 'default', cache: true},
        name: 'cliPlugin:legacy',
        args: ['input', 'extra'],
        thisIsCommand: true,
      });
    });

    it('preserves legacy action callbacks with custom options', async () => {
      const result = await testCommand([
        'cliPlugin:legacy',
        'input',
        'extra',
        '--label',
        'custom',
        '--no-cache',
      ]);
      expect(result.exit).toBeUndefined();
      expect(result.stderr).toBe('');
      expect(JSON.parse(result.stdout)).toEqual({
        input: 'input',
        label: 'custom',
        cache: false,
        options: {label: 'custom', cache: false},
        name: 'cliPlugin:legacy',
        args: ['input', 'extra'],
        thisIsCommand: true,
      });
    });

    it('inherits compatibility settings in nested commands', async () => {
      const result = await testCommand([
        'cliPlugin:nested',
        'run',
        '--label',
        'nested',
        'extra',
      ]);
      expect(result.exit).toBeUndefined();
      expect(JSON.parse(result.stdout)).toEqual({
        label: 'nested',
        options: {label: 'nested'},
        args: ['extra'],
        parent: 'cliPlugin:nested',
      });
    });

    it('allows plugins to opt into modern option handling', async () => {
      const result = await testCommand([
        'cliPlugin:modern',
        '--label',
        'modern',
      ]);
      expect(result.exit).toBeUndefined();
      expect(JSON.parse(result.stdout)).toEqual({
        options: {label: 'modern'},
        name: 'cliPlugin:modern',
        separateOptions: true,
      });
    });

    it('allows plugins to reject excess arguments', async () => {
      const result = await testCommand(['cliPlugin:modern', 'extra']);
      expect(result.exit).toEqual({
        code: 'commander.excessArguments',
        exitCode: 1,
      });
    });

    it('docusaurus cliPlugin:test', async () => {
      const result = await testCommand(['cliPlugin:test']);
      expect(result).toMatchInlineSnapshot(`
        {
          "exit": undefined,
          "stderr": "",
          "stdout": "TEST ACTION",
        }
      `);
    });

    it('docusaurus cliPlugin:test --test-option', async () => {
      const result = await testCommand(['cliPlugin:test', '--test-option']);
      expect(result).toMatchInlineSnapshot(`
        {
          "exit": undefined,
          "stderr": "",
          "stdout": "TEST ACTION",
        }
      `);
    });
  });

  describe('internal commands', () => {
    beforeEach(() => {
      vi.spyOn(buildCommand, 'build').mockResolvedValue(undefined);
      vi.spyOn(startCommand, 'start').mockResolvedValue(undefined);
      vi.spyOn(serveCommand, 'serve').mockResolvedValue(undefined);
      vi.spyOn(writeHeadingIdsCommand, 'writeHeadingIds').mockResolvedValue(
        undefined,
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('parses variadic and repeated build locales', async () => {
      await testCommand([
        'build',
        'website',
        '--locale',
        'en',
        'fr',
        '--locale',
        'de',
        '--no-minify',
      ]);
      expect(buildCommand.build).toHaveBeenCalledWith(
        'website',
        expect.objectContaining({locale: ['en', 'fr', 'de'], minify: false}),
        expect.any(Command),
      );
    });

    it('preserves start host, port, polling, and negated options', async () => {
      await testCommand([
        'start',
        'website',
        '-h',
        '0.0.0.0',
        '-p',
        '4000',
        '--poll',
        '500',
        '--no-open',
        '--no-minify',
      ]);
      expect(startCommand.start).toHaveBeenCalledWith(
        'website',
        expect.objectContaining({
          host: '0.0.0.0',
          port: '4000',
          poll: 500,
          open: false,
          minify: false,
        }),
        expect.any(Command),
      );
    });

    it('preserves serve defaults and omitted siteDir', async () => {
      await testCommand(['serve']);
      expect(serveCommand.serve).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({open: true}),
        expect.any(Command),
      );
    });

    it('parses write-heading-ids --syntax', async () => {
      await testCommand([
        'write-heading-ids',
        'website',
        'docs/doc.md',
        '--syntax',
        'mdx-comment',
      ]);
      expect(writeHeadingIdsCommand.writeHeadingIds).toHaveBeenCalledWith(
        'website',
        ['docs/doc.md'],
        expect.objectContaining({syntax: 'mdx-comment'}),
        expect.any(Command),
      );
    });

    it('rejects invalid write-heading-ids --syntax', async () => {
      const result = await testCommand([
        'write-heading-ids',
        '--syntax',
        'unknown',
      ]);
      expect(writeHeadingIdsCommand.writeHeadingIds).not.toHaveBeenCalled();
      expect(result).toMatchInlineSnapshot(`
        {
          "exit": {
            "code": "commander.invalidArgument",
            "exitCode": 1,
          },
          "stderr": "error: option '--syntax <syntax>' argument 'unknown' is invalid. Allowed choices are classic, mdx-comment.
        ",
          "stdout": "",
        }
      `);
    });
  });
});
