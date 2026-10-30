/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default [
  {
    path: '/page.html',
    exact: true,
    component: '',
  },
  {
    path: '/café.html',
    exact: true,
    component: '',
  },
  {
    path: '/docs',
    exact: false,
    component: '',
    routes: [
      {
        path: '/docs/installation',
        exact: true,
        component: '',
      },
    ],
  },
  {
    path: '*',
    component: '',
  },
];
