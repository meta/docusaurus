/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import useCoreThemeConfig from '@docusaurus/useThemeConfig';
import type {PrismTheme} from 'prism-react-renderer';
import type {DeepPartial} from 'utility-types';
import type {ThemeConfig, UserThemeConfig} from '@docusaurus/types';
import type {MagicCommentConfig} from './codeBlockUtils';
import type {ColorMode} from '../contexts/colorMode';

type DocsVersionPersistence = 'localStorage' | 'none';

// TODO improve types, use unions
export type NavbarItem = {
  type?: string;
  items?: NavbarItem[];
  label?: string;
  position?: 'left' | 'right';
} & {[key: string]: unknown};

type BaseLogo = {
  alt?: string;
  src: string;
  srcDark?: string;
  href?: string;
  width?: string | number;
  height?: string | number;
  target?: string;
  style?: object;
  className?: string;
};

export type NavbarLogo = BaseLogo;

// TODO improve
export type Navbar = {
  style?: 'dark' | 'primary';
  hideOnScroll: boolean;
  title?: string;
  items: NavbarItem[];
  logo?: NavbarLogo;
};

export type ColorModeConfig = {
  defaultMode: ColorMode;
  disableSwitch: boolean;
  respectPrefersColorScheme: boolean;
};

type AnnouncementBarConfig = {
  id: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  isCloseable: boolean;
};

type PrismConfig = {
  theme: PrismTheme;
  darkTheme?: PrismTheme;
  defaultLanguage?: string;
  additionalLanguages: string[];
  magicComments: MagicCommentConfig[];
};

export type FooterLinkItem = {
  label?: string;
  className?: string;
  to?: string;
  href?: string;
  html?: string;
  prependBaseUrlToHref?: string;
} & {[key: string]: unknown};

export type FooterColumnItem = {
  title: string | null;
  className?: string;
  items: FooterLinkItem[];
};

export type FooterLogo = BaseLogo;

type FooterBase = {
  style: 'light' | 'dark';
  logo?: FooterLogo;
  copyright?: string;
};

export type MultiColumnFooter = FooterBase & {
  links: FooterColumnItem[];
};

export type SimpleFooter = FooterBase & {
  links: FooterLinkItem[];
};

export type Footer = MultiColumnFooter | SimpleFooter;

type TableOfContents = {
  minHeadingLevel: number;
  maxHeadingLevel: number;
};

// Theme config fields of the classic theme, after validation/normalization
export type ClassicThemeConfig = {
  docs: {
    versionPersistence: DocsVersionPersistence;
    sidebar: {
      hideable: boolean;
      autoCollapseCategories: boolean;
    };
  };

  blog: {
    sidebar: {
      groupByYear: boolean;
    };
  };

  // TODO we should complete this theme config type over time
  // and share it across all themes
  // and use it in the Joi validation schema?

  // TODO temporary types
  navbar: Navbar;
  colorMode: ColorModeConfig;
  announcementBar?: AnnouncementBarConfig;
  prism: PrismConfig;
  footer?: Footer;
  image?: string;
  metadata: {[key: string]: string}[];
  tableOfContents: TableOfContents;
};

// Adds the classic theme fields to the @docusaurus/types interfaces
declare module '@docusaurus/types' {
  interface ThemeConfig extends ClassicThemeConfig {}
  interface UserThemeConfig extends DeepPartial<ClassicThemeConfig> {}
}

export type {ThemeConfig, UserThemeConfig};

/**
 * Same as the `@docusaurus/useThemeConfig` hook of Docusaurus core.
 */
export function useThemeConfig(): ThemeConfig {
  return useCoreThemeConfig();
}
