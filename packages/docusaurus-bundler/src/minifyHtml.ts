/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Historical env variable
const SkipHtmlMinification = process.env.SKIP_HTML_MINIFICATION === 'true';

type HtmlMinifierResult = {
  code: string;
  warnings: string[];
};

export type HtmlMinifier = {
  minify: (html: string) => Promise<HtmlMinifierResult>;
};

const NoopMinifier: HtmlMinifier = {
  minify: async (html: string) => ({code: html, warnings: []}),
};

export async function getHtmlMinifier(): Promise<HtmlMinifier> {
  if (SkipHtmlMinification) {
    return NoopMinifier;
  }
  return getSwcMinifier();
}

// Minify html with @swc/html
// Not well-documented but fast!
// See https://github.com/swc-project/swc/discussions/9616
async function getSwcMinifier(): Promise<HtmlMinifier> {
  // Import it lazily: not need for the dev server, more performant
  // This also temporarily fix our StackBlitz playground
  // See https://github.com/facebook/docusaurus/issues/12008
  // See https://github.com/swc-project/swc/issues/11833
  const {minify: swcHtmlMinifier} = await import('@swc/html');
  return {
    minify: async function minifyHtmlWithSwc(html) {
      try {
        const result = await swcHtmlMinifier(Buffer.from(html), {
          // Removing comments can lead to React hydration errors
          // See https://x.com/sebastienlorber/status/1841966927440478577
          removeComments: false,
          // TODO maybe it's fine to only keep <!-- --> React comments?
          preserveComments: [],

          // Keep <head> tag: important for social image crawlers like LinkedIn
          // See https://github.com/swc-project/swc/issues/10994
          tagOmission: 'keep-head-and-body',

          // Keep attribute quotes. WhatsApp and some RDFa parsers ignore
          // og:image when the minifier emits property=og:image without quotes.
          // See https://github.com/facebook/docusaurus/issues/12368
          quotes: true,

          // Sorting these attributes (class) can lead to React hydration errors
          sortSpaceSeparatedAttributeValues: false,
          sortAttributes: false,

          // When enabled => hydration error for className={"yt-lite "}
          normalizeAttributes: false,
          // When enabled => hydration error for className=""
          removeEmptyAttributes: false,
          // When enabled => hydration error for <a target="_self">
          removeRedundantAttributes: 'none',

          minifyJs: true,
          minifyJson: true,
          minifyCss: true,
        });

        const warnings = (result.errors ?? []).map((diagnostic) => {
          return `[HTML minifier diagnostic - ${diagnostic.level}] ${
            diagnostic.message
          } - ${JSON.stringify(diagnostic.span)}`;
        });

        return {
          code: result.code,
          warnings,
        };
      } catch (err) {
        throw new Error(`HTML minification failed (SWC)`, {
          cause: err,
        });
      }
    },
  };
}
