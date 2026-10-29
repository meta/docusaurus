/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import rule from '../prefer-docusaurus-heading';
import {ruleTester} from './testUtils';

const errorsJSX = [{messageId: 'headings'}] as const;

ruleTester.run('prefer-docusaurus-heading', rule, {
  valid: [
    {
      code: "<Heading as='h1'>heading 1</Heading>",
    },
    {
      code: "<Heading as='h2'>heading 2</Heading>",
    },
    {
      code: "<Heading as='h3'>heading 3</Heading>",
    },
    {
      code: "<Heading as='h4'>heading 4</Heading>",
    },
    {
      code: "<Heading as='h5'>heading 5</Heading>",
    },
    {
      code: "<Heading as='h6'>heading 6</Heading>",
    },
  ],
  invalid: [
    {
      code: '<h1>heading 1</h1>',
      errors: errorsJSX,
    },
    {
      code: '<h2>heading 2</h2>',
      errors: errorsJSX,
    },
    {
      code: '<h3>heading 3</h3>',
      errors: errorsJSX,
    },
    {
      code: '<h4>heading 4</h4>',
      errors: errorsJSX,
    },
    {
      code: '<h5>heading 5</h5>',
      errors: errorsJSX,
    },
    {
      code: '<h6>heading 6</h6>',
      errors: errorsJSX,
    },
  ],
});
