/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import DebugLayout from '@theme/DebugLayout';
import styles from './styles.module.css';

export default function DebugMetadata(): ReactNode {
  const {siteMetadata} = useDocusaurusContext();
  return (
    <DebugLayout>
      <h2>Site Metadata</h2>
      <div>
        Docusaurus Version: <code>{siteMetadata.docusaurusVersion}</code>
      </div>
      <div>
        Site Version:{' '}
        <code>{siteMetadata.siteVersion ?? 'No version specified'}</code>
      </div>
      <h3 className={styles.sectionTitle}>Plugins and themes</h3>
      <ul className="clean-list">
        {Object.entries(siteMetadata.pluginVersions).map(
          ([name, versionInformation]) => (
            <li key={name} className={styles.listItem}>
              {versionInformation.type === 'package' &&
                versionInformation.version && (
                  <div className={styles.version}>
                    <code>{versionInformation.version}</code>
                  </div>
                )}
              <div className={styles.name}>{name}</div>
              <div>Type: {versionInformation.type}</div>
            </li>
          ),
        )}
      </ul>
    </DebugLayout>
  );
}
