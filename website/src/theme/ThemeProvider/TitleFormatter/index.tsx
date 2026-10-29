/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ComponentProps, ReactNode} from 'react';
import {TitleFormatterProvider} from '@docusaurus/theme-common/internal';
import type {Props} from '@theme/ThemeProvider/TitleFormatter';

type FormatterProp = ComponentProps<typeof TitleFormatterProvider>['formatter'];

const formatter: FormatterProp = (params) => {
  // Custom title for dogfood plugin instances
  if (params.plugin.id.endsWith('tests')) {
    const pluginLabel = `${params.plugin.name.replace(
      'docusaurus-plugin-content-',
      '',
    )} plugin`;
    return `🐕 Dogfood - ${pluginLabel}`;
  }

  // Default title otherwise
  return params.defaultFormatter(params);
};

export default function ThemeProviderTitleFormatter({
  children,
}: Props): ReactNode {
  return (
    <TitleFormatterProvider formatter={formatter}>
      {children}
    </TitleFormatterProvider>
  );
}
