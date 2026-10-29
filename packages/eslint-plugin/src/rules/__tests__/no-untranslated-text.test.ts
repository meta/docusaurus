/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import rule from '../no-untranslated-text';
import {getCommonValidTests, ruleTester} from './testUtils';

const errorsJSX = [{messageId: 'translateChildren'}] as const;

ruleTester.run('no-untranslated-text', rule, {
  valid: [
    ...getCommonValidTests(),
    {
      code: '<Component>·</Component>',
      options: [{ignoredStrings: ['·', '—', '×']}],
    },
    {
      code: '<Component>· </Component>',
      options: [{ignoredStrings: ['·', '—', '×']}],
    },
    {
      code: '<Component> · </Component>',
      options: [{ignoredStrings: ['·', '—', '×']}],
    },
    {
      code: '<Component>· ·</Component>',
      options: [{ignoredStrings: ['·', '—', '×']}],
    },
    {
      code: '<Component>· — ×</Component>',
      options: [{ignoredStrings: ['·', '—', '×']}],
    },
    {
      code: '<Component>{"·"}</Component>',
      options: [{ignoredStrings: ['·']}],
    },
    {
      code: "<Component>{'·'}</Component>",
      options: [{ignoredStrings: ['·']}],
    },
    {
      code: '<Component>{`·`}</Component>',
      options: [{ignoredStrings: ['·', '—', '×']}],
    },
    {
      code: '<Component>Docusaurus</Component>',
      options: [{ignoredStrings: ['Docusaurus']}],
    },
    {
      code: '<Component>&#8203;</Component>',
      options: [{ignoredStrings: ['​']}],
    },
    {
      code: `<>
              {' · '}
            </>`,
      options: [{ignoredStrings: ['·']}],
    },
  ],

  invalid: [
    {
      code: '<Component>text</Component>',
      errors: errorsJSX,
    },
    {
      code: '<Component> text </Component>',
      errors: errorsJSX,
    },
    {
      code: '<Component>"text"</Component>',
      errors: errorsJSX,
    },
    {
      code: "<Component>'text'</Component>",
      errors: errorsJSX,
    },
    {
      code: '<Component>`text`</Component>',
      errors: errorsJSX,
    },
    {
      code: '<Component>{"text"}</Component>',
      errors: errorsJSX,
    },
    {
      code: "<Component>{'text'}</Component>",
      errors: errorsJSX,
    },
    {
      code: '<Component>{`text`}</Component>',
      errors: errorsJSX,
    },
    {
      code: '<>text</>',
      errors: errorsJSX,
    },
    {
      code: '<Component>· — ×</Component>',
      errors: errorsJSX,
      options: [{ignoredStrings: ['·', '—']}],
    },
    {
      code: '<Component>··</Component>',
      errors: errorsJSX,
      options: [{ignoredStrings: ['·', '—', '×']}],
    },
    {
      code: '<Component> ·· </Component>',
      errors: errorsJSX,
      options: [{ignoredStrings: ['·', '—', '×']}],
    },
    {
      code: '<Component>"·"</Component>',
      errors: errorsJSX,
      options: [{ignoredStrings: ['·', '—', '×']}],
    },
    {
      code: "<Component>'·'</Component>",
      errors: errorsJSX,
      options: [{ignoredStrings: ['·', '—', '×']}],
    },
    {
      code: '<Component>`·`</Component>',
      errors: errorsJSX,
      options: [{ignoredStrings: ['·', '—', '×']}],
    },
    {
      code: '<Component>Docusaurus</Component>',
      errors: errorsJSX,
      options: [{ignoredStrings: ['Docu', 'saurus']}],
    },
  ],
});
