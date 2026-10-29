/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import siteConfig from '@generated/docusaurus.config';
import type * as PrismNamespace from 'prismjs';

// Prism components requiring markup-templating, see prismjs/components.json
const MarkupTemplatingLanguages = [
  'django',
  'ejs',
  'erb',
  'etlua',
  'ftl',
  'handlebars',
  'latte',
  'liquid',
  'php',
  'smarty',
  'soy',
  'tt2',
  'twig',
];

export default function prismIncludeLanguages(
  PrismObject: typeof PrismNamespace,
): void {
  const {
    themeConfig: {prism},
  } = siteConfig;
  const {additionalLanguages} = prism as {additionalLanguages: string[]};

  // Prism components work on the Prism instance on the window, while prism-
  // react-renderer uses its own Prism instance. We mount the instance onto
  // window, and import components to enhance it.
  // Some components (twig, liquid) also read the window instance later, in
  // hooks running when highlighting code. We leave our instance on window for
  // them, unless another library (like Redoc) mounted its own Prism instance
  // there before: we restore it.
  // You can mutate PrismObject: registering plugins, deleting languages... As
  // long as you don't re-assign it

  const PrismBefore = globalThis.Prism;
  globalThis.Prism = PrismObject;

  additionalLanguages.forEach((lang) => {
    if (MarkupTemplatingLanguages.includes(lang)) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('prismjs/components/prism-markup-templating.js');
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(`prismjs/components/prism-${lang}`);
  });

  if (typeof PrismBefore !== 'undefined') {
    globalThis.Prism = PrismBefore;
  }
}
