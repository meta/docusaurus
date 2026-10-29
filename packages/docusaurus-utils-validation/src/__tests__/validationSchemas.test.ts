/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import Joi from '../Joi';

import {
  AdmonitionsSchema,
  RehypePluginsSchema,
  RemarkPluginsSchema,
  PluginIdSchema,
  URISchema,
  PathnameSchema,
  RouteBasePathSchema,
  ContentVisibilitySchema,
  FrontMatterLastUpdateSchema,
  FrontMatterTagsSchema,
} from '../validationSchemas';

function createTestHelpers({
  schema,
  defaultValue,
}: {
  schema: Joi.Schema;
  defaultValue?: unknown;
}) {
  function testOK(value: unknown, options?: {normalizedValue?: unknown}) {
    const expectedValue = options?.normalizedValue ?? value ?? defaultValue;
    expect(Joi.attempt(value, schema)).toEqual(expectedValue);
  }

  function testFail(value: unknown) {
    expect(() => Joi.attempt(value, schema)).toThrowErrorMatchingSnapshot(
      `for value=${JSON.stringify(value)}`,
    );
  }

  return {testOK, testFail};
}

function testMarkdownPluginSchemas(schema: Joi.Schema) {
  const {testOK, testFail} = createTestHelpers({
    schema,
    defaultValue: [],
  });

  testOK(undefined);
  testOK([() => {}]);
  testOK([[() => {}, {attr: 'val'}]]);
  testOK([[() => {}, {attr: 'val'}], () => {}, [() => {}, {attr: 'val'}]]);
  // cSpell:ignore remarkjs
  // official `remarkjs/remark-frontmatter` plugin accepts string options
  testOK([[() => {}, 'string-option']]);
  testOK([[() => {}, true]]);

  testFail(null);
  testFail(false);
  testFail(3);
  testFail([null]);
  testFail([false]);
  testFail([3]);
  testFail([[]]);
  testFail([[() => {}, undefined]]);
}

describe('validation schemas', () => {
  it('pluginIdSchema', () => {
    const {testOK, testFail} = createTestHelpers({
      schema: PluginIdSchema,
      defaultValue: 'default',
    });

    testOK(undefined);
    testOK('docs');
    testOK('default');
    testOK('plugin-id_with-simple-special-chars');
    testOK('doc1');

    testFail('/docs');
    testFail('docs/');
    testFail('do/cs');
    testFail('do cs');
    testFail(null);
    testFail(3);
    testFail(true);
    testFail([]);
  });

  it('admonitionsSchema', () => {
    const {testOK, testFail} = createTestHelpers({
      schema: AdmonitionsSchema,
      defaultValue: true,
    });

    testOK(undefined);
    testOK(true);
    testOK(false);
    testOK({});
    testOK({keywords: ['info', 'tip']});
    testOK({keywords: ['info', 'tip'], extendDefaults: true});
    testOK({keywords: ['info', 'tip'], extendDefaults: false});
    testOK({keywords: []});
    testOK({keywords: [], extendDefaults: true}); // noop
    testOK({keywords: [], extendDefaults: false}); // disable admonitions
    testOK({keywords: ['custom-keyword'], extendDefaults: true});
    testOK({keywords: ['custom-keyword'], extendDefaults: false});

    testFail(3);
    testFail([]);
    testFail({unknownAttribute: 'val'});
    testFail({keywords: ['custom-keyword'], extendDefaults: 42});

    // Legacy types
    testFail({
      infima: true,
    });
    testFail({
      icons: 'emoji',
    });
    testFail({
      customTypes: {
        myKeyword: {
          keyword: `myKeyword`,
          infima: true,
          svg: '<svg width="512px" height="512px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"></svg>',
        },
      },
    });
  });

  it('remarkPluginsSchema', () => {
    testMarkdownPluginSchemas(RemarkPluginsSchema);
  });

  it('rehypePluginsSchema', () => {
    testMarkdownPluginSchemas(RehypePluginsSchema);
  });

  it('uRISchema', () => {
    const {testFail, testOK} = createTestHelpers({schema: URISchema});

    const validURL = 'https://docusaurus.io';
    const doubleHash = 'https://docusaurus.io#github#/:';
    const invalidURL = 'spaces are invalid in a URL';
    const relativeURL = 'relativeURL';
    const relativeURLWithParent = '../relativeURLWithParent';
    const urlFromIssue = 'https://riot.im/app/#/room/#ligo-public:matrix.org';
    testOK(validURL);
    testOK(doubleHash);
    testFail(invalidURL);
    testOK(relativeURL);
    testOK(relativeURLWithParent);
    testOK(urlFromIssue);

    const protocolRelativeUrl1 = '//docusaurus.io/path';
    const protocolRelativeUrl2 = '//docusaurus.io/docs/doc1#hash';
    testOK(protocolRelativeUrl1);
    testOK(protocolRelativeUrl2);
  });

  it('pathnameSchema', () => {
    const {testFail, testOK} = createTestHelpers({schema: PathnameSchema});

    testOK('/foo');
    testFail('foo');
    testFail('https://github.com/foo');
  });

  it('routeBasePathSchema', () => {
    const {testFail, testOK} = createTestHelpers({
      schema: RouteBasePathSchema,
      defaultValue: undefined,
    });

    testOK('', {normalizedValue: '/'});
    testOK('/');
    testOK('/foo', {normalizedValue: '/foo'});
    testOK('foo', {normalizedValue: '/foo'});
    testOK('blog', {normalizedValue: '/blog'});
    testOK('blog/', {normalizedValue: '/blog/'});
    testOK('prefix/blog', {normalizedValue: '/prefix/blog'});
    testOK('prefix/blog/', {normalizedValue: '/prefix/blog/'});
    testOK('/prefix/blog', {normalizedValue: '/prefix/blog'});
    testOK(undefined);

    testFail(3);
    testFail([]);
    testFail(null);
    testFail({});
  });

  it('contentVisibilitySchema', () => {
    const {testFail, testOK} = createTestHelpers({
      schema: ContentVisibilitySchema,
    });

    testOK({});
    testOK({draft: false});
    testOK({draft: true});
    testOK({unlisted: false});
    testOK({unlisted: true});

    testOK({draft: false, unlisted: false});
    testOK({draft: true, unlisted: false});
    testOK({draft: false, unlisted: true});
    testOK({draft: true, unlisted: undefined});
    testOK({draft: undefined, unlisted: true});

    testFail({draft: 'bad string'});
    testFail({draft: 42});
    testFail({unlisted: 'bad string'});
    testFail({unlisted: 42});
    testFail({draft: true, unlisted: true});
  });

  it('frontMatterLastUpdateSchema schema', () => {
    const {testFail, testOK} = createTestHelpers({
      schema: FrontMatterLastUpdateSchema,
    });

    testOK(undefined);
    testOK({date: '2021-01-01'});
    testOK({date: '2021-01'});
    testOK({date: '2021'});
    testOK({date: new Date()});
    testOK({author: 'author'});
    testOK({author: 'author', date: '2021-01-01'});
    testOK({author: 'author', date: new Date()});

    testFail(null);
    testFail({});
    testFail('string');
    testFail(42);
    testFail(true);
    testFail([]);
    testFail({author: 23});
    testFail({date: '20-20-20'});
  });

  it('frontMatterTagsSchema schema', () => {
    const {testFail, testOK} = createTestHelpers({
      schema: FrontMatterTagsSchema,
    });

    testOK(undefined);
    testOK([]);
    testOK(['tag1', 'tag 2']);
    testOK([42, 'tag'], {normalizedValue: ['42', 'tag']});

    testFail('tag');
    testFail(['']);
    testFail([true]);
    testFail([{label: 'Tag', permalink: '/tag'}]);
  });
});
