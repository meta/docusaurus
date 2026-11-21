/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {fileURLToPath} from 'node:url';
import path from 'node:path';

// KEEP DEPENDENCY SMALL HERE!
// create-docusaurus CLI should be as lightweight as possible

// TODO try to remove these third-party dependencies if possible
import {logger} from '@docusaurus/logger';
import {askInput, askSelect, type PromptChoice} from '@docusaurus/prompts';
import {fs, pathExists} from '@docusaurus/fs';
import {
  LockfileNames,
  PackageManagers,
  DefaultPackageManager,
  GitCloneStrategies,
  type PackageManager,
  type GitCloneStrategy,
  type Source,
  type Template,
} from './constants.js';
import {
  getAvailablePackageManagers,
  runGitCloneCommand,
  runPackageManagerInstallCommand,
} from './commands.js';
import {
  siteNameToPackageName,
  updatePkg,
  printPackageManagerHelp,
} from './utils.js';
import {askPreferredLanguage} from './prompts.js';

type LanguagesOptions = {
  javascript?: boolean;
  typescript?: boolean;
};

type CLIOptions = LanguagesOptions & {
  packageManager?: PackageManager;
  skipInstall?: boolean;
  gitStrategy?: GitCloneStrategy;
};

async function getLanguage(options: LanguagesOptions) {
  if (options.typescript) {
    return 'typescript';
  }
  if (options.javascript) {
    return 'javascript';
  }
  return askPreferredLanguage();
}

async function findPackageManagerFromLockFile(
  rootDir: string,
): Promise<PackageManager | undefined> {
  for (const packageManager of PackageManagers) {
    for (const lockFileName of LockfileNames[packageManager]) {
      if (await pathExists(path.join(rootDir, lockFileName))) {
        return packageManager;
      }
    }
  }
  return undefined;
}

function findPackageManagerFromUserAgent(): PackageManager | undefined {
  return PackageManagers.find((packageManager) =>
    process.env.npm_config_user_agent?.startsWith(packageManager),
  );
}

async function askForPackageManagerChoice(): Promise<PackageManager> {
  const packageManagers = await getAvailablePackageManagers();
  if (packageManagers.length === 0) {
    logger.warn`No package maintainer available? Trying with name=${DefaultPackageManager}`;
    return DefaultPackageManager;
  }
  if (packageManagers.length === 1) {
    return packageManagers[0]!;
  }

  const choices = packageManagers.map((p) => ({name: p, value: p}));
  return askSelect<PackageManager>({
    message: 'Select a package manager...',
    choices,
    answerHint: 'the --package-manager option',
  });
}

async function getPackageManager(
  dest: string,
  {packageManager, skipInstall}: CLIOptions,
): Promise<PackageManager> {
  if (packageManager && !PackageManagers.includes(packageManager)) {
    throw new Error(
      `Invalid package manager choice ${packageManager}. Must be one of ${PackageManagers.join(
        ', ',
      )}`,
    );
  }

  return (
    // If dest already contains a lockfile (e.g. if using a local template), we
    // always use that instead
    (await findPackageManagerFromLockFile(dest)) ??
    packageManager ??
    (await findPackageManagerFromLockFile('.')) ??
    findPackageManagerFromUserAgent() ??
    // This only happens if the user has a global installation in PATH
    (skipInstall ? DefaultPackageManager : await askForPackageManagerChoice())
  );
}

const recommendedTemplate = 'classic';
const typeScriptTemplateSuffix = '-typescript';
const templatesDir = fileURLToPath(new URL('../templates', import.meta.url));

async function readTemplates(): Promise<Template[]> {
  const dirContents = await fs.readdir(templatesDir);
  const templates = await Promise.all(
    dirContents
      .filter(
        (d) =>
          !d.startsWith('.') &&
          !d.startsWith('README') &&
          !d.endsWith(typeScriptTemplateSuffix) &&
          d !== 'shared',
      )
      .map(async (name) => {
        const tsVariantPath = path.join(
          templatesDir,
          `${name}${typeScriptTemplateSuffix}`,
        );
        return {
          name,
          path: path.join(templatesDir, name),
          tsVariantPath: (await pathExists(tsVariantPath))
            ? tsVariantPath
            : undefined,
        };
      }),
  );

  // Classic should be first in list!
  return templates.sort((a, b) => {
    if (a.name === recommendedTemplate) {
      return -1;
    }
    if (b.name === recommendedTemplate) {
      return 1;
    }
    return 0;
  });
}

async function copyTemplate(
  template: Template,
  dest: string,
  language: 'javascript' | 'typescript',
): Promise<void> {
  await fs.cp(path.join(templatesDir, 'shared'), dest, {
    recursive: true,
  });

  const sourcePath =
    language === 'typescript' ? template.tsVariantPath! : template.path;

  await fs.cp(sourcePath, dest, {
    recursive: true,
    // Symlinks don't exist in published npm packages anymore, so this is only
    // to prevent errors during local testing
    filter: async (filePath) => !(await fs.lstat(filePath)).isSymbolicLink(),
  });
}

type TemplateChoice = Template | 'Git repository' | 'Local template';

function createTemplateChoices(
  templates: Template[],
): PromptChoice<TemplateChoice>[] {
  function makeNameAndValueChoice<Value extends string | Template>(
    value: Value,
  ): PromptChoice<Value> {
    if (typeof value === 'string') {
      return {name: value, value};
    }
    const name =
      value.name === recommendedTemplate
        ? `${value.name} (recommended)`
        : value.name;
    return {name, value};
  }

  return [
    ...templates.map((template) => makeNameAndValueChoice(template)),
    makeNameAndValueChoice('Git repository'),
    makeNameAndValueChoice('Local template'),
  ];
}

async function askTemplateChoice({
  templates,
  cliOptions,
}: {
  templates: Template[];
  cliOptions: CLIOptions;
}): Promise<TemplateChoice> {
  return cliOptions.gitStrategy
    ? 'Git repository'
    : await askSelect<TemplateChoice>({
        message: 'Select a template below...',
        choices: createTemplateChoices(templates),
        answerHint: 'the [template] argument',
      });
}

function isValidGitRepoUrl(gitRepoUrl: string): boolean {
  return ['https://', 'git@'].some((item) => gitRepoUrl.startsWith(item));
}

async function getSiteName(
  reqName: string | undefined,
  rootDir: string,
): Promise<string> {
  async function validateSiteName(siteName: string) {
    if (!siteName) {
      return 'A website name is required.';
    }
    const dest = path.resolve(rootDir, siteName);
    if (siteName === '.' && (await fs.readdir(dest)).length > 0) {
      return logger.interpolate`Directory not empty at path=${dest}!`;
    }
    if (siteName !== '.' && (await pathExists(dest))) {
      return logger.interpolate`Directory already exists at path=${dest}!`;
    }
    return true;
  }
  if (reqName) {
    const res = await validateSiteName(reqName);
    if (typeof res === 'string') {
      throw new Error(res);
    }
    return reqName;
  }
  return askInput({
    message: 'What should we name this site?',
    initial: 'website',
    validate: validateSiteName,
    answerHint: 'the [siteName] argument',
  });
}

async function createTemplateSource({
  template,
  cliOptions,
}: {
  template: Template;
  cliOptions: CLIOptions;
}): Promise<Source> {
  const language = await getLanguage(cliOptions);
  if (language === 'typescript' && !template.tsVariantPath) {
    logger.error`Template name=${template.name} doesn't provide a TypeScript variant.`;
    process.exit(1);
  }
  return {
    type: 'template',
    template,
    language,
  };
}

async function getTemplateSource({
  templateName,
  templates,
  cliOptions,
}: {
  templateName: string;
  templates: Template[];
  cliOptions: CLIOptions;
}): Promise<Source> {
  const template = templates.find((t) => t.name === templateName);
  if (!template) {
    logger.error('Invalid template.');
    process.exit(1);
  }
  return createTemplateSource({template, cliOptions});
}

// Get the template source explicitly requested by the user provided cli option
async function getUserProvidedSource({
  reqTemplate,
  templates,
  cliOptions,
}: {
  reqTemplate: string;
  templates: Template[];
  cliOptions: CLIOptions;
}): Promise<Source> {
  if (isValidGitRepoUrl(reqTemplate)) {
    if (
      cliOptions.gitStrategy &&
      !GitCloneStrategies.includes(cliOptions.gitStrategy)
    ) {
      logger.error`Invalid git strategy: name=${
        cliOptions.gitStrategy
      }. Value must be one of ${GitCloneStrategies.join(', ')}.`;
      process.exit(1);
    }
    return {
      type: 'git',
      url: reqTemplate,
      strategy: cliOptions.gitStrategy ?? 'deep',
    };
  }
  if (await pathExists(path.resolve(reqTemplate))) {
    return {
      type: 'local',
      path: path.resolve(reqTemplate),
    };
  }
  return getTemplateSource({
    templateName: reqTemplate,
    templates,
    cliOptions,
  });
}

async function askGitRepositorySource({
  cliOptions,
}: {
  cliOptions: CLIOptions;
}): Promise<Source> {
  const gitRepoUrl = await askInput({
    validate: (url?: string) => {
      if (url && isValidGitRepoUrl(url)) {
        return true;
      }
      return logger.red('Invalid repository URL');
    },
    message: logger.interpolate`Enter a repository URL from GitHub, Bitbucket, GitLab, or any other public repo.
(e.g: url=${'https://github.com/ownerName/repoName.git'})`,
    answerHint: 'the [template] argument',
  });
  let strategy = cliOptions.gitStrategy;
  if (!strategy) {
    strategy = await askSelect<GitCloneStrategy>({
      message: 'How should we clone this repo?',
      choices: [
        {name: 'Deep clone: preserve full history', value: 'deep'},
        {name: 'Shallow clone: clone with --depth=1', value: 'shallow'},
        {
          name: 'Copy: do a shallow clone, but do not create a git repo',
          value: 'copy',
        },
        {
          name: 'Custom: enter your custom git clone command',
          value: 'custom',
        },
      ],
      answerHint: 'the --git-strategy option',
    });
  }
  return {
    type: 'git',
    url: gitRepoUrl,
    strategy: strategy ?? 'deep',
  };
}

async function askLocalSource(): Promise<Source> {
  const templateDir = await askInput({
    validate: async (dir?: string) => {
      if (dir) {
        const fullDir = path.resolve(dir);
        if (await pathExists(fullDir)) {
          return true;
        }
        return logger.red(logger.interpolate`path=${fullDir} does not exist.`);
      }
      return logger.red('Please enter a valid path.');
    },
    message:
      'Enter a local folder path, relative to the current working directory.',
    answerHint: 'the [template] argument',
  });
  return {
    type: 'local',
    path: templateDir,
  };
}

async function getSource(
  reqTemplate: string | undefined,
  templates: Template[],
  cliOptions: CLIOptions,
): Promise<Source> {
  if (reqTemplate) {
    return getUserProvidedSource({reqTemplate, templates, cliOptions});
  }

  const template = await askTemplateChoice({templates, cliOptions});
  if (template === 'Git repository') {
    return askGitRepositorySource({cliOptions});
  }
  if (template === 'Local template') {
    return askLocalSource();
  }
  return createTemplateSource({
    template,
    cliOptions,
  });
}

export default async function init(
  rootDir: string,
  reqName?: string,
  reqTemplate?: string,
  cliOptions: CLIOptions = {},
): Promise<void> {
  const [templates, siteName] = await Promise.all([
    readTemplates(),
    getSiteName(reqName, rootDir),
  ]);
  const dest = path.resolve(rootDir, siteName);

  const source = await getSource(reqTemplate, templates, cliOptions);

  logger.info('Creating new Docusaurus project...');

  if (source.type === 'git') {
    if (!(await runGitCloneCommand(source, dest))) {
      logger.error`Cloning Git template failed!`;
      process.exit(1);
    }
    if (source.strategy === 'copy') {
      await fs.rm(path.join(dest, '.git'), {
        force: true,
        recursive: true,
      });
    }
  } else if (source.type === 'template') {
    try {
      await copyTemplate(source.template, dest, source.language);
    } catch (err) {
      throw new Error(
        logger.interpolate`Copying Docusaurus template name=${source.template.name} failed!`,
        {cause: err},
      );
    }
  } else {
    try {
      await fs.cp(source.path, dest, {recursive: true});
    } catch (err) {
      throw new Error(
        logger.interpolate`Copying local template path=${source.path} failed!`,
        {cause: err},
      );
    }
  }

  // Update package.json info.
  try {
    await updatePkg(path.join(dest, 'package.json'), {
      name: siteNameToPackageName(siteName),
      version: '0.0.0',
      private: true,
    });
  } catch (err) {
    throw new Error('Failed to update package.json.', {cause: err});
  }

  // We need to rename the gitignore file to .gitignore
  if (
    !(await pathExists(path.join(dest, '.gitignore'))) &&
    (await pathExists(path.join(dest, 'gitignore')))
  ) {
    await fs.rename(
      path.join(dest, 'gitignore'),
      path.join(dest, '.gitignore'),
    );
  }
  if (await pathExists(path.join(dest, 'gitignore'))) {
    await fs.rm(path.join(dest, 'gitignore'));
  }

  // Display the most elegant way to cd.
  const cdpath = path.relative('.', dest);
  const pkgManager = await getPackageManager(dest, cliOptions);
  if (!cliOptions.skipInstall) {
    process.chdir(dest);
    logger.info`Installing dependencies with name=${pkgManager}...`;
    // ...

    if (!(await runPackageManagerInstallCommand(pkgManager))) {
      logger.error('Dependency installation failed.');
      logger.info`The site directory has already been created, and you can retry by typing:

  code=${`cd ${cdpath}`}
  code=${`${pkgManager} install`}`;
      process.exit(0);
    }
  }

  printPackageManagerHelp({pkgManager, cdpath});
}
