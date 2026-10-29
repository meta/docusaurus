/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode} from 'react';
import siteConfig from '@generated/docusaurus.config';
import globalData from '@generated/globalData';
import i18n from '@generated/i18n';
import codeTranslations from '@generated/codeTranslations';
import siteMetadata from '@generated/site-metadata';
import type {DocusaurusContext} from '@docusaurus/types';

// Static value on purpose: don't make it dynamic!
// Using context is still useful for testability reasons.
const contextValue: DocusaurusContext = {
  siteConfig,
  siteMetadata,
  globalData,
  i18n,
  codeTranslations,
};

export const Context = React.createContext<DocusaurusContext>(contextValue);

export function DocusaurusContextProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return <Context value={contextValue}>{children}</Context>;
}
