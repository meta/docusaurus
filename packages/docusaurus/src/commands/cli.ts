/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {logger} from '@docusaurus/logger';
import {Command, Option} from 'commander';
import {DOCUSAURUS_VERSION} from '@docusaurus/utils';

import {build} from './build/build';
import {clear} from './clear';
import {deploy} from './deploy';
import {externalCommand} from './external';
import {serve} from './serve';
import {start} from './start/start';
import {swizzle} from './swizzle';
import {writeHeadingIds, HeadingIdSyntaxes} from './writeHeadingIds';
import {writeTranslations} from './writeTranslations';

function concatLocaleOptions(locale: string, locales: string[] = []): string[] {
  return locales.concat(locale);
}

function isInternalCommand(command: string | undefined) {
  return (
    command &&
    [
      'start',
      'build',
      'swizzle',
      'deploy',
      'serve',
      'clear',
      'write-translations',
      'write-heading-ids',
    ].includes(command)
  );
}

// Something like ['../node','../docusaurus.mjs','<command>',...rest]
type CLIArgs = [string, string, ...string[]];

// TODO: Annoying, we must assume default site dir is '.' because there's
//  no way to know the siteDir/config yet.
//  The individual CLI commands can declare/read siteDir on their own
//  The env variable is an escape hatch
//  See https://github.com/facebook/docusaurus/issues/8903
const DEFAULT_SITE_DIR = process.env.DOCUSAURUS_CLI_SITE_DIR ?? '.';
// Similarly we give an env escape hatch for config
// See https://github.com/facebook/docusaurus/issues/8903
const DEFAULT_CONFIG = process.env.DOCUSAURUS_CLI_CONFIG ?? undefined;

export async function runCLI(cliArgs: CLIArgs): Promise<void> {
  const program = await createCLIProgram({
    cli: new Command(),
    cliArgs,
    siteDir: DEFAULT_SITE_DIR,
    config: DEFAULT_CONFIG,
  });
  await program.parseAsync(cliArgs);
}

export async function createCLIProgram({
  cli,
  cliArgs,
  siteDir,
  config,
}: {
  cli: Command;
  cliArgs: CLIArgs;
  siteDir: string;
  config: string | undefined;
}): Promise<Command> {
  const command = cliArgs[2];

  // Preserve Commander 5 behavior for plugins using extendCli: options remain
  // properties of the command passed to action handlers, and commands may read
  // undeclared positional arguments from command.args. Subcommands created with
  // .command() inherit these settings, including nested plugin commands.
  cli.storeOptionsAsProperties(true).allowExcessArguments(true);

  cli.version(DOCUSAURUS_VERSION).usage('<command> [options]');

  cli
    .command('build [siteDir]')
    .description('Build website.')
    .option(
      '--dev',
      'Builds the website in dev mode, including full React error messages.',
    )
    .option(
      '--out-dir <dir>',
      'the full path for the new output directory, relative to the current workspace (default: build)',
    )
    .option(
      '--config <config>',
      'path to docusaurus config file (default: `[siteDir]/docusaurus.config.js`)',
    )
    .option(
      '-l, --locale <locale...>',
      'build the site in the specified locale(s). Build all known locales otherwise',
      concatLocaleOptions,
    )
    .option(
      '--no-minify',
      'build website without minimizing JS bundles (default: false)',
    )
    .action(build);

  cli
    .command('swizzle [themeName] [componentName] [siteDir]')
    .description(
      'Wraps or ejects the original theme files into website folder for customization.',
    )
    .option(
      '-w, --wrap',
      'Creates a wrapper around the original theme component.\nAllows rendering other components before/after the original theme component.',
    )
    .option(
      '-e, --eject',
      'Ejects the full source code of the original theme component.\nAllows overriding the original component entirely with your own UI and logic.',
    )
    .option(
      '-l, --list',
      'only list the available themes/components without further prompting (default: false)',
    )
    .option(
      '-t, --typescript',
      'copy TypeScript theme files when possible (default: false)',
    )
    .option(
      '-j, --javascript',
      'copy JavaScript theme files when possible (default: false)',
    )
    .option('--danger', 'enable swizzle for unsafe component of themes')
    .option(
      '--config <config>',
      'path to Docusaurus config file (default: `[siteDir]/docusaurus.config.js`)',
    )
    .action(swizzle);

  cli
    .command('deploy [siteDir]')
    .description('Deploy website to GitHub pages.')
    .option(
      '-l, --locale <locale>',
      'deploy the site in the specified locale(s). Deploy all known locales otherwise',
      concatLocaleOptions,
    )
    .option(
      '--out-dir <dir>',
      'the full path for the new output directory, relative to the current workspace (default: build)',
    )
    .option(
      '--config <config>',
      'path to Docusaurus config file (default: `[siteDir]/docusaurus.config.js`)',
    )
    .option(
      '--skip-build',
      'skip building website before deploy it (default: false)',
    )
    .option(
      '--target-dir <dir>',
      'path to the target directory to deploy to (default: `.`)',
    )
    .action(deploy);

  function normalizePollValue(value?: string) {
    if (value === undefined || value === '') {
      return false;
    }
    const parsedIntValue = Number.parseInt(value, 10);
    if (!Number.isNaN(parsedIntValue)) {
      return parsedIntValue;
    }
    return value === 'true';
  }

  cli
    .command('start [siteDir]')
    .description('Start the development server.')
    .option('-p, --port <port>', 'use specified port (default: 3000)')
    .option('-h, --host <host>', 'use specified host (default: localhost)')
    .option('-l, --locale <locale>', 'use specified site locale')
    .option(
      '--hot-only',
      'do not fallback to page refresh if hot reload fails (default: false)',
    )
    .option(
      '--config <config>',
      'path to Docusaurus config file (default: `[siteDir]/docusaurus.config.js`)',
    )
    .option('--no-open', 'do not open page in the browser (default: false)')
    .option(
      '--poll [interval]',
      'use polling rather than watching for reload (default: false). Can specify a poll interval in milliseconds',
      normalizePollValue,
    )
    .option(
      '--no-minify',
      'build website without minimizing JS bundles (default: false)',
    )
    .option(
      '--https',
      'serve the dev site over HTTPS using a self-signed cert (default: false). Implied when both --ssl-cert and --ssl-key are provided. Takes precedence over the DOCUSAURUS_HTTPS env var.',
    )
    .option(
      '--ssl-cert <path>',
      'path to a TLS certificate file (implies HTTPS). Takes precedence over the DOCUSAURUS_SSL_CRT_FILE env var.',
    )
    .option(
      '--ssl-key <path>',
      'path to a TLS private key file (implies HTTPS). Takes precedence over the DOCUSAURUS_SSL_KEY_FILE env var.',
    )
    .action(start);

  cli
    .command('serve [siteDir]')
    .description('Serve website locally.')
    .option(
      '--dir <dir>',
      'the full path for the new output directory, relative to the current workspace (default: build)',
    )
    .option(
      '--config <config>',
      'path to Docusaurus config file (default: `[siteDir]/docusaurus.config.js`)',
    )
    .option('-p, --port <port>', 'use specified port (default: 3000)')
    .option('--build', 'build website before serving (default: false)')
    .option('-h, --host <host>', 'use specified host (default: localhost)')
    .option(
      '--no-open',
      'do not open page in the browser (default: false, or true in CI)',
    )
    .action(serve);

  cli
    .command('clear [siteDir]')
    .description('Remove build artifacts.')
    .action(clear);

  cli
    .command('write-translations [siteDir]')
    .description('Extract required translations of your site.')
    .option(
      '-l, --locale <locale>',
      'the locale folder to write the translations.\n"--locale fr" will write translations in the ./i18n/fr folder.',
    )
    .option(
      '--override',
      'By default, we only append missing translation messages to existing translation files. This option allows to override existing translation messages. Make sure to commit or backup your existing translations, as they may be overridden. (default: false)',
    )
    .option(
      '--config <config>',
      'path to Docusaurus config file (default:`[siteDir]/docusaurus.config.js`)',
    )
    .option(
      '--messagePrefix <messagePrefix>',
      'Allows to init new written messages with a given prefix. This might help you to highlight untranslated message by making them stand out in the UI (default: "")',
    )
    .action(writeTranslations);

  cli
    .command('write-heading-ids [siteDir] [files...]')
    .description('Generate heading ids in Markdown content.')
    .addOption(
      new Option(
        '--syntax <syntax>',
        'heading ID syntax: "classic" ({#id}) or "mdx-comment" ({/* #id */}) (default: "classic" for files compiled as CommonMark, "mdx-comment" for files compiled as MDX)',
      ).choices(HeadingIdSyntaxes),
    )
    .option(
      '--migrate',
      'migrate existing heading IDs to the target --syntax, if they are using a different syntax (default: false)',
    )
    .option(
      '--overwrite',
      'overwrite existing heading IDs, re-generate them from the heading text (default: false)',
    )
    .option(
      '--maintain-case',
      "keep the headings' casing, otherwise make all lowercase (default: false)",
    )
    .action(writeHeadingIds);

  cli.arguments('[command]').action((cmd) => {
    cli.outputHelp();
    if (!cmd) {
      throw new Error(logger.interpolate`Missing Docusaurus CLI command.`);
    }
    throw new Error(
      logger.interpolate`Unknown Docusaurus CLI command code=${cmd}`,
    );
  });

  // There is an unrecognized subcommand
  // Let plugins extend the CLI before parsing
  if (!isInternalCommand(command)) {
    await externalCommand({cli, siteDir, config});
  }

  return cli;
}
