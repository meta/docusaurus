/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import _ from 'lodash';
import htmlTags, {voidHtmlTags} from 'html-tags';
import escapeHTML from 'escape-html';
import type {
  Props,
  HtmlTagObject,
  HtmlTags,
  LoadedPlugin,
  RouterType,
} from '@docusaurus/types';

// TODO this should be done at config validation time, not here
function assertIsHtmlTagObject(val: unknown): asserts val is HtmlTagObject {
  if (typeof val !== 'object' || !val) {
    throw new Error(`"${val}" is not a valid HTML tag object.`);
  }
  const htmlTag = val as HtmlTagObject;
  if (typeof htmlTag.tagName !== 'string') {
    throw new Error(
      `${JSON.stringify(
        val,
      )} is not a valid HTML tag object. "tagName" must be defined as a string.`,
    );
  }
  if (
    !htmlTag.customElement &&
    !(htmlTags as string[]).includes(htmlTag.tagName)
  ) {
    throw new Error(
      `Error loading ${JSON.stringify(val)}, "${
        htmlTag.tagName
      }" is not a valid HTML tag. Either use a valid "tagName" or set "customElement: true".`,
    );
  }
}

function hashRouterAbsoluteToRelativeTagAttribute(
  name: string,
  value: string,
): string {
  if ((name === 'src' || name === 'href') && value.startsWith('/')) {
    return `.${value}`;
  }
  return value;
}

function htmlTagObjectToString({
  tag,
  router,
}: {
  tag: unknown;
  router: RouterType;
}): string {
  assertIsHtmlTagObject(tag);
  const isVoidTag = (voidHtmlTags as string[]).includes(tag.tagName);
  const tagAttributes = tag.attributes ?? {};
  const attributes = Object.keys(tagAttributes)
    .map((attr) => {
      let value = tagAttributes[attr]!;
      if (typeof value === 'boolean') {
        return value ? attr : undefined;
      }
      if (router === 'hash') {
        value = hashRouterAbsoluteToRelativeTagAttribute(attr, value);
      }
      return `${attr}="${escapeHTML(value)}"`;
    })
    .filter((str): str is string => Boolean(str));
  const openingTag = `<${[tag.tagName].concat(attributes).join(' ')}>`;
  const innerHTML = (!isVoidTag && tag.innerHTML) || '';
  const closingTag = isVoidTag ? '' : `</${tag.tagName}>`;
  return openingTag + innerHTML + closingTag;
}

function createHtmlTagsString({
  tags,
  router,
}: {
  tags: HtmlTags | undefined;
  router: RouterType;
}): string {
  return (Array.isArray(tags) ? tags : [tags])
    .filter(Boolean)
    .map((val) =>
      typeof val === 'string' ? val : htmlTagObjectToString({tag: val, router}),
    )
    .join('\n');
}

/**
 * Runs the `injectHtmlTags` lifecycle, and aggregates all plugins' tags into
 * directly render-able HTML markup.
 */
export function loadHtmlTags({
  plugins,
  router,
}: {
  plugins: LoadedPlugin[];
  router: RouterType;
}): Pick<Props, 'headTags' | 'preBodyTags' | 'postBodyTags'> {
  const pluginHtmlTags = plugins.map(
    (plugin) => plugin.injectHtmlTags?.({content: plugin.content}) ?? {},
  );
  const tagTypes = ['headTags', 'preBodyTags', 'postBodyTags'] as const;
  return Object.fromEntries(
    _.zip(
      tagTypes,
      tagTypes.map((type) =>
        pluginHtmlTags
          .map((tags) => createHtmlTagsString({tags: tags[type], router}))
          .join('\n')
          .trim(),
      ),
    ),
  ) as Pick<Props, 'headTags' | 'preBodyTags' | 'postBodyTags'>;
}
