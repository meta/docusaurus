/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  createAssetRequest,
  findAssetRule,
  getAssetRuleUtils,
} from '../webpackUtils';
import type {RuleSetRule} from 'webpack';

describe('createAssetRequest', () => {
  it('creates asset request', () => {
    expect(createAssetRequest({assetPath: './img.png', type: 'image'})).toBe(
      '!./img.png?docusaurus-asset=image',
    );
  });

  it('creates asset request with search', () => {
    expect(
      createAssetRequest({
        assetPath: './file.pdf',
        search: '?w=10&h=10',
        type: 'file',
      }),
    ).toBe('!./file.pdf?w=10&h=10&docusaurus-asset=file');
  });
});

describe('getAssetRuleUtils', () => {
  function getAssetRequestRule(isServer: boolean, request: string) {
    const query = request.slice(request.indexOf('?'));
    const assetsRule = getAssetRuleUtils(isServer).rules.assets();
    return (assetsRule.oneOf as RuleSetRule[]).find(
      (rule) =>
        rule.resourceQuery instanceof RegExp && rule.resourceQuery.test(query),
    );
  }

  it('selects one rule per asset request type', () => {
    expect(
      getAssetRequestRule(
        false,
        createAssetRequest({assetPath: './img.png', type: 'image'}),
      ),
    ).toMatchObject({type: 'asset'});
    expect(
      getAssetRequestRule(
        false,
        createAssetRequest({
          assetPath: './img.png',
          search: '?w=10',
          type: 'image-file',
        }),
      ),
    ).toMatchObject({
      type: 'asset/resource',
      generator: {filename: 'assets/images/[name]-[contenthash][ext]'},
    });
    expect(
      getAssetRequestRule(
        false,
        createAssetRequest({assetPath: './data.json', type: 'file'}),
      ),
    ).toMatchObject({
      type: 'asset/resource',
      generator: {filename: 'assets/files/[name]-[contenthash][ext]'},
    });
  });

  it('does not emit assets for the server compiler', () => {
    expect(getAssetRuleUtils(false).rules.images()).toMatchObject({
      generator: {emit: true},
    });
    expect(getAssetRuleUtils(true).rules.images()).toMatchObject({
      generator: {emit: false},
    });
  });
});

describe('findAssetRule', () => {
  it('finds nested asset rule', () => {
    const utils = getAssetRuleUtils(false);
    const assetsRule = utils.rules.assets();
    const rules: RuleSetRule[] = [{test: /\.js$/}, assetsRule];
    const result = findAssetRule({rules, test: utils.rules.svgs().test});
    expect(result?.parentRules).toBe(assetsRule.oneOf);
    expect(result?.rule.test).toEqual(utils.rules.svgs().test);
  });

  it('returns undefined for unknown rule', () => {
    expect(
      findAssetRule({rules: [{test: /\.js$/}], test: /\.unknown$/}),
    ).toBeUndefined();
  });
});
