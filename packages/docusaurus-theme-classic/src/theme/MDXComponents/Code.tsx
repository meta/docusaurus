/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ComponentProps, ReactElement, ReactNode} from 'react';
import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import CodeInline from '@theme/CodeInline';
import type {Props} from '@theme/MDXComponents/Code';

function shouldBeInline(props: Props) {
  return (
    // empty code blocks have no props.children,
    // see https://github.com/meta/docusaurus/pull/9704
    typeof props.children !== 'undefined' && isSingleLine(props.children)
  );
}

function isSingleLine(children: ReactNode): boolean {
  return React.Children.toArray(children).every(isSingleLineChild);
}

// CommonMark raw HTML can nest elements in inline code,
// like <code>a <var>b</var></code>
// See https://github.com/meta/docusaurus/issues/10533
function isSingleLineChild(child: ReactNode): boolean {
  if (typeof child === 'string') {
    return !child.includes('\n');
  }
  return isHtmlElement(child) && isSingleLine(child.props.children);
}

function isHtmlElement(
  child: ReactNode,
): child is ReactElement<{children?: ReactNode}, string> {
  return React.isValidElement(child) && typeof child.type === 'string';
}

export default function MDXCode(props: Props): ReactNode {
  return shouldBeInline(props) ? (
    <CodeInline {...props} />
  ) : (
    <CodeBlock {...(props as ComponentProps<typeof CodeBlock>)} />
  );
}
