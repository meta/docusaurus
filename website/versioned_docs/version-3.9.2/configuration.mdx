---
description: Configuring your site's behavior through docusaurus.config.js and more.
---

# Configuration

import TOCInline from '@theme/TOCInline';

:::info

Check the [**`docusaurus.config.js` API reference**](api/docusaurus.config.js.mdx) for an exhaustive list of options.

:::

Docusaurus has a unique take on configurations. We encourage you to congregate information about your site into one place. We guard the fields of this file and facilitate making this data object accessible across your site.

Keeping a well-maintained `docusaurus.config.js` helps you, your collaborators, and your open source contributors to be able to focus on documentation while still being able to customize the site.

## Syntax to declare `docusaurus.config.js` {/* #syntax-to-declare-docusaurus-config */}

The `docusaurus.config.js` file is run in Node.js and should export either:

- a **config object**
- a **function** that creates the config object

:::info

The `docusaurus.config.js` file supports:

- [**ES Modules**](https://flaviocopes.com/es-modules/)
- [**CommonJS**](https://flaviocopes.com/commonjs/)
- [**TypeScript**](./typescript-support.mdx#typing-config)

Constraints:

- **Required:** use `export default /* your config*/` (or `module.exports`) to export your Docusaurus config
- **Optional:** use `import Lib from 'lib'` (or `require('lib')`) to import Node.js packages

:::

Docusaurus gives us the ability to declare its configuration in various **equivalent ways**, and all the following config examples lead to the exact same result:

```js title="docusaurus.config.js"
export default {
  title: 'Docusaurus',
  url: 'https://docusaurus.io',
  // your site config ...
};
```

```js title="docusaurus.config.js"
module.exports = {
  title: 'Docusaurus',
  url: 'https://docusaurus.io',
  // your site config ...
};
```

```ts title="docusaurus.config.ts"
import type {Config} from '@docusaurus/types';

export default {
  title: 'Docusaurus',
  url: 'https://docusaurus.io',
  // your site config ...
} satisfies Config;
```

```js title="docusaurus.config.js"
const config = {
  title: 'Docusaurus',
  url: 'https://docusaurus.io',
  // your site config ...
};

export default config;
```

```js title="docusaurus.config.js"
export default function configCreator() {
  return {
    title: 'Docusaurus',
    url: 'https://docusaurus.io',
    // your site config ...
  };
}
```

```js title="docusaurus.config.js"
export default async function createConfigAsync() {
  return {
    title: 'Docusaurus',
    url: 'https://docusaurus.io',
    // your site config ...
  };
}
```

:::tip Using ESM-only packages

Using an async config creator can be useful to import ESM-only modules (notably most Remark plugins). It is possible to import such modules thanks to dynamic imports:

```js title="docusaurus.config.js"
export default async function createConfigAsync() {
  // Use a dynamic import instead of require('esm-lib')
  // highlight-next-line
  const lib = await import('lib');

  return {
    title: 'Docusaurus',
    url: 'https://docusaurus.io',
    // rest of your site config...
  };
}
```

:::

## What goes into a `docusaurus.config.js`? {/* #what-goes-into-a-docusaurusconfigjs */}

You should not have to write your `docusaurus.config.js` from scratch even if you are developing your site. All templates come with a `docusaurus.config.js` that includes defaults for the common options.

However, it can be helpful if you have a high-level understanding of how the configurations are designed and implemented.

The high-level overview of Docusaurus configuration can be categorized into:

<TOCInline toc={toc} minHeadingLevel={3} maxHeadingLevel={3} />

### Site metadata {/* #site-metadata */}

Site metadata contains the essential global metadata such as `title`, `url`, `baseUrl`, and `favicon`.

They are used in several places such as your site's title and headings, browser tab icon, social sharing (Facebook, X) information or even to generate the correct path to serve your static files.

### Deployment configurations {/* #deployment-configurations */}

Deployment configurations such as `projectName`, `organizationName`, and optionally `deploymentBranch` are used when you deploy your site with the `deploy` command.

It is recommended to check the [deployment docs](deployment.mdx) for more information.

### Theme, plugin, and preset configurations {/* #theme-plugin-and-preset-configurations */}

List the [themes](./using-plugins.mdx#using-themes), [plugins](./using-plugins.mdx), and [presets](./using-plugins.mdx#using-presets) for your site in the `themes`, `plugins`, and `presets` fields, respectively. These are typically npm packages:

```js title="docusaurus.config.js"
export default {
  // ...
  plugins: [
    '@docusaurus/plugin-content-blog',
    '@docusaurus/plugin-content-pages',
  ],
  themes: ['@docusaurus/theme-classic'],
};
```

:::tip

Docusaurus supports [**module shorthands**](./using-plugins.mdx#module-shorthands), allowing you to simplify the above configuration as:

```js title="docusaurus.config.js"
export default {
  // ...
  plugins: ['content-blog', 'content-pages'],
  themes: ['classic'],
};
```

:::

They can also be loaded from local directories:

```js title="docusaurus.config.js"
import path from 'path';

export default {
  // ...
  themes: [path.resolve(__dirname, '/path/to/docusaurus-local-theme')],
};
```

To specify options for a plugin or theme, replace the name of the plugin or theme in the config file with an array containing the name and an options object:

```js title="docusaurus.config.js"
export default {
  // ...
  plugins: [
    [
      'content-blog',
      {
        path: 'blog',
        routeBasePath: 'blog',
        include: ['*.md', '*.mdx'],
        // ...
      },
    ],
    'content-pages',
  ],
};
```

To specify options for a plugin or theme that is bundled in a preset, pass the options through the `presets` field. In this example, `docs` refers to `@docusaurus/plugin-content-docs` and `theme` refers to `@docusaurus/theme-classic`.

```js title="docusaurus.config.js"
export default {
  // ...
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
        },
        theme: {
          customCss: ['./src/css/custom.css'],
        },
      },
    ],
  ],
};
```

:::tip

The `presets: [['classic', {...}]]` shorthand works as well.

:::

For further help configuring themes, plugins, and presets, see [Using Plugins](./using-plugins.mdx).

### Custom configurations {/* #custom-configurations */}

Docusaurus guards `docusaurus.config.js` from unknown fields. To add custom fields, define them in `customFields`.

Example:

```js title="docusaurus.config.js"
export default {
  // ...
  // highlight-start
  customFields: {
    image: '',
    keywords: [],
  },
  // highlight-end
  // ...
};
```

## Accessing configuration from components {/* #accessing-configuration-from-components */}

Your configuration object will be made available to all the components of your site. And you may access them via React context as `siteConfig`.

Basic example:

```jsx
import React from 'react';
// highlight-next-line
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const Hello = () => {
  // highlight-start
  const {siteConfig} = useDocusaurusContext();
  // highlight-end
  const {title, tagline} = siteConfig;

  return <div>{`${title} · ${tagline}`}</div>;
};
```

:::tip

If you just want to use those fields on the client side, you could create your own JS files and import them as ES6 modules, there is no need to put them in `docusaurus.config.js`.

:::

## Customizing Babel Configuration {/* #customizing-babel-configuration */}

Docusaurus transpiles your site's source code using Babel by default. If you want to customize the Babel configuration, you can do so by creating a `babel.config.js` file in your project root.

To use the built-in preset as a base configuration, install the following package and use it

```bash npm2yarn
npm install --save @docusaurus/babel
```

Then use the preset in your `babel.config.js` file:

```js title="babel.config.js"
export default {
  presets: ['@docusaurus/babel/preset'],
};
```

Most of the time, the default preset configuration will work just fine. If you want to customize your Babel configuration (e.g. to add support for Flow), you can directly edit this file. For your changes to take effect, you need to restart the Docusaurus dev server.
