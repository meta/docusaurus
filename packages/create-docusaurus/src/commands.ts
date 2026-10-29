/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// We use cross-spawn instead of spawn because of Windows compatibility issues.
// For example, "yarn" doesn't work on Windows, it requires "yarn.cmd"
import crossSpawn from 'cross-spawn';
import {
  PackageManagers,
  type PackageManager,
  type GitCloneStrategy,
  type Source,
} from './constants.js';
import {askForCustomGitCloneCommand} from './prompts.js';

// This is the same as node's child_process.SpawnOptions type, but extract from
// cross-spawn directly to ensure direct compatibility.
type SpawnOptions = NonNullable<Parameters<typeof crossSpawn>[2]>;

type CommandResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

/**
 * Run a command, similar to execa(cmd,args) but simpler
 * @param command
 * @param args
 * @param options
 * @returns the command exit code and output
 */
export async function runCommand(
  command: string,
  args: string[] = [],
  options: SpawnOptions = {},
): Promise<CommandResult> {
  // This does something similar to execa.command()
  // we split a string command (with optional args) into command+args
  // this way it's compatible with spawn()
  const [realCommand, ...baseArgs] = command.split(' ');
  const allArgs = [...baseArgs, ...args];
  if (!realCommand) {
    throw new Error(`Invalid command: ${command}`);
  }

  return new Promise<CommandResult>((resolve, reject) => {
    const p = crossSpawn(realCommand, allArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    });
    let stdout = '';
    let stderr = '';
    p.stdout?.setEncoding('utf8').on('data', (chunk: string) => {
      stdout += chunk;
    });
    p.stderr?.setEncoding('utf8').on('data', (chunk: string) => {
      stderr += chunk;
    });
    p.on('error', reject);
    p.on('close', (exitCode) =>
      exitCode !== null
        ? resolve({exitCode, stdout, stderr})
        : reject(new Error(`No exit code for command ${command}`)),
    );
  });
}

// Gives the user a hint about why a command failed
function printCommandOutput({stdout, stderr}: CommandResult): void {
  process.stdout.write(stdout);
  process.stderr.write(stderr);
}

async function hasPackageManager(
  packageManager: PackageManager,
): Promise<boolean> {
  const {exitCode} = await runCommand(packageManager, ['--version']);
  return exitCode === 0;
}

export async function getAvailablePackageManagers(): Promise<PackageManager[]> {
  const list = await Promise.all(
    PackageManagers.map(async (name) => {
      return (await hasPackageManager(name)) ? name : null;
    }),
  );
  return list.filter((item) => item !== null);
}

export async function runPackageManagerInstallCommand(
  pkgManager: PackageManager,
): Promise<boolean> {
  const installCommand =
    pkgManager === 'yarn' ? 'yarn' : `${pkgManager} install`;

  // The output is piped, so package managers can't detect color support
  // hasColors() is undefined when stdout is not a TTY
  const forceColor = process.stdout.hasColors?.() ?? false;
  // npm ignores FORCE_COLOR (pnpm 12 ignores --color=always and parses
  // "--color always" as "pnpm add always")
  const colorArgs =
    forceColor && pkgManager === 'npm' ? ['--color=always'] : [];

  const result = await runCommand(installCommand, colorArgs, {
    env: {...process.env, ...(forceColor ? {FORCE_COLOR: '1'} : {})},
  });
  // The install output is noisy: only print it on failure
  if (result.exitCode !== 0) {
    printCommandOutput(result);
  }
  return result.exitCode === 0;
}

async function getGitCloneCommand(
  gitStrategy: GitCloneStrategy,
): Promise<string> {
  switch (gitStrategy) {
    case 'shallow':
    case 'copy':
      return 'git clone --recursive --depth 1';
    case 'custom': {
      return askForCustomGitCloneCommand();
    }
    case 'deep':
    default:
      return 'git clone';
  }
}

export async function runGitCloneCommand(
  source: Source & {type: 'git'},
  dest: string,
): Promise<boolean> {
  const gitCommand = await getGitCloneCommand(source.strategy);
  const result = await runCommand(gitCommand, [source.url, dest]);
  if (result.exitCode !== 0) {
    printCommandOutput(result);
  }
  return result.exitCode === 0;
}
