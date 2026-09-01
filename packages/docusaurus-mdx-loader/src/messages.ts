/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from '@docusaurus/logger';
import {toMessageRelativeFilePath} from '@docusaurus/utils';
import type {SimpleProcessorResult} from './processor';
import type {WebpackCompilerName} from '@docusaurus/utils';

type VFileMessage = SimpleProcessorResult['messages'][number];

// Returns " (line:column)" when position info is available
function formatMessagePositionExtraMessage(message: VFileMessage): string {
  const {line, column} = message;
  return line && column
    ? logger.interpolate` (number=${line}:number=${column})`
    : '';
}

function formatMessage(message: VFileMessage): string {
  return `- ${message.reason}${formatMessagePositionExtraMessage(message)}`;
}

/**
 * Remark/Rehype plugins report non-fatal problems by attaching messages to the
 * vfile instead of throwing. Docusaurus used to discard those messages, making
 * plugin warnings invisible to users.
 * See https://github.com/facebook/docusaurus/issues/9953
 */
export function reportMDXMessages({
  messages,
  filePath,
  compilerName,
}: {
  messages: SimpleProcessorResult['messages'];
  filePath: string;
  compilerName: WebpackCompilerName;
}): void {
  // We only report messages for the client compiler
  // This avoids emitting duplicate warnings in prod mode
  // Note: the client compiler is used in both dev/prod modes
  // See the same logic in the unusedDirectives Remark plugin
  if (compilerName !== 'client' || messages.length === 0) {
    return;
  }

  const relativePath = toMessageRelativeFilePath(filePath);

  logger.warn`Docusaurus found ${
    messages.length
  } Markdown warnings in file path=${relativePath}
${messages.map(formatMessage).join('\n')}`;
}
