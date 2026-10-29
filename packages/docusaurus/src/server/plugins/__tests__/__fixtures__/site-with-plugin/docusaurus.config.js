/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  title: 'My Site',
  tagline: 'The tagline of my site',
  url: 'https://your-docusaurus-site.example.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  plugins: [
    function (_context, _options) {
      return {name: 'first-plugin'};
    },
    [
      function (_context, _options) {
        return {name: 'second-plugin'};
      },
      {it: 'should work'},
    ],
    function (_context, _options) {
      // it's ok for a plugin to self-disable
      return null;
    },
    './plugin3.js',
    ['./plugin4.js', {}],
    './pluginEsm',
    './pluginTypeScript.ts'
  ],
  presets: ['./preset.js'],
};
