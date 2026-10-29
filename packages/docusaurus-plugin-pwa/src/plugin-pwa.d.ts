/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module '@docusaurus/plugin-pwa' {
  import type {InjectManifestOptions} from 'workbox-build';

  export type PluginOptions = {
    /**
     * Turn debug mode on:
     *
     * - Workbox logs
     * - Additional Docusaurus logs
     * - Unoptimized SW file output
     * - Source maps
     */
    debug?: boolean;
    /**
     * Strategies used to turn the offline mode on:
     *
     * - `appInstalled`: activates for users having installed the site as an app
     * (not 100% reliable)
     * - `standalone`: activates for users running the app as standalone (often
     * the case once a PWA is installed)
     * - `queryString`: activates if queryString contains `offlineMode=true`
     * (convenient for PWA debugging)
     * - `mobile`: activates for mobile users (width <= 940px)
     * - `saveData`: activates for users with `navigator.connection.saveData ===
     * true`
     * - `always`: activates for all users
     */
    offlineModeActivationStrategies: (
      | 'appInstalled'
      | 'queryString'
      | 'standalone'
      | 'mobile'
      | 'saveData'
      | 'always'
    )[];
    /**
     * Workbox options to pass to `workbox.injectManifest()`. This gives you
     * control over which assets will be precached, and be available offline.
     * @see https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.injectManifest
     */
    injectManifestConfig: InjectManifestOptions;
    /**
     * Array of objects containing `tagName` and key-value pairs for attributes
     * to inject into the `<head>` tag. Technically you can inject any head tag
     * through this, but it's ideally used for tags to make your site PWA-
     * compliant.
     */
    pwaHead: {
      tagName: string;
      href?: string;
      content?: string;
      [attributeName: string]: string | boolean | undefined;
    }[];
    /**
     * Useful for additional Workbox rules. You can do whatever a service worker
     * can do here, and use the full power of workbox libraries. The code is
     * transpiled, so you can use modern ES6+ syntax here.
     */
    swCustom?: string;
    /**
     * Adds an entry before the Docusaurus app so that registration can happen
     * before the app runs. The default `registerSW.js` file is enough for
     * simple registration. Passing `false` will disable registration entirely.
     */
    swRegister: string | false;
  };

  export type Options = Partial<PluginOptions>;
}

declare module '@theme/PwaReloadPopup' {
  import type {ReactNode} from 'react';

  export interface Props {
    /**
     * The popup should call this callback when the `reload` button is clicked.
     * This will tell the service worker to install the waiting service worker
     * and reload the page.
     */
    readonly onReload: () => void;
  }
  export default function PwaReloadPopup(props: Props): ReactNode;
}
