/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useId} from 'react';
import type {SVGProps, ReactNode} from 'react';

// SVG Source: https://svgl.app/
function Mastodon(props: SVGProps<SVGSVGElement>): ReactNode {
  const gradientId = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 61 65"
      width="1em"
      height="1em"
      {...props}>
      <path
        fill={`url(#${gradientId})`}
        d="M60.754 14.39C59.814 7.406 53.727 1.903 46.512.836 45.294.656 40.682 0 29.997 0h-.08C19.23 0 16.938.656 15.72.836 8.705 1.873 2.299 6.82.745 13.886c-.748 3.48-.828 7.338-.689 10.877.198 5.075.237 10.142.697 15.197a71.482 71.482 0 0 0 1.664 9.968c1.477 6.056 7.458 11.096 13.317 13.152a35.718 35.718 0 0 0 19.484 1.028 28.365 28.365 0 0 0 2.107-.576c1.572-.5 3.413-1.057 4.766-2.038a.154.154 0 0 0 .062-.118v-4.899a.146.146 0 0 0-.055-.111.145.145 0 0 0-.122-.028 54 54 0 0 1-12.644 1.478c-7.328 0-9.298-3.478-9.863-4.925a15.258 15.258 0 0 1-.857-3.882.142.142 0 0 1 .178-.145 52.976 52.976 0 0 0 12.437 1.477c1.007 0 2.012 0 3.02-.026 4.213-.119 8.654-.334 12.8-1.144.103-.02.206-.038.295-.065 6.539-1.255 12.762-5.196 13.394-15.176.024-.393.083-4.115.083-4.523.003-1.386.446-9.829-.065-15.017Z"
      />
      <path
        fill="#fff"
        d="M50.394 22.237v17.35H43.52V22.749c0-3.545-1.478-5.353-4.483-5.353-3.303 0-4.958 2.139-4.958 6.364v9.217h-6.835V23.76c0-4.225-1.657-6.364-4.96-6.364-2.988 0-4.48 1.808-4.48 5.353v16.84H10.93V22.237c0-3.545.905-6.362 2.715-8.45 1.868-2.082 4.317-3.152 7.358-3.152 3.519 0 6.178 1.354 7.951 4.057l1.711 2.871 1.714-2.871c1.773-2.704 4.432-4.056 7.945-4.056 3.038 0 5.487 1.069 7.36 3.152 1.81 2.085 2.712 4.902 2.71 8.449Z"
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1={30.5}
          x2={30.5}
          y1={0}
          y2={65}
          gradientUnits="userSpaceOnUse">
          <stop stopColor="#6364FF" />
          <stop offset={1} stopColor="#563ACC" />
        </linearGradient>
      </defs>
    </svg>
  );
}
export default Mastodon;
