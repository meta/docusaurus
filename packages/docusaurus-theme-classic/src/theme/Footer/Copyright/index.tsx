/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import type {Props} from '@theme/Footer/Copyright';

export default function FooterCopyright({copyright}: Props): ReactNode {
  return (
    <div
      className="footer__copyright"
      // Developer provided the HTML, so assume it's safe.
      dangerouslySetInnerHTML={{__html: copyright}}
    />
  );
}
