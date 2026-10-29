/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {LoadContext, Plugin} from '@docusaurus/types';
import type {PluginOptions, Options} from './options';

// Not sure why it's needed to expose vendored types 🤷‍️
export {} from './vendor-gtag';

function createConfigSnippet(trackingID: string): string {
  return `gtag('config', '${trackingID}');`;
}

function createConfigSnippets({
  trackingID: trackingIDArray,
}: PluginOptions): string {
  return trackingIDArray.map(createConfigSnippet).join('\n');
}

export default function pluginGoogleGtag(
  context: LoadContext,
  options: PluginOptions,
): Plugin | null {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const firstTrackingId = options.trackingID[0];

  return {
    name: 'docusaurus-plugin-google-gtag',

    contentLoaded({actions}) {
      actions.setGlobalData(options);
    },

    getClientModules() {
      return ['./gtag'];
    },

    injectHtmlTags() {
      return {
        // Gtag includes GA by default, so we also preconnect to
        // google-analytics.
        headTags: [
          {
            tagName: 'link',
            attributes: {
              rel: 'preconnect',
              href: 'https://www.google-analytics.com',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'preconnect',
              href: 'https://www.googletagmanager.com',
            },
          },
          {
            tagName: 'script',
            attributes: {
              async: true,
              // We only include the first tracking id here because google says
              // we shouldn't install multiple tags/scripts on the same page
              // Instead we should load one script and use n * gtag("config",id)
              // See https://developers.google.com/tag-platform/gtagjs/install#add-products
              src: `https://www.googletagmanager.com/gtag/js?id=${firstTrackingId}`,
            },
          },
          {
            tagName: 'script',
            innerHTML: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${createConfigSnippets(options)};
              `,
          },
        ],
      };
    },
  };
}

export {validateThemeConfig, validateOptions} from './options';

export type {PluginOptions, Options};
