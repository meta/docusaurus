---
id: admonitions
description: Handling admonitions/callouts in Docusaurus Markdown
slug: /markdown-features/admonitions
---

# Admonitions

import BrowserWindow from '@site/src/components/BrowserWindow';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Admonition from '@theme/Admonition';

In addition to the basic Markdown syntax, we have a special admonitions syntax by wrapping text with a set of 3 colons, followed by a label denoting its type.

Example:

```md
:::note

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

:::tip

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

:::info

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

:::warning

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

:::danger

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::
```

```mdx-code-block
<BrowserWindow>

:::note

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

:::tip

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

:::info

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

:::warning

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

:::danger

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

</BrowserWindow>
```

## Usage with Prettier {/* #usage-with-prettier */}

If you use [Prettier](https://prettier.io) to format your Markdown files, Prettier might auto-format your code to invalid admonition syntax. To avoid this problem, add empty lines around the starting and ending directives. This is also why the examples we show here all have empty lines around the content.

{/* prettier-ignore */}
```md
<!-- Prettier doesn't change this -->
:::note

Hello world

:::

<!-- Prettier changes this -->
:::note
Hello world
:::

<!-- to this -->
::: note Hello world:::
```

## Specifying title {/* #specifying-title */}

You may also specify an optional title.

```md
:::note[Your Title **with** some _Markdown_ `syntax`!]

Some **content** with some _Markdown_ `syntax`.

:::
```

```mdx-code-block
<BrowserWindow>

:::note[Your Title **with** some _Markdown_ `syntax`!]

Some **content** with some _Markdown_ `syntax`.

:::

</BrowserWindow>
```

## Specifying attributes {/* #specifying-attributes */}

You may also provide classes or IDs to admonitions.

```md
:::note[With css classes]{.padding--lg .text--italic}

Note the padding and the italicized text.

:::

:::note{#admonition-id}

The admonition container has now the id `admonition-id`.

:::

:::note{.padding--lg #admonition-id-2}

Use id and classes together.

:::
```

```mdx-code-block
<BrowserWindow>

:::note[With css classes]{.padding--lg .text--italic}

Note the padding and the italicized text.

:::

:::note{#admonition-id}

The admonition container has now the id `admonition-id`.

:::

:::note{.padding--lg #admonition-id-2}

Use id and classes together.

:::

</BrowserWindow>
```

## Nested admonitions {/* #nested-admonitions */}

Admonitions can be nested. Use more colons `:` for each parent admonition level.

```md
:::::info Parent

Parent content

::::danger Child

Child content

:::tip Deep Child

Deep child content

:::

::::

:::::
```

```mdx-code-block
<BrowserWindow>

:::::info Parent

Parent content

::::danger Child

Child content

:::tip Deep Child

Deep child content

:::

::::

:::::

</BrowserWindow>
```

## Admonitions with MDX {/* #admonitions-with-mdx */}

You can use MDX inside admonitions too!

```jsx
import Tabs from '@theme/Tabs';

import TabItem from '@theme/TabItem';

:::tip[Use tabs in admonitions]

<Tabs>
  <TabItem value="apple" label="Apple">This is an apple 🍎</TabItem>
  <TabItem value="orange" label="Orange">This is an orange 🍊</TabItem>
  <TabItem value="banana" label="Banana">This is a banana 🍌</TabItem>
</Tabs>

:::
```

```mdx-code-block
<BrowserWindow>

:::tip[Use tabs in admonitions]

<Tabs>
  <TabItem value="apple" label="Apple">This is an apple 🍎</TabItem>
  <TabItem value="orange" label="Orange">This is an orange 🍊</TabItem>
  <TabItem value="banana" label="Banana">This is a banana 🍌</TabItem>
</Tabs>

:::

</BrowserWindow>
```

## Usage in JSX {/* #usage-in-jsx */}

Outside of Markdown, you can use the `@theme/Admonition` component to get the same output.

```jsx title="MyReactPage.jsx"
import Admonition from '@theme/Admonition';

export default function MyReactPage() {
  return (
    <div>
      <Admonition type="info">
        <p>Some information</p>
      </Admonition>
    </div>
  );
}
```

The types that are accepted are the same as above: `note`, `tip`, `danger`, `info`, `warning`. Optionally, you can specify an icon by passing a JSX element or a string, or a title:

```jsx title="MyReactPage.jsx"
<Admonition type="tip" icon="💡" title="Did you know...">
  Use plugins to introduce shorter syntax for the most commonly used JSX
  elements in your project.
</Admonition>
```

```mdx-code-block
<BrowserWindow>
  <Admonition type="tip" icon="💡" title="Did you know...">
    Use plugins to introduce shorter syntax for the most commonly used JSX
    elements in your project.
  </Admonition>
</BrowserWindow>
```

## Customizing admonitions {/* #customizing-admonitions */}

There are two kinds of customizations possible with admonitions: **parsing** and **rendering**.

### Customizing rendering behavior {/* #customizing-rendering-behavior */}

You can customize how each individual admonition type is rendered through [swizzling](../../swizzling.mdx). You can often achieve your goal through a simple wrapper. For example, in the follow example, we swap out the icon for `info` admonitions only.

```jsx title="src/theme/Admonition.js"
import React from 'react';
import Admonition from '@theme-original/Admonition';
import MyCustomNoteIcon from '@site/static/img/info.svg';

export default function AdmonitionWrapper(props) {
  if (props.type !== 'info') {
    return <Admonition title="My Custom Admonition Title" {...props} />;
  }
  return <Admonition icon={<MyCustomNoteIcon />} {...props} />;
}
```

### Customizing parsing behavior {/* #customizing-parsing-behavior */}

Admonitions are implemented with a [Remark plugin](./markdown-features-plugins.mdx). The plugin is designed to be configurable. To customize the Remark plugin for a specific content plugin (docs, blog, pages), pass the options through the `admonitions` key.

```js title="docusaurus.config.js"
export default {
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          admonitions: {
            keywords: ['note', 'tip', 'info', 'warning', 'danger'],
            extendDefaults: true,
          },
        },
      },
    ],
  ],
};
```

The plugin accepts the following options:

- `keywords`: An array of keywords that can be used as the type for the admonition.
- `extendDefaults`: Should the provided options (such as `keywords`) be merged into the existing defaults. Defaults to `true`.

The `keyword` will be passed as the `type` prop of the `Admonition` component.

### Custom admonition type components {/* #custom-admonition-type-components */}

By default, the theme doesn't know what do to with custom admonition keywords such as `:::my-custom-admonition`. It is your responsibility to map each admonition keyword to a React component so that the theme knows how to render them.

If you registered a new admonition type `my-custom-admonition` via the following config:

```js title="docusaurus.config.js"
export default {
  // ...
  presets: [
    [
      'classic',
      {
        // ...
        docs: {
          admonitions: {
            keywords: ['my-custom-admonition'],
            extendDefaults: true,
          },
        },
      },
    ],
  ],
};
```

You can provide the corresponding React component for `:::my-custom-admonition` by creating the following file (unfortunately, since it's not a React component file, it's not swizzlable):

```js title="src/theme/Admonition/Types.js"
import React from 'react';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';

function MyCustomAdmonition(props) {
  return (
    <div style={{border: 'solid red', padding: 10}}>
      <h5 style={{color: 'blue', fontSize: 30}}>{props.title}</h5>
      <div>{props.children}</div>
    </div>
  );
}

const AdmonitionTypes = {
  ...DefaultAdmonitionTypes,

  // Add all your custom admonition types here...
  // You can also override the default ones if you want
  'my-custom-admonition': MyCustomAdmonition,
};

export default AdmonitionTypes;
```

Now you can use your new admonition keyword in a Markdown file, and it will be parsed and rendered with your custom logic:

```md
:::my-custom-admonition[My Title]

It works!

:::
```

<BrowserWindow>

:::my-custom-admonition[My Title]

It works!

:::

</BrowserWindow>
