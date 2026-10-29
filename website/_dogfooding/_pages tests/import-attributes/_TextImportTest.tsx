/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type React from 'react';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';

// Asserts that a module imported with `with {type: 'text'}`
// is the raw file content, not processed by any loader
// Throws on purpose: a regression must fail the website build
export default function TextImportTest({
  name,
  value,
  expected,
  language,
}: {
  name: string;
  // Typed as unknown: TypeScript doesn't type text imports as strings
  value: unknown;
  // A raw source snippet that loaders would transform or remove
  expected: string;
  language: string;
}): React.JSX.Element {
  if (typeof value !== 'string' || !value.includes(expected)) {
    throw new Error(
      `Text import attribute test failed for ${name}: expected a string containing ${JSON.stringify(expected)}, got ${typeof value}:\n${String(value)}`,
    );
  }
  return (
    <section>
      <Heading as="h3">✅ {name}</Heading>
      <CodeBlock language={language}>{value}</CodeBlock>
    </section>
  );
}
