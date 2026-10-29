/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {fromPartial, type PartialDeep} from '@total-typescript/shoehorn';
import {getBlogPostAuthors, groupBlogPostsByAuthorKey} from '../authors';
import type {
  AuthorAttributes,
  AuthorsMap,
  BlogPost,
} from '@docusaurus/plugin-content-blog';

function post(partial: PartialDeep<BlogPost>): BlogPost {
  return fromPartial(partial);
}

describe('getBlogPostAuthors', () => {
  it('can read no authors', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {},
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: [],
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([]);
  });

  it('can read authors string', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },
        authorsMap: {
          slorber: {name: 'Sébastien Lorber', key: 'slorber', page: null},
        },
        baseUrl: '/',
      }),
    ).toEqual([
      {
        key: 'slorber',
        name: 'Sébastien Lorber',
        imageURL: undefined,
        page: null,
      },
    ]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },
        authorsMap: {
          slorber: {
            name: 'Sébastien Lorber',
            imageURL: 'https://github.com/slorber.png',
            key: 'slorber',
            page: null,
          },
        },
        baseUrl: '/',
      }),
    ).toEqual([
      {
        key: 'slorber',
        name: 'Sébastien Lorber',
        imageURL: 'https://github.com/slorber.png',
        page: null,
      },
    ]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },
        authorsMap: {
          slorber: {
            name: 'Sébastien Lorber',
            imageURL: '/img/slorber.png',
            key: 'slorber',
            page: null,
          },
        },
        baseUrl: '/',
      }),
    ).toEqual([
      {
        key: 'slorber',
        name: 'Sébastien Lorber',
        imageURL: '/img/slorber.png',
        page: null,
      },
    ]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },
        authorsMap: {
          slorber: {
            name: 'Sébastien Lorber',
            imageURL: '/baseUrl/img/slorber.png',
            key: 'slorber',
            page: null,
          },
        },
        baseUrl: '/baseUrl',
      }),
    ).toEqual([
      {
        key: 'slorber',
        name: 'Sébastien Lorber',
        imageURL: '/baseUrl/img/slorber.png',
        page: null,
      },
    ]);
  });

  it('can read authors string[]', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: ['slorber', 'yangshun'],
        },
        authorsMap: {
          slorber: {
            name: 'Sébastien Lorber',
            title: 'maintainer',
            key: 'slorber',
            page: null,
          },
          yangshun: {name: 'Yangshun Tay', key: 'yangshun', page: null},
        },
        baseUrl: '/',
      }),
    ).toEqual([
      {
        key: 'slorber',
        name: 'Sébastien Lorber',
        title: 'maintainer',
        imageURL: undefined,
        page: null,
      },
      {
        key: 'yangshun',
        name: 'Yangshun Tay',
        imageURL: undefined,

        page: null,
      },
    ]);
  });

  it('read different values from socials', () => {
    function testSocials(socials: AuthorAttributes['socials'] | undefined) {
      return getBlogPostAuthors({
        frontMatter: {
          authors: {
            name: 'Sébastien Lorber',
            title: 'maintainer',
            socials,
          },
        },
        authorsMap: undefined,
        baseUrl: '/',
      });
    }

    // @ts-expect-error test
    expect(() => testSocials(null)).not.toThrow();
    // @ts-expect-error test
    expect(testSocials(null)).toEqual([
      {
        name: 'Sébastien Lorber',
        title: 'maintainer',
        imageURL: undefined,
        socials: {},
        key: null,
        page: null,
      },
    ]);
    expect(() => () => testSocials(undefined)).not.toThrow();
    // @ts-expect-error test
    expect(() => testSocials({twitter: undefined}))
      .toThrowErrorMatchingInlineSnapshot(`
        [Error: Author socials should be usernames/userIds/handles, or fully qualified HTTP(s) absolute URLs.
        Social platform 'twitter' has illegal value 'undefined']
      `);
    expect(
      // @ts-expect-error test
      () => testSocials({twitter: null}),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: Author socials should be usernames/userIds/handles, or fully qualified HTTP(s) absolute URLs.
      Social platform 'twitter' has illegal value 'null']
    `);
  });

  it('can read empty socials', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: {
            name: 'Sébastien Lorber',
            title: 'maintainer',
            socials: {},
          },
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([
      {
        name: 'Sébastien Lorber',
        title: 'maintainer',
        imageURL: undefined,
        socials: {},
        key: null,
        page: null,
      },
    ]);
  });

  it('can normalize full socials from Author', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: {
            name: 'Sébastien Lorber',
            title: 'maintainer',
            socials: {
              github: 'https://github.com/slorber',
              linkedin: 'https://www.linkedin.com/in/sebastienlorber/',
              stackoverflow: 'https://stackoverflow.com/users/82609',
              twitter: 'https://twitter.com/sebastienlorber',
              x: 'https://x.com/sebastienlorber',
            },
          },
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([
      {
        name: 'Sébastien Lorber',
        title: 'maintainer',
        imageURL: undefined,
        key: null,
        socials: {
          github: 'https://github.com/slorber',
          linkedin: 'https://www.linkedin.com/in/sebastienlorber/',
          stackoverflow: 'https://stackoverflow.com/users/82609',
          twitter: 'https://twitter.com/sebastienlorber',
          x: 'https://x.com/sebastienlorber',
        },
        page: null,
      },
    ]);
  });

  it('can normalize handle socials from Author', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: {
            name: 'Sébastien Lorber',
            title: 'maintainer',
            socials: {
              github: 'slorber',
              x: 'sebastienlorber',
              linkedin: 'sebastienlorber',
              stackoverflow: '82609',
              twitter: 'sebastienlorber',
            },
          },
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([
      {
        name: 'Sébastien Lorber',
        title: 'maintainer',
        imageURL: undefined,
        key: null,
        socials: {
          github: 'https://github.com/slorber',
          linkedin: 'https://www.linkedin.com/in/sebastienlorber/',
          stackoverflow: 'https://stackoverflow.com/users/82609',
          twitter: 'https://twitter.com/sebastienlorber',
          x: 'https://x.com/sebastienlorber',
        },
        page: null,
      },
    ]);
  });

  it('can normalize socials from Author[]', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: [
            {
              name: 'Sébastien Lorber',
              title: 'maintainer',
              socials: {
                github: 'slorber',
                x: 'sebastienlorber',
                linkedin: 'sebastienlorber',
                stackoverflow: '82609',
                twitter: 'sebastienlorber',
              },
            },
            {
              name: 'Seb',
              socials: {
                github: 'https://github.com/slorber',
                linkedin: 'https://www.linkedin.com/in/sebastienlorber/',
                stackoverflow: 'https://stackoverflow.com/users/82609',
                twitter: 'https://twitter.com/sebastienlorber',
                x: 'https://x.com/sebastienlorber',
              },
            },
          ],
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([
      {
        name: 'Sébastien Lorber',
        title: 'maintainer',
        imageURL: undefined,
        key: null,
        socials: {
          github: 'https://github.com/slorber',
          linkedin: 'https://www.linkedin.com/in/sebastienlorber/',
          stackoverflow: 'https://stackoverflow.com/users/82609',
          twitter: 'https://twitter.com/sebastienlorber',
          x: 'https://x.com/sebastienlorber',
        },
        page: null,
      },
      {
        name: 'Seb',
        imageURL: undefined,
        key: null,
        socials: {
          github: 'https://github.com/slorber',
          linkedin: 'https://www.linkedin.com/in/sebastienlorber/',
          stackoverflow: 'https://stackoverflow.com/users/82609',
          twitter: 'https://twitter.com/sebastienlorber',
          x: 'https://x.com/sebastienlorber',
        },
        page: null,
      },
    ]);
  });

  it('can read authors Author[]', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: [
            {
              name: 'Sébastien Lorber',
              title: 'maintainer',
            },
            {
              name: 'Yangshun Tay',
            },
          ],
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([
      {
        name: 'Sébastien Lorber',
        title: 'maintainer',
        imageURL: undefined,
        key: null,
        socials: {},
        page: null,
      },
      {
        name: 'Yangshun Tay',
        imageURL: undefined,
        socials: {},
        key: null,
        page: null,
      },
    ]);
  });

  it('can read authors complex (string | Author)[] setup with keys and local overrides', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: [
            'slorber',
            {
              key: 'yangshun',
              title: 'Yangshun title local override',
              extra: 42,
            },
            {
              name: 'Alexey',
              socials: {
                github: 'lex111',
              },
            },
          ],
        },
        authorsMap: {
          slorber: {
            name: 'Sébastien Lorber',
            title: 'maintainer',
            key: 'slorber',
            page: null,
          },
          yangshun: {
            name: 'Yangshun Tay',
            title: 'Yangshun title original',
            key: 'yangshun',
            page: null,
          },
        },
        baseUrl: '/',
      }),
    ).toEqual([
      {
        key: 'slorber',
        name: 'Sébastien Lorber',
        title: 'maintainer',
        imageURL: undefined,
        page: null,
      },
      {
        key: 'yangshun',
        name: 'Yangshun Tay',
        title: 'Yangshun title local override',
        extra: 42,
        socials: {},
        imageURL: undefined,
        page: null,
      },
      {
        name: 'Alexey',
        imageURL: undefined,
        key: null,
        page: null,
        socials: {
          github: 'https://github.com/lex111',
        },
      },
    ]);
  });

  it('throw when using author key with no authorsMap', () => {
    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: Can't reference blog post authors by a key (such as 'slorber') because no authors map file could be loaded.
      Please double-check your blog plugin config (in particular 'authorsMapPath'), ensure the file exists at the configured path, is not empty, and is valid!]
    `);
  });

  it('throw when using author key with empty authorsMap', () => {
    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },
        authorsMap: {},
        baseUrl: '/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: Can't reference blog post authors by a key (such as 'slorber') because no authors map file could be loaded.
      Please double-check your blog plugin config (in particular 'authorsMapPath'), ensure the file exists at the configured path, is not empty, and is valid!]
    `);
  });

  it('throw when using bad author key in string', () => {
    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },

        authorsMap: {
          yangshun: {name: 'Yangshun Tay', key: 'yangshun', page: null},
          jmarcey: {name: 'Joel Marcey', key: 'jmarcey', page: null},
        },
        baseUrl: '/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: Blog author with key "slorber" not found in the authors map file.
      Valid author keys are:
      - yangshun
      - jmarcey]
    `);
  });

  it('throw when using bad author key in string[]', () => {
    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: ['yangshun', 'jmarcey', 'slorber'],
        },
        authorsMap: {
          yangshun: {name: 'Yangshun Tay', key: 'yangshun', page: null},
          jmarcey: {name: 'Joel Marcey', key: 'jmarcey', page: null},
        },
        baseUrl: '/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: Blog author with key "slorber" not found in the authors map file.
      Valid author keys are:
      - yangshun
      - jmarcey]
    `);
  });

  it('throw when using bad author key in Author[].key', () => {
    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: [{key: 'yangshun'}, {key: 'jmarcey'}, {key: 'slorber'}],
        },

        authorsMap: {
          yangshun: {name: 'Yangshun Tay', key: 'yangshun', page: null},
          jmarcey: {name: 'Joel Marcey', key: 'jmarcey', page: null},
        },
        baseUrl: '/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: Blog author with key "slorber" not found in the authors map file.
      Valid author keys are:
      - yangshun
      - jmarcey]
    `);
  });

  // Global author without baseUrl
  it('getBlogPostAuthors do not modify global authors imageUrl without baseUrl', async () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: ['ozaki'],
        },
        authorsMap: {
          ozaki: {
            key: 'ozaki',
            imageURL: '/ozaki.png',
            page: null,
          },
        },
        baseUrl: '/',
      }),
    ).toEqual([
      {
        imageURL: '/ozaki.png',
        key: 'ozaki',
        page: null,
      },
    ]);
  });

  // Global author with baseUrl
  it('getBlogPostAuthors do not modify global authors imageUrl with baseUrl', async () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: ['ozaki'],
        },
        authorsMap: {
          ozaki: {
            key: 'ozaki',
            imageURL: '/img/ozaki.png',
            page: null,
          },
        },
        baseUrl: '/img/',
      }),
    ).toEqual([
      {
        imageURL: '/img/ozaki.png',
        key: 'ozaki',
        page: null,
      },
    ]);
  });

  // Global author without baseUrl with a subfolder in img
  it('getBlogPostAuthors do not modify globalAuthor imageUrl with subfolder without baseUrl', async () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: ['ozaki'],
        },
        authorsMap: {
          ozaki: {
            key: 'ozaki',
            imageURL: '/img/ozaki.png',
            page: null,
          },
        },
        baseUrl: '/',
      }),
    ).toEqual([
      {
        imageURL: '/img/ozaki.png',
        key: 'ozaki',
        page: null,
      },
    ]);
  });

  // Global author with baseUrl with a subfolder in img
  it('getBlogPostAuthors do not modify globalAuthor imageUrl with subfolder with baseUrl', async () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: ['ozaki'],
        },
        authorsMap: {
          ozaki: {
            key: 'ozaki',
            imageURL: '/img/ozaki.png',
            page: null,
          },
        },
        baseUrl: '/img/',
      }),
    ).toEqual([
      {
        imageURL: '/img/ozaki.png',
        key: 'ozaki',
        page: null,
      },
    ]);
  });

  it('getBlogPostAuthors throws if global author imageURL does not have baseUrl', async () => {
    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: ['ozaki'],
        },
        authorsMap: {
          ozaki: {
            key: 'ozaki',
            imageURL: '/ozaki.png',
            page: null,
          },
        },
        baseUrl: '/baseUrl/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Docusaurus internal bug: global authors image /ozaki.png should start with the expected baseUrl=/baseUrl/]`,
    );
  });

  it('getBlogPostAuthors do not throws if inline author imageURL is a link to a file', async () => {
    const baseUrlTest = getBlogPostAuthors({
      frontMatter: {
        authors: [{imageURL: './ozaki.png'}],
      },
      authorsMap: undefined,
      baseUrl: '/baseUrl/',
    });
    const withoutBaseUrlTest = getBlogPostAuthors({
      frontMatter: {
        authors: [{imageURL: './ozaki.png'}],
      },
      authorsMap: undefined,
      baseUrl: '/',
    });
    expect(() => baseUrlTest).not.toThrow();
    expect(baseUrlTest).toEqual([
      {
        imageURL: './ozaki.png',
        key: null,
        page: null,
        socials: {},
      },
    ]);
    expect(() => withoutBaseUrlTest).not.toThrow();
    expect(withoutBaseUrlTest).toEqual([
      {
        imageURL: './ozaki.png',
        key: null,
        page: null,
        socials: {},
      },
    ]);
  });

  // Inline author without baseUrl
  it('getBlogPostAuthors can return imageURL without baseUrl for inline authors', async () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: [{imageURL: '/ozaki.png'}],
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([
      {
        imageURL: '/ozaki.png',
        key: null,
        page: null,
        socials: {},
      },
    ]);
  });

  // Inline author with baseUrl
  it('getBlogPostAuthors normalize imageURL with baseUrl for inline authors', async () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: [{imageURL: '/ozaki.png'}],
        },
        authorsMap: undefined,
        baseUrl: '/img/',
      }),
    ).toEqual([
      {
        imageURL: '/img/ozaki.png',
        key: null,
        page: null,
        socials: {},
      },
    ]);
  });

  // Inline author without baseUrl with a subfolder in img
  it('getBlogPostAuthors normalize imageURL from subfolder without baseUrl for inline authors', async () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: [{imageURL: '/img/ozaki.png'}],
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([
      {
        imageURL: '/img/ozaki.png',
        key: null,
        page: null,
        socials: {},
      },
    ]);
  });

  // Inline author with baseUrl with a subfolder in img
  it('getBlogPostAuthors normalize imageURL from subfolder with baseUrl for inline authors', async () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: [{imageURL: '/img/ozaki.png'}],
        },
        authorsMap: undefined,
        baseUrl: '/img/',
      }),
    ).toEqual([
      {
        imageURL: '/img/img/ozaki.png',
        key: null,
        page: null,
        socials: {},
      },
    ]);
  });
});

describe('groupBlogPostsByAuthorKey', () => {
  const authorsMap: AuthorsMap = fromPartial({
    ozaki: {},
    slorber: {},
    keyWithNoPost: {},
  });

  it('can group blog posts', () => {
    const post1 = post({metadata: {authors: [{key: 'ozaki'}]}});
    const post2 = post({
      metadata: {authors: [{key: 'slorber'}, {key: 'ozaki'}]},
    });
    const post3 = post({metadata: {authors: [{key: 'slorber'}]}});
    const post4 = post({
      metadata: {authors: [{name: 'Inline author 1'}, {key: 'slorber'}]},
    });
    const post5 = post({
      metadata: {authors: [{name: 'Inline author 2'}]},
    });
    const post6 = post({
      metadata: {authors: [{key: 'unknownKey'}]},
    });

    const blogPosts = [post1, post2, post3, post4, post5, post6];

    expect(groupBlogPostsByAuthorKey({authorsMap, blogPosts})).toEqual({
      ozaki: [post1, post2],
      slorber: [post2, post3, post4],
      keyWithNoPost: [],
      // We don't care about this edge case, it doesn't happen in practice
      unknownKey: undefined,
    });
  });
});
