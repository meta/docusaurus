/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Should we translate theme-fallback?
/* eslint-disable @docusaurus/no-untranslated-text */

import type {ReactNode} from 'react';
import type {LoadingComponentProps} from 'react-loadable';

export default function Loading({
  error,
  retry,
  pastDelay,
}: LoadingComponentProps): ReactNode {
  if (error) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: '#fff',
          backgroundColor: '#fa383e',
          borderColor: '#fa383e',
          borderStyle: 'solid',
          borderRadius: '0.25rem',
          borderWidth: '1px',
          boxSizing: 'border-box',
          display: 'block',
          padding: '1rem',
          flex: '0 0 50%',
          marginLeft: '25%',
          marginRight: '25%',
          marginTop: '5rem',
          maxWidth: '50%',
          width: '100%',
        }}>
        <p>{String(error)}</p>
        <div>
          <button type="button" onClick={retry}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (pastDelay) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}>
        <svg
          id="loader"
          style={{
            width: 128,
            height: 110,
            position: 'absolute',
            top: 'calc(100vh - 64%)',
          }}
          viewBox="0 0 45 45"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#61dafb">
          <g
            fill="none"
            fillRule="evenodd"
            transform="translate(1 1)"
            strokeWidth="2">
            <circle cx="22" cy="22" r="6" strokeOpacity="0">
              <animate
                attributeName="r"
                begin="1.5s"
                dur="3s"
                values="6;22"
                calcMode="linear"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                begin="1.5s"
                dur="3s"
                values="1;0"
                calcMode="linear"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-width"
                begin="1.5s"
                dur="3s"
                values="2;0"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="22" cy="22" r="6" strokeOpacity="0">
              <animate
                attributeName="r"
                begin="3s"
                dur="3s"
                values="6;22"
                calcMode="linear"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                begin="3s"
                dur="3s"
                values="1;0"
                calcMode="linear"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-width"
                begin="3s"
                dur="3s"
                values="2;0"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="22" cy="22" r="8">
              <animate
                attributeName="r"
                begin="0s"
                dur="1.5s"
                values="6;1;2;3;4;5;6"
                calcMode="linear"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </svg>
      </div>
    );
  }

  return null;
}
