/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import SiteStorage from '@generated/site-storage';

// The purpose is to test a migration script for storage namespacing
// See also: https://github.com/facebook/docusaurus/pull/10121

if (ExecutionEnvironment.canUseDOM) {
  const migrateStorageKey = (key: string) => {
    const value = localStorage.getItem(key);
    if (value !== null && SiteStorage.namespace) {
      const newKey = `${key}${SiteStorage.namespace}`;
      console.log(`Updating storage key [${key} => ${newKey}], value=${value}`);
      localStorage.setItem(newKey, value);
      localStorage.removeItem(key);
    }
  };

  const storageKeys = [
    'theme',
    'docusaurus.announcement.id',
    'docusaurus.announcement.dismiss',
    'docs-preferred-version-default',
  ];
  storageKeys.forEach(migrateStorageKey);
}
