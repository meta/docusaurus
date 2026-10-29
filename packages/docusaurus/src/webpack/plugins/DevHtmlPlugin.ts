/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {Compilation, Compiler} from 'webpack';

const PluginName = 'Docusaurus-DevHtmlPlugin';

export type DevHtmlAssets = {
  // Public URLs of the entrypoint JS files, in load order
  scripts: string[];
  // Public URLs of the entrypoint CSS files
  stylesheets: string[];
};

export type DevHtmlPluginOptions = {
  filename: string;
  render: (assets: DevHtmlAssets) => string;
};

// Same as html-webpack-plugin: encode each path segment, keep the querystring
function encodeFilePath(filePath: string): string {
  const [urlPath, ...queryParts] = filePath.split('?');
  const query = queryParts.length > 0 ? `?${queryParts.join('?')}` : '';
  return urlPath!.split('/').map(encodeURIComponent).join('/') + query;
}

// With "auto" (hash router), assets are resolved relatively to the page
// The generated HTML file is always emitted at the output root
function getPublicPath(publicPath: string): string {
  if (publicPath === 'auto') {
    return '';
  }
  return publicPath.endsWith('/') ? publicPath : `${publicPath}/`;
}

export function getAssetUrls({
  files,
  publicPath,
}: {
  files: string[];
  publicPath: string;
}): DevHtmlAssets {
  const toUrls = (regexp: RegExp) =>
    [...new Set(files)]
      .filter((file) => regexp.test(file))
      .map((file) => getPublicPath(publicPath) + encodeFilePath(file));
  return {
    scripts: toUrls(/\.m?js(?:\?|$)/),
    stylesheets: toUrls(/\.css(?:\?|$)/),
  };
}

function getEntrypointAssets(compilation: Compilation): DevHtmlAssets {
  const files = Array.from(compilation.entrypoints.values())
    .flatMap((entrypoint) => entrypoint.getFiles())
    .filter((file) => {
      const info = compilation.getAsset(file)?.info;
      return !info?.hotModuleReplacement && !info?.development;
    });
  const publicPath = compilation.getAssetPath(
    compilation.outputOptions.publicPath!,
    {hash: compilation.hash},
  );
  return getAssetUrls({files, publicPath});
}

/**
 * Emits the HTML page used by "docusaurus start" to load the client bundle.
 *
 * Replaces html-webpack-plugin: we only need the entrypoint asset URLs,
 * and this works the same way with Webpack and Rspack.
 */
export default class DevHtmlPlugin {
  readonly options: DevHtmlPluginOptions;

  constructor(options: DevHtmlPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    const {RawSource} = compiler.webpack.sources;
    compiler.hooks.thisCompilation.tap(PluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PluginName,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        () => {
          const html = this.options.render(getEntrypointAssets(compilation));
          compilation.emitAsset(this.options.filename, new RawSource(html));
        },
      );
    });
  }
}
