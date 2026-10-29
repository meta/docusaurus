/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode, SVGProps} from 'react';

// SVG Source: https://github.com/tabler/tabler-icons
function Email(props: SVGProps<SVGSVGElement>): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}>
      <path stroke="none" d="M0 0h24v24H0z" />
      <path d="M7.2 12a4.8 4.8 0 1 0 9.6 0 4.8 4.8 0 1 0-9.6 0" />
      <path d="M16.8 12v1.8a3 3 0 0 0 6 0V12a10.8 10.8 0 1 0-6.6 9.936" />
    </svg>
  );
}
export default Email;
