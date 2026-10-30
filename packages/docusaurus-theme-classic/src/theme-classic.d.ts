/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference types="@docusaurus/module-type-aliases" />
/// <reference types="@docusaurus/plugin-content-docs" />
/// <reference types="@docusaurus/plugin-content-blog" />
/// <reference types="@docusaurus/plugin-content-pages" />

// This file, like all the other ambient declaration files for plugins, is
// needed for TS to understand our `@theme` alias. The export signatures are
// duplicated from the implementation, which is fine, since every module only
// default-exports a React component.
// TODO we'll eventually migrate to TS `paths` option. This is not easy due to
// our theme shadowing—we probably need the user to specify multiple theme paths
// in their tsconfig.

declare module '@docusaurus/theme-classic' {
  import type {LoadContext, Plugin, PluginModule} from '@docusaurus/types';

  export type PluginOptions = {
    customCss: string[];
  };

  export type Options = {
    customCss?: string[] | string;
  };

  export const getSwizzleConfig: PluginModule['getSwizzleConfig'];

  export default function themeClassic(
    context: LoadContext,
    options: Options,
  ): Plugin<undefined>;
}

declare module '@theme/Admonition' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: ReactNode;
    readonly type: string;
    readonly icon?: ReactNode;
    readonly title?: ReactNode;
    readonly className?: string;
    readonly id?: string;
  }

  export default function Admonition(props: Props): ReactNode;
}

declare module '@theme/Admonition/Type/Note' {
  import type {ReactNode} from 'react';
  import type {Props as AdmonitionProps} from '@theme/Admonition';

  export interface Props extends AdmonitionProps {}
  export default function AdmonitionTypeNote(props: Props): ReactNode;
}

declare module '@theme/Admonition/Type/Info' {
  import type {ReactNode} from 'react';
  import type {Props as AdmonitionProps} from '@theme/Admonition';

  export interface Props extends AdmonitionProps {}
  export default function AdmonitionTypeInfo(props: Props): ReactNode;
}

declare module '@theme/Admonition/Type/Tip' {
  import type {ReactNode} from 'react';
  import type {Props as AdmonitionProps} from '@theme/Admonition';

  export interface Props extends AdmonitionProps {}
  export default function AdmonitionTypeTip(props: Props): ReactNode;
}

declare module '@theme/Admonition/Type/Warning' {
  import type {ReactNode} from 'react';
  import type {Props as AdmonitionProps} from '@theme/Admonition';

  export interface Props extends AdmonitionProps {}
  export default function AdmonitionTypeWarning(props: Props): ReactNode;
}

declare module '@theme/Admonition/Type/Danger' {
  import type {ReactNode} from 'react';
  import type {Props as AdmonitionProps} from '@theme/Admonition';

  export interface Props extends AdmonitionProps {}
  export default function AdmonitionTypeDanger(props: Props): ReactNode;
}

declare module '@theme/Admonition/Types' {
  import type {ComponentType} from 'react';
  import type {Props} from '@theme/Admonition';

  const AdmonitionTypes: {
    [admonitionType: string]: ComponentType<Props>;
  };

  export default AdmonitionTypes;
}

declare module '@theme/Admonition/Layout' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: ReactNode;
    readonly type: string;
    readonly icon?: ReactNode;
    readonly title?: ReactNode;
    readonly className?: string;
    readonly id?: string;
  }
  export default function AdmonitionLayout(props: Props): ReactNode;
}

declare module '@theme/Admonition/Icon/Note' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function AdmonitionIconNote(props: Props): ReactNode;
}

declare module '@theme/Admonition/Icon/Tip' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function AdmonitionIconTip(props: Props): ReactNode;
}

declare module '@theme/Admonition/Icon/Warning' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function AdmonitionIconWarning(props: Props): ReactNode;
}

declare module '@theme/Admonition/Icon/Danger' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function AdmonitionIconDanger(props: Props): ReactNode;
}

declare module '@theme/Admonition/Icon/Info' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function AdmonitionIconInfo(props: Props): ReactNode;
}

declare module '@theme/AnnouncementBar' {
  import type {ReactNode} from 'react';

  export default function AnnouncementBar(): ReactNode | null;
}

declare module '@theme/AnnouncementBar/Content' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'div'> {}

  export default function AnnouncementBarContent(props: Props): ReactNode;
}

declare module '@theme/AnnouncementBar/CloseButton' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'button'> {}

  export default function AnnouncementBarCloseButton(props: Props): ReactNode;
}

declare module '@theme/BackToTopButton' {
  import type {ReactNode} from 'react';

  export default function BackToTopButton(): ReactNode;
}

declare module '@theme/Blog/Components/Author' {
  import type {ReactNode} from 'react';
  import type {Author} from '@docusaurus/plugin-content-blog';

  export interface Props {
    readonly as?: 'h1' | 'h2';
    readonly author: Author;
    readonly className?: string;
    readonly count?: number;
  }

  export default function BlogAuthor(props: Props): ReactNode;
}

declare module '@theme/Blog/Components/Author/Socials' {
  import type {ReactNode} from 'react';
  import type {Author} from '@docusaurus/plugin-content-blog';

  export interface Props {
    readonly author: Author;
    readonly className?: string;
  }

  export default function BlogAuthorSocials(props: Props): ReactNode;
}

declare module '@theme/Blog/Components/Author/GeneratedImage' {
  export interface Props {
    readonly name: string;
    readonly link?: string;
    readonly className?: string;
  }

  export default function GeneratedImage(props: Props): JSX.Element;
}

declare module '@theme/BlogListPaginator' {
  import type {ReactNode} from 'react';
  import type {BlogPaginatedMetadata} from '@docusaurus/plugin-content-blog';

  export interface Props {
    readonly metadata: BlogPaginatedMetadata;
  }
  export default function BlogListPaginator(props: Props): ReactNode;
}

declare module '@theme/BlogSidebar/Content' {
  import type {ReactNode, ComponentType} from 'react';
  import type {BlogSidebarItem} from '@docusaurus/plugin-content-blog';

  export interface Props {
    readonly items: BlogSidebarItem[];
    readonly ListComponent: ComponentType<{items: BlogSidebarItem[]}>;
    readonly yearGroupHeadingClassName?: string;
  }

  export default function BlogSidebarContent(props: Props): ReactNode;
}

declare module '@theme/BlogSidebar/Desktop' {
  import type {ReactNode} from 'react';
  import type {BlogSidebar} from '@docusaurus/plugin-content-blog';

  export interface Props {
    readonly sidebar: BlogSidebar;
  }

  export default function BlogSidebarDesktop(props: Props): ReactNode;
}

declare module '@theme/BlogSidebar/Mobile' {
  import type {ReactNode} from 'react';
  import type {BlogSidebar} from '@docusaurus/plugin-content-blog';

  export interface Props {
    readonly sidebar: BlogSidebar;
  }

  export default function BlogSidebarMobile(props: Props): ReactNode;
}

declare module '@theme/BlogSidebar' {
  import type {ReactNode} from 'react';
  import type {BlogSidebar} from '@docusaurus/plugin-content-blog';

  export interface Props {
    readonly sidebar?: BlogSidebar;
  }

  export default function BlogSidebar(props: Props): ReactNode;
}

declare module '@theme/BlogPostItem' {
  import type {ReactNode} from 'react';

  export interface Props {
    children: ReactNode;
    className?: string;
  }

  export default function BlogPostItem(props: Props): ReactNode;
}

declare module '@theme/BlogPostItems' {
  import type {ComponentType, ReactNode} from 'react';
  import type {PropBlogPostContent} from '@docusaurus/plugin-content-blog';

  export interface Props {
    items: readonly {content: PropBlogPostContent}[];
    component?: ComponentType<{children: ReactNode}>;
  }

  export default function BlogPostItem(props: Props): ReactNode;
}

declare module '@theme/BlogPostItem/Container' {
  import type {ReactNode} from 'react';

  export interface Props {
    children: ReactNode;
    className?: string;
  }

  export default function BlogPostItemContainer(props: Props): ReactNode;
}

declare module '@theme/BlogPostItem/Header' {
  import type {ReactNode} from 'react';

  export default function BlogPostItemHeader(): ReactNode;
}

declare module '@theme/BlogPostItem/Header/Title' {
  import type {ReactNode} from 'react';

  export interface Props {
    className?: string;
  }

  export default function BlogPostItemHeaderTitle(props: Props): ReactNode;
}

declare module '@theme/BlogPostItem/Header/Info' {
  import type {ReactNode} from 'react';

  export interface Props {
    className?: string;
  }

  export default function BlogPostItemHeaderInfo(): ReactNode;
}

declare module '@theme/BlogPostItem/Header/Authors' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly className?: string;
  }

  export default function BlogPostItemHeaderAuthors(props: Props): ReactNode;
}

declare module '@theme/BlogPostItem/Content' {
  import type {ReactNode} from 'react';

  export interface Props {
    children: ReactNode;
    className?: string;
  }

  export default function BlogPostItemContent(props: Props): ReactNode;
}

declare module '@theme/BlogPostItem/Footer' {
  import type {ReactNode} from 'react';

  export default function BlogPostItemFooter(): ReactNode | null;
}

declare module '@theme/BlogPostItem/Footer/ReadMoreLink' {
  import type {ReactNode} from 'react';
  import type {Props as LinkProps} from '@docusaurus/Link';

  export type Props = LinkProps & {
    blogPostTitle: string;
  };

  export default function BlogPostItemFooterReadMoreLink(
    props: Props,
  ): ReactNode | null;
}

declare module '@theme/BlogPostPaginator' {
  import type {ReactNode} from 'react';

  type Item = {readonly title: string; readonly permalink: string};

  export interface Props {
    readonly nextItem?: Item;
    readonly prevItem?: Item;
  }

  export default function BlogPostPaginator(props: Props): ReactNode;
}

declare module '@theme/BlogLayout' {
  import type {ReactNode} from 'react';
  import type {Props as LayoutProps} from '@theme/Layout';
  import type {BlogSidebar} from '@docusaurus/plugin-content-blog';

  export interface Props extends LayoutProps {
    readonly sidebar?: BlogSidebar;
    readonly toc?: ReactNode;
  }

  export default function BlogLayout(props: Props): ReactNode;
}

declare module '@theme/CodeBlock' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: ReactNode;
    readonly className?: string;
    readonly metastring?: string;
    readonly title?: ReactNode;
    readonly language?: string;
    readonly showLineNumbers?: boolean | number;
  }

  export default function CodeBlock(props: Props): ReactNode;
}

declare module '@theme/CodeInline' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'code'> {}

  export default function CodeInline(props: Props): ReactNode;
}

declare module '@theme/CodeBlock/Provider' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: ReactNode;
  }

  export default function CodeBlockProvider(props: Props): ReactNode;
}

declare module '@theme/CodeBlock/Title' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: ReactNode;
  }

  export default function CodeBlockTitle(props: Props): ReactNode;
}

declare module '@theme/CodeBlock/Layout' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly className?: string;
  }

  export default function CodeBlockLayout(props: Props): ReactNode;
}

declare module '@theme/CodeBlock/Buttons' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly className?: string;
  }

  export default function CodeBlockButtons(props: Props): ReactNode;
}

declare module '@theme/CodeBlock/Buttons/Button' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'button'> {
    readonly className?: string;
  }

  export default function CopyButton(props: Props): ReactNode;
}

declare module '@theme/CodeBlock/Buttons/CopyButton' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly className?: string;
  }

  export default function CodeBlockButtonCopy(props: Props): ReactNode;
}

declare module '@theme/CodeBlock/Buttons/WordWrapButton' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly className?: string;
  }

  export default function CodeBlockButtonWordWrap(props: Props): ReactNode;
}

declare module '@theme/CodeBlock/Container' {
  import type {ReactNode, ComponentProps} from 'react';

  export default function CodeBlockContainer<T extends 'div' | 'pre'>({
    as: As,
    ...props
  }: {as: T} & ComponentProps<T>): ReactNode;
}

declare module '@theme/CodeBlock/Content' {
  import type {ReactNode} from 'react';

  export interface Props {
    className?: string;
  }

  export default function CodeBlockContent(props: Props): ReactNode;
}

declare module '@theme/CodeBlock/Element' {
  import type {ReactNode} from 'react';
  import type {Props} from '@theme/CodeBlock';

  export type {Props};

  export default function CodeBlockElement(props: Props): ReactNode;
}

declare module '@theme/CodeBlock/String' {
  import type {ReactNode} from 'react';
  import type {Props as CodeBlockProps} from '@theme/CodeBlock';

  export interface Props extends Omit<CodeBlockProps, 'children'> {
    readonly children: string;
  }

  export default function CodeBlockString(props: Props): ReactNode;
}

declare module '@theme/CodeBlock/Line' {
  import type {ReactNode} from 'react';
  import type {
    LineInputProps,
    LineOutputProps,
    Token,
    TokenInputProps,
    TokenOutputProps,
  } from 'prism-react-renderer';

  export interface Props {
    readonly line: Token[];
    readonly classNames: string[] | undefined;
    readonly showLineNumbers: boolean;
    readonly getLineProps: (input: LineInputProps) => LineOutputProps;
    readonly getTokenProps: (input: TokenInputProps) => TokenOutputProps;
  }

  export default function CodeBlockLine(props: Props): ReactNode;
}

declare module '@theme/CodeBlock/Line/Token' {
  import type {ReactNode} from 'react';
  import type {Token, TokenOutputProps} from 'prism-react-renderer';

  export interface Props extends TokenOutputProps {
    readonly token: Token;
    readonly line: Token[];
  }

  export default function CodeBlockLine(props: Props): ReactNode;
}

declare module '@theme/DocCard' {
  import type {ReactNode} from 'react';
  import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

  export interface Props {
    readonly item: PropSidebarItem;
  }

  export default function DocCard(props: Props): ReactNode;
}

declare module '@theme/DocCard/Heading' {
  import type {ReactNode} from 'react';
  import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

  export interface Props {
    readonly item: PropSidebarItem;
    readonly icon: ReactNode;
    readonly title: string;
  }

  export default function DocCardHeading(props: Props): ReactNode;
}

declare module '@theme/DocCard/Heading/Icon' {
  import type {ReactNode} from 'react';
  import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

  export interface Props {
    readonly item: PropSidebarItem;
    readonly icon: ReactNode;
  }

  export default function DocCardHeadingIcon(props: Props): ReactNode;
}

declare module '@theme/DocCard/Heading/Text' {
  import type {ReactNode} from 'react';
  import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

  export interface Props {
    readonly item: PropSidebarItem;
    readonly title: string;
  }

  export default function DocCardHeadingText(props: Props): ReactNode;
}

declare module '@theme/DocCard/Description' {
  import type {ReactNode} from 'react';
  import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

  export interface Props {
    readonly item: PropSidebarItem;
    readonly description: string;
  }

  export default function DocCardDescription(props: Props): ReactNode;
}

declare module '@theme/DocCard/Layout' {
  import type {ReactNode} from 'react';
  import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

  export interface Props {
    readonly item: PropSidebarItem;
    readonly className?: string;
    readonly href: string;
    readonly icon: ReactNode;
    readonly title: string;
    readonly description?: string;
  }

  export default function DocCardLayout(props: Props): ReactNode;
}

declare module '@theme/DocCardList' {
  import type {ReactNode} from 'react';
  import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

  export interface Props {
    readonly items?: PropSidebarItem[];
    readonly className?: string;
  }

  export default function DocCardList(props: Props): ReactNode;
}

declare module '@theme/DocItem/Layout' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: ReactNode;
  }

  export default function DocItemLayout(props: Props): ReactNode;
}

declare module '@theme/DocItem/Metadata' {
  import type {ReactNode} from 'react';

  export default function DocItemMetadata(): ReactNode;
}

declare module '@theme/DocItem/Content' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: ReactNode;
  }

  export default function DocItemContent(props: Props): ReactNode;
}

declare module '@theme/DocItem/TOC/Mobile' {
  import type {ReactNode} from 'react';

  export default function DocItemTOCMobile(): ReactNode;
}

declare module '@theme/DocItem/TOC/Desktop' {
  import type {ReactNode} from 'react';

  export default function DocItemTOCDesktop(): ReactNode;
}

declare module '@theme/DocItem/Paginator' {
  import type {ReactNode} from 'react';

  export default function DocItemPaginator(): ReactNode;
}

declare module '@theme/DocItem/Footer' {
  import type {ReactNode} from 'react';

  export default function DocItemFooter(): ReactNode;
}

declare module '@theme/DocRoot/Layout' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: ReactNode;
  }

  export default function DocRootLayout(props: Props): ReactNode;
}

declare module '@theme/DocRoot/Layout/Sidebar' {
  import type {Dispatch, SetStateAction, ReactNode} from 'react';
  import type {PropSidebar} from '@docusaurus/plugin-content-docs';

  export interface Props {
    readonly sidebar: PropSidebar;
    readonly hiddenSidebarContainer: boolean;
    readonly setHiddenSidebarContainer: Dispatch<SetStateAction<boolean>>;
  }

  export default function DocRootLayoutSidebar(props: Props): ReactNode;
}

declare module '@theme/DocRoot/Layout/Sidebar/ExpandButton' {
  import type {ReactNode} from 'react';

  export interface Props {
    toggleSidebar: () => void;
  }

  export default function DocRootLayoutSidebarExpandButton(
    props: Props,
  ): ReactNode;
}

declare module '@theme/DocRoot/Layout/Main' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly hiddenSidebarContainer: boolean;
    readonly children: ReactNode;
  }

  export default function DocRootLayoutMain(props: Props): ReactNode;
}

declare module '@theme/DocPaginator' {
  import type {ReactNode} from 'react';
  import type {PropNavigation} from '@docusaurus/plugin-content-docs';

  // May be simpler to provide a {navigation: PropNavigation} prop?
  export interface Props extends PropNavigation {
    className?: string;
  }

  export default function DocPaginator(props: Props): ReactNode;
}

declare module '@theme/DocSidebar' {
  import type {ReactNode} from 'react';
  import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

  export interface Props {
    readonly path: string;
    readonly sidebar: readonly PropSidebarItem[];
    readonly onCollapse: () => void;
    readonly isHidden: boolean;
  }

  export default function DocSidebar(props: Props): ReactNode;
}

declare module '@theme/DocSidebar/Mobile' {
  import type {ReactNode} from 'react';
  import type {Props as DocSidebarProps} from '@theme/DocSidebar';

  export interface Props extends DocSidebarProps {}

  export default function DocSidebarMobile(props: Props): ReactNode;
}

declare module '@theme/DocSidebar/Desktop' {
  import type {ReactNode} from 'react';
  import type {Props as DocSidebarProps} from '@theme/DocSidebar';

  export interface Props extends DocSidebarProps {}

  export default function DocSidebarDesktop(props: Props): ReactNode;
}

declare module '@theme/DocSidebar/Desktop/Content' {
  import type {ReactNode} from 'react';
  import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

  export interface Props {
    readonly className?: string;
    readonly path: string;
    readonly sidebar: readonly PropSidebarItem[];
  }

  export default function Content(props: Props): ReactNode;
}

declare module '@theme/DocSidebar/Desktop/CollapseButton' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly onClick: React.MouseEventHandler;
  }

  export default function CollapseButton(props: Props): ReactNode;
}

declare module '@theme/DocSidebarItem' {
  import type {ReactNode} from 'react';
  import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

  export interface Props {
    readonly activePath: string;
    readonly onItemClick?: (item: PropSidebarItem) => void;
    readonly level: number;
    readonly tabIndex?: number;
    readonly item: PropSidebarItem;
    readonly index: number;
  }

  export default function DocSidebarItem(props: Props): ReactNode;
}

declare module '@theme/DocSidebarItem/Link' {
  import type {ReactNode} from 'react';
  import type {Props as DocSidebarItemProps} from '@theme/DocSidebarItem';

  import type {PropSidebarItemLink} from '@docusaurus/plugin-content-docs';

  export interface Props extends DocSidebarItemProps {
    readonly item: PropSidebarItemLink;
  }

  export default function DocSidebarItemLink(props: Props): ReactNode;
}

declare module '@theme/DocSidebarItem/Html' {
  import type {ReactNode} from 'react';
  import type {Props as DocSidebarItemProps} from '@theme/DocSidebarItem';
  import type {PropSidebarItemHtml} from '@docusaurus/plugin-content-docs';

  export interface Props extends DocSidebarItemProps {
    readonly item: PropSidebarItemHtml;
  }

  export default function DocSidebarItemHtml(props: Props): ReactNode;
}

declare module '@theme/DocSidebarItem/Category' {
  import type {ReactNode} from 'react';
  import type {Props as DocSidebarItemProps} from '@theme/DocSidebarItem';
  import type {PropSidebarItemCategory} from '@docusaurus/plugin-content-docs';

  export interface Props extends DocSidebarItemProps {
    readonly item: PropSidebarItemCategory;
  }

  export default function DocSidebarItemCategory(props: Props): ReactNode;
}

declare module '@theme/DocSidebarItems' {
  import type {ReactNode} from 'react';
  import type {Props as DocSidebarItemProps} from '@theme/DocSidebarItem';
  import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

  export interface Props extends Omit<DocSidebarItemProps, 'item' | 'index'> {
    readonly items: readonly PropSidebarItem[];
  }

  export default function DocSidebarItems(props: Props): ReactNode;
}

declare module '@theme/DocVersionBanner' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly className?: string;
  }

  export default function DocVersionBanner(props: Props): ReactNode;
}

declare module '@theme/DocVersionBadge' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly className?: string;
  }

  export default function DocVersionBadge(props: Props): ReactNode;
}

declare module '@theme/DocVersionSuggestions' {
  import type {ReactNode} from 'react';

  export default function DocVersionSuggestions(): ReactNode;
}

declare module '@theme/EditMetaRow' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly className: string;
    readonly editUrl: string | null | undefined;
    readonly lastUpdatedAt: number | null | undefined;
    readonly lastUpdatedBy: string | null | undefined;
  }
  export default function EditMetaRow(props: Props): ReactNode;
}

declare module '@theme/EditThisPage' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly editUrl: string;
  }
  export default function EditThisPage(props: Props): ReactNode;
}

declare module '@theme/ErrorPageContent' {
  import type ErrorComponent from '@theme/Error';

  const ErrorPageContent: typeof ErrorComponent;
  export default ErrorPageContent;
}

declare module '@theme/Footer' {
  import type {ReactNode} from 'react';

  export default function Footer(): ReactNode | null;
}

declare module '@theme/Footer/Logo' {
  import type {ReactNode} from 'react';

  import type {FooterLogo} from '@docusaurus/theme-common';

  export interface Props {
    readonly logo: FooterLogo;
  }

  export default function FooterLogo(props: Props): ReactNode;
}

declare module '@theme/Footer/Copyright' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly copyright: string;
  }

  export default function FooterCopyright(props: Props): ReactNode;
}

declare module '@theme/Footer/LinkItem' {
  import type {ReactNode} from 'react';

  import type {FooterLinkItem} from '@docusaurus/theme-common';

  export interface Props {
    readonly item: FooterLinkItem;
  }

  export default function FooterLinkItem(props: Props): ReactNode;
}

declare module '@theme/Footer/Layout' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly style: 'light' | 'dark';
    readonly links: ReactNode;
    readonly logo: ReactNode;
    readonly copyright: ReactNode;
  }

  export default function FooterLayout(props: Props): ReactNode;
}

declare module '@theme/Footer/Links' {
  import type {ReactNode} from 'react';
  import type {Footer} from '@docusaurus/theme-common';

  export interface Props {
    readonly links: Footer['links'];
  }

  export default function FooterLinks(props: Props): ReactNode;
}

declare module '@theme/Footer/Links/MultiColumn' {
  import type {ReactNode} from 'react';
  import type {MultiColumnFooter} from '@docusaurus/theme-common';

  export interface Props {
    readonly columns: MultiColumnFooter['links'];
  }

  export default function FooterLinksMultiColumn(props: Props): ReactNode;
}

declare module '@theme/Footer/Links/Simple' {
  import type {ReactNode} from 'react';
  import type {SimpleFooter} from '@docusaurus/theme-common';

  export interface Props {
    readonly links: SimpleFooter['links'];
  }

  export default function FooterLinksSimple(props: Props): ReactNode;
}

declare module '@theme/Heading' {
  import type {ComponentProps, ReactNode} from 'react';

  type HeadingType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  export interface Props extends ComponentProps<HeadingType> {
    readonly as: HeadingType;
  }

  export default function Heading(props: Props): ReactNode;
}

declare module '@theme/NotFound/Content' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly className?: string;
  }

  export default function NotFoundContent(props: Props): ReactNode;
}

declare module '@theme/Layout' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children?: ReactNode;
    readonly noFooter?: boolean;
    readonly wrapperClassName?: string;

    // Not really layout-related, but kept for convenience/retro-compatibility
    readonly title?: string;
    readonly description?: string;
  }

  export default function Layout(props: Props): ReactNode;
}

declare module '@theme/Layout/Provider' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: ReactNode;
  }

  export default function LayoutProvider(props: Props): ReactNode;
}

declare module '@theme/SearchMetadata' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly locale?: string;
    readonly version?: string;
    readonly tag?: string;
  }

  export default function SearchMetadata(props: Props): ReactNode;
}

declare module '@theme/LastUpdated' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly lastUpdatedAt?: number | null;
    readonly lastUpdatedBy?: string | null;
  }

  export default function LastUpdated(props: Props): ReactNode;
}

declare module '@theme/SkipToContent' {
  import type {ReactNode} from 'react';

  export default function SkipToContent(): ReactNode;
}

declare module '@theme/MDXComponents/A' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'a'> {
    'data-footnote-ref'?: true;
  }

  export default function MDXA(props: Props): ReactNode;
}

declare module '@theme/MDXComponents/Code' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'code'> {}

  export default function MDXCode(props: Props): ReactNode;
}

declare module '@theme/MDXComponents/Details' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'details'> {}

  export default function MDXDetails(props: Props): ReactNode;
}

declare module '@theme/MDXComponents/Ul' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'ul'> {}

  export default function MDXUl(props: Props): ReactNode;
}

declare module '@theme/MDXComponents/Li' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'li'> {}

  export default function MDXLi(props: Props): ReactNode;
}

declare module '@theme/MDXComponents/Img' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'img'> {}

  export default function MDXImg(props: Props): ReactNode;
}

declare module '@theme/MDXComponents/Heading' {
  import type {ComponentProps, ReactNode} from 'react';
  import type Heading from '@theme/Heading';

  export interface Props extends ComponentProps<typeof Heading> {}

  export default function MDXHeading(props: Props): ReactNode;
}

declare module '@theme/MDXComponents/Pre' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'pre'> {}

  export default function MDXPre(props: Props): ReactNode;
}

declare module '@theme/MDXComponents' {
  import type {ComponentType, ComponentProps, ReactNode} from 'react';

  import type MDXCode from '@theme/MDXComponents/Code';
  import type MDXA from '@theme/MDXComponents/A';
  import type MDXPre from '@theme/MDXComponents/Pre';
  import type MDXDetails from '@theme/MDXComponents/Details';
  import type MDXUl from '@theme/MDXComponents/Ul';
  import type MDXImg from '@theme/MDXComponents/Img';
  import type Admonition from '@theme/Admonition';
  import type Mermaid from '@theme/Mermaid';
  import type Head from '@docusaurus/Head';

  import type {MDXProvider} from '@mdx-js/react';

  type MDXComponentsBase = ComponentProps<typeof MDXProvider>['components'];

  export type MDXComponentsObject = MDXComponentsBase & {
    readonly Head: typeof Head;
    readonly details: typeof MDXDetails;

    readonly Details: typeof MDXDetails;
    readonly code: typeof MDXCode;
    readonly a: typeof MDXA;
    readonly pre: typeof MDXPre;
    readonly ul: typeof MDXUl;
    readonly img: typeof MDXImg;
    readonly h1: (props: ComponentProps<'h1'>) => ReactNode;
    readonly h2: (props: ComponentProps<'h2'>) => ReactNode;
    readonly h3: (props: ComponentProps<'h3'>) => ReactNode;
    readonly h4: (props: ComponentProps<'h4'>) => ReactNode;
    readonly h5: (props: ComponentProps<'h5'>) => ReactNode;
    readonly h6: (props: ComponentProps<'h6'>) => ReactNode;
    readonly admonition: typeof Admonition;
    readonly mermaid: typeof Mermaid;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [tagName: string]: ComponentType<any>;
  };

  const MDXComponents: MDXComponentsObject;
  export default MDXComponents;
}

declare module '@theme/MDXContent' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: ReactNode;
  }

  export default function MDXContent(props: Props): ReactNode;
}

declare module '@theme/Navbar' {
  import type {ReactNode} from 'react';

  export default function Navbar(): ReactNode;
}

declare module '@theme/Navbar/ColorModeToggle' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly className?: string;
  }

  export default function NavbarColorModeToggle(props: Props): ReactNode | null;
}

declare module '@theme/Navbar/Logo' {
  import type {ReactNode} from 'react';

  export default function NavbarLogo(): ReactNode;
}

declare module '@theme/Navbar/Content' {
  import type {ReactNode} from 'react';

  export default function NavbarContent(): ReactNode;
}

declare module '@theme/Navbar/Layout' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: React.ReactNode;
  }

  export default function NavbarLayout(props: Props): ReactNode;
}

declare module '@theme/Navbar/MobileSidebar' {
  import type {ReactNode} from 'react';

  export default function NavbarMobileSidebar(): ReactNode;
}

declare module '@theme/Navbar/MobileSidebar/Layout' {
  import type {ReactNode} from 'react';

  interface Props {
    readonly header: ReactNode;
    readonly primaryMenu: ReactNode;
    readonly secondaryMenu: ReactNode;
  }

  export default function NavbarMobileSidebarLayout(props: Props): ReactNode;
}

declare module '@theme/Navbar/MobileSidebar/Toggle' {
  import type {ReactNode} from 'react';

  export default function NavbarMobileSidebarToggle(): ReactNode;
}

declare module '@theme/Navbar/MobileSidebar/PrimaryMenu' {
  import type {ReactNode} from 'react';

  export default function NavbarMobileSidebarPrimaryMenu(): ReactNode;
}

declare module '@theme/Navbar/MobileSidebar/SecondaryMenu' {
  import type {ReactNode} from 'react';

  export default function NavbarMobileSidebarSecondaryMenu(): ReactNode;
}

declare module '@theme/Navbar/MobileSidebar/Header' {
  import type {ReactNode} from 'react';

  export default function NavbarMobileSidebarHeader(): ReactNode;
}

declare module '@theme/Navbar/Search' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: ReactNode;
    readonly className?: string;
  }

  export default function NavbarSearch(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/DefaultNavbarItem' {
  import type {ReactNode} from 'react';
  import type {Props as NavbarNavLinkProps} from '@theme/NavbarItem/NavbarNavLink';

  export type DefaultNavbarItemProps = NavbarNavLinkProps & {
    readonly isDropdownItem?: boolean;
    readonly className?: string;
    readonly position?: 'left' | 'right';
  };

  export interface Props extends DefaultNavbarItemProps {
    readonly mobile?: boolean;
  }

  export default function DefaultNavbarItem(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/DefaultNavbarItem/Mobile' {
  import type {ReactNode} from 'react';
  import type {DefaultNavbarItemProps} from '@theme/NavbarItem/DefaultNavbarItem';

  export interface Props extends DefaultNavbarItemProps {}

  export default function DefaultNavbarItemMobile(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/DefaultNavbarItem/Desktop' {
  import type {ReactNode} from 'react';
  import type {DefaultNavbarItemProps} from '@theme/NavbarItem/DefaultNavbarItem';

  export interface Props extends DefaultNavbarItemProps {}

  export default function DefaultNavbarItemDesktop(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/NavbarNavLink' {
  import type {ReactNode} from 'react';
  import type {Props as LinkProps} from '@docusaurus/Link';

  export interface Props extends LinkProps {
    readonly activeBasePath?: string;
    readonly activeBaseRegex?: string;
    readonly exact?: boolean;
    readonly label?: ReactNode;
    readonly html?: string;
    readonly prependBaseUrlToHref?: boolean;
    readonly isDropdownLink?: boolean;
  }

  export default function NavbarNavLink(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/DropdownNavbarItem' {
  import type {ReactNode} from 'react';
  import type {Props as NavbarNavLinkProps} from '@theme/NavbarItem/NavbarNavLink';
  import type {LinkLikeNavbarItemProps} from '@theme/NavbarItem';

  export type DropdownNavbarItemProps = NavbarNavLinkProps & {
    readonly position?: 'left' | 'right';
    readonly items: readonly LinkLikeNavbarItemProps[];
    readonly className?: string;
  };

  export interface Props extends DropdownNavbarItemProps {
    readonly mobile?: boolean;
  }

  export default function DropdownNavbarItem(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/DropdownNavbarItem/Mobile' {
  import type {ReactNode} from 'react';
  import type {DropdownNavbarItemProps} from '@theme/NavbarItem/DropdownNavbarItem';

  export interface Props extends DropdownNavbarItemProps {}

  export default function DropdownNavbarItemMobile(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/DropdownNavbarItem/Desktop' {
  import type {ReactNode} from 'react';
  import type {DropdownNavbarItemProps} from '@theme/NavbarItem/DropdownNavbarItem';

  export interface Props extends DropdownNavbarItemProps {}

  export default function DropdownNavbarItemDesktop(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/SearchNavbarItem' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly mobile?: boolean;
    readonly className?: string;
  }

  export default function SearchNavbarItem(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/LocaleDropdownNavbarItem' {
  import type {ReactNode} from 'react';
  import type {Props as DropdownNavbarItemProps} from '@theme/NavbarItem/DropdownNavbarItem';
  import type {LinkLikeNavbarItemProps} from '@theme/NavbarItem';

  export interface Props extends DropdownNavbarItemProps {
    readonly dropdownItemsBefore: LinkLikeNavbarItemProps[];
    readonly dropdownItemsAfter: LinkLikeNavbarItemProps[];
    readonly queryString?: string;
  }

  export default function LocaleDropdownNavbarItem(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/DocsVersionDropdownNavbarItem' {
  import type {ReactNode} from 'react';
  import type {Props as DropdownNavbarItemProps} from '@theme/NavbarItem/DropdownNavbarItem';
  import type {LinkLikeNavbarItemProps} from '@theme/NavbarItem';

  type PropVersionItem = {
    readonly label?: string;
  };

  type PropVersionItems = {
    readonly [version: string]: PropVersionItem;
  };

  type PropVersions = string[] | PropVersionItems;

  export interface Props extends DropdownNavbarItemProps {
    readonly docsPluginId?: string;
    readonly dropdownActiveClassDisabled?: boolean;
    readonly dropdownItemsBefore: LinkLikeNavbarItemProps[];
    readonly dropdownItemsAfter: LinkLikeNavbarItemProps[];
    readonly versions?: PropVersions;
  }

  export default function DocsVersionDropdownNavbarItem(
    props: Props,
  ): ReactNode;
}

declare module '@theme/NavbarItem/DocsVersionNavbarItem' {
  import type {ReactNode} from 'react';
  import type {Props as DefaultNavbarItemProps} from '@theme/NavbarItem/DefaultNavbarItem';

  export interface Props extends DefaultNavbarItemProps {
    readonly docsPluginId?: string;
  }

  export default function DocsVersionNavbarItem(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/DocNavbarItem' {
  import type {ReactNode} from 'react';
  import type {Props as DefaultNavbarItemProps} from '@theme/NavbarItem/DefaultNavbarItem';

  export interface Props extends DefaultNavbarItemProps {
    readonly docId: string;
    readonly docsPluginId?: string;
  }

  export default function DocsSidebarNavbarItem(props: Props): ReactNode | null;
}

declare module '@theme/NavbarItem/DocSidebarNavbarItem' {
  import type {ReactNode} from 'react';
  import type {Props as DefaultNavbarItemProps} from '@theme/NavbarItem/DefaultNavbarItem';

  export interface Props extends DefaultNavbarItemProps {
    readonly sidebarId: string;
    readonly docsPluginId?: string;
  }

  export default function DocSidebarNavbarItem(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/HtmlNavbarItem' {
  import type {ReactNode} from 'react';
  import type {Props as DefaultNavbarItemProps} from '@theme/NavbarItem/DefaultNavbarItem';

  export interface Props extends DefaultNavbarItemProps {
    readonly value: string;
  }

  export default function HtmlNavbarItem(props: Props): ReactNode;
}

declare module '@theme/NavbarItem/ComponentTypes' {
  import type {ComponentType} from 'react';

  import type DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
  import type DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
  import type LocaleDropdownNavbarItem from '@theme/NavbarItem/LocaleDropdownNavbarItem';
  import type SearchNavbarItem from '@theme/NavbarItem/SearchNavbarItem';
  import type HtmlNavbarItem from '@theme/NavbarItem/HtmlNavbarItem';
  import type DocNavbarItem from '@theme/NavbarItem/DocNavbarItem';
  import type DocSidebarNavbarItem from '@theme/NavbarItem/DocSidebarNavbarItem';
  import type DocsVersionNavbarItem from '@theme/NavbarItem/DocsVersionNavbarItem';
  import type DocsVersionDropdownNavbarItem from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';

  export type ComponentTypesObject = {
    readonly default: typeof DefaultNavbarItem;
    readonly localeDropdown: typeof LocaleDropdownNavbarItem;
    readonly search: typeof SearchNavbarItem;
    readonly dropdown: typeof DropdownNavbarItem;
    readonly html: typeof HtmlNavbarItem;
    readonly doc: typeof DocNavbarItem;
    readonly docSidebar: typeof DocSidebarNavbarItem;
    readonly docsVersion: typeof DocsVersionNavbarItem;
    readonly docsVersionDropdown: typeof DocsVersionDropdownNavbarItem;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [customComponentType: string]: ComponentType<any>;
  };

  const ComponentTypes: ComponentTypesObject;
  export default ComponentTypes;
}

declare module '@theme/NavbarItem' {
  import type {ComponentProps, ReactNode} from 'react';
  import type {Props as DefaultNavbarItemProps} from '@theme/NavbarItem/DefaultNavbarItem';
  import type {Props as DocNavbarItemProps} from '@theme/NavbarItem/DocNavbarItem';
  import type {Props as DocSidebarNavbarItemProps} from '@theme/NavbarItem/DocSidebarNavbarItem';
  import type {Props as DocsVersionNavbarItemProps} from '@theme/NavbarItem/DocsVersionNavbarItem';
  import type {Props as DropdownNavbarItemProps} from '@theme/NavbarItem/DropdownNavbarItem';
  import type {Props as DocsVersionDropdownNavbarItemProps} from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';
  import type {Props as LocaleDropdownNavbarItemProps} from '@theme/NavbarItem/LocaleDropdownNavbarItem';
  import type {Props as SearchNavbarItemProps} from '@theme/NavbarItem/SearchNavbarItem';
  import type {Props as HtmlNavbarItemProps} from '@theme/NavbarItem/HtmlNavbarItem';

  export type LinkLikeNavbarItemProps =
    | ({readonly type?: 'default'} & DefaultNavbarItemProps)
    | ({readonly type: 'doc'} & DocNavbarItemProps)
    | ({readonly type: 'docsVersion'} & DocsVersionNavbarItemProps)
    | ({readonly type: 'docSidebar'} & DocSidebarNavbarItemProps)
    | ({readonly type: 'html'} & HtmlNavbarItemProps);

  export type Props = ComponentProps<'a'> & {
    readonly position?: 'left' | 'right';
  } & (
      | LinkLikeNavbarItemProps
      | ({readonly type?: 'dropdown'} & DropdownNavbarItemProps)
      | ({
          readonly type: 'docsVersionDropdown';
        } & DocsVersionDropdownNavbarItemProps)
      | ({readonly type: 'localeDropdown'} & LocaleDropdownNavbarItemProps)
      | ({
          readonly type: 'search';
        } & SearchNavbarItemProps)
    );

  export type NavbarItemType = Props['type'];

  export default function NavbarItem(props: Props): ReactNode;
}

declare module '@theme/PaginatorNavLink' {
  import type {ReactNode} from 'react';
  import type {PropNavigationLink} from '@docusaurus/plugin-content-docs';

  export interface Props extends Omit<PropNavigationLink, 'title'> {
    readonly title: ReactNode;
    readonly subLabel?: ReactNode;
    readonly isNext?: boolean;
  }

  export default function PaginatorNavLink(props: Props): ReactNode;
}

declare module '@theme/SearchBar' {
  import type {ReactNode} from 'react';

  export default function SearchBar(): ReactNode;
}

declare module '@theme/Mermaid' {
  import type {ReactNode} from 'react';

  export interface Props {
    value: string;
  }

  export default function Mermaid(props: Props): ReactNode;
}

declare module '@theme/TabItem' {
  import type {ReactNode} from 'react';

  import type {TabItemProps} from '@docusaurus/theme-common/internal';

  export interface Props extends TabItemProps {}

  export default function TabItem(props: Props): ReactNode;
}

declare module '@theme/Tabs' {
  import type {ReactNode} from 'react';
  import type {TabsProps} from '@docusaurus/theme-common/internal';

  export interface Props extends TabsProps {}

  export default function Tabs(props: Props): ReactNode;
}

declare module '@theme/ThemedImage' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends Omit<ComponentProps<'img'>, 'src'> {
    readonly sources: {
      readonly light: string;
      readonly dark: string;
    };
  }

  export default function ThemedImage(props: Props): ReactNode;
}

declare module '@theme/ThemeProvider/TitleFormatter' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly children: ReactNode;
  }
  export default function ThemeProviderTitleFormatter({
    children,
  }: Props): ReactNode;
}

declare module '@theme/Details' {
  import {Details, type DetailsProps} from '@docusaurus/theme-common/Details';

  export interface Props extends DetailsProps {}
  export default Details;
}

declare module '@theme/TOCItems' {
  import type {ReactNode} from 'react';
  import type {TOCItem} from '@docusaurus/mdx-loader';

  export interface Props {
    readonly toc: readonly TOCItem[];
    readonly minHeadingLevel?: number;
    readonly maxHeadingLevel?: number;
    readonly className?: string;
    readonly linkClassName?: string | null;
    readonly linkActiveClassName?: string;
  }

  export default function TOCItems(props: Props): ReactNode;
}

declare module '@theme/TOCItems/Tree' {
  import type {ReactNode} from 'react';
  import type {TOCTreeNode} from '@docusaurus/theme-common/internal';

  export interface Props {
    readonly toc: readonly TOCTreeNode[];
    readonly className: string;
    readonly linkClassName: string | null;
    readonly isChild?: boolean;
  }

  export default function TOCItems(props: Props): ReactNode;
}

declare module '@theme/TOC' {
  import type {ReactNode} from 'react';
  import type {TOCItem} from '@docusaurus/mdx-loader';

  // `minHeadingLevel` only comes from doc/post front matter, and won't have a
  // default set by Joi. See TOC, TOCInline, TOCCollapsible for examples.
  export interface Props {
    readonly toc: readonly TOCItem[];
    readonly minHeadingLevel?: number;
    readonly maxHeadingLevel?: number;
    readonly className?: string;
  }

  export default function TOC(props: Props): ReactNode;
}

declare module '@theme/TOCInline' {
  import type {ReactNode} from 'react';
  import type {TOCItem} from '@docusaurus/mdx-loader';

  export interface Props {
    readonly toc: readonly TOCItem[];
    readonly minHeadingLevel?: number;
    readonly maxHeadingLevel?: number;
  }

  export default function TOCInline(props: Props): ReactNode;
}

declare module '@theme/TOCCollapsible' {
  import type {ReactNode} from 'react';
  import type {TOCItem} from '@docusaurus/mdx-loader';

  export interface Props {
    readonly className?: string;
    readonly minHeadingLevel?: number;
    readonly maxHeadingLevel?: number;
    readonly toc: readonly TOCItem[];
  }

  export default function TOCCollapsible(props: Props): ReactNode;
}

declare module '@theme/TOCCollapsible/CollapseButton' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'button'> {
    collapsed: boolean;
  }

  export default function TOCCollapsibleCollapseButton(props: Props): ReactNode;
}

declare module '@theme/ColorModeToggle' {
  import type {ReactNode} from 'react';
  import type {ColorMode} from '@docusaurus/theme-common';

  export interface Props {
    readonly className?: string;
    readonly buttonClassName?: string;
    readonly respectPrefersColorScheme: boolean;
    readonly value: ColorMode | null;
    /**
     * The parameter represents the "to-be" value. For example, if currently in
     * light mode, clicking the button should call `onChange("dark")`
     */
    readonly onChange: (colorMode: ColorMode | null) => void;
  }

  export default function ColorModeToggle(props: Props): ReactNode;
}

declare module '@theme/Logo' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'a'> {
    readonly imageClassName?: string;
    readonly titleClassName?: string;
  }

  export default function Logo(props: Props): ReactNode;
}

declare module '@theme/Icon/Arrow' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconArrow(props: Props): ReactNode;
}

declare module '@theme/Icon/DarkMode' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconDarkMode(props: Props): ReactNode;
}

declare module '@theme/Icon/Edit' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconEdit(props: Props): ReactNode;
}

declare module '@theme/Icon/Home' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconHome(props: Props): ReactNode;
}

declare module '@theme/Icon/LightMode' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconLightMode(props: Props): ReactNode;
}

declare module '@theme/Icon/SystemColorMode' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconSystemColorMode(props: Props): ReactNode;
}

declare module '@theme/Icon/Menu' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconMenu(props: Props): ReactNode;
}

declare module '@theme/Icon/Close' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconClose(props: Props): ReactNode;
}

declare module '@theme/Icon/Copy' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconCopy(props: Props): ReactNode;
}

declare module '@theme/Icon/Language' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconLanguage(props: Props): ReactNode;
}

declare module '@theme/Icon/Success' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconSuccess(props: Props): ReactNode;
}

declare module '@theme/Icon/ExternalLink' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconExternalLink(props: Props): ReactNode;
}

declare module '@theme/Icon/WordWrap' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function IconWordWrap(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/Twitter' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function Twitter(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/GitHub' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function Github(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/X' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function X(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/LinkedIn' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function LinkedIn(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/Default' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function DefaultSocialIcon(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/StackOverflow' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function StackOverflow(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/Bluesky' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function Bluesky(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/Instagram' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function Instagram(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/Threads' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function Threads(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/YouTube' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function YouTube(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/Twitch' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function Twitch(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/Email' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function Email(props: Props): ReactNode;
}

declare module '@theme/Icon/Socials/Mastodon' {
  import type {ComponentProps, ReactNode} from 'react';

  export interface Props extends ComponentProps<'svg'> {}

  export default function Mastodon(props: Props): ReactNode;
}

declare module '@theme/TagsListByLetter' {
  import type {ReactNode} from 'react';
  import type {TagsListItem} from '@docusaurus/utils';

  export interface Props {
    readonly tags: readonly TagsListItem[];
  }
  export default function TagsListByLetter(props: Props): ReactNode;
}

declare module '@theme/TagsListInline' {
  import type {ReactNode} from 'react';
  import type {Tag} from '@docusaurus/utils';

  export interface Props {
    readonly tags: readonly Tag[];
  }
  export default function TagsListInline(props: Props): ReactNode;
}

declare module '@theme/Tag' {
  import type {ReactNode} from 'react';
  import type {TagsListItem} from '@docusaurus/utils';
  import type {Optional} from 'utility-types';

  export interface Props extends Optional<TagsListItem, 'count'> {}

  export default function Tag(props: Props): ReactNode;
}

declare module '@theme/ContentVisibility' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly metadata: {
      // the visibility metadata our 3 content plugins share in common
      readonly unlisted: boolean;
      readonly frontMatter: {draft?: boolean; unlisted?: boolean};
    };
  }

  export default function ContentVisibility(props: Props): ReactNode;
}

declare module '@theme/ContentVisibility/Unlisted' {
  import type {ReactNode} from 'react';

  export interface Props {
    className?: string;
  }

  export default function Unlisted(props: Props): ReactNode;
}

declare module '@theme/ContentVisibility/Draft' {
  import type {ReactNode} from 'react';

  export interface Props {
    className?: string;
  }

  export default function Draft(props: Props): ReactNode;
}

declare module '@theme/prism-include-languages' {
  import type * as PrismNamespace from 'prismjs';

  export default function prismIncludeLanguages(
    PrismObject: typeof PrismNamespace,
  ): void;
}

declare module '@theme/DocBreadcrumbs/Items/Home' {
  import type {ReactNode} from 'react';

  export default function HomeBreadcrumbItem(): ReactNode;
}

declare module '@theme/DocBreadcrumbs/StructuredData' {
  import type {ReactNode} from 'react';
  import type {PropSidebarBreadcrumbsItem} from '@docusaurus/plugin-content-docs';

  export interface Props {
    readonly breadcrumbs: PropSidebarBreadcrumbsItem[];
  }

  export default function DocBreadcrumbsStructuredData(props: Props): ReactNode;
}
