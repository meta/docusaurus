/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {styleText} from 'node:util';
import type {ReportingSeverity} from '@docusaurus/types';

type InterpolatableValue = string | number | (string | number)[];

type StyleTextFormat = Parameters<typeof styleText>[0];

const CommonStyles = {
  blueBold: ['blue', 'bold'],
  cyanUnderline: ['cyan', 'underline'],
} satisfies Record<string, StyleTextFormat>;

const Prefixes = {
  success: styleText(['green', 'bold'], '[SUCCESS]'),
  info: styleText(['cyan', 'bold'], '[INFO]'),
  warning: styleText(['yellow', 'bold'], '[WARNING]'),
  error: styleText(['red', 'bold'], '[ERROR]'),
};

const path = (msg: unknown): string =>
  styleText(CommonStyles.cyanUnderline, `"${String(msg)}"`);
const url = (msg: unknown): string =>
  styleText(CommonStyles.cyanUnderline, String(msg));
const name = (msg: unknown): string =>
  styleText(CommonStyles.blueBold, String(msg));
const code = (msg: unknown): string => styleText('cyan', `\`${String(msg)}\``);
const subdue = (msg: unknown): string => styleText('gray', String(msg));
const num = (msg: unknown): string => styleText('yellow', String(msg));

function interpolate(
  msgs: TemplateStringsArray,
  ...values: InterpolatableValue[]
): string {
  let res = '';
  values.forEach((value, idx) => {
    const flag = msgs[idx]!.match(/[a-z]+=$/);
    res += msgs[idx]!.replace(/[a-z]+=$/, '');
    const format = (() => {
      if (!flag) {
        return (a: string | number) => a;
      }
      switch (flag[0]) {
        case 'path=':
          return path;
        case 'url=':
          return url;
        case 'number=':
          return num;
        case 'name=':
          return name;
        case 'subdue=':
          return subdue;
        case 'code=':
          return code;
        default:
          throw new Error(
            'Bad Docusaurus logging message. This is likely an internal bug, please report it.',
          );
      }
    })();
    res += Array.isArray(value)
      ? `\n- ${value.map((v) => format(v)).join('\n- ')}`
      : format(value);
  });
  res += msgs.slice(-1)[0];
  return res;
}

function stringify(msg: unknown): string {
  if (String(msg) === '[object Object]') {
    return JSON.stringify(msg);
  }
  if (msg instanceof Date) {
    return msg.toUTCString();
  }
  return String(msg);
}

function info(msg: unknown): void;
function info(
  msg: TemplateStringsArray,
  ...values: [InterpolatableValue, ...InterpolatableValue[]]
): void;
function info(msg: unknown, ...values: InterpolatableValue[]): void {
  console.info(
    `${Prefixes.info} ${
      values.length === 0
        ? stringify(msg)
        : interpolate(msg as TemplateStringsArray, ...values)
    }`,
  );
}
function warn(msg: unknown): void;
function warn(
  msg: TemplateStringsArray,
  ...values: [InterpolatableValue, ...InterpolatableValue[]]
): void;
function warn(msg: unknown, ...values: InterpolatableValue[]): void {
  console.warn(
    styleText(
      'yellow',
      `${Prefixes.warning} ${
        values.length === 0
          ? stringify(msg)
          : interpolate(msg as TemplateStringsArray, ...values)
      }`,
    ),
  );
}
function error(msg: unknown): void;
function error(
  msg: TemplateStringsArray,
  ...values: [InterpolatableValue, ...InterpolatableValue[]]
): void;
function error(msg: unknown, ...values: InterpolatableValue[]): void {
  console.error(
    styleText(
      'red',
      `${Prefixes.error} ${
        values.length === 0
          ? stringify(msg)
          : interpolate(msg as TemplateStringsArray, ...values)
      }`,
    ),
  );
}
function success(msg: unknown): void;
function success(
  msg: TemplateStringsArray,
  ...values: [InterpolatableValue, ...InterpolatableValue[]]
): void;
function success(msg: unknown, ...values: InterpolatableValue[]): void {
  console.log(
    `${Prefixes.success} ${
      values.length === 0
        ? stringify(msg)
        : interpolate(msg as TemplateStringsArray, ...values)
    }`,
  );
}
function throwError(msg: unknown): void;
function throwError(
  msg: TemplateStringsArray,
  ...values: [InterpolatableValue, ...InterpolatableValue[]]
): void;
function throwError(msg: unknown, ...values: InterpolatableValue[]): void {
  throw new Error(
    values.length === 0
      ? stringify(msg)
      : interpolate(msg as TemplateStringsArray, ...values),
  );
}

function newLine(): void {
  console.log();
}

/**
 * Takes a message and reports it according to the severity that the user wants.
 *
 * - `ignore`: completely no-op
 * - `log`: uses the `INFO` log level
 * - `warn`: uses the `WARN` log level
 * - `throw`: aborts the process, throws the error.
 *
 * Since the logger doesn't have logging level filters yet, these severities
 * mostly just differ by their colors.
 *
 * @throws In addition to throwing when `reportingSeverity === "throw"`, this
 * function also throws if `reportingSeverity` is not one of the above.
 */
function report(reportingSeverity: ReportingSeverity): typeof success {
  const reportingMethods = {
    ignore: () => {},
    log: info,
    warn,
    throw: throwError,
  };
  if (
    !Object.prototype.hasOwnProperty.call(reportingMethods, reportingSeverity)
  ) {
    throw new Error(
      `Unexpected "reportingSeverity" value: ${reportingSeverity}.`,
    );
  }
  return reportingMethods[reportingSeverity];
}

const logger = {
  red: (msg: string | number): string => styleText('red', String(msg)),
  yellow: (msg: string | number): string => styleText('yellow', String(msg)),
  green: (msg: string | number): string => styleText('green', String(msg)),
  cyan: (msg: string | number): string => styleText('cyan', String(msg)),
  bold: (msg: string | number): string => styleText('bold', String(msg)),
  dim: (msg: string | number): string => styleText('dim', String(msg)),
  path,
  url,
  name,
  code,
  subdue,
  num,
  interpolate,
  info,
  warn,
  error,
  success,
  report,
  newLine,
};

export default logger;
