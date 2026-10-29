/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Translate, {translate} from '@docusaurus/Translate';

export type FeatureItem = {
  title: string;
  image: {
    src: string;
    width: number;
    height: number;
  };
  text: ReactNode;
};

const FEATURES: FeatureItem[] = [
  {
    title: translate({
      message: 'Powered by MDX',
      id: 'homepage.features.powered-by-mdx.title',
    }),
    image: {
      src: '/img/undraw_typewriter.svg',
      width: 1009.54,
      height: 717.96,
    },
    text: (
      <Translate id="homepage.features.powered-by-mdx.text">
        Save time and focus on text documents. Simply write docs and blog posts
        with MDX, and Docusaurus builds them into static HTML files ready to be
        served. You can even embed React components in your Markdown thanks to
        MDX.
      </Translate>
    ),
  },
  {
    title: translate({
      message: 'Built Using React',
      id: 'homepage.features.built-using-react.title',
    }),
    image: {
      src: '/img/undraw_react.svg',
      width: 1108,
      height: 731.18,
    },
    text: (
      <Translate id="homepage.features.built-using-react.text">
        Extend and customize your project&apos;s layout by writing React
        components. Leverage the pluggable architecture, and design your own
        site while reusing the same data created by Docusaurus plugins.
      </Translate>
    ),
  },
  {
    title: translate({
      message: 'Ready for Translations',
      id: 'homepage.features.ready-for-translations.title',
    }),
    image: {
      src: '/img/undraw_around_the_world.svg',
      width: 1137,
      height: 776.59,
    },
    text: (
      <Translate id="homepage.features.ready-for-translations.text">
        Localization comes out-of-the-box. Use git, Crowdin, or any other
        translation manager to translate your docs and deploy them individually.
      </Translate>
    ),
  },
  {
    title: translate({
      message: 'Document Versioning',
      id: 'homepage.features.document-versioning.title',
    }),
    image: {
      src: '/img/undraw_version_control.svg',
      width: 1038.23,
      height: 693.31,
    },
    text: (
      <Translate id="homepage.features.document-versioning.text">
        Support users on all versions of your project. Document versioning helps
        you keep documentation in sync with project releases.
      </Translate>
    ),
  },
  {
    title: translate({
      message: 'Content Search',
      id: 'homepage.features.content-search.title',
    }),
    image: {
      src: '/img/undraw_algolia.svg',
      width: 1137.97,
      height: 736.21,
    },
    text: (
      <Translate id="homepage.features.content-search.text">
        Make it easy for your community to find what they need in your
        documentation. We proudly support Algolia documentation search.
      </Translate>
    ),
  },
];

export default FEATURES;
