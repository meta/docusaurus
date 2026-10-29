/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  execSync,
  type ExecSyncOptionsWithStringEncoding,
} from 'node:child_process';
import logger from '@docusaurus/logger';
import detect from 'detect-port';
import {DEFAULT_PORT} from '@docusaurus/utils';
import prompts from 'prompts';

const execOptions: ExecSyncOptionsWithStringEncoding = {
  encoding: 'utf8',
  stdio: [/* stdin */ 'pipe', /* stdout */ 'pipe', /* stderr */ 'ignore'],
};

function clearConsole(): void {
  process.stdout.write(
    process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H',
  );
}

function getProcessForPort(port: number): string | null {
  try {
    const processId = execSync(
      `lsof -i:${port} -P -t -sTCP:LISTEN`,
      execOptions,
    )
      .split('\n')[0]!
      .trim();
    const directory = execSync(
      `lsof -p ${processId} | awk '$4=="cwd" {for (i=9; i<=NF; i++) printf "%s ", $i}'`,
      execOptions,
    ).trim();
    const command = execSync(
      `ps -o command -p ${processId} | sed -n 2p`,
      execOptions,
    ).replace(/\n$/, '');
    return logger.interpolate`code=${command} subdue=${`(pid ${processId})`} in path=${directory}`;
  } catch {
    return null;
  }
}

/**
 * Detects if program is running on port, and prompts user to choose another if
 * port is already being used. This feature was heavily inspired by
 * create-react-app and uses many of the same utility functions to implement it.
 */
async function choosePort(
  host: string,
  defaultPort: number,
): Promise<number | null> {
  try {
    const port = await detect({
      port: defaultPort,
      ...(host !== 'localhost' && {hostname: host}),
    });
    if (port === defaultPort) {
      return port;
    }
    const isRoot = process.getuid?.() === 0;
    const isInteractive = process.stdout.isTTY;
    const message =
      process.platform !== 'win32' && defaultPort < 1024 && !isRoot
        ? `Admin permissions are required to run a server on a port below 1024.`
        : `Something is already running on port ${defaultPort}.`;
    if (!isInteractive) {
      logger.error(message);
      return null;
    }
    clearConsole();
    const existingProcess = getProcessForPort(defaultPort);
    const {shouldChangePort} = (await prompts({
      type: 'confirm',
      name: 'shouldChangePort',
      message: logger.yellow(`${logger.bold('[WARNING]')} ${message}${
        existingProcess ? ` Probably:\n  ${existingProcess}` : ''
      }

Would you like to run the app on another port instead?`),
      initial: true,
    })) as {shouldChangePort: boolean};
    return shouldChangePort ? port : null;
  } catch (err) {
    throw new Error(
      logger.interpolate`Could not find an open port at ${host}.`,
      {cause: err},
    );
  }
}

export type HostPortOptions = {
  host?: string;
  port?: string;
};

export async function getHostPort(options: HostPortOptions): Promise<{
  host: string;
  port: number | null;
}> {
  const host = options.host ?? 'localhost';
  const basePort = options.port ? parseInt(options.port, 10) : DEFAULT_PORT;
  const port = await choosePort(host, basePort);
  return {host, port};
}
