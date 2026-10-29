/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Image from '@theme/IdealImage';

function Component() {
  return (
    <Image
      className="margin--xl"
      style={{width: '100px', height: '32px'}}
      img={require('./img/oss_logo.png')}
    />
  );
}

export default Component;
