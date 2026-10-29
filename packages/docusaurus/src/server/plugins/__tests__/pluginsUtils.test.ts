/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it} from 'vitest';
import {mergeGlobalData} from '../pluginsUtils';
import type {GlobalData} from '@docusaurus/types';

describe('mergeGlobalData', () => {
  it('no global data', () => {
    expect(mergeGlobalData()).toEqual({});
  });

  it('1 global data', () => {
    const globalData: GlobalData = {
      plugin: {
        default: {someData: 'val'},
      },
    };
    expect(mergeGlobalData(globalData)).toEqual(globalData);
  });

  it('1 global data - primitive value', () => {
    // For retro-compatibility we allow primitive values to be kept as is
    // Not sure anyone is using primitive global data though...
    const globalData: GlobalData = {
      plugin: {
        default: 42,
      },
    };
    expect(mergeGlobalData(globalData)).toEqual(globalData);
  });

  it('3 distinct plugins global data', () => {
    const globalData1: GlobalData = {
      plugin1: {
        default: {someData1: 'val1'},
      },
    };
    const globalData2: GlobalData = {
      plugin2: {
        default: {someData2: 'val2'},
      },
    };
    const globalData3: GlobalData = {
      plugin3: {
        default: {someData3: 'val3'},
      },
    };

    expect(mergeGlobalData(globalData1, globalData2, globalData3)).toEqual({
      plugin1: {
        default: {someData1: 'val1'},
      },
      plugin2: {
        default: {someData2: 'val2'},
      },
      plugin3: {
        default: {someData3: 'val3'},
      },
    });
  });

  it('3 plugin instances of same plugin', () => {
    const globalData1: GlobalData = {
      plugin: {
        id1: {someData1: 'val1'},
      },
    };
    const globalData2: GlobalData = {
      plugin: {
        id2: {someData2: 'val2'},
      },
    };
    const globalData3: GlobalData = {
      plugin: {
        id3: {someData3: 'val3'},
      },
    };

    expect(mergeGlobalData(globalData1, globalData2, globalData3)).toEqual({
      plugin: {
        id1: {someData1: 'val1'},
        id2: {someData2: 'val2'},
        id3: {someData3: 'val3'},
      },
    });
  });

  it('3 times the same plugin', () => {
    const globalData1: GlobalData = {
      plugin: {
        id: {someData1: 'val1', shared: 'shared1'},
      },
    };
    const globalData2: GlobalData = {
      plugin: {
        id: {someData2: 'val2', shared: 'shared2'},
      },
    };
    const globalData3: GlobalData = {
      plugin: {
        id: {someData3: 'val3', shared: 'shared3'},
      },
    };

    expect(mergeGlobalData(globalData1, globalData2, globalData3)).toEqual({
      plugin: {
        id: {
          someData1: 'val1',
          someData2: 'val2',
          someData3: 'val3',
          shared: 'shared3',
        },
      },
    });
  });

  it('3 times same plugin - including primitive values', () => {
    // Very unlikely to happen, but we can't merge primitive values together
    // Since we use Object.assign(), the primitive values are simply ignored
    const globalData1: GlobalData = {
      plugin: {
        default: 42,
      },
    };
    const globalData2: GlobalData = {
      plugin: {
        default: {hey: 'val'},
      },
    };
    const globalData3: GlobalData = {
      plugin: {
        default: 84,
      },
    };
    expect(mergeGlobalData(globalData1, globalData2, globalData3)).toEqual({
      plugin: {
        default: {hey: 'val'},
      },
    });
  });

  it('real world case', () => {
    const globalData1: GlobalData = {
      plugin1: {
        id1: {someData1: 'val1', shared: 'globalData1'},
      },
    };
    const globalData2: GlobalData = {
      plugin1: {
        id1: {someData2: 'val2', shared: 'globalData2'},
      },
    };

    const globalData3: GlobalData = {
      plugin1: {
        id2: {someData3: 'val3', shared: 'globalData3'},
      },
    };

    const globalData4: GlobalData = {
      plugin2: {
        id1: {someData1: 'val1', shared: 'globalData4'},
      },
    };
    const globalData5: GlobalData = {
      plugin2: {
        id2: {someData1: 'val1', shared: 'globalData5'},
      },
    };

    const globalData6: GlobalData = {
      plugin3: {
        id1: {someData1: 'val1', shared: 'globalData6'},
      },
    };

    expect(
      mergeGlobalData(
        globalData1,
        globalData2,
        globalData3,
        globalData4,
        globalData5,
        globalData6,
      ),
    ).toEqual({
      plugin1: {
        id1: {someData1: 'val1', someData2: 'val2', shared: 'globalData2'},
        id2: {someData3: 'val3', shared: 'globalData3'},
      },
      plugin2: {
        id1: {someData1: 'val1', shared: 'globalData4'},
        id2: {someData1: 'val1', shared: 'globalData5'},
      },
      plugin3: {
        id1: {someData1: 'val1', shared: 'globalData6'},
      },
    });
  });
});
