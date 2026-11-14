/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {test, expect} from '@playwright/test';

// cSpell:ignore zhong

test.beforeEach(async ({page}) => {
  await page.goto('http://localhost:3000/showcase?name=React&tags=opensource');
  await expect(page.locator('html')).toHaveAttribute(
    'data-has-hydrated',
    'true',
  );
});

test('showcase search commits input method text after composition ends', async ({
  page,
}) => {
  const input = page.getByPlaceholder('Search for site name...');
  await expect(input).toHaveValue('React');
  await input.selectText();

  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Input.imeSetComposition', {
      text: 'zhong',
      selectionStart: 0,
      selectionEnd: 5,
    });

    await expect(input).toHaveValue('zhong');
    await expect(page).toHaveURL(/\?name=React&tags=opensource$/);
    await expect(input).toBeFocused();

    await session.send('Input.insertText', {text: '中文'});

    await expect(input).toHaveValue('中文');
    await expect(page).toHaveURL(/\?name=%E4%B8%AD%E6%96%87&tags=opensource$/);
    await expect(input).toBeFocused();
  } finally {
    await session.detach();
  }
});

test('showcase search updates ordinary input and clearing immediately', async ({
  page,
}) => {
  const input = page.getByPlaceholder('Search for site name...');
  await input.fill('Docusaurus');
  await expect(page).toHaveURL(/\?name=Docusaurus&tags=opensource$/);

  await input.fill('');
  await expect(page).toHaveURL(/\?tags=opensource$/);
  await expect(input).toHaveValue('');
});

test('showcase search follows an external filter reset', async ({page}) => {
  const input = page.getByPlaceholder('Search for site name...');
  await expect(input).toHaveValue('React');

  await page.getByRole('button', {name: 'Clear All', exact: true}).click();

  await expect(page).toHaveURL('http://localhost:3000/showcase');
  await expect(input).toHaveValue('');
});
