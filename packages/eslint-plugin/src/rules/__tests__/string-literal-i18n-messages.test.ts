/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import rule from '../string-literal-i18n-messages';
import {getCommonValidTests, ruleTester} from './testUtils';

const errorsJSX = [{messageId: 'translateChildren'}] as const;
const errorsFunc = [{messageId: 'translateArg'}] as const;

ruleTester.run('string-literal-i18n-messages', rule, {
  valid: [...getCommonValidTests()],

  invalid: [
    {
      code: '<Translate>{text}</Translate>',
      errors: errorsJSX,
    },
    {
      code: '<Translate>Hi {text} my friend</Translate>',
      errors: errorsJSX,
    },
    {
      code: '<Translate> {text} </Translate>',
      errors: errorsJSX,
    },
    {
      code: '<Translate>`{text}`</Translate>',
      errors: errorsJSX,
    },
    {
      // eslint-disable-next-line no-template-curly-in-string
      code: '<Translate>{`${text}`}</Translate>',
      errors: errorsJSX,
    },
    {
      code: 'translate({message: metaTitle})',
      errors: errorsFunc,
    },
  ],
});
