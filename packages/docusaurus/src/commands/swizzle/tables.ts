/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import logger from '@docusaurus/logger';
import Table from 'cli-table3';
import {SwizzleActions} from './actions';
import {actionStatusColor, actionStatusLabel} from './common';
import type {SwizzleActionStatus} from '@docusaurus/types';
import type {ThemeComponents} from './components';

function tableStatusLabel(status: SwizzleActionStatus): string {
  return actionStatusColor(status, actionStatusLabel(status));
}

function getStatusLabel(status: SwizzleActionStatus): string {
  return actionStatusColor(status, actionStatusLabel(status));
}

function statusTable(): string {
  const table = new Table({
    head: ['Status', 'CLI option', 'Description'],
  });

  table.push(
    {
      [tableStatusLabel('safe')]: [
        '',
        `
This component is safe to swizzle and was designed for this purpose.
The swizzled component is retro-compatible with minor version upgrades.
`,
      ],
    },
    {
      [tableStatusLabel('unsafe')]: [
        logger.code('--danger'),
        `
This component is unsafe to swizzle, but you can still do it!
Warning: we may release breaking changes within minor version upgrades.
You will have to upgrade your component manually and maintain it over time.

${logger.green(
  'Tip',
)}: your customization can't be done in a ${tableStatusLabel('safe')} way?
Report it here: https://github.com/meta/docusaurus/discussions/5468
`,
      ],
    },
    {
      [tableStatusLabel('forbidden')]: [
        '',
        `
This component is not meant to be swizzled.
`,
      ],
    },
  );

  return table.toString();
}

function actionsTable(): string {
  const table = new Table({
    head: ['Actions', 'CLI option', 'Description'],
  });

  table.push(
    {
      [logger.bold('Wrap')]: [
        logger.code('--wrap'),
        `
Creates a wrapper around the original theme component.
Allows rendering other components before/after the original theme component.

${logger.green('Tip')}: prefer ${logger.code(
          '--wrap',
        )} whenever possible to reduce the amount of code to maintain.
      `,
      ],
    },
    {
      [logger.bold('Eject')]: [
        logger.code('--eject'),
        `
Ejects the full source code of the original theme component.
Allows overriding of the original component entirely with your own UI and logic.

${logger.green('Tip')}: ${logger.code(
          '--eject',
        )} can be useful for completely redesigning a component.
`,
      ],
    },
  );

  return table.toString();
}

export function helpTables(): string {
  return `${logger.bold('Swizzle actions')}:
${actionsTable()}

${logger.bold('Swizzle safety statuses')}:
${statusTable()}

${logger.bold('Swizzle guide')}: https://docusaurus.io/docs/swizzling`;
}

export function themeComponentsTable(themeComponents: ThemeComponents): string {
  const table = new Table({
    head: [
      'Component name',
      ...SwizzleActions.map((action) => _.capitalize(action)),
      'Description',
    ],
  });

  themeComponents.all.forEach((component) => {
    table.push({
      [component]: [
        ...SwizzleActions.map((action) =>
          getStatusLabel(themeComponents.getActionStatus(component, action)),
        ),
        themeComponents.getDescription(component),
      ],
    });
  });

  return `${logger.bold(
    `Components available for swizzle in ${logger.name(
      themeComponents.themeName,
    )}`,
  )}:
${table.toString()}
`;
}
