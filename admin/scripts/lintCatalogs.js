#!/usr/bin/env node
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Checks the content of the pnpm catalogs of pnpm-workspace.yaml.
// Syncpack checks that dependencies use the catalogs, but it can't compare
// catalog entries with each other, nor with the explicit versions of the
// site templates and pnpm overrides, which can't use catalogs.

import fs from 'node:fs/promises';
import path from 'node:path';
import {load as loadYaml} from 'js-yaml';
import {logger} from '@docusaurus/logger';

const RootDir = path.resolve(import.meta.dirname, '../..');

const RuntimeDependencyTypes = [
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
];
const AllDependencyTypes = [...RuntimeDependencyTypes, 'devDependencies'];

async function main() {
  const monorepo = await loadMonorepo();

  const errors = [
    ...checkUnusedCatalogEntries(monorepo),
    ...checkCatalogsSplit(monorepo),
    ...checkTemplatesMatchCatalogs(monorepo),
    ...checkOverridesMatchCatalogs(monorepo),
    ...checkDependencyGroups(monorepo),
  ];

  if (errors.length > 0) {
    logger.error(`Catalog issues found:\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }
  logger.success('No catalog issues found');
}

// ---------------------------------------------------------------------------
// Loading the monorepo data
// ---------------------------------------------------------------------------

/**
 * @typedef {{[name: string]: string}} Versions
 * @typedef {{filePath: string, manifest: object}} Package
 * @typedef {{name: string, patterns: string[]}} DependencyGroup
 * @typedef {{
 *   catalogs: {default: Versions, dev: Versions},
 *   overrides: Versions,
 *   packages: Package[],
 *   templates: Package[],
 *   dependencyGroups: DependencyGroup[],
 * }} Monorepo
 */

/** @returns {Promise<Monorepo>} */
async function loadMonorepo() {
  const workspace = await readYaml('pnpm-workspace.yaml');
  const dependabot = await readYaml('.github/dependabot.yml');

  return {
    catalogs: {
      default: workspace.catalog ?? {},
      dev: workspace.catalogs?.dev ?? {},
    },
    overrides: workspace.overrides ?? {},
    packages: await loadPackages([
      'package.json',
      ...(await listPackageJsonPaths('packages')),
      'website/package.json',
      'argos/package.json',
      'admin/scripts/package.json',
    ]),
    templates: await loadPackages(
      await listPackageJsonPaths('packages/create-docusaurus/templates'),
    ),
    dependencyGroups: getDependabotNpmGroups(dependabot),
  };
}

function getDependabotNpmGroups(dependabot) {
  const npmUpdate = dependabot.updates.find(
    (update) => update['package-ecosystem'] === 'npm',
  );
  return Object.entries(npmUpdate?.groups ?? {}).map(([name, group]) => ({
    name,
    patterns: group.patterns,
  }));
}

// ---------------------------------------------------------------------------
// Checks: pure functions returning a list of error messages
// ---------------------------------------------------------------------------

/**
 * Catalog entries must be used by at least one package.
 * pnpm removes them automatically with "pnpm remove" (catalogPrune setting),
 * but not when editing a package.json manually.
 * @param {Monorepo} monorepo
 * @returns {string[]}
 */
function checkUnusedCatalogEntries({catalogs, packages}) {
  const usedNames = new Set(
    packages
      .flatMap((pkg) => getDependencies(pkg, AllDependencyTypes))
      .map((dependency) => dependency.name),
  );
  const catalogNames = [
    ...Object.keys(catalogs.default),
    ...Object.keys(catalogs.dev),
  ];
  return catalogNames
    .filter((name) => !usedNames.has(name))
    .map(
      (name) =>
        `pnpm-workspace.yaml: ${name} isn't used by any package, remove it from the catalog`,
    );
}

/**
 * The default catalog contains the dependencies used at runtime by at least
 * one package, the dev catalog contains the dependencies only used as
 * devDependencies.
 * @param {Monorepo} monorepo
 * @returns {string[]}
 */
function checkCatalogsSplit({catalogs, packages}) {
  const allDependencies = packages.flatMap((pkg) =>
    getDependencies(pkg, AllDependencyTypes),
  );

  const devCatalogUsedAtRuntime = allDependencies
    .filter(
      (dependency) =>
        dependency.specifier === 'catalog:dev' &&
        dependency.dependencyType !== 'devDependencies',
    )
    .map(
      (dependency) =>
        `${dependency.filePath}: ${dependency.dependencyType} ${dependency.name} can't use the dev catalog, move it to the default catalog`,
    );

  const usedNames = new Set(
    allDependencies.map((dependency) => dependency.name),
  );
  const runtimeDependencyNames = new Set(
    allDependencies
      .filter((dependency) =>
        RuntimeDependencyTypes.includes(dependency.dependencyType),
      )
      .map((dependency) => dependency.name),
  );
  // Unused entries are reported by checkUnusedCatalogEntries()
  const defaultCatalogOnlyUsedByDevDependencies = Object.keys(catalogs.default)
    .filter((name) => usedNames.has(name) && !runtimeDependencyNames.has(name))
    .map(
      (name) =>
        `pnpm-workspace.yaml: ${name} is only used by devDependencies, move it to the dev catalog`,
    );

  const inBothCatalogs = Object.keys(catalogs.dev)
    .filter((name) => name in catalogs.default)
    .map(
      (name) =>
        `pnpm-workspace.yaml: ${name} is declared in both the default and dev catalogs`,
    );

  return [
    ...devCatalogUsedAtRuntime,
    ...defaultCatalogOnlyUsedByDevDependencies,
    ...inBothCatalogs,
  ];
}

/**
 * The site templates are copied to user sites and can't use catalogs: their
 * dependency versions must match the catalogs.
 * @param {Monorepo} monorepo
 * @returns {string[]}
 */
function checkTemplatesMatchCatalogs({catalogs, templates}) {
  return templates
    .flatMap((template) =>
      getDependencies(template, ['dependencies', 'devDependencies']),
    )
    .filter((dependency) =>
      differsFromCatalogs(catalogs, dependency.name, dependency.specifier),
    )
    .map(
      (dependency) =>
        `${dependency.filePath}: ${dependency.dependencyType} ${dependency.name} is ${dependency.specifier}, but ${getCatalogVersion(catalogs, dependency.name)} in the catalog`,
    );
}

/**
 * pnpm rejects catalog overrides of packages that are in a catalog: the
 * override versions must match the catalogs.
 * @param {Monorepo} monorepo
 * @returns {string[]}
 */
function checkOverridesMatchCatalogs({catalogs, overrides}) {
  return Object.entries(overrides)
    .filter(([name, version]) => differsFromCatalogs(catalogs, name, version))
    .map(
      ([name, version]) =>
        `pnpm-workspace.yaml: override ${name} is ${version}, but ${getCatalogVersion(catalogs, name)} in the catalog`,
    );
}

/**
 * The packages of a Dependabot group must be upgraded together, and must
 * use the same version.
 * @param {Monorepo} monorepo
 * @returns {string[]}
 */
function checkDependencyGroups({catalogs, dependencyGroups}) {
  const catalogEntries = Object.entries({...catalogs.dev, ...catalogs.default});

  return dependencyGroups.flatMap((group) => {
    const members = catalogEntries.filter(([name]) =>
      matchesSomePattern(name, group.patterns),
    );
    const versions = new Set(members.map(([, version]) => version));
    if (versions.size <= 1) {
      return [];
    }
    const membersDescription = members
      .map(([name, version]) => `${name}@${version}`)
      .join(', ');
    return [
      `pnpm-workspace.yaml: the packages of the "${group.name}" Dependabot group must use the same version: ${membersDescription}`,
    ];
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * @param {Package} pkg
 * @param {string[]} dependencyTypes
 */
function getDependencies(pkg, dependencyTypes) {
  return dependencyTypes.flatMap((dependencyType) =>
    Object.entries(pkg.manifest[dependencyType] ?? {}).map(
      ([name, specifier]) => ({
        filePath: pkg.filePath,
        dependencyType,
        name,
        specifier,
      }),
    ),
  );
}

function getCatalogVersion(catalogs, name) {
  return catalogs.default[name] ?? catalogs.dev[name];
}

function differsFromCatalogs(catalogs, name, version) {
  const catalogVersion = getCatalogVersion(catalogs, name);
  return catalogVersion !== undefined && catalogVersion !== version;
}

// Dependabot patterns only support the "*" wildcard
function matchesSomePattern(name, patterns) {
  return patterns.some((pattern) => {
    const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const regExp = new RegExp(`^${escapedPattern.replaceAll('*', '.*')}$`);
    return regExp.test(name);
  });
}

async function readYaml(filePath) {
  return loadYaml(await fs.readFile(path.join(RootDir, filePath), 'utf8'));
}

/** @returns {Promise<Package[]>} */
async function loadPackages(filePaths) {
  return Promise.all(
    filePaths.map(async (filePath) => ({
      filePath,
      manifest: JSON.parse(
        await fs.readFile(path.join(RootDir, filePath), 'utf8'),
      ),
    })),
  );
}

// The package.json paths of the direct subdirectories of a directory
async function listPackageJsonPaths(dir) {
  const entries = await fs.readdir(path.join(RootDir, dir), {
    withFileTypes: true,
  });
  const candidatePaths = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${dir}/${entry.name}/package.json`);
  const existingPaths = await Promise.all(
    candidatePaths.map(async (filePath) =>
      (await fileExists(filePath)) ? filePath : null,
    ),
  );
  return existingPaths.filter(Boolean);
}

async function fileExists(filePath) {
  try {
    await fs.access(path.join(RootDir, filePath));
    return true;
  } catch {
    return false;
  }
}

await main();
