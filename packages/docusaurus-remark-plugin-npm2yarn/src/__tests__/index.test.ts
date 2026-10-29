/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {remark} from 'remark';
import mdx from 'remark-mdx';
import {read} from 'to-vfile';
import dedent from 'dedent';
import npm2yarn from '../index';

const process = async (
  content: any,
  options?: Parameters<typeof npm2yarn>[0],
) => {
  const result = await remark()
    .use(mdx)
    .use(npm2yarn, options)
    .process(content);

  return result.value;
};

const processFixture = async (
  name: string,
  options?: Parameters<typeof npm2yarn>[0],
) => {
  const filePath = path.join(__dirname, '__fixtures__', `${name}.md`);
  const file = await read(filePath);
  return process(file, options);
};

describe('npm2yarn plugin', () => {
  it('works with simplest md', async () => {
    const result = await process(dedent`
    # Title

    Hey

    \`\`\`bash npm2yarn
    npm install test
    \`\`\`

    `);

    expect(result).toMatchSnapshot();
  });

  it('works on installation file', async () => {
    const result = await processFixture('installation');

    expect(result).toMatchSnapshot();
  });

  it('works on plugin file', async () => {
    const result = await processFixture('plugin');

    expect(result).toMatchSnapshot();
  });

  it('works with common commands', async () => {
    const result = await processFixture('conversion-test', {sync: true});

    expect(result).toMatchSnapshot();
  });

  it('works with sync option', async () => {
    const result = await processFixture('plugin', {sync: true});

    expect(result).toMatchSnapshot();
  });

  it('does not work when language is not set', async () => {
    const result = await processFixture('syntax-not-properly-set');

    expect(result).toMatchSnapshot();
  });

  it('does not re-import tabs components when already imported above', async () => {
    const result = await processFixture('import-tabs-above');

    expect(result).toMatchSnapshot();
  });

  it('does not re-import tabs components when already imported below', async () => {
    const result = await processFixture('import-tabs-below');

    expect(result).toMatchSnapshot();
  });

  it('does not re-import tabs components real-world multiple npm2yarn usage', async () => {
    const result = await processFixture('multiple');
    expect(result).toMatchSnapshot();
  });

  it('work with yarn converter', async () => {
    const result = await processFixture('plugin', {converters: ['yarn']});

    expect(result).toMatchSnapshot();
  });

  it('work with pnpm converter', async () => {
    const result = await processFixture('plugin', {converters: ['pnpm']});

    expect(result).toMatchSnapshot();
  });

  it('work with bun converter', async () => {
    const result = await processFixture('plugin', {converters: ['bun']});

    expect(result).toMatchSnapshot();
  });

  it('work with custom converter', async () => {
    const result = await processFixture('plugin', {
      converters: [['Turbo', (code) => code.replace(/npm/g, 'turbo')]],
    });

    expect(result).toMatchSnapshot();
  });
});
