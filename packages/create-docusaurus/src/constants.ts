/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Only used in the rare, rare case of running globally installed create +
// using --skip-install. We need a default name to show the tip text
export const DefaultPackageManager = 'npm';

// Order matters
export const LockfileNames = {
  npm: 'package-lock.json',
  yarn: 'yarn.lock',
  pnpm: 'pnpm-lock.yaml',
  bun: 'bun.lockb',
};

export type PackageManager = keyof typeof LockfileNames;

export const PackageManagers = Object.keys(LockfileNames) as PackageManager[];

export const GitCloneStrategies = [
  'deep',
  'shallow',
  'copy',
  'custom',
] as const;

export type GitCloneStrategy = (typeof GitCloneStrategies)[number];

export type Template = {
  name: string;
  path: string;
  tsVariantPath: string | undefined;
};

export type Source =
  | {
      type: 'template';
      template: Template;
      language: 'javascript' | 'typescript';
    }
  | {
      type: 'git';
      url: string;
      strategy: GitCloneStrategy;
    }
  | {
      type: 'local';
      path: string;
    };
