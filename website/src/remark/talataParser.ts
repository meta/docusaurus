/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Parser} from 'acorn';
import acornJsx from 'acorn-jsx';
import remarkMath from 'remark-math';
import {talata} from 'talata/unified';
import {directive} from 'talata/directive';
import {frontmatter} from 'talata/frontmatter';
import {math} from 'talata/math';
import {mdx} from 'talata/mdx';
import type {MarkdownParser} from '@docusaurus/types';
import type {Processor} from 'unified';

const AcornJsxParser = Parser.extend(acornJsx());

// Docusaurus parses MDX ESM as ES2025, MDX defaults to ES2024
const AcornOptions = {ecmaVersion: 2025, sourceType: 'module'};

// talata ignores micromark syntax extensions: we replace those of the remark
// plugins we use with talata extensions
// See https://github.com/lxsmnsyc/talata#differences-from-the-reference
function talataParser(this: Processor, {format}: {format: 'md' | 'mdx'}) {
  const usesRemarkMath = this.attachers.some(
    ([plugin]) => plugin === remarkMath,
  );
  const extensions = [
    frontmatter(),
    directive(),
    ...(usesRemarkMath ? [math()] : []),
    ...(format === 'mdx'
      ? [mdx({acorn: AcornJsxParser, acornOptions: AcornOptions})]
      : []),
  ];
  talata.call(this, {gfm: true, extensions});
}

export const parser: MarkdownParser = ({format}) => [talataParser, {format}];
