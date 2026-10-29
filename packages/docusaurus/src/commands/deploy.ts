/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import os from 'node:os';
import logger from '@docusaurus/logger';
import {execa} from 'execa';
import {hasSSHProtocol, buildSshUrl, buildHttpsUrl} from '@docusaurus/utils';
import {fs, realpath} from '@docusaurus/fs';
import {loadContext, type LoadContextParams} from '../server/site';
import {build} from './build/build';

export type DeployCLIOptions = Pick<LoadContextParams, 'config' | 'outDir'> & {
  locale?: [string, ...string[]];
  skipBuild?: boolean;
  targetDir?: string;
};

// GIT_PASS env variable should not appear in logs
function obfuscateGitPass(str: string) {
  const gitPass = process.env.GIT_PASS;
  return gitPass ? str.replace(gitPass, 'GIT_PASS') : str;
}

const debugMode = !!process.env.DOCUSAURUS_DEPLOY_DEBUG;

// Log executed commands so that user can figure out mistakes on his own
// for example: https://github.com/facebook/docusaurus/issues/3875
async function exec(
  file: string,
  args: string[],
  options?: {log?: boolean; failfast?: boolean},
) {
  const log = options?.log ?? true;
  const failfast = options?.failfast ?? true;
  const cmd = [file, ...args].join(' ');
  try {
    const result = await execa(file, args, {reject: false});
    if (log || debugMode) {
      logger.info`code=${obfuscateGitPass(
        cmd,
      )} subdue=${`code: ${result.exitCode}`}`;
    }
    if (debugMode) {
      console.log(result);
    }
    if (failfast && result.exitCode !== 0) {
      throw new Error(
        `Command returned unexpected exitCode ${result.exitCode}
${result.stderr}`,
      );
    }
    return result;
  } catch (err) {
    throw new Error(
      logger.interpolate`Error while executing command code=${obfuscateGitPass(
        cmd,
      )}
In CWD code=${process.cwd()}`,
      {cause: err},
    );
  }
}

async function hasGit() {
  return (await exec('git', ['--version'], {failfast: false})).exitCode === 0;
}

export async function deploy(
  siteDirParam: string = '.',
  cliOptions: Partial<DeployCLIOptions> = {},
): Promise<void> {
  const siteDir = await realpath(siteDirParam);

  const {outDir, siteConfig, siteConfigPath} = await loadContext({
    siteDir,
    config: cliOptions.config,
    outDir: cliOptions.outDir,
  });

  if (typeof siteConfig.trailingSlash === 'undefined') {
    logger.warn(`When deploying to GitHub Pages, it is better to use an explicit "trailingSlash" site config.
Otherwise, GitHub Pages will add an extra trailing slash to your site urls only on direct-access (not when navigation) with a server redirect.
This behavior can have SEO impacts and create relative link issues.
`);
  }

  logger.info('Deploy command invoked...');
  if (!(await hasGit())) {
    throw new Error('Git not installed or not added to PATH!');
  }

  // Source repo is the repo from where the command is invoked
  const sourceRepoUrl = (
    await exec('git', ['remote', 'get-url', 'origin'], {
      log: false,
    })
  ).stdout.trim();

  // The source branch; defaults to the currently checked out branch
  const sourceBranch =
    process.env.CURRENT_BRANCH ??
    (
      await exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {log: false})
    ).stdout.trim();

  const gitUser = process.env.GIT_USER;

  let useSSH =
    process.env.USE_SSH !== undefined &&
    process.env.USE_SSH.toLowerCase() === 'true';

  if (!gitUser && !useSSH) {
    // If USE_SSH is unspecified: try inferring from repo URL
    if (process.env.USE_SSH === undefined && hasSSHProtocol(sourceRepoUrl)) {
      useSSH = true;
    } else {
      throw new Error(
        'Please set the GIT_USER environment variable, or explicitly specify USE_SSH instead!',
      );
    }
  }

  const organizationName =
    process.env.ORGANIZATION_NAME ?? siteConfig.organizationName;
  if (!organizationName) {
    throw new Error(
      `Missing project organization name. Did you forget to define "organizationName" in ${siteConfigPath}? You may also export it via the ORGANIZATION_NAME environment variable.`,
    );
  }
  logger.info`organizationName: name=${organizationName}`;

  const projectName = process.env.PROJECT_NAME ?? siteConfig.projectName;
  if (!projectName) {
    throw new Error(
      `Missing project name. Did you forget to define "projectName" in ${siteConfigPath}? You may also export it via the PROJECT_NAME environment variable.`,
    );
  }
  logger.info`projectName: name=${projectName}`;

  // github.io indicates organization repos that deploy via default branch. All
  // others use gh-pages (either case can be configured actually, but we can
  // make educated guesses). Organization deploys look like:
  // - Git repo: https://github.com/<organization>/<organization>.github.io
  // - Site url: https://<organization>.github.io
  const isGitHubPagesOrganizationDeploy = projectName.includes('.github.io');
  if (
    isGitHubPagesOrganizationDeploy &&
    !process.env.DEPLOYMENT_BRANCH &&
    !siteConfig.deploymentBranch
  ) {
    throw new Error(`For GitHub pages organization deployments, 'docusaurus deploy' does not assume anymore that 'master' is your default Git branch.
Please provide the branch name to deploy to as an environment variable, for example DEPLOYMENT_BRANCH=main or DEPLOYMENT_BRANCH=master .
You can also set the deploymentBranch property in docusaurus.config.js .`);
  }

  const deploymentBranch =
    process.env.DEPLOYMENT_BRANCH ?? siteConfig.deploymentBranch ?? 'gh-pages';
  logger.info`deploymentBranch: name=${deploymentBranch}`;

  const githubHost =
    process.env.GITHUB_HOST ?? siteConfig.githubHost ?? 'github.com';
  const githubPort = process.env.GITHUB_PORT ?? siteConfig.githubPort;

  let deploymentRepoURL: string;
  if (useSSH) {
    deploymentRepoURL = buildSshUrl(
      githubHost,
      organizationName,
      projectName,
      githubPort,
    );
  } else {
    const gitPass = process.env.GIT_PASS;
    const gitCredentials = gitPass ? `${gitUser!}:${gitPass}` : gitUser!;
    deploymentRepoURL = buildHttpsUrl(
      gitCredentials,
      githubHost,
      organizationName,
      projectName,
      githubPort,
    );
  }

  logger.info`Remote repo URL: name=${obfuscateGitPass(deploymentRepoURL)}`;

  // Check if this is a cross-repo publish.
  const crossRepoPublish = !sourceRepoUrl.endsWith(
    `${organizationName}/${projectName}.git`,
  );

  // We don't allow deploying to the same branch unless it's a cross publish.
  if (sourceBranch === deploymentBranch && !crossRepoPublish) {
    throw new Error(
      `You cannot deploy from this branch (${sourceBranch}).` +
        '\nYou will need to checkout to a different branch!',
    );
  }

  // Save the commit hash that triggers publish-gh-pages before checking
  // out to deployment branch.
  const currentCommit = (
    await exec('git', ['rev-parse', 'HEAD'])
  ).stdout.trim();

  const runDeploy = async (outputDirectory: string) => {
    const targetDirectory = cliOptions.targetDir ?? '.';
    const fromPath = outputDirectory;
    const toPath = await fs.mkdtemp(
      path.join(os.tmpdir(), `${projectName}-${deploymentBranch}`),
    );
    process.chdir(toPath);

    // Clones the repo into the temp folder and checks out the target branch.
    // If the branch doesn't exist, it creates a new one based on the
    // repository default branch.
    const cloneResult = await exec(
      'git',
      [
        'clone',
        '--depth',
        '1',
        '--branch',
        deploymentBranch,
        deploymentRepoURL,
        toPath,
      ],
      {failfast: false},
    );
    if (cloneResult.exitCode !== 0) {
      await exec('git', ['clone', '--depth', '1', deploymentRepoURL, toPath]);
      await exec('git', ['checkout', '-b', deploymentBranch]);
    }

    // Clear out any existing contents in the target directory
    await exec('git', ['rm', '-rf', targetDirectory], {log: false});

    const targetPath = path.join(toPath, targetDirectory);
    try {
      // verbatimSymlinks: keep relative symlinks relative
      await fs.cp(fromPath, targetPath, {
        recursive: true,
        verbatimSymlinks: true,
      });
    } catch (err) {
      throw new Error(
        `Failed to copy build assets from path=${fromPath} to path=${targetPath}.`,
        {cause: err},
      );
    }
    await exec('git', ['add', '--all']);

    const gitUserName = process.env.GIT_USER_NAME;
    if (gitUserName) {
      await exec('git', ['config', 'user.name', gitUserName]);
    }

    const gitUserEmail = process.env.GIT_USER_EMAIL;
    if (gitUserEmail) {
      await exec('git', ['config', 'user.email', gitUserEmail]);
    }

    const commitMessage =
      process.env.CUSTOM_COMMIT_MESSAGE ??
      `Deploy website - based on ${currentCommit}`;
    // The commit might return a non-zero value when site is up to date.
    const commitResults = await exec(
      'git',
      ['commit', '-m', commitMessage, '--allow-empty'],
      {failfast: false},
    );
    const pushResult = await exec(
      'git',
      ['push', '--force', 'origin', deploymentBranch],
      {failfast: false},
    );
    if (pushResult.exitCode !== 0) {
      throw new Error(
        'Running "git push" command failed. Does the GitHub user account you are using have push access to the repository?',
      );
    } else if (commitResults.exitCode === 0) {
      let websiteURL;
      if (githubHost === 'github.com') {
        websiteURL = projectName.includes('.github.io')
          ? `https://${organizationName}.github.io/`
          : `https://${organizationName}.github.io/${projectName}/`;
      } else {
        // GitHub enterprise hosting.
        websiteURL = `https://${githubHost}/pages/${organizationName}/${projectName}/`;
      }
      logger.success`Website is live at url=${websiteURL}.`;
      process.exit(0);
    }
  };

  if (!cliOptions.skipBuild) {
    // Build site, then push to deploymentBranch branch of specified repo.
    try {
      await build(siteDir, cliOptions);
      await runDeploy(outDir);
    } catch (err) {
      logger.error('Deployment of the build output failed.');
      throw err;
    }
  } else {
    // Push current build to deploymentBranch branch of specified repo.
    await runDeploy(outDir);
  }
}
