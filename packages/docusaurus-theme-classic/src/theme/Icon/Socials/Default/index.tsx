/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode, SVGProps} from 'react';

// SVG Source: https://github.com/tabler/tabler-icons
function DefaultSocial(props: SVGProps<SVGSVGElement>): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M1.2 12a10.8 10.8 0 1 0 21.6 0a10.8 10.8 0 0 0 -21.6 0" />
      <path d="M1.92 8.4h20.16" />
      <path d="M1.92 15.6h20.16" />
      <path d="M11.4 1.2a20.4 20.4 0 0 0 0 21.6" />
      <path d="M12.6 1.2a20.4 20.4 0 0 1 0 21.6" />
    </svg>
  );
}
export default DefaultSocial;
