/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import _ from 'lodash';
import {listTagsByLetters} from '../tagsUtils';
import type {TagsListItem} from '@docusaurus/utils';

describe('listTagsByLetters', () => {
  type Result = ReturnType<typeof listTagsByLetters>;

  it('creates letters list', () => {
    const tag1: TagsListItem = {
      label: 'tag1',
      permalink: '/tag1',
      count: 1,
      description: '',
    };
    const tag2: TagsListItem = {
      label: 'Tag2',
      permalink: '/tag2',
      count: 11,
      description: '',
    };
    const tagZxy: TagsListItem = {
      label: 'zxy',
      permalink: '/zxy',
      count: 987,
      description: '',
    };
    const tagAbc: TagsListItem = {
      label: 'Abc',
      permalink: '/abc',
      count: 123,
      description: '',
    };
    const tagDef: TagsListItem = {
      label: 'def',
      permalink: '/def',
      count: 1,
      description: '',
    };
    const tagAaa: TagsListItem = {
      label: 'aaa',
      permalink: '/aaa',
      count: 10,
      description: '',
    };

    const expectedResult: Result = [
      {letter: 'A', tags: [tagAaa, tagAbc]},
      {letter: 'D', tags: [tagDef]},
      {letter: 'T', tags: [tag1, tag2]},
      {letter: 'Z', tags: [tagZxy]},
    ];

    // Input order shouldn't matter, output is always consistently sorted
    expect(
      listTagsByLetters([tag1, tag2, tagZxy, tagAbc, tagDef, tagAaa]),
    ).toEqual(expectedResult);
    expect(
      listTagsByLetters([tagZxy, tagDef, tagAaa, tag2, tagAbc, tag1]),
    ).toEqual(expectedResult);
    expect(
      listTagsByLetters(
        _.shuffle([tagZxy, tagDef, tagAaa, tag2, tagAbc, tag1]),
      ),
    ).toEqual(expectedResult);
  });
});
