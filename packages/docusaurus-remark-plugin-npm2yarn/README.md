# `@docusaurus/remark-plugin-npm2yarn`

## Motivation:

Transforms npm bash command code blocks to Docusaurus tabs:

The following (remove the `//`):

````bash
// ```bash npm2yarn
// npm run build
// ```
````

Becomes:

![npm2yarn tabs example](./example.png)

**Note**: it only works when used with Docusaurus themes that have the `Tabs` and `TabItems` components.

## Install

```bash
npm install @docusaurus/remark-plugin-npm2yarn
```

It is a Remark plugin, **not a Docusaurus plugin**, so you have to install it as a Remark plugin in the config of your Docusaurus plugins.

```js
module.exports = {
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // ...
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), {sync: true}],
          ],
        },
        blog: {
          // ...
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), {sync: true}],
          ],
        },
        pages: {
          // ...
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), {sync: true}],
          ],
        },
        // ...
      },
    ],
  ],
  // ...
};
```

## Options

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `sync` | `boolean` | `false` | Syncing tab choices (Yarn and npm). See https://docusaurus.io/docs/markdown-features/#syncing-tab-choices for details. |
| `converters` | `array` | `['yarn', 'pnpm', 'bun']` | The list of converters to use. The order of the converters is important, as the first converter will be used as the default choice. |

## Custom converters

In case you want to convert npm commands to something else than `yarn`, `pnpm` or `bun`, you can use custom converters:

```ts
type CustomConverter = [name: string, cb: (npmCode: string) => string];
```

```ts
{
  remarkPlugins: [
    [
      require('@docusaurus/remark-plugin-npm2yarn'),
      {
        sync: true,
        converters: [
          'yarn',
          'pnpm',
          'bun',
          ['Turbo', (code) => code.replace(/npm/g, 'turbo')],
        ],
      },
    ],
  ];
}
```
