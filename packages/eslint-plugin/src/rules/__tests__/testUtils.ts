/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {afterAll, describe, it} from 'vitest';
import {RuleTester} from '@typescript-eslint/rule-tester';

// `RuleTester` defers to globals when these are unset; we run with
// `globals: false`, so wire it to Vitest's test-framework functions instead.
RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

export const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

export const getCommonValidTests = (): {code: string}[] => [
  {
    code: '<Translate>text</Translate>',
  },
  {
    code: '<Translate> text </Translate>',
  },
  {
    code: '<Translate>"text"</Translate>',
  },
  {
    code: "<Translate>'text'</Translate>",
  },
  {
    code: '<Translate>`text`</Translate>',
  },
  {
    code: '<Translate>{"text"}</Translate>',
  },
  {
    code: "<Translate>{'text'}</Translate>",
  },
  {
    code: '<Translate>{`text`}</Translate>',
  },
  {
    code: '<Component>{text}</Component>',
  },
  {
    code: '<Component> {text} </Component>',
  },
  {
    code: 'translate({message: `My page meta title`})',
  },
  {
    code: `<Translate
              id="homepage.title"
              description="The homepage welcome message">
                Welcome to my website
            </Translate>`,
  },
  {
    code: `<Translate
              values={{firstName: 'Sébastien'}}>
                {'Welcome, {firstName}! How are you?'}
            </Translate>`,
  },
  {
    code: `<Translate>{'This'} is {\`valid\`}</Translate>`,
  },
  {
    code: "translate({message: 'My page meta title'})",
  },
  {
    code: "translate({message: 'The logo of site {siteName}'}, {siteName: 'Docusaurus'})",
  },
  {
    code: 'translate({otherProp: metaTitle})',
  },
  {
    code: 'translate({otherProp: `My page meta title`})',
  },
];
