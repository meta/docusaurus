/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import path from 'node:path';
import {
  type AuthorsMapInput,
  checkAuthorsMapPermalinkCollisions,
  getAuthorsMap,
  validateAuthorsMapInput,
} from '../authorsMap';
import type {AuthorsMap} from '@docusaurus/plugin-content-blog';

describe('checkAuthorsMapPermalinkCollisions', () => {
  it('do not throw when permalinks are unique', () => {
    const authors: AuthorsMap = {
      author1: {
        name: 'author1',
        key: 'author1',
        page: {
          permalink: '/author1',
        },
      },
      author2: {
        name: 'author2',
        key: 'author2',
        page: {
          permalink: '/author2',
        },
      },
    };

    expect(() => {
      checkAuthorsMapPermalinkCollisions(authors);
    }).not.toThrow();
  });

  it('throw when permalinks collide', () => {
    const authors: AuthorsMap = {
      author1: {
        name: 'author1',
        key: 'author1',
        page: {
          permalink: '/author1',
        },
      },
      author2: {
        name: 'author1',
        key: 'author1',
        page: {
          permalink: '/author1',
        },
      },
    };

    expect(() => {
      checkAuthorsMapPermalinkCollisions(authors);
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: The following permalinks are duplicated:
      Permalink: /author1
      Authors: author1, author1]
    `);
  });
});

describe('getAuthorsMap', () => {
  const fixturesDir = path.join(__dirname, '__fixtures__/authorsMapFiles');
  const contentPaths = {
    contentPathLocalized: fixturesDir,
    contentPath: fixturesDir,
  };

  it('getAuthorsMap can read yml file', async () => {
    await expect(
      getAuthorsMap({
        contentPaths,
        authorsMapPath: 'authors.yml',
        authorsBaseRoutePath: '/authors',
        baseUrl: '/',
      }),
    ).resolves.toBeDefined();
  });

  it('getAuthorsMap can read json file', async () => {
    await expect(
      getAuthorsMap({
        contentPaths,
        authorsMapPath: 'authors.json',
        authorsBaseRoutePath: '/authors',
        baseUrl: '/',
      }),
    ).resolves.toBeDefined();
  });

  it('getAuthorsMap can return undefined if yaml file not found', async () => {
    await expect(
      getAuthorsMap({
        contentPaths,
        authorsMapPath: 'authors_does_not_exist.yml',
        authorsBaseRoutePath: '/authors',
        baseUrl: '/',
      }),
    ).resolves.toBeUndefined();
  });

  it('getAuthorsMap return imageURL with relative path', async () => {
    const authorsMap = await getAuthorsMap({
      contentPaths,
      authorsMapPath: 'authors.yml',
      authorsBaseRoutePath: '/authors',
      baseUrl: '/',
    });
    expect(authorsMap?.ozaki?.imageURL).toBe('/ozaki.png');
  });

  it('getAuthorsMap normalize imageURL with baseUrl', async () => {
    const authorsMap = await getAuthorsMap({
      contentPaths,
      authorsMapPath: 'authors.yml',
      authorsBaseRoutePath: '/authors',
      baseUrl: '/baseUrl/',
    });
    expect(authorsMap?.ozaki?.imageURL).toBe('/baseUrl/ozaki.png');
  });

  it('getAuthorsMap return imageURL with relative subdir path', async () => {
    const authorsMap = await getAuthorsMap({
      contentPaths,
      authorsMapPath: 'authors.yml',
      authorsBaseRoutePath: '/authors',
      baseUrl: '/',
    });
    expect(authorsMap?.ozakione?.imageURL).toBe('/img/ozaki.png');
  });

  it('getAuthorsMap normalize imageURL with baseUrl and subdir same value', async () => {
    const authorsMap = await getAuthorsMap({
      contentPaths,
      authorsMapPath: 'authors.yml',
      authorsBaseRoutePath: '/authors',
      baseUrl: '/img/',
    });
    expect(authorsMap?.ozakione?.imageURL).toBe('/img/img/ozaki.png');
  });

  it('getAuthorsMap normalize imageURL subdir with baseUrl', async () => {
    const authorsMap = await getAuthorsMap({
      contentPaths,
      authorsMapPath: 'authors.yml',
      authorsBaseRoutePath: '/authors',
      baseUrl: '/blog/',
    });
    expect(authorsMap?.ozakione?.imageURL).toBe('/blog/img/ozaki.png');
  });
});

describe('validateAuthorsMapInput', () => {
  it('accept valid authors map', () => {
    const authorsMap: AuthorsMapInput = {
      slorber: {
        name: 'Sébastien Lorber',
        title: 'maintainer',
        url: 'https://sebastienlorber.com',
        imageURL: 'https://github.com/slorber.png',
        key: 'slorber',
        page: false,
      },
      yangshun: {
        name: 'Yangshun Tay',
        imageURL: 'https://github.com/yangshun.png',
        randomField: 42,
        key: 'yangshun',
        page: false,
      },
      jmarcey: {
        name: 'Joel',
        title: 'creator of Docusaurus',
        hello: new Date(),
        key: 'jmarcey',
        page: false,
      },
    };
    expect(validateAuthorsMapInput(authorsMap)).toEqual(authorsMap);
  });

  it('rename snake case image_url to camelCase imageURL', () => {
    const authorsMap: AuthorsMapInput = {
      slorber: {
        name: 'Sébastien Lorber',
        image_url: 'https://github.com/slorber.png',
        key: 'slorber',
        page: false,
      },
    };
    expect(validateAuthorsMapInput(authorsMap)).toEqual({
      slorber: {
        name: 'Sébastien Lorber',
        imageURL: 'https://github.com/slorber.png',
        page: false,
        key: 'slorber',
      },
    });
  });

  it('accept author with only image', () => {
    const authorsMap: AuthorsMapInput = {
      slorber: {
        imageURL: 'https://github.com/slorber.png',
        url: 'https://github.com/slorber',
        key: 'slorber',
        page: false,
      },
    };
    expect(validateAuthorsMapInput(authorsMap)).toEqual(authorsMap);
  });

  it('reject author without name or image', () => {
    const authorsMap: AuthorsMapInput = {
      slorber: {
        title: 'foo',
        key: 'slorber',
        page: false,
      },
    };
    expect(() =>
      validateAuthorsMapInput(authorsMap),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "slorber" must contain at least one of [name, imageURL]]`,
    );
  });

  it('reject undefined author', () => {
    expect(() =>
      validateAuthorsMapInput({
        slorber: undefined,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "slorber" cannot be undefined. It should be an author object containing properties like name, title, and imageURL.]`,
    );
  });

  it('reject null author', () => {
    expect(() =>
      validateAuthorsMapInput({
        slorber: null,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "slorber" should be an author object containing properties like name, title, and imageURL.]`,
    );
  });

  it('reject array author', () => {
    expect(() =>
      validateAuthorsMapInput({slorber: []}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "slorber" should be an author object containing properties like name, title, and imageURL.]`,
    );
  });

  it('reject array content', () => {
    expect(() =>
      validateAuthorsMapInput([]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: The authors map file should contain an object where each entry contains an author key and the corresponding author's data.]`,
    );
  });

  it('reject flat author', () => {
    expect(() =>
      validateAuthorsMapInput({name: 'Sébastien'}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "name" should be an author object containing properties like name, title, and imageURL.]`,
    );
  });

  it('reject non-map author', () => {
    const authorsMap: AuthorsMapInput = {
      // @ts-expect-error: intentionally invalid
      slorber: [],
    };
    expect(() =>
      validateAuthorsMapInput(authorsMap),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "slorber" should be an author object containing properties like name, title, and imageURL.]`,
    );
  });
});

describe('authors socials', () => {
  it('valid known author map socials', () => {
    const authorsMap: AuthorsMapInput = {
      ozaki: {
        name: 'ozaki',
        socials: {
          twitter: 'ozakione',
          github: 'ozakione',
        },
        key: 'ozaki',
        page: false,
      },
    };

    expect(validateAuthorsMapInput(authorsMap)).toEqual(authorsMap);
  });

  it('throw socials that are not strings', () => {
    const socialNumber: AuthorsMapInput = {
      ozaki: {
        name: 'ozaki',
        socials: {
          // @ts-expect-error: for tests
          twitter: 42,
        },
      },
    };

    const socialNull: AuthorsMapInput = {
      ozaki: {
        name: 'ozaki',
        socials: {
          // @ts-expect-error: for tests
          twitter: null,
        },
      },
    };

    const socialNull2: AuthorsMapInput = {
      ozaki: {
        name: 'ozaki',
        // @ts-expect-error: for tests
        socials: null,
      },
    };

    expect(() =>
      validateAuthorsMapInput(socialNumber),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "ozaki.socials.twitter" must be a string]`,
    );
    expect(() =>
      validateAuthorsMapInput(socialNull),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "ozaki.socials.twitter" must be a string]`,
    );
    expect(() =>
      validateAuthorsMapInput(socialNull2),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "ozaki.socials" should be an author object containing properties like name, title, and imageURL.]`,
    );
  });

  it('throw socials that are objects', () => {
    const authorsMap: AuthorsMapInput = {
      ozaki: {
        name: 'ozaki',
        socials: {
          // @ts-expect-error: for tests
          twitter: {link: 'ozakione'},
        },
      },
    };

    expect(() =>
      validateAuthorsMapInput(authorsMap),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ValidationError: "ozaki.socials.twitter" must be a string]`,
    );
  });

  it('valid unknown author map socials', () => {
    const authorsMap: AuthorsMapInput = {
      ozaki: {
        name: 'ozaki',
        socials: {
          random: 'ozakione',
        },
        key: 'ozaki',
        page: false,
      },
    };

    expect(validateAuthorsMapInput(authorsMap)).toEqual(authorsMap);
  });
});
