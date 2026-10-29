/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  readPlaygroundName,
  createPlaygroundResponse,
  createPlaygroundDocumentationResponse,
} from '../functionUtils/playgroundUtils';

export default async (request: Request): Promise<Response> => {
  const playgroundName = readPlaygroundName(request);
  return playgroundName
    ? createPlaygroundResponse(playgroundName)
    : createPlaygroundDocumentationResponse();
};
