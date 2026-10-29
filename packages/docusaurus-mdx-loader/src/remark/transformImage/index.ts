/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import {visit} from 'unist-util-visit';
import {
  toMessageRelativeFilePath,
  posixPath,
  escapePath,
  findAsyncSequential,
  createAssetRequest,
  parseURLOrPath,
  parseLocalURLPath,
} from '@docusaurus/utils';
import {imageSizeFromFile} from 'image-size/fromFile';
import logger from '@docusaurus/logger';
import {pathExists} from '@docusaurus/fs';
import {
  assetRequireAttributeValue,
  formatNodePositionExtraMessage,
  transformNode,
} from '../utils';
import type {Plugin, Transformer} from 'unified';
import type {MdxJsxTextElement} from 'mdast-util-mdx';
import type {Image, Root} from 'mdast';
import type {Parent} from 'unist';
import type {
  MarkdownConfig,
  OnBrokenMarkdownImagesFunction,
} from '@docusaurus/types';

export type PluginOptions = {
  staticDirs: string[];
  siteDir: string;
  onBrokenMarkdownImages: MarkdownConfig['hooks']['onBrokenMarkdownImages'];
};

type Context = {
  staticDirs: PluginOptions['staticDirs'];
  siteDir: PluginOptions['siteDir'];
  onBrokenMarkdownImages: OnBrokenMarkdownImagesFunction;
  filePath: string;
};

function asFunction(
  onBrokenMarkdownImages: PluginOptions['onBrokenMarkdownImages'],
): OnBrokenMarkdownImagesFunction {
  if (typeof onBrokenMarkdownImages === 'string') {
    const extraHelp =
      onBrokenMarkdownImages === 'throw'
        ? logger.interpolate`\nTo ignore this error, use the code=${'siteConfig.markdown.hooks.onBrokenMarkdownImages'} option, or apply the code=${'pathname://'} protocol to the broken image URLs.`
        : '';
    return ({sourceFilePath, url: imageUrl, node}) => {
      const relativePath = toMessageRelativeFilePath(sourceFilePath);
      if (imageUrl) {
        logger.report(
          onBrokenMarkdownImages,
        )`Markdown image with URL code=${imageUrl} in source file path=${relativePath}${formatNodePositionExtraMessage(
          node,
        )} couldn't be resolved to an existing local image file.${extraHelp}`;
      } else {
        logger.report(
          onBrokenMarkdownImages,
        )`Markdown image with empty URL found in source file path=${relativePath}${formatNodePositionExtraMessage(
          node,
        )}.${extraHelp}`;
      }
    };
  } else {
    return (params) =>
      onBrokenMarkdownImages({
        ...params,
        sourceFilePath: toMessageRelativeFilePath(params.sourceFilePath),
      });
  }
}

type Target = [node: Image, index: number, parent: Parent];

async function toImageRequireNode(
  [node]: Target,
  imagePath: string,
  context: Context,
) {
  // MdxJsxTextElement => see https://github.com/facebook/docusaurus/pull/8288#discussion_r1125871405
  const jsxNode = node as unknown as MdxJsxTextElement;
  const attributes: MdxJsxTextElement['attributes'] = [];

  let relativeImagePath = posixPath(
    path.relative(path.dirname(context.filePath), imagePath),
  );
  relativeImagePath = `./${relativeImagePath}`;

  const parsedUrl = parseURLOrPath(node.url);
  const hash = parsedUrl.hash ?? '';
  const search = parsedUrl.search ?? '';
  const requireString = createAssetRequest({
    assetPath: escapePath(relativeImagePath),
    search,
    type: 'image',
  });
  if (node.alt) {
    attributes.push({
      type: 'mdxJsxAttribute',
      name: 'alt',
      value: node.alt,
    });
  }

  attributes.push({
    type: 'mdxJsxAttribute',
    name: 'src',
    value: assetRequireAttributeValue(requireString, hash),
  });

  if (node.title) {
    attributes.push({
      type: 'mdxJsxAttribute',
      name: 'title',
      value: node.title,
    });
  }

  try {
    const size = (await imageSizeFromFile(imagePath))!;
    if (size.width) {
      attributes.push({
        type: 'mdxJsxAttribute',
        name: 'width',
        value: String(size.width),
      });
    }
    if (size.height) {
      attributes.push({
        type: 'mdxJsxAttribute',
        name: 'height',
        value: String(size.height),
      });
    }
  } catch (err) {
    console.error(err);
    // Workaround for https://github.com/yarnpkg/berry/pull/3889#issuecomment-1034469784
    // TODO remove this check once fixed in Yarn PnP
    if (!process.versions.pnp) {
      logger.warn`The image at path=${imagePath} can't be read correctly. Please ensure it's a valid image.
${(err as Error).message}`;
    }
  }

  transformNode(jsxNode, {
    type: 'mdxJsxTextElement',
    name: 'img',
    attributes,
    children: [],
  });
}

async function getLocalImageAbsolutePath(
  originalImagePath: string,
  {siteDir, filePath, staticDirs}: Context,
) {
  if (originalImagePath.startsWith('@site/')) {
    const imageFilePath = path.join(
      siteDir,
      originalImagePath.replace('@site/', ''),
    );
    if (!(await pathExists(imageFilePath))) {
      return null;
    }
    return imageFilePath;
  } else if (path.isAbsolute(originalImagePath)) {
    // Absolute paths are expected to exist in the static folder.
    const possiblePaths = staticDirs.map((dir) =>
      path.join(dir, originalImagePath),
    );
    const imageFilePath = await findAsyncSequential(possiblePaths, pathExists);
    if (!imageFilePath) {
      return null;
    }
    return imageFilePath;
  } else {
    // relative paths are resolved against the source file's folder
    const imageFilePath = path.join(path.dirname(filePath), originalImagePath);
    if (!(await pathExists(imageFilePath))) {
      return null;
    }
    return imageFilePath;
  }
}

async function processImageNode(target: Target, context: Context) {
  const [node] = target;

  if (!node.url) {
    node.url =
      context.onBrokenMarkdownImages({
        url: node.url,
        sourceFilePath: context.filePath,
        node,
      }) ?? node.url;
    return;
  }

  const localUrlPath = parseLocalURLPath(node.url);
  if (!localUrlPath) {
    // pathname:// is an escape hatch, in case the user does not want images to
    // be converted to require calls going through webpack loader
    if (parseURLOrPath(node.url).protocol === 'pathname:') {
      node.url = node.url.replace('pathname://', '');
    }
    return;
  }

  // We decode it first because Node Url.pathname is always encoded
  // while the image file-system path are not.
  // See https://github.com/facebook/docusaurus/discussions/10720
  const decodedPathname = decodeURIComponent(localUrlPath.pathname);

  // We try to convert image urls without protocol to images with require calls
  // going through webpack ensures that image assets exist at build time
  const localImagePath = await getLocalImageAbsolutePath(
    decodedPathname,
    context,
  );
  if (localImagePath === null) {
    node.url =
      context.onBrokenMarkdownImages({
        url: node.url,
        sourceFilePath: context.filePath,
        node,
      }) ?? node.url;
  } else {
    await toImageRequireNode(target, localImagePath, context);
  }
}

const plugin: Plugin<PluginOptions[], Root> = function plugin(
  options,
): Transformer<Root> {
  const onBrokenMarkdownImages = asFunction(options.onBrokenMarkdownImages);

  return async (root, vfile) => {
    const context: Context = {
      ...options,
      filePath: vfile.path!,
      onBrokenMarkdownImages,
    };

    const promises: Promise<void>[] = [];
    visit(root, 'image', (node, index, parent) => {
      if (!parent || index === undefined) {
        return;
      }
      promises.push(processImageNode([node, index, parent!], context));
    });
    await Promise.all(promises);
  };
};

export default plugin;
