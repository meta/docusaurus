/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {version as docSearchVersion} from '@docsearch/react';

// TODO Docusaurus v4: upgrade to DocSearch v4
//  drop v3 compat, remove this file?
export const docSearchV3: boolean = docSearchVersion.startsWith('3.');
