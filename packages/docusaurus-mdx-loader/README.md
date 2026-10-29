# `@docusaurus/mdx-loader`

Docusaurus webpack loader for [MDX](https://github.com/mdx-js/mdx).

## Installation

```sh
yarn add @docusaurus/mdx-loader
```

## Usage

```js
// ...
module: {
  rules: [
    // ...
    {
      test: /\.mdx?$/,
      use: [
        {
          loader: '@docusaurus/mdx-loader',
          options: {
            // .. See options
          },
        },
      ],
    },
  ];
}
```

## Options

### `rehypePlugins`

Array of rehype plugins to manipulate the MDXHAST

### `remarkPlugins`

Array of remark plugins to manipulate the MDXAST

### `metadataPath`

A function to provide the metadataPath depending on current loaded MDX path that will be exported as the MDX metadata.

### `markdownConfig`

The global Docusaurus Markdown config (`config.markdown`), that plugin authors should forward:

```js
const loader = {
  loader: require.resolve('@docusaurus/mdx-loader'),
  options: {
    markdownConfig: siteConfig.markdown,
  },
};
```
