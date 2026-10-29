/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {mkdtempDisposable, realpath, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {getBabelOptions} from '../utils';
import {extractSourceCodeFileTranslations} from '../babelTranslationsExtractor';

const TestBabelOptions = getBabelOptions({
  isServer: true,
});

async function tmpFile(name: string) {
  const dir = await mkdtempDisposable(
    path.join(await realpath(tmpdir()), 'docusaurus-tmp-'),
  );
  return {
    path: path.join(dir.path, name),
    [Symbol.asyncDispose]: dir[Symbol.asyncDispose],
  };
}

async function tmpSourceCodeFile({
  extension,
  content,
}: {
  extension: string;
  content: string;
}) {
  const file = await tmpFile(`sourceCode.${extension}`);
  await writeFile(file.path, content);
  return {
    path: file.path,
    [Symbol.asyncDispose]: file[Symbol.asyncDispose],
  };
}

describe('extractSourceCodeFileTranslations', () => {
  it('throws for bad source code', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
const default => {

}
`,
    });

    await expect(
      extractSourceCodeFileTranslations(sourceCodeFile.path, TestBabelOptions),
    ).rejects.toThrow(
      /Error while attempting to extract Docusaurus translations from source code file at/,
    );
  });

  it('extracts nothing from untranslated source code', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
const unrelated =  42;
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {},
      warnings: [],
    });
  });

  it('extracts from a translate() functions calls', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
import {translate} from '@docusaurus/Translate';

export default function MyComponent() {
  return (
    <div>
      <input text={translate({id: 'codeId',message: 'code message',description: 'code description'})}/>

      <input text={translate({id: 'codeId1'})}/>
    </div>
  );
}
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {
        codeId: {message: 'code message', description: 'code description'},
        codeId1: {message: 'codeId1'},
      },
      warnings: [],
    });
  });

  it('extracts from a <Translate> components', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
import Translate from '@docusaurus/Translate';

export default function MyComponent() {
  return (
    <div>
      <Translate id="codeId" description={"code description"}>
        code message
      </Translate>

      <Translate id="codeId1" description="description 2" />
    </div>
  );
}
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {
        codeId: {message: 'code message', description: 'code description'},
        codeId1: {message: 'codeId1', description: 'description 2'},
      },
      warnings: [],
    });
  });

  it('extracts statically evaluable content', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
import Translate, {translate} from '@docusaurus/Translate';

const prefix = "prefix ";

export default function MyComponent() {
  return (
    <div>
      <input
        text={translate({
          id: prefix + 'codeId fn',
          message: prefix + 'code message',
          description: prefix + 'code description'}
        )}
      />
      <Translate
        id={prefix + "codeId comp"}
        description={prefix + "code description"}
      >
      {prefix + "code message"}
      </Translate>
      <Translate>

        {

          prefix + \`Static template literal with unusual formatting!\`
        }
      </Translate>
    </div>
  );
}
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {
        'prefix codeId comp': {
          message: 'prefix code message',
          description: 'prefix code description',
        },
        'prefix codeId fn': {
          message: 'prefix code message',
          description: 'prefix code description',
        },
        'prefix Static template literal with unusual formatting!': {
          message: 'prefix Static template literal with unusual formatting!',
        },
      },
      warnings: [],
    });
  });

  it('extracts from TypeScript file', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'tsx',
      content: `
import {translate} from '@docusaurus/Translate';

type ComponentProps<T> = {toto: string}

export default function MyComponent<T>(props: ComponentProps<T>) {
  return (
    <div>
      <input text={translate({id: 'codeId',message: 'code message',description: 'code description'}) as string}/>
      <input text={translate({message: 'code message 2',description: 'code description 2'}) as string}/>
    </div>
  );
}
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {
        codeId: {message: 'code message', description: 'code description'},
        'code message 2': {
          message: 'code message 2',
          description: 'code description 2',
        },
      },
      warnings: [],
    });
  });

  it('does not extract from functions that is not docusaurus provided', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
import translate from 'a-lib';

export default function somethingElse() {
  const a = translate('foo');
  return <Translate>bar</Translate>
}
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {},
      warnings: [],
    });
  });

  it('does not extract from functions that is internal', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
function translate() {
  return 'foo'
}

export default function somethingElse() {
  const a = translate('foo');
  return a;
}
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {},
      warnings: [],
    });
  });

  it('recognizes aliased imports', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
import Foo, {translate as bar} from '@docusaurus/Translate';

export function MyComponent() {
  return (
    <div>
      <Foo id="codeId" description={"code description"}>
        code message
      </Foo>

      <Translate id="codeId1" />
    </div>
  );
}

export default function () {
  return (
    <div>
      <input text={translate({id: 'codeId',message: 'code message',description: 'code description'})}/>

      <input text={bar({id: 'codeId1'})}/>
    </div>
  );
}
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {
        codeId: {
          description: 'code description',
          message: 'code message',
        },
        codeId1: {
          message: 'codeId1',
        },
      },
      warnings: [],
    });
  });

  it('recognizes aliased imports as string literal', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
import {'translate' as bar} from '@docusaurus/Translate';

export default function () {
  return (
    <div>
      <input text={translate({id: 'codeId',message: 'code message',description: 'code description'})}/>

      <input text={bar({id: 'codeId1'})}/>
    </div>
  );
}
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {
        codeId1: {
          message: 'codeId1',
        },
      },
      warnings: [],
    });
  });

  it('warns about id if no children', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
import Translate from '@docusaurus/Translate';

export default function () {
  return (
    <Translate description="foo" />
  );
}
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {},
      warnings: [
        `<Translate> without children must have id prop.
Example: <Translate id="my-id" />
File: ${sourceCodeFile.path} at line 6
Full code: <Translate description="foo" />`,
      ],
    });
  });

  it('warns about dynamic id', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
import Translate from '@docusaurus/Translate';

export default function () {
  return (
    <Translate id={index}>foo</Translate>
  );
}
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {
        foo: {
          message: 'foo',
        },
      },
      warnings: [
        `<Translate> prop=id should be a statically evaluable object.
Example: <Translate id="optional id" description="optional description">Message</Translate>
Dynamically constructed values are not allowed, because they prevent translations to be extracted.
File: ${sourceCodeFile.path} at line 6
Full code: <Translate id={index}>foo</Translate>`,
      ],
    });
  });

  it('warns about dynamic children', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
import Translate from '@docusaurus/Translate';

export default function () {
  return (
    <Translate id='foo'><a>hhh</a></Translate>
  );
}
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {},
      warnings: [
        `Translate content could not be extracted. It has to be a static string and use optional but static props, like <Translate id="my-id" description="my-description">text</Translate>.
File: ${sourceCodeFile.path} at line 6
Full code: <Translate id='foo'><a>hhh</a></Translate>`,
      ],
    });
  });

  it('warns about dynamic translate argument', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
import {translate} from '@docusaurus/Translate';

translate(foo);
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {},
      warnings: [
        `translate() first arg should be a statically evaluable object.
Example: translate({message: "text",id: "optional.id",description: "optional description"}
Dynamically constructed values are not allowed, because they prevent translations to be extracted.
File: ${sourceCodeFile.path} at line 4
Full code: translate(foo)`,
      ],
    });
  });

  it('warns about too many arguments', async () => {
    await using sourceCodeFile = await tmpSourceCodeFile({
      extension: 'js',
      content: `
import {translate} from '@docusaurus/Translate';

translate({message: 'a'}, {a: 1}, 2);
`,
    });

    const sourceCodeFileTranslations = await extractSourceCodeFileTranslations(
      sourceCodeFile.path,
      TestBabelOptions,
    );

    expect(sourceCodeFileTranslations).toEqual({
      sourceCodeFilePath: sourceCodeFile.path,
      translations: {},
      warnings: [
        `translate() function only takes 1 or 2 args
File: ${sourceCodeFile.path} at line 4
Full code: translate({
  message: 'a'
}, {
  a: 1
}, 2)`,
      ],
    });
  });
});
