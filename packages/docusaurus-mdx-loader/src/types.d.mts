/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {WebpackCompilerName} from '@docusaurus/utils';

declare module 'vfile' {
  /*
  This map registers the type of the data key of a VFile (TypeScript type).
  This type can be augmented to register custom data types.
  See https://github.com/vfile/vfile#datamap
   */
  interface DataMap {
    frontMatter: {[key: string]: unknown};
    compilerName: WebpackCompilerName;
    contentTitle?: string;
  }
}

declare module 'unist' {
  interface Data {
    admonitionTitle?: boolean;
    hName?: string;
    hProperties?: Record<string, unknown>;
  }
}

declare module 'mdast' {
  interface Data {
    id?: string;
    hName?: string;
    hProperties?: Record<string, unknown>;
  }

  interface HeadingData {
    hProperties?: {id?: string};
  }
}
