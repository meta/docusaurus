/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import path from 'node:path';
import {mkdtempDisposable, realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {SRC_DIR_NAME} from '@docusaurus/utils';
import {outputFile} from '@docusaurus/fs';
import {extractSiteSourceCodeTranslations} from '../translationsExtractor';
import type {InitializedPlugin, LoadedPlugin} from '@docusaurus/types';

async function createTmpDir() {
  return mkdtempDisposable(
    path.join(await realpath(tmpdir()), 'docusaurus-tmp-'),
  );
}

describe('extractSiteSourceCodeTranslations', () => {
  it('extracts translation from all plugins source code', async () => {
    await using siteDirTmp = await createTmpDir();
    const siteDir = siteDirTmp.path;

    const siteComponentFile1 = path.join(
      siteDir,
      SRC_DIR_NAME,
      'site-component-1.jsx',
    );
    await outputFile(
      siteComponentFile1,
      `
import Translate from '@docusaurus/Translate';

export default function MySiteComponent1() {
  return (
      <Translate
        id="siteComponentFileId1"
        description="site component 1 desc"
      >
        site component 1 message
      </Translate>
  );
}
`,
    );

    function createTestPlugin(pluginDir: string): InitializedPlugin {
      // @ts-expect-error: good enough for this test
      return {
        name: 'abc',
        getPathsToWatch() {
          return [path.join(pluginDir, 'subpath', '**/*.{js,jsx,ts,tsx}')];
        },
        getThemePath() {
          return path.join(pluginDir, 'src', 'theme');
        },
      };
    }

    await using plugin1DirTmp = await createTmpDir();
    const plugin1Dir = plugin1DirTmp.path;
    const plugin1File1 = path.join(plugin1Dir, 'subpath', 'file1.jsx');
    await outputFile(
      plugin1File1,
      `
import {translate} from '@docusaurus/Translate';

export default function MyComponent() {
  return (
    <div>
      <input
        text={translate(
          {id: 'plugin1Id1',message: 'plugin1 message 1',description: 'plugin1 description 1'},
          {someDynamicValue: 42}
        )}/>
    </div>
  );
}
`,
    );
    const plugin1File2 = path.join(plugin1Dir, 'src', 'theme', 'file2.jsx');
    await outputFile(
      plugin1File2,
      `
import {translate} from '@docusaurus/Translate';

export default function MyComponent() {
  return (
    <div>
      <input text={translate({id: 'plugin1Id2',message: 'plugin1 message 2',description: 'plugin1 description 2'})}/>
    </div>
  );
}
`,
    );

    // This one should not be found! On purpose!
    const plugin1File3 = path.join(plugin1Dir, 'ignoredFolder', 'file3.jsx');
    await outputFile(
      plugin1File3,
      `
import {translate} from '@docusaurus/Translate';

export default function MyComponent() {
  return (
    <div>
      <input text={translate({id: 'plugin1Id3',message: 'plugin1 message 3',description: 'plugin1 description 3'})}/>
    </div>
  );
}
`,
    );

    const plugin1File4 = path.join(plugin1Dir, 'src/theme/file4.jsx');
    // Contains some invalid translations...
    await outputFile(
      plugin1File4,
      `
import {translate} from '@docusaurus/Translate';

export default function MyComponent() {
  return (
    <div>
      <input text={translate({id: index})}/>
    </div>
  );
}
`,
    );

    using warn = vi.spyOn(console, 'warn');

    const plugin1 = createTestPlugin(plugin1Dir);

    await using plugin2DirTmp = await createTmpDir();
    const plugin2Dir = plugin2DirTmp.path;
    const plugin2File = path.join(plugin1Dir, 'subpath', 'file.tsx');
    await outputFile(
      plugin2File,
      `
import Translate, {translate} from '@docusaurus/Translate';

type Props = {hey: string};

export default function MyComponent(props: Props) {
  return (
    <div>
      <input text={translate({id: 'plugin2Id1',message: 'plugin2 message 1',description: 'plugin2 description 1'})}/>
      <Translate
        id="plugin2Id2"
        description="plugin2 description 2"
      >
        plugin2 message 2
      </Translate>
    </div>
  );
}
`,
    );
    const plugin2 = createTestPlugin(plugin2Dir);

    const plugins = [
      plugin1,
      plugin2,
      {name: 'dummy', options: {}, version: {type: 'synthetic'}} as const,
    ] as LoadedPlugin[];
    const translations = await extractSiteSourceCodeTranslations({
      siteDir,
      plugins,
    });
    expect(translations).toEqual({
      siteComponentFileId1: {
        description: 'site component 1 desc',
        message: 'site component 1 message',
      },
      plugin1Id1: {
        description: 'plugin1 description 1',
        message: 'plugin1 message 1',
      },
      plugin1Id2: {
        description: 'plugin1 description 2',
        message: 'plugin1 message 2',
      },
      plugin2Id1: {
        description: 'plugin2 description 1',
        message: 'plugin2 message 1',
      },
      plugin2Id2: {
        description: 'plugin2 description 2',
        message: 'plugin2 message 2',
      },
    });
    expect(warn.mock.calls[0]![0]).toMatch(
      /.*\[WARNING\].* Translation extraction warnings for file .*src.theme.file4\.jsx.*\n.*- translate\(\) first arg should be a statically evaluable object\./,
    );
  });
});
