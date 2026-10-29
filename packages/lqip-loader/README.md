# `@docusaurus/lqip-loader`

Low Quality Image Placeholders (LQIP) loader for webpack.

## Installation

```bash
npm install --save-dev @docusaurus/lqip-loader
```

## Example

Generating Base64 for a jpeg image imported in your JS bundle:

> The large image file will be emitted & only 400byte of Base64 (if set to true in the loader options) will be bundled.

### `webpack.config.js`

The LQIP loader must be chained after a loader exporting the image URL as a JS module, such as [`@docusaurus/responsive-loader`](https://github.com/slorber/responsive-loader):

```js
{
  test: /\.(png|jpe?g)$/,
  // Loaders produce a JS module, not an asset
  type: 'javascript/auto',
  use: [
    '@docusaurus/lqip-loader',
    {
      loader: '@docusaurus/responsive-loader',
      options: {
        adapter: require('@docusaurus/responsive-loader/sharp'),
      },
    },
  ],
}
```

### `your-app-module.js`

```js
import banner from './images/banner.jpg';

console.log(banner.preSrc);
// outputs: "data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhY....

console.log(banner.src); // that's the original image URL to load later!
```

### Important note

To save memory and improve GPU performance, browsers (including Chrome started from 61.0.3163.38) will now render a slightly more crisp or pixelated Base64 encoded images. If you want the blur to be very intense (smooth), here's a fix!

```css
img {
  filter: blur(25px);
}
```

More history about the issue can be [found here](https://bugs.chromium.org/p/chromium/issues/detail?id=771110#c3) and [here](https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/6L_3ZZeuA0M).

## Credits

This package has been imported from [`@endiliey/lqip-loader`](https://github.com/endiliey/lqip-loader) which was a fork of the original [`lqip-loader`](https://github.com/zouhir/lqip-loader) created exclusively for Docusaurus.
