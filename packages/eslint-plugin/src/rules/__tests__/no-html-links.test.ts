/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import rule from '../no-html-links';
import {ruleTester} from './testUtils';

const errorsJSX = [{messageId: 'link'}] as const;

ruleTester.run('prefer-docusaurus-link', rule, {
  valid: [
    {
      code: '<Link to="/test">test</Link>',
    },
    {
      code: '<Link to="https://x.com/docusaurus">X</Link>',
    },
    {
      code: '<a href="https://x.com/docusaurus">X</a>',
      options: [{ignoreFullyResolved: true}],
    },
    {
      code: '<a href={`https://x.com/docusaurus`}>X</a>',
      options: [{ignoreFullyResolved: true}],
    },
    {
      code: '<a href="mailto:viktor@malmedal.dev">Contact</a>  ',
      options: [{ignoreFullyResolved: true}],
    },
    {
      code: '<a href="tel:123456789">Call</a>',
      options: [{ignoreFullyResolved: true}],
    },
  ],
  invalid: [
    {
      code: '<a href="/test">test</a>',
      errors: errorsJSX,
    },
    {
      code: '<a href="https://x.com/docusaurus" target="_blank">test</a>',
      errors: errorsJSX,
    },
    {
      code: '<a href="https://x.com/docusaurus" target="_blank" rel="noopener noreferrer">test</a>',
      errors: errorsJSX,
    },
    {
      code: '<a href="mailto:viktor@malmedal.dev">Contact</a>  ',
      errors: errorsJSX,
    },
    {
      code: '<a href="tel:123456789">Call</a>',
      errors: errorsJSX,
    },
    {
      code: '<a href={``}>Twitter</a>',
      errors: errorsJSX,
    },
    {
      code: '<a href={`https://www.twitter.com/docusaurus`}>Twitter</a>',
      errors: errorsJSX,
    },
    {
      code: '<a href="www.twitter.com/docusaurus">Twitter</a>',
      options: [{ignoreFullyResolved: true}],
      errors: errorsJSX,
    },
    {
      // TODO we might want to make this test pass
      // Can template literals be statically pre-evaluated? (Babel can do it)
      // eslint-disable-next-line no-template-curly-in-string
      code: '<a href={`https://x.com/${"docu" + "saurus"} ${"rex"}`}>Twitter</a>',
      options: [{ignoreFullyResolved: true}],
      errors: errorsJSX,
    },
  ],
});
