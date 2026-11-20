/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import {mergeTranslations} from '@docusaurus/utils';
import type {TranslationFile, TranslationFileContent} from '@docusaurus/types';
import type {
  ThemeConfig,
  Navbar,
  NavbarItem,
  Footer,
  MultiColumnFooter,
  SimpleFooter,
} from '@docusaurus/theme-common';

function getNavbarTranslationFile(navbar: Navbar): TranslationFileContent {
  // TODO handle properly all the navbar item types here!
  function flattenNavbarItems(items: NavbarItem[]): NavbarItem[] {
    const subItems = items.flatMap((item) => {
      const allSubItems = [
        item.items ?? [],
        (item.dropdownItemsBefore as NavbarItem[] | undefined) ?? [],
        (item.dropdownItemsAfter as NavbarItem[] | undefined) ?? [],
      ].flat();
      return flattenNavbarItems(allSubItems);
    });
    return [...items, ...subItems];
  }

  const allNavbarItems = flattenNavbarItems(navbar.items);

  const navbarItemsTranslations: TranslationFileContent = Object.fromEntries(
    allNavbarItems
      .filter((navbarItem) => navbarItem.label)
      .map((navbarItem) => [
        `item.label.${navbarItem.label}`,
        {
          message: navbarItem.label!,
          description: `Navbar item with label ${navbarItem.label}`,
        },
      ]),
  );

  const titleTranslations: TranslationFileContent = navbar.title
    ? {title: {message: navbar.title, description: 'The title in the navbar'}}
    : {};

  const logoAlt: TranslationFileContent = navbar.logo?.alt
    ? {
        'logo.alt': {
          message: navbar.logo.alt,
          description: 'The alt text of navbar logo',
        },
      }
    : {};

  return mergeTranslations([
    titleTranslations,
    logoAlt,
    navbarItemsTranslations,
  ]);
}
function translateNavbar(
  navbar: Navbar,
  navbarTranslations: TranslationFileContent | undefined,
): Navbar {
  if (!navbarTranslations) {
    return navbar;
  }

  const logo = navbar.logo
    ? {
        ...navbar.logo,
        alt: navbarTranslations[`logo.alt`]?.message ?? navbar.logo?.alt,
      }
    : undefined;

  return {
    ...navbar,
    title: navbarTranslations.title?.message ?? navbar.title,
    logo,
    //  TODO handle properly all the navbar item types here!
    items: navbar.items.map((item) => {
      const translateItem = (navbarItem: NavbarItem) => ({
        ...navbarItem,
        label:
          navbarTranslations[`item.label.${navbarItem.label}`]?.message ??
          navbarItem.label,
      });
      const subItems = item.items?.map(translateItem);
      const dropdownItemsBefore = (
        item.dropdownItemsBefore as NavbarItem[] | undefined
      )?.map(translateItem);
      const dropdownItemsAfter = (
        item.dropdownItemsAfter as NavbarItem[] | undefined
      )?.map(translateItem);
      return {
        ...item,
        label:
          navbarTranslations[`item.label.${item.label}`]?.message ?? item.label,
        ...(subItems ? {items: subItems} : undefined),
        ...(dropdownItemsBefore ? {dropdownItemsBefore} : undefined),
        ...(dropdownItemsAfter ? {dropdownItemsAfter} : undefined),
      };
    }),
  };
}

function isMultiColumnFooterLinks(
  links: MultiColumnFooter['links'] | SimpleFooter['links'],
): links is MultiColumnFooter['links'] {
  return links.length > 0 && 'title' in links[0]!;
}

function getFooterTranslationFile(footer: Footer): TranslationFileContent {
  const footerLinkTitles: TranslationFileContent = Object.fromEntries(
    (isMultiColumnFooterLinks(footer.links)
      ? footer.links.filter((link) => link.title)
      : []
    ).map((link) => [
      `link.title.${link.title}`,
      {
        message: link.title!,
        description: `The title of the footer links column with title=${link.title} in the footer`,
      },
    ]),
  );

  const footerLinkLabels: TranslationFileContent = Object.fromEntries(
    (isMultiColumnFooterLinks(footer.links)
      ? footer.links.flatMap((link) => link.items).filter((link) => link.label)
      : footer.links.filter((link) => link.label)
    ).map((link) => [
      `link.item.label.${link.label}`,
      {
        message: link.label!,
        description: `The label of footer link with label=${
          link.label
        } linking to ${link.to ?? link.href}`,
      },
    ]),
  );

  const copyright: TranslationFileContent = footer.copyright
    ? {
        copyright: {
          message: footer.copyright,
          description: 'The footer copyright',
        },
      }
    : {};

  const logoAlt: TranslationFileContent = footer.logo?.alt
    ? {
        'logo.alt': {
          message: footer.logo.alt,
          description: 'The alt text of footer logo',
        },
      }
    : {};

  return mergeTranslations([
    footerLinkTitles,
    footerLinkLabels,
    copyright,
    logoAlt,
  ]);
}
function translateFooter(
  footer: Footer,
  footerTranslations: TranslationFileContent | undefined,
): Footer {
  if (!footerTranslations) {
    return footer;
  }
  const links = isMultiColumnFooterLinks(footer.links)
    ? footer.links.map((link) => ({
        ...link,
        title:
          footerTranslations[`link.title.${link.title}`]?.message ?? link.title,
        items: link.items.map((linkItem) => ({
          ...linkItem,
          label:
            footerTranslations[`link.item.label.${linkItem.label}`]?.message ??
            linkItem.label,
        })),
      }))
    : footer.links.map((link) => ({
        ...link,
        label:
          footerTranslations[`link.item.label.${link.label}`]?.message ??
          link.label,
      }));

  const copyright = footerTranslations.copyright?.message ?? footer.copyright;

  const logo = footer.logo
    ? {
        ...footer.logo,
        alt: footerTranslations[`logo.alt`]?.message ?? footer.logo?.alt,
      }
    : undefined;

  return {
    ...footer,
    links,
    copyright,
    logo,
  };
}

export function getTranslationFiles({
  themeConfig,
}: {
  themeConfig: ThemeConfig;
}): TranslationFile[] {
  const translationFiles: (TranslationFile | undefined)[] = [
    {path: 'navbar', content: getNavbarTranslationFile(themeConfig.navbar)},
    themeConfig.footer
      ? {
          path: 'footer',
          content: getFooterTranslationFile(themeConfig.footer),
        }
      : undefined,
  ];

  return translationFiles.filter(Boolean) as TranslationFile[];
}

export function translateThemeConfig({
  themeConfig,
  translationFiles,
}: {
  // To make TS correctly figure out the contravariance in parameter.
  // In practice it's always normalized
  themeConfig: ThemeConfig;
  translationFiles: TranslationFile[];
}): ThemeConfig {
  const translationFilesMap: {[fileName: string]: TranslationFile} = _.keyBy(
    translationFiles,
    (f) => f.path,
  );

  return {
    ...themeConfig,
    navbar: translateNavbar(
      themeConfig.navbar,
      translationFilesMap.navbar?.content,
    ),
    footer: themeConfig.footer
      ? translateFooter(themeConfig.footer, translationFilesMap.footer?.content)
      : undefined,
  };
}
