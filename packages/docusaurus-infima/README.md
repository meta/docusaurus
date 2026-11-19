# `@docusaurus/infima`

The Infima CSS framework, an internal package of `@docusaurus/theme-classic`.

Don't depend on it directly: it has no stability guarantee, except for the `--ifm-*` CSS variables and the documented class names. The Infima documentation moves to [docusaurus.io/infima](https://docusaurus.io/infima).

## Origin

The `styles` sources come from the former upstream repository at commit [`87bc1dbf`](https://github.com/facebookincubator/infima/tree/87bc1dbfde5dfb2a70b5ff105b5f2f5ee130c2ab): they are the same as the published `infima@0.2.0-alpha.45` package. `scripts/build.mjs` inlines its [PostCSS preset](https://github.com/facebookincubator/infima/blob/87bc1dbfde5dfb2a70b5ff105b5f2f5ee130c2ab/packages/postcss-preset-infima/index.js).
