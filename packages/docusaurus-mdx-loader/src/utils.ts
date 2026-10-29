/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from '@docusaurus/logger';
import {
  createAssetRequest,
  escapePath,
  type WebpackCompilerName,
} from '@docusaurus/utils';
import {getProcessor, type SimpleProcessorResult} from './processor';
import {validateMDXFrontMatter} from './frontMatter';
import preprocessor from './preprocessor';
import type {Options} from './options';

/**
 * Converts assets an object with Webpack require calls code.
 * This is useful for mdx files to reference co-located assets using relative
 * paths. Those assets should enter the Webpack assets pipeline and be hashed.
 * For now, we only handle that for images and paths starting with `./`:
 *
 * `{image: "./myImage.png"}` => `{image: require("./myImage.png")}`
 */
export function createAssetsExportCode({assets}: {assets: unknown}): string {
  if (
    typeof assets !== 'object' ||
    !assets ||
    Object.keys(assets).length === 0
  ) {
    return 'undefined';
  }

  // TODO implementation can be completed/enhanced
  function createAssetValueCode(assetValue: unknown): string | undefined {
    if (Array.isArray(assetValue)) {
      const arrayItemCodes = assetValue.map(
        (item: unknown) => createAssetValueCode(item) ?? 'undefined',
      );
      return `[${arrayItemCodes.join(', ')}]`;
    }
    // Only process string values starting with ./
    // We could enhance this logic and check if file exists on disc?
    if (typeof assetValue === 'string' && assetValue.startsWith('./')) {
      // TODO do we have other use-cases than image assets?
      const request = createAssetRequest({
        assetPath: escapePath(assetValue),
        type: 'image-file',
      });
      return `require("${request}")`;
    }
    return undefined;
  }

  const assetEntries = Object.entries(assets);

  const codeLines = assetEntries
    .map(([key, value]: [string, unknown]) => {
      const assetRequireCode = createAssetValueCode(value);
      return assetRequireCode ? `"${key}": ${assetRequireCode},` : undefined;
    })
    .filter(Boolean);

  return `{\n${codeLines.join('\n')}\n}`;
}

/**
 * data.contentTitle is set by the remark contentTitle plugin
 */
export function extractContentTitleData(data: {
  [key: string]: unknown;
}): string | undefined {
  return data.contentTitle as string | undefined;
}

export async function compileToJSX({
  filePath,
  fileContent,
  frontMatter,
  options,
  compilerName,
}: {
  filePath: string;
  fileContent: string;
  frontMatter: Record<string, unknown>;
  options: Options;
  compilerName: WebpackCompilerName;
}): Promise<SimpleProcessorResult> {
  const preprocessedFileContent = preprocessor({
    fileContent,
    filePath,
    admonitions: options.admonitions,
    markdownConfig: options.markdownConfig,
  });

  const mdxFrontMatter = validateMDXFrontMatter(frontMatter.mdx);

  const processor = getProcessor({
    filePath,
    options,
    mdxFrontMatter,
  });

  try {
    return await processor.process({
      content: preprocessedFileContent,
      filePath,
      frontMatter,
      compilerName,
    });
  } catch (errorUnknown) {
    const error = errorUnknown as Error;

    // MDX can emit errors that have useful extra attributes
    const errorJSON = JSON.stringify(error, null, 2);
    const errorDetails =
      errorJSON === '{}'
        ? // regular JS error case: print stacktrace
          (error.stack ?? 'N/A')
        : // MDX error: print extra attributes + stacktrace
          `${errorJSON}\n${error.stack}`;

    throw new Error(
      `MDX compilation failed for file ${logger.path(filePath)}\nCause: ${
        error.message
      }\nDetails:\n${errorDetails}`,
      // TODO error cause doesn't seem to be used by Webpack stats.errors :s
      {cause: errorUnknown},
    );
  }
}
