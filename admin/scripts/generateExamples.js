/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-check

import fs from 'node:fs/promises';
import {execa} from 'execa';
import {readJSON} from '@docusaurus/fs';

/**
 * Generate one example per init template
 * We use those generated examples as CodeSandbox projects
 * See https://github.com/facebook/docusaurus/issues/1699
 * @param {string} template
 */
async function generateTemplateExample(template) {
  try {
    console.log(
      `generating ${template} template for codesandbox in the examples folder...`,
    );

    // Run the docusaurus script to create the template in the examples folder
    const isTypeScript = template.endsWith('-typescript');
    const templateName = isTypeScript
      ? template.replace('-typescript', '')
      : template;
    const templateFlag = isTypeScript ? '--typescript' : '--javascript';

    await execa(
      'yarn',
      // We use the published init script on purpose, because the local init is
      // too new and could generate upcoming/unavailable config options.
      // Remember CodeSandbox templates will use the published version,
      // not the repo version.
      // Using "yarn create" because "npm init" still try to use local pkg
      [
        'create',
        'docusaurus',
        `examples/${template}`,
        templateName,
        '--',
        templateFlag,
      ],
      {stdio: 'inherit'},
    );

    const templatePackageJson =
      await /** @type {Promise<import("../../packages/create-docusaurus/templates/classic/package.json") & { scripts: { [name: string]: string }; description: string }>} */ (
        readJSON(`examples/${template}/package.json`)
      );

    // Attach the dev script which would be used in code sandbox by default
    templatePackageJson.scripts.dev = 'docusaurus start';

    // These example projects are not meant to be published to npm
    templatePackageJson.private = true;

    // Make sure package.json name is not "examples-classic". The package.json
    // name appears in CodeSandbox UI so let's display a good name!
    // Unfortunately we can't use uppercase or spaces... See also
    // https://github.com/codesandbox/codesandbox-client/pull/5136#issuecomment-763521662
    templatePackageJson.name =
      template === 'classic' ? 'docusaurus' : `docusaurus-${template}`;
    templatePackageJson.description =
      template === 'classic'
        ? 'Docusaurus example project'
        : `Docusaurus example project (${template} template)`;

    await fs.writeFile(
      `./examples/${template}/package.json`,
      `${JSON.stringify(templatePackageJson, null, 2)}\n`,
    );

    // Create sandbox/stackblitz config file at the root of template
    const codeSandboxConfig = {
      infiniteLoopProtection: true,
      hardReloadOnChange: true,
      view: 'browser',
      template: 'docusaurus',
      node: '24',
      container: {
        node: '24',
      },
    };
    await fs.writeFile(
      `./examples/${template}/sandbox.config.json`,
      `${JSON.stringify(codeSandboxConfig, null, 2)}\n`,
    );

    const stackBlitzConfig = {
      installDependencies: true,
      startCommand: 'npm start',
    };
    await fs.writeFile(
      `./examples/${template}/.stackblitzrc`,
      `${JSON.stringify(stackBlitzConfig, null, 2)}\n`,
    );

    console.log(`Generated example for template ${template}`);
  } catch (err) {
    console.error(`Failed to generated example for template ${template}`);
    throw err;
  }
}

/**
 * Starters are repositories/branches that only contains a newly initialized
 * Docusaurus site. Those are useful for users to inspect (may be more
 * convenient than "examples/classic) Also some tools like Netlify deploy button
 * currently require using the main branch of a dedicated repo.
 * See https://github.com/jamstack/jamstack.org/pull/609
 * Button visible here: https://jamstack.org/generators/
 */
async function updateStarters() {
  /**
   * @param {Object} param0
   * @param {string} param0.subfolder
   * @param {string} param0.remote
   * @param {string} param0.remoteBranch
   */
  async function forcePushGitSubtree({subfolder, remote, remoteBranch}) {
    console.log('');
    // See https://stackoverflow.com/questions/33172857/how-do-i-force-a-subtree-push-to-overwrite-remote-changes
    try {
      console.log(`forcePushGitSubtree: splitting subtree ${subfolder}`);
      const {stdout: splitCommit} = await execa(
        'git',
        ['subtree', 'split', '--prefix', subfolder],
        {stderr: 'inherit'},
      );
      console.log(
        `forcePushGitSubtree: pushing ${splitCommit} to ${remote} ${remoteBranch}`,
      );
      await execa(
        'git',
        ['push', remote, `${splitCommit}:${remoteBranch}`, '--force'],
        {stdio: 'inherit'},
      );
      console.log('forcePushGitSubtree success!');
    } catch (err) {
      console.error(
        `Can't force push to git subtree ${subfolder} on ${remote} ${remoteBranch}`,
      );
      console.error(`If it's a permission problem, ask @slorber`);
      console.error(err);
    }
    console.log('');
  }

  console.log('');

  console.log('Updating https://github.com/facebook/docusaurus/tree/starter');
  await forcePushGitSubtree({
    subfolder: 'examples/classic',
    remote: 'origin',
    remoteBranch: 'starter',
  });

  console.log('');
  console.log('');

  // TODO replace by starter repo in Docusaurus-community org (if we get it)
  console.log('Updating https://github.com/slorber/docusaurus-starter');
  await forcePushGitSubtree({
    subfolder: 'examples/classic',
    remote: 'git@github.com:slorber/docusaurus-starter.git',
    remoteBranch: 'main',
  });

  console.log('');
}

const {stdout: branch} = await execa('git', [
  'rev-parse',
  '--abbrev-ref',
  'HEAD',
]);
if (branch === 'main') {
  throw new Error(
    "Please don't generate Docusaurus examples from the main branch!\nWe are going to commit during this process!",
  );
}
const gitDiffResult = await execa('git', ['diff', '--exit-code'], {
  stdio: 'inherit',
  reject: false,
});
if (gitDiffResult.exitCode !== 0) {
  throw new Error(
    'Please run the generate examples command with a clean Git state and no uncommitted local changes. git diff should display nothing!',
  );
}

console.log(`
# Generate examples start!
`);

// Delete the examples directories if they exist
console.log(`-------
## Removing example folders...
`);
await fs.rm('./examples/classic', {recursive: true, force: true});
await fs.rm('./examples/classic-typescript', {recursive: true, force: true});

// Get the list of all available templates
console.log(`
-------
## Generate example folders...
`);
const excludes = ['README.md', 'shared'];
const templates = (
  await fs.readdir('./packages/create-docusaurus/templates')
).filter((name) => !excludes.includes(name));
console.log(`Will generate examples for templates: ${templates.join(',')}`);
for (const template of templates) {
  await generateTemplateExample(template);
}
console.log('Committing changes');
await execa('git', ['add', 'examples'], {stdio: 'inherit'});
await execa('git', ['commit', '-am', 'update examples', '--allow-empty'], {
  stdio: 'inherit',
});

// Update starters
console.log(`
-------
# Updating starter repos and branches ...
It can take some time... please wait until done...
`);
await updateStarters();

console.log(`
-------
Generate examples end!
Don't forget to push and merge your pull request!
`);
