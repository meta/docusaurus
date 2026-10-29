/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {SwizzleConfig} from '@docusaurus/types';

/* eslint sort-keys: "error" */

export default function getSwizzleConfig(): SwizzleConfig {
  return {
    components: {
      'Admonition/Icon': {
        actions: {
          eject: 'safe',
          wrap: 'forbidden', // Can't wrap a folder
        },
        description: 'The folder containing all admonition icons',
      },
      'Admonition/Icon/Danger': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The admonition danger icon',
      },
      'Admonition/Icon/Info': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The admonition info icon',
      },
      'Admonition/Icon/Note': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The admonition note icon',
      },
      'Admonition/Icon/Tip': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The admonition tip icon',
      },
      'Admonition/Icon/Warning': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The admonition warning icon',
      },
      'Admonition/Layout': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The standard admonition layout applied to all default admonition types',
      },
      'Admonition/Type': {
        actions: {
          eject: 'safe',
          wrap: 'forbidden',
        },
        description:
          'The folder containing all the admonition type components.',
      },
      'Admonition/Type/Danger': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component responsible for rendering a :::danger admonition type',
      },
      'Admonition/Type/Info': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component responsible for rendering a :::info admonition type',
      },
      'Admonition/Type/Note': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component responsible for rendering a :::note admonition type',
      },
      'Admonition/Type/Tip': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component responsible for rendering a :::tip admonition type',
      },
      'Admonition/Type/Warning': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component responsible for rendering a :::warning admonition type',
      },
      'Admonition/Types': {
        actions: {
          eject: 'safe',
          // TODO the swizzle CLI should provide a way to wrap such objects
          wrap: 'forbidden',
        },
        description:
          'The object mapping admonition type to a React component.\nUse it to add custom admonition type components, or replace existing ones.\nCan be ejected or wrapped (only manually, see our documentation).',
      },
      Blog: {
        actions: {
          // Forbidden because it's a parent folder, makes the CLI crash atm
          eject: 'forbidden',
          wrap: 'forbidden',
        },
      },
      'Blog/Components': {
        actions: {
          // Forbidden because it's a parent folder, makes the CLI crash atm
          eject: 'forbidden',
          wrap: 'forbidden',
        },
      },
      'Blog/Pages': {
        actions: {
          // Forbidden because it's a parent folder, makes the CLI crash atm
          eject: 'forbidden',
          wrap: 'forbidden',
        },
      },
      CodeBlock: {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component used to render multi-line code blocks, generally used in Markdown files.',
      },
      'CodeBlock/Content': {
        actions: {
          eject: 'unsafe',
          wrap: 'unsafe',
        },
        description:
          'The component responsible for rendering the syntax-highlighted code lines of a CodeBlock.',
      },
      ColorModeToggle: {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The color mode toggle to switch between light and dark mode.',
      },
      'DocBreadcrumbs/Items': {
        actions: {
          eject: 'unsafe',
          wrap: 'forbidden', // Can't wrap a folder
        },
        description:
          'The components responsible for rendering the breadcrumb items',
      },
      DocCardList: {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component responsible for rendering a list of sidebar items cards.\nNotable used on the category generated-index pages.',
      },
      'DocItem/TOC': {
        actions: {
          // Forbidden because it's a parent folder, makes the CLI crash atm
          // TODO the CLI should rather support --eject
          // Subfolders can be swizzled
          eject: 'forbidden',
          wrap: 'forbidden',
        },
        description:
          'The DocItem TOC is not directly swizzle-able, but you can swizzle its sub-components.',
      },
      DocSidebar: {
        actions: {
          eject: 'unsafe', // Too much technical code in sidebar, not very safe atm
          wrap: 'safe',
        },
        description: 'The sidebar component on docs pages',
      },
      Footer: {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: "The footer component of your site's layout",
      },
      'Footer/Copyright': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The footer copyright',
      },
      'Footer/Layout': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The footer main layout component',
      },
      'Footer/LinkItem': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The footer link item component',
      },
      'Footer/Links': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The footer component rendering the footer links',
      },
      'Footer/Links/MultiColumn': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The footer component rendering the footer links with a multi-column layout',
      },
      'Footer/Links/Simple': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The footer component rendering the footer links with a simple layout (single row)',
      },
      'Footer/Logo': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The footer logo',
      },
      Icon: {
        actions: {
          // Forbidden because it's a parent folder, makes the CLI crash atm
          // TODO the CLI should rather support --eject
          // Subfolders can be swizzled
          eject: 'forbidden',
          wrap: 'forbidden',
        },
        description:
          'The Icon folder is not directly swizzle-able, but you can swizzle its sub-components.',
      },
      'Icon/Arrow': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The arrow icon component',
      },
      'Icon/DarkMode': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The dark mode icon component.',
      },
      'Icon/Edit': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The edit icon component',
      },
      'Icon/LightMode': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The light mode icon component.',
      },
      'Icon/Menu': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The menu icon component',
      },
      'Icon/Socials': {
        actions: {
          // Forbidden because it's a parent folder, makes the CLI crash atm
          // TODO the CLI should rather support --eject
          // Subfolders can be swizzled
          eject: 'forbidden',
          wrap: 'forbidden',
        },
        description:
          'The Icon/Socials folder is not directly swizzle-able, but you can swizzle its sub-components.',
      },
      MDXComponents: {
        actions: {
          eject: 'safe',
          wrap: 'forbidden', /// TODO allow wrapping objects???
        },
        description:
          'The MDX components to use for rendering MDX files. Meant to be ejected.',
      },
      'MDXComponents/A': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component used to render <a> tags and Markdown links in MDX',
      },
      'MDXComponents/Code': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component used to render <code> tags and Markdown code blocks in MDX',
      },
      'MDXComponents/Details': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The component used to render <details> tags in MDX',
      },
      'MDXComponents/Heading': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component used to render heading tags (<h1>, <h2>...) and Markdown headings in MDX',
      },
      'MDXComponents/Img': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component used to render <img> tags and Markdown images in MDX',
      },
      'MDXComponents/Li': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The component used to render <li> tags in MDX',
      },
      'MDXComponents/Pre': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description: 'The component used to render <pre> tags in MDX',
      },
      'MDXComponents/Ul': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component used to render <ul> tags and Markdown unordered lists in MDX',
      },
      MDXContent: {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'A component wrapping all MDX content and providing the MDXComponents to the MDX context',
      },
      'NavbarItem/ComponentTypes': {
        actions: {
          eject: 'safe',
          wrap: 'forbidden',
        },
        description:
          'The Navbar item components mapping. Can be ejected to add custom navbar item types.\nSee https://github.com/facebook/docusaurus/issues/7227.',
      },
      NotFound: {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The global 404 page of your site, meant to be ejected and customized',
      },
      SearchBar: {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        // TODO how to describe this one properly?
        // By default it's an empty placeholder for the user to fill
        description:
          'The search bar component of your site, appearing in the navbar.',
      },
      SkipToContent: {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'The component responsible for implementing the accessibility "skip to content" link (https://www.w3.org/TR/WCAG20-TECHS/G1.html)',
      },
      'prism-include-languages': {
        actions: {
          eject: 'safe',
          wrap: 'forbidden', // Not a component!
        },
        description:
          'The Prism languages to include for code block syntax highlighting. Meant to be ejected.',
      },
    },
  };
}
