/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import {normalizeUrl} from '@docusaurus/utils';
import type {
  SidebarItem,
  Sidebars,
  SidebarProcessorParams,
  ProcessedSidebarItemCategory,
  ProcessedSidebarItem,
  ProcessedSidebars,
  SidebarItemCategoryLink,
} from './types';

export type SidebarPostProcessorParams = SidebarProcessorParams & {
  draftIds: Set<string>;
};

function normalizeCategoryLink(
  category: ProcessedSidebarItemCategory,
  params: SidebarPostProcessorParams,
): SidebarItemCategoryLink | undefined {
  if (category.link?.type === 'doc' && params.draftIds.has(category.link.id)) {
    return undefined;
  }
  if (category.link?.type === 'generated-index') {
    // Default slug logic can be improved
    const getDefaultSlug = () =>
      `/category/${params.categoryLabelSlugger.slug(category.label)}`;
    const slug = category.link.slug ?? getDefaultSlug();
    const permalink = normalizeUrl([params.version.path, slug]);
    return {
      ...category.link,
      slug,
      permalink,
    };
  }
  return category.link;
}

function postProcessSidebarItem(
  item: ProcessedSidebarItem,
  params: SidebarPostProcessorParams,
): SidebarItem | null {
  if (item.type === 'category') {
    // Fail-fast if there's actually no subitems, no because all subitems are
    // drafts. This is likely a configuration mistake.
    if (item.items.length === 0 && !item.link) {
      throw new Error(
        `Sidebar category ${item.label} has neither any subitem nor a link. This makes this item not able to link to anything.`,
      );
    }
    const category = {
      ...item,
      collapsed: item.collapsed ?? params.sidebarOptions.sidebarCollapsed,
      collapsible: item.collapsible ?? params.sidebarOptions.sidebarCollapsible,
      link: normalizeCategoryLink(item, params),
      items: item.items
        .map((subItem) => postProcessSidebarItem(subItem, params))
        .filter((v): v is SidebarItem => Boolean(v)),
    };

    // If the current category doesn't have subitems, we render a normal link
    // instead.
    if (category.items.length === 0) {
      // Doesn't make sense to render an empty generated index page, so we
      // filter the entire category out as well.
      if (
        !category.link ||
        category.link.type === 'generated-index' ||
        params.draftIds.has(category.link.id)
      ) {
        return null;
      }
      const {label, className, customProps} = category;
      return {
        type: 'doc',
        id: category.link.id,
        label,
        ...(className && {className}),
        ...(customProps && {customProps}),
      };
    }
    // A non-collapsible category can't be collapsed!
    if (!category.collapsible) {
      category.collapsed = false;
    }
    return category;
  }
  if (
    (item.type === 'doc' || item.type === 'ref') &&
    params.draftIds.has(item.id)
  ) {
    return null;
  }
  return item;
}

export function postProcessSidebars(
  sidebars: ProcessedSidebars,
  params: SidebarProcessorParams,
): Sidebars {
  const draftIds = new Set(params.drafts.map((d) => d.id));

  return _.mapValues(sidebars, (sidebar) =>
    sidebar
      .map((item) => postProcessSidebarItem(item, {...params, draftIds}))
      .filter((v): v is SidebarItem => Boolean(v)),
  );
}
