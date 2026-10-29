/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {toString} from 'mdast-util-to-string';
import {visit, EXIT} from 'unist-util-visit';
import type {Transformer, Plugin} from 'unified';
import type {Heading, Parent, Root} from 'mdast';
import type {MdxJsxFlowElement} from 'mdast-util-mdx';

interface PluginOptions {
  removeContentTitle?: boolean;
}

function wrapHeadingInJsxHeader(
  headingNode: Heading,
  parent: Parent,
  index: number,
) {
  const header: MdxJsxFlowElement = {
    type: 'mdxJsxFlowElement',
    name: 'header',
    attributes: [],
    children: [headingNode],
  };
  parent.children[index] = header;
}

/**
 * A remark plugin to extract the h1 heading found in Markdown files
 * This is exposed as "data.contentTitle" to the processed vfile
 * Also gives the ability to strip that content title (used for the blog plugin)
 */
const plugin: Plugin<PluginOptions[], Root> = function plugin(
  options = {},
): Transformer<Root> {
  // content title is
  const removeContentTitle = options.removeContentTitle ?? false;

  return (root, vfile) => {
    visit(root, ['heading', 'thematicBreak'], (node, index, parent) => {
      if (!parent || index === undefined) {
        return undefined;
      }
      if (node.type === 'heading') {
        if (node.depth === 1) {
          vfile.data.contentTitle = toString(node);
          if (removeContentTitle) {
            parent.children.splice(index, 1);
          } else {
            // TODO in the future it might be better to export contentTitle as
            // as JSX node to keep this logic a theme concern?
            // See https://github.com/facebook/docusaurus/pull/10335#issuecomment-2250187371
            wrapHeadingInJsxHeader(node, parent, index);
          }
          return EXIT; // We only handle the very first heading
        }
        // We only handle contentTitle if it's the very first heading found
        if (node.depth >= 1) {
          return EXIT;
        }
      }
      // We only handle contentTitle when it's above the first thematic break
      if (node.type === 'thematicBreak') {
        return EXIT;
      }
      return undefined;
    });
  };
};

export default plugin;
