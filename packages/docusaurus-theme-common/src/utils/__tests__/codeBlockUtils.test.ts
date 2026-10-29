/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {
  getLineNumbersStart,
  type MagicCommentConfig,
  parseCodeBlockTitle,
  parseClassNameLanguage,
  parseLines,
  createCodeBlockMetadata,
} from '../codeBlockUtils';

const defaultMagicComments: MagicCommentConfig[] = [
  {
    className: 'theme-code-block-highlighted-line',
    line: 'highlight-next-line',
    block: {start: 'highlight-start', end: 'highlight-end'},
  },
];

describe('parseCodeBlockTitle', () => {
  it('parses double quote delimited title', () => {
    expect(parseCodeBlockTitle(`title="index.js"`)).toBe(`index.js`);
  });

  it('parses single quote delimited title', () => {
    expect(parseCodeBlockTitle(`title='index.js'`)).toBe(`index.js`);
  });

  it('does not parse mismatched quote delimiters', () => {
    expect(parseCodeBlockTitle(`title="index.js'`)).toBe(``);
  });

  it('parses undefined metastring', () => {
    expect(parseCodeBlockTitle(undefined)).toBe(``);
  });

  it('parses metastring with no title specified', () => {
    expect(parseCodeBlockTitle(`{1,2-3}`)).toBe(``);
  });

  it('parses with multiple metadata title first', () => {
    expect(parseCodeBlockTitle(`title="index.js" label="JavaScript"`)).toBe(
      `index.js`,
    );
  });

  it('parses with multiple metadata title last', () => {
    expect(parseCodeBlockTitle(`label="JavaScript" title="index.js"`)).toBe(
      `index.js`,
    );
  });

  it('parses double quotes when delimited by single quotes', () => {
    expect(parseCodeBlockTitle(`title='console.log("Hello, World!")'`)).toBe(
      `console.log("Hello, World!")`,
    );
  });

  it('parses single quotes when delimited by double quotes', () => {
    expect(parseCodeBlockTitle(`title="console.log('Hello, World!')"`)).toBe(
      `console.log('Hello, World!')`,
    );
  });
});

describe('parseClassNameLanguage', () => {
  it('works', () => {
    expect(parseClassNameLanguage('language-foo xxx yyy')).toBe('foo');
    expect(parseClassNameLanguage('xxxxx language-foo yyy')).toBe('foo');
    expect(parseClassNameLanguage('xx-language-foo yyyy')).toBeUndefined();
    expect(parseClassNameLanguage('xxx yyy zzz')).toBeUndefined();
  });
});

describe('parseLines', () => {
  it('does not parse content with metastring', () => {
    expect(
      parseLines('aaaaa\nnnnnn', {
        metastring: '{1}',
        language: 'js',
        magicComments: defaultMagicComments,
      }),
    ).toMatchInlineSnapshot(`
      {
        "code": "aaaaa
      nnnnn",
        "lineClassNames": {
          "0": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);

    expect(
      parseLines(
        `// highlight-next-line
aaaaa
bbbbb`,
        {
          metastring: '{1}',
          language: 'js',
          magicComments: defaultMagicComments,
        },
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "// highlight-next-line
      aaaaa
      bbbbb",
        "lineClassNames": {
          "0": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);

    expect(
      parseLines(
        `aaaaa
bbbbb`,
        {
          metastring: '{1}',
          language: 'undefined',
          magicComments: defaultMagicComments,
        },
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "aaaaa
      bbbbb",
        "lineClassNames": {
          "0": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);

    expect(() =>
      parseLines(
        `aaaaa
bbbbb`,
        {
          metastring: '{1}',
          language: 'js',
          magicComments: [],
        },
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: A highlight range has been given in code block's metastring (\`\`\` {1}), but no magic comment config is available. Docusaurus applies the first magic comment entry's className for metastring ranges.]`,
    );
  });

  it('does not parse content with no language', () => {
    expect(
      parseLines(
        `// highlight-next-line
aaaaa
bbbbb`,
        {
          metastring: '',
          language: undefined,
          magicComments: defaultMagicComments,
        },
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "// highlight-next-line
      aaaaa
      bbbbb",
        "lineClassNames": {},
      }
    `);
  });

  it('removes lines correctly', () => {
    expect(
      parseLines(
        `// highlight-next-line
aaaaa
bbbbb`,
        {metastring: '', language: 'js', magicComments: defaultMagicComments},
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "aaaaa
      bbbbb",
        "lineClassNames": {
          "0": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);

    expect(
      parseLines(
        `// highlight-start
aaaaa
// highlight-end
bbbbb`,
        {metastring: '', language: 'js', magicComments: defaultMagicComments},
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "aaaaa
      bbbbb",
        "lineClassNames": {
          "0": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);

    expect(
      parseLines(
        `// highlight-start
// highlight-next-line
aaaaa
bbbbbbb
// highlight-next-line
// highlight-end
bbbbb`,
        {metastring: '', language: 'js', magicComments: defaultMagicComments},
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "aaaaa
      bbbbbbb
      bbbbb",
        "lineClassNames": {
          "0": [
            "theme-code-block-highlighted-line",
            "theme-code-block-highlighted-line",
          ],
          "1": [
            "theme-code-block-highlighted-line",
          ],
          "2": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);
  });

  it('respects language', () => {
    expect(
      parseLines(
        `# highlight-next-line
aaaaa
bbbbb`,
        {metastring: '', language: 'js', magicComments: defaultMagicComments},
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "# highlight-next-line
      aaaaa
      bbbbb",
        "lineClassNames": {},
      }
    `);

    expect(
      parseLines(
        `/* highlight-next-line */
aaaaa
bbbbb`,
        {metastring: '', language: 'py', magicComments: defaultMagicComments},
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "/* highlight-next-line */
      aaaaa
      bbbbb",
        "lineClassNames": {},
      }
    `);

    expect(
      parseLines(
        `// highlight-next-line
aaaa
/* highlight-next-line */
bbbbb
# highlight-next-line
ccccc
<!-- highlight-next-line -->
dddd`,
        {metastring: '', language: 'py', magicComments: defaultMagicComments},
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "// highlight-next-line
      aaaa
      /* highlight-next-line */
      bbbbb
      ccccc
      <!-- highlight-next-line -->
      dddd",
        "lineClassNames": {
          "4": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);

    expect(
      parseLines(
        `// highlight-next-line
aaaa
/* highlight-next-line */
bbbbb
# highlight-next-line
ccccc
<!-- highlight-next-line -->
dddd`,
        {metastring: '', language: '', magicComments: defaultMagicComments},
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "aaaa
      bbbbb
      ccccc
      dddd",
        "lineClassNames": {
          "0": [
            "theme-code-block-highlighted-line",
          ],
          "1": [
            "theme-code-block-highlighted-line",
          ],
          "2": [
            "theme-code-block-highlighted-line",
          ],
          "3": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);

    expect(
      parseLines(
        `// highlight-next-line
aaaa
{/* highlight-next-line */}
bbbbb
<!-- highlight-next-line -->
dddd`,
        {metastring: '', language: 'jsx', magicComments: defaultMagicComments},
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "aaaa
      bbbbb
      <!-- highlight-next-line -->
      dddd",
        "lineClassNames": {
          "0": [
            "theme-code-block-highlighted-line",
          ],
          "1": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);

    expect(
      parseLines(
        `// highlight-next-line
aaaa
{/* highlight-next-line */}
bbbbb
<!-- highlight-next-line -->
dddd`,
        {metastring: '', language: 'html', magicComments: defaultMagicComments},
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "aaaa
      {/* highlight-next-line */}
      bbbbb
      dddd",
        "lineClassNames": {
          "0": [
            "theme-code-block-highlighted-line",
          ],
          "3": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);

    expect(
      parseLines(
        `---
# highlight-next-line
aaa: boo
---

aaaa

<div>
{/* highlight-next-line */}
foo
</div>

bbbbb
<!-- highlight-next-line -->
dddd

\`\`\`js
// highlight-next-line
console.log("preserved");
\`\`\`
`,
        {metastring: '', language: 'md', magicComments: defaultMagicComments},
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "---
      aaa: boo
      ---

      aaaa

      <div>
      foo
      </div>

      bbbbb
      dddd

      \`\`\`js
      // highlight-next-line
      console.log("preserved");
      \`\`\`",
        "lineClassNames": {
          "1": [
            "theme-code-block-highlighted-line",
          ],
          "11": [
            "theme-code-block-highlighted-line",
          ],
          "7": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);
  });

  it('parses multiple types of magic comments', () => {
    expect(
      parseLines(
        `
// highlight-next-line
highlighted
// collapse-next-line
collapsed
/* collapse-start */
collapsed
collapsed
/* collapse-end */
`,
        {
          language: 'js',
          metastring: '',
          magicComments: [
            {
              className: 'highlight',
              line: 'highlight-next-line',
              block: {start: 'highlight-start', end: 'highlight-end'},
            },
            {
              className: 'collapse',
              line: 'collapse-next-line',
              block: {start: 'collapse-start', end: 'collapse-end'},
            },
          ],
        },
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "
      highlighted
      collapsed
      collapsed
      collapsed",
        "lineClassNames": {
          "1": [
            "highlight",
          ],
          "2": [
            "collapse",
          ],
          "3": [
            "collapse",
          ],
          "4": [
            "collapse",
          ],
        },
      }
    `);
  });

  it('handles one line with multiple class names', () => {
    expect(
      parseLines(
        `
// highlight-next-line
// collapse-next-line
highlighted and collapsed
/* collapse-start */
/* highlight-start */
highlighted and collapsed
highlighted and collapsed
/* collapse-end */
Only highlighted
/* highlight-end */
/* collapse-start */
Only collapsed
/* highlight-start */
highlighted and collapsed
highlighted and collapsed
/* highlight-end */
Only collapsed
// highlight-next-line
highlighted and collapsed
/* collapse-end */
`,
        {
          language: 'js',
          metastring: '',
          magicComments: [
            {
              className: 'highlight',
              line: 'highlight-next-line',
              block: {start: 'highlight-start', end: 'highlight-end'},
            },
            {
              className: 'collapse',
              line: 'collapse-next-line',
              block: {start: 'collapse-start', end: 'collapse-end'},
            },
          ],
        },
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "
      highlighted and collapsed
      highlighted and collapsed
      highlighted and collapsed
      Only highlighted
      Only collapsed
      highlighted and collapsed
      highlighted and collapsed
      Only collapsed
      highlighted and collapsed",
        "lineClassNames": {
          "1": [
            "highlight",
            "collapse",
          ],
          "2": [
            "highlight",
            "collapse",
          ],
          "3": [
            "highlight",
            "collapse",
          ],
          "4": [
            "highlight",
          ],
          "5": [
            "collapse",
          ],
          "6": [
            "highlight",
            "collapse",
          ],
          "7": [
            "highlight",
            "collapse",
          ],
          "8": [
            "collapse",
          ],
          "9": [
            "highlight",
            "collapse",
          ],
        },
      }
    `);

    expect(
      parseLines(
        `// a
// b
// c
// d
line
// b
// d
line
`,
        {
          language: 'js',
          metastring: '',
          magicComments: [
            {className: 'a', line: 'a'},
            {className: 'b', line: 'b'},
            {className: 'c', line: 'c'},
            {className: 'd', line: 'd'},
          ],
        },
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "line
      line",
        "lineClassNames": {
          "0": [
            "a",
            "b",
            "c",
            "d",
          ],
          "1": [
            "b",
            "d",
          ],
        },
      }
    `);
  });

  it('handles CRLF line breaks with highlight comments correctly', () => {
    expect(
      parseLines(
        `aaaaa\r\n// highlight-start\r\nbbbbb\r\n// highlight-end\r\n`,
        {
          metastring: '',
          language: 'js',
          magicComments: defaultMagicComments,
        },
      ),
    ).toMatchInlineSnapshot(`
      {
        "code": "aaaaa
      bbbbb",
        "lineClassNames": {
          "1": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);
  });

  it('handles CRLF line breaks with highlight metastring', () => {
    expect(
      parseLines(`aaaaa\r\nbbbbb\r\n`, {
        metastring: '{2}',
        language: 'js',
        magicComments: defaultMagicComments,
      }),
    ).toMatchInlineSnapshot(`
      {
        "code": "aaaaa
      bbbbb",
        "lineClassNames": {
          "1": [
            "theme-code-block-highlighted-line",
          ],
        },
      }
    `);
  });
});

describe('getLineNumbersStart', () => {
  it('with nothing set', () => {
    expect(
      getLineNumbersStart({
        showLineNumbers: undefined,
        metastring: undefined,
      }),
    ).toMatchInlineSnapshot(`undefined`);
    expect(
      getLineNumbersStart({
        showLineNumbers: undefined,
        metastring: '',
      }),
    ).toMatchInlineSnapshot(`undefined`);
  });

  describe('handles prop', () => {
    describe('combined with metastring', () => {
      it('set to true', () => {
        expect(
          getLineNumbersStart({
            showLineNumbers: true,
            metastring: 'showLineNumbers=2',
          }),
        ).toMatchInlineSnapshot(`1`);
      });

      it('set to false', () => {
        expect(
          getLineNumbersStart({
            showLineNumbers: false,
            metastring: 'showLineNumbers=2',
          }),
        ).toMatchInlineSnapshot(`undefined`);
      });

      it('set to number', () => {
        expect(
          getLineNumbersStart({
            showLineNumbers: 10,
            metastring: 'showLineNumbers=2',
          }),
        ).toMatchInlineSnapshot(`10`);
      });
    });

    describe('standalone', () => {
      it('set to true', () => {
        expect(
          getLineNumbersStart({
            showLineNumbers: true,
            metastring: undefined,
          }),
        ).toMatchInlineSnapshot(`1`);
      });

      it('set to false', () => {
        expect(
          getLineNumbersStart({
            showLineNumbers: false,
            metastring: undefined,
          }),
        ).toMatchInlineSnapshot(`undefined`);
      });

      it('set to number', () => {
        expect(
          getLineNumbersStart({
            showLineNumbers: 10,
            metastring: undefined,
          }),
        ).toMatchInlineSnapshot(`10`);
      });
    });
  });

  describe('handles metadata', () => {
    describe('standalone', () => {
      it('set as flag', () => {
        expect(
          getLineNumbersStart({
            showLineNumbers: undefined,
            metastring: 'showLineNumbers',
          }),
        ).toMatchInlineSnapshot(`1`);
      });
      it('set with number', () => {
        expect(
          getLineNumbersStart({
            showLineNumbers: undefined,
            metastring: 'showLineNumbers=10',
          }),
        ).toMatchInlineSnapshot(`10`);
      });
    });

    describe('combined with other options', () => {
      it('set as flag', () => {
        expect(
          getLineNumbersStart({
            showLineNumbers: undefined,
            metastring: '{1,2-3}  title="file.txt" showLineNumbers noInline',
          }),
        ).toMatchInlineSnapshot(`1`);
      });
      it('set with number', () => {
        expect(
          getLineNumbersStart({
            showLineNumbers: undefined,
            metastring: '{1,2-3}  title="file.txt" showLineNumbers=10 noInline',
          }),
        ).toMatchInlineSnapshot(`10`);
      });
    });
  });
});

describe('createCodeBlockMetadata', () => {
  type Params = Parameters<typeof createCodeBlockMetadata>[0];

  const defaultParams: Params = {
    code: '',
    className: undefined,
    metastring: '',
    language: undefined,
    defaultLanguage: undefined,
    magicComments: defaultMagicComments,
    title: undefined,
    showLineNumbers: undefined,
  };

  function create(params?: Partial<Params>) {
    return createCodeBlockMetadata({...defaultParams, ...params});
  }

  it('creates basic metadata', () => {
    const meta = create();
    expect(meta).toMatchInlineSnapshot(`
      {
        "className": "language-text",
        "code": "",
        "codeInput": "",
        "language": "text",
        "lineClassNames": {},
        "lineNumbersStart": undefined,
        "title": undefined,
      }
    `);
  });

  describe('language', () => {
    it('returns input language', () => {
      const meta = create({language: 'js'});
      expect(meta.language).toBe('js');
    });

    it('returns className language', () => {
      const meta = create({className: 'x language-ts y z'});
      expect(meta.language).toBe('ts');
    });

    it('returns default language', () => {
      const meta = create({defaultLanguage: 'jsx'});
      expect(meta.language).toBe('jsx');
    });

    it('returns fallback language', () => {
      const meta = create();
      expect(meta.language).toBe('text');
    });

    it('returns language with expected precedence', () => {
      expect(
        create({
          language: 'js',
          className: 'x language-ts y z',
          defaultLanguage: 'jsx',
        }).language,
      ).toBe('js');
      expect(
        create({
          language: undefined,
          className: 'x language-ts y z',
          defaultLanguage: 'jsx',
        }).language,
      ).toBe('ts');
      expect(
        create({
          language: undefined,
          className: 'x y z',
          defaultLanguage: 'jsx',
        }).language,
      ).toBe('jsx');
      expect(
        create({
          language: undefined,
          className: 'x y z',
          defaultLanguage: undefined,
        }).language,
      ).toBe('text');
    });
  });

  describe('code highlighting', () => {
    it('returns code with no highlighting', () => {
      const code = 'const x = 42;';
      const meta = create({code});
      expect(meta.codeInput).toBe(code);
      expect(meta.code).toBe(code);
      expect(meta.lineClassNames).toMatchInlineSnapshot(`{}`);
    });

    it('returns code with metastring highlighting', () => {
      const code = 'const x = 42;';
      const meta = create({code, metastring: '{1}'});
      expect(meta.codeInput).toBe(code);
      expect(meta.code).toBe(code);
      expect(meta.lineClassNames).toMatchInlineSnapshot(
        `
        {
          "0": [
            "theme-code-block-highlighted-line",
          ],
        }
      `,
      );
    });

    it('returns code with magic comment highlighting', () => {
      const code = 'const x = 42;';
      const inputCode = `// highlight-next-line\n${code}`;

      const meta = create({code: inputCode});
      expect(meta.codeInput).toBe(inputCode);
      expect(meta.code).toBe(code);
      expect(meta.lineClassNames).toMatchInlineSnapshot(
        `
        {
          "0": [
            "theme-code-block-highlighted-line",
          ],
        }
      `,
      );
    });
  });

  describe('className', () => {
    it('returns provided className with current language', () => {
      const meta = create({language: 'js', className: 'some-class'});
      expect(meta.className).toBe('some-class language-js');
    });

    it('returns provided className with fallback language', () => {
      const meta = create({className: 'some-class'});
      expect(meta.className).toBe('some-class language-text');
    });

    it('returns provided className without duplicating className language', () => {
      const meta = create({
        language: 'js',
        className: 'some-class language-js',
      });
      expect(meta.className).toBe('some-class language-js');
    });
  });

  describe('title', () => {
    it('returns no title', () => {
      const meta = create();
      expect(meta.title).toBeUndefined();
    });

    it('returns title from metastring', () => {
      const meta = create({metastring: "title='my title meta'"});
      expect(meta.title).toBe('my title meta');
    });

    it('returns title from param', () => {
      const meta = create({title: 'my title param'});
      expect(meta.title).toBe('my title param');
    });

    it('returns title from meta over params', () => {
      const meta = create({
        metastring: "title='my title meta'",
        title: 'my title param',
      });
      expect(meta.title).toBe('my title meta');
    });
  });

  describe('showLineNumbers', () => {
    it('returns no lineNumbersStart', () => {
      const meta = create();
      expect(meta.lineNumbersStart).toBeUndefined();
    });

    it('returns lineNumbersStart - params.showLineNumbers=true', () => {
      const meta = create({showLineNumbers: true});
      expect(meta.lineNumbersStart).toBe(1);
    });

    it('returns lineNumbersStart - params.showLineNumbers=3', () => {
      const meta = create({showLineNumbers: 3});
      expect(meta.lineNumbersStart).toBe(3);
    });

    it('returns lineNumbersStart - meta showLineNumbers', () => {
      const meta = create({metastring: 'showLineNumbers'});
      expect(meta.lineNumbersStart).toBe(1);
    });

    it('returns lineNumbersStart - meta showLineNumbers=2', () => {
      const meta = create({metastring: 'showLineNumbers=2'});
      expect(meta.lineNumbersStart).toBe(2);
    });

    it('returns lineNumbersStart - params.showLineNumbers=3 + meta showLineNumbers=2', () => {
      const meta = create({
        showLineNumbers: 3,
        metastring: 'showLineNumbers=2',
      });
      expect(meta.lineNumbersStart).toBe(3);
    });
  });
});
