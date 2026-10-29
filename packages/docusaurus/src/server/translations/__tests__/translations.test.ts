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
import {outputFile, readJSON} from '@docusaurus/fs';
import {
  writePluginTranslations,
  writeCodeTranslations,
  readCodeTranslationFileContent,
  type WriteTranslationsOptions,
  localizePluginTranslationFile,
  loadPluginsDefaultCodeTranslationMessages,
  applyDefaultCodeTranslations,
} from '../translations';
import type {
  InitializedPlugin,
  LoadedPlugin,
  TranslationFile,
  TranslationFileContent,
} from '@docusaurus/types';

async function createTmpSiteDir() {
  return mkdtempDisposable(
    path.join(await realpath(tmpdir()), 'docusaurus-tmp-'),
  );
}

async function createTmpTranslationFile(
  content: TranslationFileContent | null,
) {
  const siteDir = await createTmpSiteDir();
  const filePath = path.join(siteDir.path, 'i18n/en/code.json');

  // null means we don't want a file, just a filename
  if (content !== null) {
    await outputFile(filePath, JSON.stringify(content, null, 2));
  }

  return {
    localizationDir: path.join(siteDir.path, 'i18n/en'),
    readFile() {
      return readJSON(filePath);
    },
    [Symbol.asyncDispose]: siteDir[Symbol.asyncDispose],
  };
}

describe('writeCodeTranslations', () => {
  it('creates new translation file', async () => {
    using info = vi.spyOn(console, 'info');

    await using tmpTranslationFile = await createTmpTranslationFile(null);
    const {localizationDir, readFile} = tmpTranslationFile;

    await writeCodeTranslations(
      {localizationDir},
      {
        key1: {message: 'key1 message'},
        key2: {message: 'key2 message'},
        key3: {message: 'key3 message'},
      },
      {},
    );

    await expect(readFile()).resolves.toEqual({
      key1: {message: 'key1 message'},
      key2: {message: 'key2 message'},
      key3: {message: 'key3 message'},
    });
    expect(info).toHaveBeenCalledWith(
      expect.stringMatching(/3.* translations will be written/),
    );
  });

  it('creates new translation file with prefix', async () => {
    using info = vi.spyOn(console, 'info');

    await using tmpTranslationFile = await createTmpTranslationFile(null);
    const {localizationDir, readFile} = tmpTranslationFile;

    await writeCodeTranslations(
      {localizationDir},
      {
        key1: {message: 'key1 message'},
        key2: {message: 'key2 message'},
        key3: {message: 'key3 message'},
      },
      {
        messagePrefix: 'PREFIX ',
      },
    );

    await expect(readFile()).resolves.toEqual({
      key1: {message: 'PREFIX key1 message'},
      key2: {message: 'PREFIX key2 message'},
      key3: {message: 'PREFIX key3 message'},
    });
    expect(info).toHaveBeenCalledWith(
      expect.stringMatching(/3.* translations will be written/),
    );
  });

  it('appends missing translations', async () => {
    using info = vi.spyOn(console, 'info');

    await using tmpTranslationFile = await createTmpTranslationFile({
      key1: {message: 'key1 message'},
      key2: {message: 'key2 message'},
      key3: {message: 'key3 message'},
    });
    const {localizationDir, readFile} = tmpTranslationFile;

    await writeCodeTranslations(
      {localizationDir},
      {
        key1: {message: 'key1 message new'},
        key2: {message: 'key2 message new'},
        key3: {message: 'key3 message new'},
        key4: {message: 'key4 message new'},
      },
      {},
    );

    await expect(readFile()).resolves.toEqual({
      key1: {message: 'key1 message'},
      key2: {message: 'key2 message'},
      key3: {message: 'key3 message'},
      key4: {message: 'key4 message new'},
    });
    expect(info).toHaveBeenCalledWith(
      expect.stringMatching(/4.* translations will be written/),
    );
  });

  it('appends missing.* translations with prefix', async () => {
    using info = vi.spyOn(console, 'info');

    await using tmpTranslationFile = await createTmpTranslationFile({
      key1: {message: 'key1 message'},
    });
    const {localizationDir, readFile} = tmpTranslationFile;

    await writeCodeTranslations(
      {localizationDir},
      {
        key1: {message: 'key1 message new'},
        key2: {message: 'key2 message new'},
      },
      {
        messagePrefix: 'PREFIX ',
      },
    );

    await expect(readFile()).resolves.toEqual({
      key1: {message: 'key1 message'},
      key2: {message: 'PREFIX key2 message new'},
    });
    expect(info).toHaveBeenCalledWith(
      expect.stringMatching(/2.* translations will be written/),
    );
  });

  it('overrides missing translations', async () => {
    using info = vi.spyOn(console, 'info');

    await using tmpTranslationFile = await createTmpTranslationFile({
      key1: {message: 'key1 message'},
    });
    const {localizationDir, readFile} = tmpTranslationFile;

    await writeCodeTranslations(
      {localizationDir},
      {
        key1: {message: 'key1 message new'},
        key2: {message: 'key2 message new'},
      },
      {
        override: true,
      },
    );

    await expect(readFile()).resolves.toEqual({
      key1: {message: 'key1 message new'},
      key2: {message: 'key2 message new'},
    });
    expect(info).toHaveBeenCalledWith(
      expect.stringMatching(/2.* translations will be written/),
    );
  });

  it('overrides missing translations with prefix', async () => {
    using info = vi.spyOn(console, 'info');

    await using tmpTranslationFile = await createTmpTranslationFile({
      key1: {message: 'key1 message'},
    });
    const {localizationDir, readFile} = tmpTranslationFile;

    await writeCodeTranslations(
      {localizationDir},
      {
        key1: {message: 'key1 message new'},
        key2: {message: 'key2 message new'},
      },
      {
        override: true,
        messagePrefix: 'PREFIX ',
      },
    );

    await expect(readFile()).resolves.toEqual({
      key1: {message: 'PREFIX key1 message new'},
      key2: {message: 'PREFIX key2 message new'},
    });
    expect(info).toHaveBeenCalledWith(
      expect.stringMatching(/2.* translations will be written/),
    );
  });

  it('always overrides message description', async () => {
    using info = vi.spyOn(console, 'info');

    await using tmpTranslationFile = await createTmpTranslationFile({
      key1: {message: 'key1 message', description: 'key1 desc'},
      key2: {message: 'key2 message', description: 'key2 desc'},
      key3: {message: 'key3 message', description: undefined},
    });
    const {localizationDir, readFile} = tmpTranslationFile;

    await writeCodeTranslations(
      {localizationDir},
      {
        key1: {message: 'key1 message new', description: undefined},
        key2: {message: 'key2 message new', description: 'key2 desc new'},
        key3: {message: 'key3 message new', description: 'key3 desc new'},
      },
      {},
    );

    await expect(readFile()).resolves.toEqual({
      key1: {message: 'key1 message', description: undefined},
      key2: {message: 'key2 message', description: 'key2 desc new'},
      key3: {message: 'key3 message', description: 'key3 desc new'},
    });
    expect(info).toHaveBeenCalledWith(
      expect.stringMatching(/3.* translations will be written/),
    );
  });

  it('does not create empty translation files', async () => {
    using info = vi.spyOn(console, 'info');

    await using tmpTranslationFile = await createTmpTranslationFile(null);
    const {localizationDir, readFile} = tmpTranslationFile;

    await writeCodeTranslations({localizationDir}, {}, {});

    await expect(readFile()).rejects.toMatchObject({
      cause: {code: 'ENOENT'},
    });
    expect(info).toHaveBeenCalledTimes(0);
  });

  it('throws for invalid content', async () => {
    const {localizationDir} = await createTmpTranslationFile(
      // @ts-expect-error: bad content on purpose
      {bad: 'content'},
    );

    await expect(() =>
      writeCodeTranslations(
        {localizationDir},
        {
          key1: {message: 'key1 message'},
        },

        {},
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "bad" must be of type object]`,
    );
  });
});

describe('writePluginTranslations', () => {
  it('writes plugin translations', async () => {
    await using tmpDir = await createTmpSiteDir();
    const localizationDir = tmpDir.path;

    const filePath = path.join(
      localizationDir,
      'my-plugin-name',
      'my/translation/file.json',
    );

    await writePluginTranslations({
      localizationDir,
      translationFile: {
        path: 'my/translation/file',
        content: {
          key1: {message: 'key1 message'},
          key2: {message: 'key2 message'},
          key3: {message: 'key3 message'},
        },
      },
      plugin: {
        name: 'my-plugin-name',
        options: {
          id: 'default',
        },
      } as LoadedPlugin,
    });

    await expect(readJSON(filePath)).resolves.toEqual({
      key1: {message: 'key1 message'},
      key2: {message: 'key2 message'},
      key3: {message: 'key3 message'},
    });
  });

  it('writes plugin translations consecutively with different options', async () => {
    await using tmpDir = await createTmpSiteDir();
    const localizationDir = tmpDir.path;

    const filePath = path.join(
      localizationDir,
      'my-plugin-name-my-plugin-id',
      'my/translation/file.json',
    );

    function doWritePluginTranslations(
      content: TranslationFileContent,
      options?: WriteTranslationsOptions,
    ) {
      return writePluginTranslations({
        localizationDir,
        locale: 'fr',
        translationFile: {
          path: 'my/translation/file',
          content,
        },
        // @ts-expect-error: enough for this test
        plugin: {
          name: 'my-plugin-name',
          options: {
            id: 'my-plugin-id',
          },
        },
        options,
      });
    }

    await doWritePluginTranslations({
      key1: {message: 'key1 message', description: 'key1 desc'},
      key2: {message: 'key2 message', description: 'key2 desc'},
      key3: {message: 'key3 message', description: 'key3 desc'},
    });
    await expect(readJSON(filePath)).resolves.toEqual({
      key1: {message: 'key1 message', description: 'key1 desc'},
      key2: {message: 'key2 message', description: 'key2 desc'},
      key3: {message: 'key3 message', description: 'key3 desc'},
    });

    await doWritePluginTranslations(
      {
        key3: {message: 'key3 message 2'},
        key4: {message: 'key4 message 2', description: 'key4 desc'},
      },
      {messagePrefix: 'PREFIX '},
    );
    await expect(readJSON(filePath)).resolves.toEqual({
      key1: {message: 'key1 message', description: 'key1 desc'},
      key2: {message: 'key2 message', description: 'key2 desc'},
      key3: {message: 'key3 message', description: undefined},
      key4: {message: 'PREFIX key4 message 2', description: 'key4 desc'},
    });

    await doWritePluginTranslations(
      {
        key1: {message: 'key1 message 3', description: 'key1 desc'},
        key2: {message: 'key2 message 3', description: 'key2 desc'},
        key3: {message: 'key3 message 3', description: 'key3 desc'},
        key4: {message: 'key4 message 3', description: 'key4 desc'},
      },
      {messagePrefix: 'PREFIX ', override: true},
    );
    await expect(readJSON(filePath)).resolves.toEqual({
      key1: {message: 'PREFIX key1 message 3', description: 'key1 desc'},
      key2: {message: 'PREFIX key2 message 3', description: 'key2 desc'},
      key3: {message: 'PREFIX key3 message 3', description: 'key3 desc'},
      key4: {message: 'PREFIX key4 message 3', description: 'key4 desc'},
    });
  });

  it('throws with explicit extension', async () => {
    await using tmpDir = await createTmpSiteDir();
    const localizationDir = tmpDir.path;

    await expect(() =>
      writePluginTranslations({
        localizationDir,
        translationFile: {
          path: 'my/translation/file.json',
          content: {},
        },

        plugin: {
          name: 'my-plugin-name',
          options: {
            id: 'my-plugin-id',
          },
        } as LoadedPlugin,

        options: {},
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Translation file path at "my/translation/file.json" does not need to end with ".json", we add the extension automatically.]`,
    );
  });
});

describe('localizePluginTranslationFile', () => {
  it('does not localize if localized file does not exist', async () => {
    await using tmpDir = await createTmpSiteDir();
    const localizationDir = tmpDir.path;

    const translationFile: TranslationFile = {
      path: 'my/translation/file',
      content: {
        key1: {message: 'key1 message'},
        key2: {message: 'key2 message'},
        key3: {message: 'key3 message'},
      },
    };

    const localizedTranslationFile = await localizePluginTranslationFile({
      localizationDir,
      translationFile,
      plugin: {
        name: 'my-plugin-name',
        options: {},
      } as LoadedPlugin,
    });

    expect(localizedTranslationFile).toEqual(translationFile);
  });

  it('normalizes partially localized translation files', async () => {
    await using tmpDir = await createTmpSiteDir();
    const localizationDir = tmpDir.path;

    await outputFile(
      path.join(localizationDir, 'my-plugin-name', 'my/translation/file.json'),
      JSON.stringify({
        key2: {message: 'key2 message localized'},
        key4: {message: 'key4 message localized'},
      }),
    );

    const translationFile: TranslationFile = {
      path: 'my/translation/file',
      content: {
        key1: {message: 'key1 message'},
        key2: {message: 'key2 message'},
        key3: {message: 'key3 message'},
      },
    };

    const localizedTranslationFile = await localizePluginTranslationFile({
      localizationDir,
      translationFile,
      plugin: {
        name: 'my-plugin-name',
        options: {},
      } as LoadedPlugin,
    });

    expect(localizedTranslationFile).toEqual({
      path: translationFile.path,
      content: {
        // We only append/override localized messages, but never delete the data
        // of the unlocalized translation file. This ensures that all required
        // keys are present when trying to read the translations files
        key1: {message: 'key1 message'},
        key2: {message: 'key2 message localized'},
        key3: {message: 'key3 message'},
        key4: {message: 'key4 message localized'},
      },
    });
  });
});

describe('readCodeTranslationFileContent', () => {
  async function testReadTranslation(val: TranslationFileContent) {
    const {localizationDir} = await createTmpTranslationFile(val);
    return readCodeTranslationFileContent({localizationDir});
  }

  it("returns undefined if file doesn't exist", async () => {
    await expect(
      readCodeTranslationFileContent({localizationDir: 'foo'}),
    ).resolves.toBeUndefined();
  });

  it('passes valid translation file content', async () => {
    await expect(testReadTranslation({})).resolves.toEqual({});
    await expect(testReadTranslation({key1: {message: ''}})).resolves.toEqual({
      key1: {message: ''},
    });
    await expect(
      testReadTranslation({key1: {message: 'abc', description: 'desc'}}),
    ).resolves.toEqual({key1: {message: 'abc', description: 'desc'}});
    await expect(
      testReadTranslation({
        key1: {message: 'abc', description: 'desc'},
        key2: {message: 'def', description: 'desc'},
      }),
    ).resolves.toEqual({
      key1: {message: 'abc', description: 'desc'},
      key2: {message: 'def', description: 'desc'},
    });
  });

  it('fails for invalid translation file content', async () => {
    await expect(() =>
      // @ts-expect-error: test
      testReadTranslation('HEY'),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "value" must be of type object]`,
    );
    await expect(() =>
      // @ts-expect-error: test
      testReadTranslation(42),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "value" must be of type object]`,
    );
    await expect(() =>
      // @ts-expect-error: test
      testReadTranslation({key: {description: 'no message'}}),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "key.message" is required]`,
    );
    await expect(() =>
      // @ts-expect-error: test
      testReadTranslation({key: {message: 42}}),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "key.message" must be a string]`,
    );
    await expect(() =>
      testReadTranslation({
        // @ts-expect-error: test
        key: {message: 'Message', description: 42},
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "key.description" must be a string]`,
    );
  });
});

describe('loadPluginsDefaultCodeTranslationMessages', () => {
  function createTestPlugin(
    fn: InitializedPlugin['getDefaultCodeTranslationMessages'],
  ): InitializedPlugin {
    return {getDefaultCodeTranslationMessages: fn} as InitializedPlugin;
  }

  it('works for empty plugins', async () => {
    const plugins: InitializedPlugin[] = [];
    await expect(
      loadPluginsDefaultCodeTranslationMessages(plugins),
    ).resolves.toEqual({});
  });

  it('works for 1 plugin without lifecycle', async () => {
    const plugins: InitializedPlugin[] = [createTestPlugin(undefined)];
    await expect(
      loadPluginsDefaultCodeTranslationMessages(plugins),
    ).resolves.toEqual({});
  });

  it('works for 1 plugin with lifecycle', async () => {
    const plugins: InitializedPlugin[] = [
      createTestPlugin(async () => ({
        a: '1',
        b: '2',
      })),
    ];
    await expect(
      loadPluginsDefaultCodeTranslationMessages(plugins),
    ).resolves.toEqual({
      a: '1',
      b: '2',
    });
  });

  it('works for 2 plugins with lifecycles', async () => {
    const plugins: InitializedPlugin[] = [
      createTestPlugin(async () => ({
        a: '1',
        b: '2',
      })),
      createTestPlugin(async () => ({
        c: '3',
        d: '4',
      })),
    ];
    await expect(
      loadPluginsDefaultCodeTranslationMessages(plugins),
    ).resolves.toEqual({
      a: '1',
      b: '2',
      c: '3',
      d: '4',
    });
  });

  it('works for realistic use-case', async () => {
    const plugins: InitializedPlugin[] = [
      createTestPlugin(undefined),
      createTestPlugin(async () => ({
        a: '1',
        b: '2',
      })),
      createTestPlugin(undefined),
      createTestPlugin(undefined),
      createTestPlugin(async () => ({
        a: '2',
        d: '4',
      })),
      createTestPlugin(async () => ({
        d: '5',
      })),
      createTestPlugin(undefined),
    ];
    await expect(
      loadPluginsDefaultCodeTranslationMessages(plugins),
    ).resolves.toEqual({
      // merge, last plugin wins
      b: '2',
      a: '2',
      d: '5',
    });
  });
});

describe('applyDefaultCodeTranslations', () => {
  it('works for no code and message', () => {
    using warn = vi.spyOn(console, 'warn');
    expect(
      applyDefaultCodeTranslations({
        extractedCodeTranslations: {},
        defaultCodeMessages: {},
      }),
    ).toEqual({});
    expect(warn).toHaveBeenCalledTimes(0);
  });

  it('works for code and message', () => {
    using warn = vi.spyOn(console, 'warn');
    expect(
      applyDefaultCodeTranslations({
        extractedCodeTranslations: {
          id: {
            message: 'extracted message',
            description: 'description',
          },
        },
        defaultCodeMessages: {
          id: 'default message',
        },
      }),
    ).toEqual({
      id: {
        message: 'default message',
        description: 'description',
      },
    });
    expect(warn).toHaveBeenCalledTimes(0);
  });

  it('works for code and message mismatch', () => {
    using warn = vi.spyOn(console, 'warn');
    expect(
      applyDefaultCodeTranslations({
        extractedCodeTranslations: {
          id: {
            message: 'extracted message',
            description: 'description',
          },
        },
        defaultCodeMessages: {
          unknownId: 'default message',
        },
      }),
    ).toEqual({
      id: {
        message: 'extracted message',
        description: 'description',
      },
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toMatch(/unknownId/);
  });

  it('works for realistic scenario', () => {
    using warn = vi.spyOn(console, 'warn');
    expect(
      applyDefaultCodeTranslations({
        extractedCodeTranslations: {
          id1: {
            message: 'extracted message 1',
            description: 'description 1',
          },
          id2: {
            message: 'extracted message 2',
            description: 'description 2',
          },
          id3: {
            message: 'extracted message 3',
            description: 'description 3',
          },
        },
        defaultCodeMessages: {
          id2: 'default message id2',
          id3: 'default message id3',
          idUnknown1: 'default message idUnknown1',
          idUnknown2: 'default message idUnknown2',
        },
      }),
    ).toEqual({
      id1: {
        message: 'extracted message 1',
        description: 'description 1',
      },
      id2: {
        message: 'default message id2',
        description: 'description 2',
      },
      id3: {
        message: 'default message id3',
        description: 'description 3',
      },
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toMatch(/idUnknown1/);
    expect(warn.mock.calls[0]![0]).toMatch(/idUnknown2/);
  });
});
