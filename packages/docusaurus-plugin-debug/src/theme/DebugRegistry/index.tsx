/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import registry from '@generated/registry';
import DebugLayout from '@theme/DebugLayout';
import styles from './styles.module.css';

export default function DebugRegistry(): ReactNode {
  return (
    <DebugLayout>
      <h2>Registry</h2>
      <ul className="clean-list">
        {Object.values(registry).map(([, aliasedPath, resolved]) => (
          <li key={aliasedPath} className={styles.listItem}>
            <div style={{marginBottom: '10px'}}>
              Aliased Path: <code>{aliasedPath}</code>
            </div>
            <div>
              Resolved Path: <code>{resolved}</code>
            </div>
          </li>
        ))}
      </ul>
    </DebugLayout>
  );
}
