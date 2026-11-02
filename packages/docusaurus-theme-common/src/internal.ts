/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This re-export permits to handle some level of retro-compatibility. Users
// might swizzle unsafe components and expose these internal imports. When we
// move an API from internal to public, former internal imports should keep
// working, so that the change doesn't become breaking.
//
// Important: this line is removed from build output with the
// "removeThemeInternalReexport" script for CI checks. This ensures that none of
// our internal code relies on this re-export and that we don't forget to
// migrate theme internal imports to public imports.
//
// eslint-disable-next-line no-restricted-syntax
export * from './index';

export {
  AnnouncementBarProvider,
  useAnnouncementBar,
} from './contexts/announcementBar';

export {
  sanitizeTabsChildren,
  TabsProvider,
  useTabs,
  useTabsContextValue,
} from './utils/tabsUtils';
export type {TabValue, TabsProps, TabItemProps} from './utils/tabsUtils';

export {useNavbarMobileSidebar} from './contexts/navbarMobileSidebar';
export {useNavbarSecondaryMenu} from './contexts/navbarSecondaryMenu/display';

export {ColorModeProvider} from './contexts/colorMode';

export {useAlternatePageUtils} from './utils/useAlternatePageUtils';

export {
  type CodeBlockMetadata,
  createCodeBlockMetadata,
  getPrismCssVariables,
  CodeBlockContextProvider,
  useCodeBlockContext,
} from './utils/codeBlockUtils';

export {DEFAULT_SEARCH_TAG} from './utils/searchUtils';

export {
  TitleFormatterProvider,
  useTitleFormatter,
} from './utils/titleFormatterUtils';

export {useLocalPathname} from './utils/useLocalPathname';

export {useQueryStringValue} from './utils/historyUtils';

export {useFilteredAndTreeifiedTOC, type TOCTreeNode} from './utils/tocUtils';

export {
  ScrollControllerProvider,
  useScrollPosition,
  useScrollPositionBlocker,
} from './utils/scrollUtils';

export {useHomePageRoute, isSamePath} from './utils/routesUtils';

export {PluginHtmlClassNameProvider} from './utils/metadataUtils';

export {
  splitNavbarItems,
  NavbarProvider,
  isItemActive,
  containsActiveItems,
  type NavItemActiveConfig,
} from './utils/navbarUtils';

export {extractLeadingEmoji} from './utils/emojiUtils';

export {
  useTOCHighlight,
  type TOCHighlightConfig,
} from './hooks/useTOCHighlight';

export {useDateTimeFormat} from './utils/IntlUtils';

export {useHideableNavbar} from './hooks/useHideableNavbar';
export {useLockBodyScroll} from './hooks/useLockBodyScroll';
export {useCodeWordWrap} from './hooks/useCodeWordWrap';
export {useBackToTopButton} from './hooks/useBackToTopButton';
