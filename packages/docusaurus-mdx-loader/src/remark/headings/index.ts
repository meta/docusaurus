/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* Based on remark-slug (https://github.com/remarkjs/remark-slug) and gatsby-remark-autolink-headers (https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-remark-autolink-headers) */

import {toString} from 'mdast-util-to-string';
import {visit} from 'unist-util-visit';
import {parseMarkdownHeadingId, createSlugger} from '@docusaurus/utils';
import type {Plugin, Transformer} from 'unified';
import type {Heading, Root, Text} from 'mdast';

export interface PluginOptions {
  anchorsMaintainCase: boolean;
}

function getCommentContentHeadingId(comment: string): string | undefined {
  // If the comment has spaces, we only consider the first part
  const firstPart = comment.trim().split(' ')[0];
  // We ignore comments that don't start with # on purpose
  // Forcing users to use a leading # is more explicit
  // In the future it's possible we'd want to allow other types of comments
  // For example class comments like {/* .my-class */}
  if (firstPart?.startsWith('#')) {
    return firstPart.slice(1) || undefined;
  }
  return undefined;
}

function getCommentHeadingId(heading: Heading): string | undefined {
  const lastChild = heading.children.at(-1);

  // MDX comment: {/* my-id */} or {/* #my-id */}
  if (
    lastChild &&
    lastChild.type === 'mdxTextExpression' &&
    lastChild.data?.estree
  ) {
    const program = lastChild.data.estree;
    // We only extract the id from single-comment MDX expressions
    // ✅ {/* #my-id */}
    // ❌ {/* #my-id */ /* #my-id2 */}
    // ❌ {someExpression /* #my-id */}
    if (program.body.length === 0 && program.comments?.length === 1) {
      const commentContent = program.comments[0]!.value;
      return getCommentContentHeadingId(commentContent);
    }
  }

  // HTML comment: <!-- my-id --> or <!-- #my-id -->
  if (lastChild?.type === 'html') {
    const match = /^<!--(?<comment>[\s\S]*)-->$/.exec(
      (lastChild as unknown as {value: string}).value,
    );
    if (match?.groups?.comment) {
      const commentContent = match.groups.comment;
      return getCommentContentHeadingId(commentContent);
    }
  }

  return undefined;
}

// Try to find an explicit id in MD/MDX comments
function extractCommentId(heading: Heading) {
  const commentId = getCommentHeadingId(heading);
  if (commentId) {
    // Remove the last comment node
    heading.children.pop();
    // Trim the trailing space from the last text node ("text " → "text")
    const newLast = heading.children.at(-1);
    if (newLast?.type === 'text') {
      newLast.value = newLast.value.trimEnd();
    }
    return commentId;
  }
  return undefined;
}

// Try to find an explicit id in the heading text (classic {#id} syntax)
function extractClassicSyntaxHeadingId(heading: Heading, headingText: string) {
  const parsedHeading = parseMarkdownHeadingId(headingText, 'classic');
  // Remove the heading text from its id (legacy syntax)
  if (parsedHeading.id) {
    // When there's an id, it is always in the last child node
    const lastNode = heading.children.at(-1) as Text;
    if (heading.children.length > 1) {
      const lastNodeText = parseMarkdownHeadingId(
        lastNode.value,
        'classic',
      ).text;
      // When the last part contains text + id, remove the id
      if (lastNodeText) {
        lastNode.value = lastNodeText;
      }
      // When last part contains only the id: completely remove that node
      else {
        heading.children.pop();
      }
    } else {
      lastNode.value = parsedHeading.text;
    }
    return parsedHeading.id;
  }
  return undefined;
}

const plugin: Plugin<PluginOptions[], Root> = function plugin({
  anchorsMaintainCase,
}): Transformer<Root> {
  return (root) => {
    function getHeadingText(heading: Heading) {
      const headingTextNodes = heading.children.filter(
        ({type}) => !['html', 'jsx'].includes(type),
      );
      return toString(headingTextNodes.length > 0 ? headingTextNodes : heading);
    }

    const slugs = createSlugger();
    visit(root, 'heading', (heading) => {
      const data = heading.data ?? (heading.data = {});
      const properties = data.hProperties ?? (data.hProperties = {});

      // Gives the ability to provide/write a remark plugin that sets an id
      // When an id is already set, we use it instead of running our own plugin
      function extractAlreadyExistingId() {
        if (properties.id) {
          // Not sure why we need to slugify here, historical code
          return slugs.slug(properties.id, {maintainCase: true});
        }
        return undefined;
      }

      function extractIdFromText() {
        const headingText = getHeadingText(heading);
        return (
          extractClassicSyntaxHeadingId(heading, headingText) ??
          slugs.slug(headingText, {maintainCase: anchorsMaintainCase})
        );
      }

      // All the ways we can extract an id, ordered by priority
      // /!\ the extraction methods can perform AST cleanup side effects
      const id =
        extractAlreadyExistingId() ??
        extractCommentId(heading) ??
        extractIdFromText();

      data.id = id;
      properties.id = id;
    });
  };
};

export default plugin;
