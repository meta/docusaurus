# `@docusaurus/infima`

The Infima CSS framework, an internal package of `@docusaurus/theme-classic`.

Don't depend on it directly: it has no stability guarantee, except for the `--ifm-*` CSS variables and the documented class names. The Infima documentation moves to [docusaurus.io/infima](https://docusaurus.io/infima).

## Sources

The `styles` folder contains plain CSS. `scripts/build.mjs` only inlines the `@import` rules of `styles/infima.css` into `dist/infima.css`. The site bundler does the rest: vendor prefixes and fallbacks for the site's target browsers, and minification.

The rule order is the cascade order: moving a rule can change which one wins.

## Origin

The `styles` sources come from the former upstream repository at commit [`87bc1dbf`](https://github.com/facebookincubator/infima/tree/87bc1dbfde5dfb2a70b5ff105b5f2f5ee130c2ab), the same as the published `infima@0.2.0-alpha.45` package. They were converted from PostCSS to plain CSS: loops, mixins and nesting expanded, and `color-mod()` colors precomputed.
