/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import * as path from 'node:path';
import {mkdtempDisposable, realpath, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import * as YAML from 'js-yaml';
import {
  ensureUniquePermalinks,
  getTagsFile,
  getTagsFilePathsToWatch,
  normalizeTagsFile,
} from '../tagsFile';
import type {TagsFile, TagsFileInput} from '@docusaurus/utils';

describe('ensureUniquePermalinks', () => {
  it('throw when one duplicate permalink found', () => {
    const definedTags: TagsFile = {
      open: {
        label: 'Open Source',
        permalink: '/custom-open-source',
        description: 'Learn about the open source',
      },
      closed: {
        label: 'Closed Source',
        permalink: '/custom-open-source',
        description: 'Learn about the closed source',
      },
    };

    expect(() => ensureUniquePermalinks(definedTags))
      .toThrowErrorMatchingInlineSnapshot(`
        [Error: Duplicate permalinks found in tags file:
          - /custom-open-source]
      `);
  });

  it('throw when multiple duplicate permalink found', () => {
    const definedTags: TagsFile = {
      open: {
        label: 'Open Source',
        permalink: '/custom-open-source',
        description: 'Learn about the open source',
      },
      closed: {
        label: 'Closed Source',
        permalink: '/custom-open-source',
        description: 'Learn about the closed source',
      },
      hello: {
        label: 'Hello',
        permalink: '/hello',
        description: 'Learn about the hello',
      },
      world: {
        label: 'Hello',
        permalink: '/hello',
        description: 'Learn about the world',
      },
    };

    expect(() => ensureUniquePermalinks(definedTags))
      .toThrowErrorMatchingInlineSnapshot(`
        [Error: Duplicate permalinks found in tags file:
          - /custom-open-source
          - /hello]
      `);
  });

  it('do not throw when no duplicate permalink found', () => {
    const definedTags: TagsFile = {
      open: {
        label: 'Open Source',
        permalink: '/open-source',
        description: 'Learn about the open source',
      },
      closed: {
        label: 'Closed Source',
        permalink: '/closed-source',
        description: 'Learn about the closed source',
      },
    };

    expect(() => ensureUniquePermalinks(definedTags)).not.toThrow();
  });
});

describe('normalizeTagsFile', () => {
  it('normalize null tag', () => {
    const input: TagsFileInput = {
      'kebab case test': null,
    };

    const expectedOutput: TagsFile = {
      'kebab case test': {
        description: undefined,
        label: 'Kebab case test',
        permalink: '/kebab-case-test',
      },
    };

    expect(normalizeTagsFile(input)).toEqual(expectedOutput);
  });

  it('normalize partial tag with label', () => {
    const input: TagsFileInput = {
      world: {label: 'WORLD'},
    };

    const expectedOutput: TagsFile = {
      world: {
        description: undefined,
        label: 'WORLD',
        permalink: '/world',
      },
    };

    expect(normalizeTagsFile(input)).toEqual(expectedOutput);
  });

  it('normalize partial tag with description', () => {
    const input: TagsFileInput = {
      world: {description: 'World description test'},
    };

    const expectedOutput: TagsFile = {
      world: {
        description: 'World description test',
        label: 'World',
        permalink: '/world',
      },
    };

    expect(normalizeTagsFile(input)).toEqual(expectedOutput);
  });

  it('normalize partial tag with permalink', () => {
    const input: TagsFileInput = {
      world: {permalink: 'world'},
    };

    const expectedOutput: TagsFile = {
      world: {
        description: undefined,
        label: 'World',
        permalink: 'world',
      },
    };

    expect(normalizeTagsFile(input)).toEqual(expectedOutput);
  });

  it('does not modify fully defined tags', () => {
    const input: TagsFileInput = {
      tag1: {
        label: 'Custom Label',
        description: 'Custom Description',
        permalink: 'custom-permalink',
      },
    };

    expect(normalizeTagsFile(input)).toEqual(input);
  });

  it('handle special characters in keys', () => {
    const input: TagsFileInput = {
      'special@char$!key': null,
    };

    const expectedOutput: TagsFile = {
      'special@char$!key': {
        description: undefined,
        label: 'Special@char$!key',
        permalink: '/special-char-key',
      },
    };

    expect(normalizeTagsFile(input)).toEqual(expectedOutput);
  });

  it('handle special characters in keys with chinese characters', () => {
    const input: TagsFileInput = {
      特殊字符测试: null,
    };

    const expectedOutput: TagsFile = {
      特殊字符测试: {
        description: undefined,
        label: '特殊字符测试',
        permalink: '/特殊字符测试',
      },
    };

    expect(normalizeTagsFile(input)).toEqual(expectedOutput);
  });

  it('normalize test', () => {
    const input: TagsFileInput = {
      world: {permalink: 'aze'},
      hello: {permalink: 'h e l l o'},
    };

    const expectedOutput = {
      world: {
        description: undefined,
        label: 'World',
        permalink: 'aze',
      },
      hello: {
        description: undefined,
        label: 'Hello',
        permalink: 'h e l l o',
      },
    };

    expect(normalizeTagsFile(input)).toEqual(expectedOutput);
  });
});

describe('getTagsFilePathsToWatch', () => {
  it('returns tags file paths - tags undefined', () => {
    expect(
      getTagsFilePathsToWatch({
        tags: undefined,
        contentPaths: {
          contentPath: '/user/blog',
          contentPathLocalized: '/i18n/blog',
        },
      }),
    ).toEqual(['/i18n/blog/tags.yml', '/user/blog/tags.yml']);
  });

  it('returns tags file paths - tags.yml', () => {
    expect(
      getTagsFilePathsToWatch({
        tags: 'tags.yml',
        contentPaths: {
          contentPath: '/user/blog',
          contentPathLocalized: '/i18n/blog',
        },
      }),
    ).toEqual(['/i18n/blog/tags.yml', '/user/blog/tags.yml']);
  });

  it('returns tags file paths - customTags.yml', () => {
    expect(
      getTagsFilePathsToWatch({
        tags: 'customTags.yml',
        contentPaths: {
          contentPath: '/user/blog',
          contentPathLocalized: '/i18n/blog',
        },
      }),
    ).toEqual(['/i18n/blog/customTags.yml', '/user/blog/customTags.yml']);
  });

  it('returns [] - tags: null', () => {
    expect(
      getTagsFilePathsToWatch({
        tags: null,
        contentPaths: {
          contentPath: '/user/blog',
          contentPathLocalized: '/i18n/blog',
        },
      }),
    ).toEqual([]);
  });

  it('returns [] - tags: false', () => {
    expect(
      getTagsFilePathsToWatch({
        tags: false,
        contentPaths: {
          contentPath: '/user/blog',
          contentPathLocalized: '/i18n/blog',
        },
      }),
    ).toEqual([]);
  });
});

describe('getTagsFile', () => {
  async function createTestTagsFile({
    filePath,
    tagsFileInput,
  }: {
    filePath: string;
    tagsFileInput: TagsFileInput;
  }): Promise<{dir: string} & AsyncDisposable> {
    const tmpDir = await mkdtempDisposable(
      path.join(await realpath(tmpdir()), 'docusaurus-tmp-'),
    );
    const contentPath = tmpDir.path;
    const finalFilePath = path.join(contentPath, filePath);
    const fileContent = YAML.dump(tagsFileInput);
    await writeFile(finalFilePath, fileContent);
    return {
      dir: contentPath,
      [Symbol.asyncDispose]: tmpDir[Symbol.asyncDispose],
    };
  }

  type Params = Parameters<typeof getTagsFile>[0];

  it('reads tags file - regular', async () => {
    await using tagsFile = await createTestTagsFile({
      filePath: 'tags.yml',
      tagsFileInput: {
        tag1: {label: 'Tag1 Label'},
        tag2: {description: 'Tag2 Description'},
        tag3: {
          label: 'Tag3 Label',
          permalink: '/tag-3',
          description: 'Tag3 Description',
        },
      },
    });
    const {dir} = tagsFile;

    const params: Params = {
      contentPaths: {contentPath: dir, contentPathLocalized: dir},
      tags: 'tags.yml',
    };

    await expect(getTagsFile(params)).resolves.toMatchInlineSnapshot(`
      {
        "tag1": {
          "description": undefined,
          "label": "Tag1 Label",
          "permalink": "/tag-1",
        },
        "tag2": {
          "description": "Tag2 Description",
          "label": "Tag2",
          "permalink": "/tag-2",
        },
        "tag3": {
          "description": "Tag3 Description",
          "label": "Tag3 Label",
          "permalink": "/tag-3",
        },
      }
    `);
  });

  it('reads tags file - only keys', async () => {
    await using tagsFile = await createTestTagsFile({
      filePath: 'tags.yml',
      tagsFileInput: {
        tagKey: null,
      },
    });
    const {dir} = tagsFile;

    const params: Params = {
      contentPaths: {contentPath: dir, contentPathLocalized: dir},
      tags: 'tags.yml',
    };

    await expect(getTagsFile(params)).resolves.toMatchInlineSnapshot(`
      {
        "tagKey": {
          "description": undefined,
          "label": "Tagkey",
          "permalink": "/tag-key",
        },
      }
    `);
  });

  it('reads tags file - tags option undefined', async () => {
    await using tagsFile = await createTestTagsFile({
      filePath: 'tags.yml',
      tagsFileInput: {
        tag: {label: 'tag label'},
      },
    });
    const {dir} = tagsFile;

    const params: Params = {
      contentPaths: {contentPath: dir, contentPathLocalized: dir},
      tags: undefined,
    };

    await expect(getTagsFile(params)).resolves.toMatchInlineSnapshot(`
      {
        "tag": {
          "description": undefined,
          "label": "tag label",
          "permalink": "/tag",
        },
      }
    `);
  });

  it('reads tags file - empty file', async () => {
    await using tagsFile = await createTestTagsFile({
      filePath: 'tags.yml',
      tagsFileInput: {},
    });
    const {dir} = tagsFile;

    const params: Params = {
      contentPaths: {contentPath: dir, contentPathLocalized: dir},
      tags: undefined,
    };

    await expect(getTagsFile(params)).resolves.toEqual({});
  });

  it('reads tags file - prioritizes reading from localized content path', async () => {
    await using tagsFile = await createTestTagsFile({
      filePath: 'tags.yml',
      tagsFileInput: {
        tag: {label: 'tag label'},
      },
    });
    const {dir} = tagsFile;

    await using tagsFileLocalized = await createTestTagsFile({
      filePath: 'tags.yml',
      tagsFileInput: {
        tag: {label: 'tag label (localized)'},
      },
    });
    const {dir: dirLocalized} = tagsFileLocalized;

    const params: Params = {
      contentPaths: {contentPath: dir, contentPathLocalized: dirLocalized},
      tags: undefined,
    };

    await expect(getTagsFile(params)).resolves.toMatchInlineSnapshot(`
      {
        "tag": {
          "description": undefined,
          "label": "tag label (localized)",
          "permalink": "/tag",
        },
      }
    `);
  });

  it('reads tags file - custom tags file path', async () => {
    await using tagsFile = await createTestTagsFile({
      filePath: 'custom-tags-path.yml',
      tagsFileInput: {
        tag: {label: 'tag label'},
      },
    });
    const {dir} = tagsFile;

    const params: Params = {
      contentPaths: {contentPath: dir, contentPathLocalized: dir},
      tags: 'custom-tags-path.yml',
    };

    await expect(getTagsFile(params)).resolves.toMatchInlineSnapshot(`
      {
        "tag": {
          "description": undefined,
          "label": "tag label",
          "permalink": "/tag",
        },
      }
    `);
  });

  it('throws if duplicate permalink', async () => {
    await using tagsFile = await createTestTagsFile({
      filePath: 'tags.yml',
      tagsFileInput: {
        tag1: {permalink: '/duplicate'},
        tag2: {permalink: '/duplicate'},
      },
    });
    const {dir} = tagsFile;

    const params: Params = {
      contentPaths: {contentPath: dir, contentPathLocalized: dir},
      tags: undefined,
    };

    await expect(getTagsFile(params)).rejects.toMatchInlineSnapshot(`
      [Error: Duplicate permalinks found in tags file:
        - /duplicate]
    `);
  });

  it('throws if custom tags file path does not exist', async () => {
    const params: Params = {
      contentPaths: {contentPath: 'any', contentPathLocalized: 'localizedAny'},
      tags: 'custom-tags-path.yml',
    };

    await expect(getTagsFile(params)).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [Error: No tags file 'custom-tags-path.yml' could be found in any of those directories:
      - localizedAny
      - any]
    `);
  });

  it('does not read tags file - tags option null/false', async () => {
    await using tagsFile = await createTestTagsFile({
      filePath: 'tags.yml',
      tagsFileInput: {
        tag: {label: 'tag label'},
      },
    });
    const {dir} = tagsFile;

    await expect(
      getTagsFile({
        contentPaths: {contentPath: dir, contentPathLocalized: dir},
        tags: null,
      }),
    ).resolves.toBeNull();
    await expect(
      getTagsFile({
        contentPaths: {contentPath: dir, contentPathLocalized: dir},
        tags: false,
      }),
    ).resolves.toBeNull();
  });

  it('does not read tags file - tags files has non-default name', async () => {
    await using tagsFile = await createTestTagsFile({
      filePath: 'bad-tags-file-name.yml',
      tagsFileInput: {
        tag: {label: 'tag label'},
      },
    });
    const {dir} = tagsFile;

    const params: Params = {
      contentPaths: {contentPath: dir, contentPathLocalized: dir},
      tags: undefined,
    };

    await expect(getTagsFile(params)).resolves.toBeNull();
  });
});
