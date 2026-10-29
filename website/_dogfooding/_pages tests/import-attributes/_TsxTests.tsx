/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type React from 'react';
import Heading from '@theme/Heading';
import TextImportTest from './_TextImportTest';

import jsonData from './_fixtures/json-fixture.json' with {type: 'json'};

// TypeScript doesn't know about text import attributes:
// imports are typed according to their file extension
// This is fine because TextImportTest accepts an unknown value
import jsText from './_fixtures/js-fixture.js' with {type: 'text'};
// @ts-expect-error: TS requires allowImportingTsExtensions
import tsText from './_fixtures/ts-fixture.ts' with {type: 'text'};
// @ts-expect-error: TS requires allowImportingTsExtensions
import tsxText from './_fixtures/tsx-fixture.tsx' with {type: 'text'};
import jsonText from './_fixtures/json-fixture.json' with {type: 'text'};
import svgText from './_fixtures/svg-fixture.svg' with {type: 'text'};
import mdText from './_fixtures/md-fixture.md' with {type: 'text'};
import mdxText from './_fixtures/mdx-fixture.mdx' with {type: 'text'};
// @ts-expect-error: no TS module declaration for .yaml files
import yamlText from './_fixtures/yaml-fixture.yaml' with {type: 'text'};
// @ts-expect-error: no TS module declaration for .txt files
import txtText from './_fixtures/txt-fixture.txt' with {type: 'text'};
import cssModuleText from './_fixtures/css-module-fixture.module.css' with {type: 'text'};
import cssText from './_fixtures/css-fixture.css' with {type: 'text'};

export default function TsxTests(): React.JSX.Element {
  return (
    <>
      <Heading as="h3">JSON import</Heading>
      <pre>{JSON.stringify(jsonData)}</pre>
      <TextImportTest
        name="JS"
        language="jsx"
        value={jsText}
        expected="<div>JS fixture</div>"
      />
      <TextImportTest
        name="TS"
        language="ts"
        value={tsText}
        expected="tsFixture: string"
      />
      <TextImportTest
        name="TSX"
        language="tsx"
        value={tsxText}
        expected="{name}: {name: string}"
      />
      <TextImportTest
        name="JSON"
        language="json"
        value={jsonText}
        expected='"fixture": "JSON fixture"'
      />
      <TextImportTest
        name="CSS"
        language="css"
        value={cssText}
        expected=".cssFixture {"
      />
      <TextImportTest
        name="CSS Module"
        language="css"
        value={cssModuleText}
        expected=".cssModuleFixture {"
      />
      <TextImportTest
        name="SVG"
        language="xml"
        value={svgText}
        expected="<svg xmlns"
      />
      <TextImportTest
        name="Markdown"
        language="md"
        value={mdText}
        expected="Some **Markdown** text."
      />
      <TextImportTest
        name="MDX"
        language="mdx"
        value={mdxText}
        expected='<MdxFixture name="world" />'
      />
      <TextImportTest
        name="YAML"
        language="yaml"
        value={yamlText}
        expected="fixture: YAML fixture"
      />
      <TextImportTest
        name="Text"
        language="text"
        value={txtText}
        expected="Text fixture"
      />
    </>
  );
}
