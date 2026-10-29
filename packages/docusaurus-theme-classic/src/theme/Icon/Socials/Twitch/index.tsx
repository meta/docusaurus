/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type {SVGProps, ReactNode} from 'react';

// SVG Source: https://svgl.app/
function Twitch(props: SVGProps<SVGSVGElement>): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x={0}
      y={0}
      viewBox="0 0 2400 2800"
      width="1em"
      height="1em"
      {...props}>
      <path
        d="m2200 1300-400 400h-400l-350 350v-350H600V200h1600z"
        fill="#fff"
      />
      <g>
        <path
          d="M500 0 0 500v1800h600v500l500-500h400l900-900V0H500zm1700 1300-400 400h-400l-350 350v-350H600V200h1600v1100z"
          fill="#9146ff"
        />
        <path
          d="M1700 550h200v600h-200zM1150 550h200v600h-200z"
          fill="#9146ff"
        />
      </g>
    </svg>
  );
}
export default Twitch;
