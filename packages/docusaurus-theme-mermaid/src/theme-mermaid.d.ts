/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/// <reference types="@docusaurus/module-type-aliases" />

declare module '@docusaurus/theme-mermaid' {
  import type {DeepPartial} from 'utility-types';
  import type {MermaidConfig} from 'mermaid';
  import type {Plugin} from '@docusaurus/types';

  export type ThemeConfigMermaid = {
    theme: {
      light: NonNullable<MermaidConfig['theme']>;
      dark: NonNullable<MermaidConfig['theme']>;
    };
    options: MermaidConfig;
  };

  export type ThemeConfig = {
    mermaid: ThemeConfigMermaid;
  };
  export type UserThemeConfig = DeepPartial<ThemeConfig>;

  // Adds the theme config fields to the @docusaurus/types interfaces
  // Their names intentionally shadow the ThemeConfig types of this module
  /* eslint-disable @typescript-eslint/no-shadow */
  module '@docusaurus/types' {
    interface ThemeConfig {
      mermaid: ThemeConfigMermaid;
    }
    interface UserThemeConfig {
      mermaid?: DeepPartial<ThemeConfigMermaid>;
    }
  }
  /* eslint-enable @typescript-eslint/no-shadow */

  export default function themeMermaid(): Plugin<undefined>;
}

declare module '@theme/Mermaid' {
  import {type ReactNode} from 'react';

  export interface Props {
    value: string;
  }

  export default function Mermaid(props: Props): ReactNode;
}
