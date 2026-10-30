/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {visit} from 'unist-util-visit';
import {transformNode} from '../utils';
import type {Transformer} from 'unified';

import type {Root} from 'mdast';
import type {MdxJsxFlowElement} from 'mdast-util-mdx';

// Transform <head> to <Head>
// MDX 2 doesn't allow to substitute html elements with the provider anymore
export default function plugin(): Transformer<Root> {
  return (root) => {
    transformJsxHead(root);
    transformHtmlHead(root);
  };
}

// With the MDX format, <head> is a JSX element
function transformJsxHead(root: Root) {
  visit(root, 'mdxJsxFlowElement', (node) => {
    if (node.name === 'head') {
      node.name = 'Head';
    }
  });
}

// With the CommonMark format, <head> is a raw HTML block
// rehype-raw parses raw HTML in body context, where the <head> tag is dropped
// We wrap its content in a <Head> JSX element, that rehype-raw passes through
// The content remains raw HTML that rehype-raw parses inside <Head>
function transformHtmlHead(root: Root) {
  visit(root, 'html', (node) => {
    const headContent = getHeadContent(node.value);
    if (headContent === undefined) {
      return;
    }
    const headElement: MdxJsxFlowElement = {
      type: 'mdxJsxFlowElement',
      name: 'Head',
      attributes: [],
      children: [{type: 'html', value: headContent}],
      position: node.position,
    };
    transformNode(node, headElement);
  });
}

const HeadHtmlRegExp = /^<head>(?<content>.*)<\/head>$/s;

function getHeadContent(html: string): string | undefined {
  return HeadHtmlRegExp.exec(html.trim())?.groups?.content;
}
