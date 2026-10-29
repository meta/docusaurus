/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {type ReactNode, useState} from 'react';
import clsx from 'clsx';
import Translate, {translate} from '@docusaurus/Translate';
import type {Props} from '@theme/PwaReloadPopup';

import styles from './styles.module.css';

export default function PwaReloadPopup({onReload}: Props): ReactNode {
  const [isVisible, setIsVisible] = useState(true);

  return (
    isVisible && (
      <div className={clsx('alert', 'alert--secondary', styles.popup)}>
        <p>
          <Translate
            id="theme.PwaReloadPopup.info"
            description="The text for PWA reload popup">
            New version available
          </Translate>
        </p>
        <div className={styles.buttonContainer}>
          <button
            className="button button--link"
            type="button"
            onClick={() => {
              setIsVisible(false);
              onReload();
            }}>
            <Translate
              id="theme.PwaReloadPopup.refreshButtonText"
              description="The text for PWA reload button">
              Refresh
            </Translate>
          </button>

          <button
            aria-label={translate({
              id: 'theme.PwaReloadPopup.closeButtonAriaLabel',
              message: 'Close',
              description:
                'The ARIA label for close button of PWA reload popup',
            })}
            className="close"
            type="button"
            onClick={() => setIsVisible(false)}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    )
  );
}
