/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode, SVGProps} from 'react';

// SVG Source: https://svgl.app/
function StackOverflow(props: SVGProps<SVGSVGElement>): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 169.61 200"
      width="1em"
      height="1em"
      {...props}>
      <path
        d="M140.44 178.38v-48.65h21.61V200H0v-70.27h21.61v48.65z"
        fill="#bcbbbb"
      />
      <path
        d="M124.24 140.54l4.32-16.22-86.97-17.83-3.78 17.83zM49.7 82.16L130.72 120l7.56-16.22-81.02-37.83zm22.68-40l68.06 57.3 11.35-13.51-68.6-57.3-11.35 13.51zM116.14 0l-14.59 10.81 53.48 71.89 14.58-10.81zM37.81 162.16h86.43v-16.21H37.81z"
        fill="#f48024"
      />
    </svg>
  );
}
export default StackOverflow;
