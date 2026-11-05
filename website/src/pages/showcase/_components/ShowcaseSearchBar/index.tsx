/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {type ReactNode, useState} from 'react';
import {translate} from '@docusaurus/Translate';
import {useSearchName} from '@site/src/pages/showcase/_utils';
import styles from './styles.module.css';

export default function ShowcaseSearchBar(): ReactNode {
  const [searchName, setSearchName] = useSearchName();
  const [compositionValue, setCompositionValue] = useState<string | null>(null);
  return (
    <div className={styles.searchBar}>
      <input
        placeholder={translate({
          message: 'Search for site name...',
          id: 'showcase.searchBar.placeholder',
        })}
        value={compositionValue ?? searchName}
        onCompositionStart={(e) => {
          setCompositionValue(e.currentTarget.value);
        }}
        onCompositionEnd={(e) => {
          setCompositionValue(null);
          setSearchName(e.currentTarget.value);
        }}
        onInput={(e) => {
          if (compositionValue !== null) {
            setCompositionValue(e.currentTarget.value);
          } else {
            setSearchName(e.currentTarget.value);
          }
        }}
      />
    </div>
  );
}
