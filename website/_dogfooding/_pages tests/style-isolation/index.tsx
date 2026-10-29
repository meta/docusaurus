/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

/* eslint-disable @docusaurus/prefer-docusaurus-heading */

function ExampleContainer({
  isolated,
  children,
}: {
  isolated?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        styles.exampleContainer,
        isolated ? styles.isolated : undefined,
      )}>
      {children}
    </div>
  );
}

function ExampleRow({name, children}: {name: string; children: ReactNode}) {
  return (
    <tr>
      <td>{name}</td>
      <td>
        <ExampleContainer>{children}</ExampleContainer>
      </td>
      <td>
        <ExampleContainer isolated>{children}</ExampleContainer>
      </td>
    </tr>
  );
}

function ExamplesTable() {
  return (
    <table className="table-auto border-collapse border border-gray-300">
      <thead>
        <tr>
          <th>Example</th>
          <th>Normal</th>
          <th>Isolated</th>
        </tr>
      </thead>
      <tbody>
        <ExampleRow name="h1">
          <h1>title</h1>
        </ExampleRow>

        <ExampleRow name="p">
          <p>text</p>
        </ExampleRow>

        <ExampleRow name="a">
          {/* eslint-disable-next-line */}
          <a href="https://example.com">link</a>
        </ExampleRow>

        <ExampleRow name="code">
          <code>code</code>
        </ExampleRow>
        <ExampleRow name="pre > code">
          <pre>
            <code>code</code>
          </pre>
        </ExampleRow>

        <ExampleRow name="blockquote">
          <blockquote>some text</blockquote>
        </ExampleRow>

        <ExampleRow name="button">
          <button>button</button>
        </ExampleRow>

        <ExampleRow name="ul">
          <ul>
            <li>item1</li>
            <li>item2</li>
          </ul>
        </ExampleRow>

        <ExampleRow name="ol">
          <ol>
            <li>item1</li>
            <li>item2</li>
          </ol>
        </ExampleRow>

        <ExampleRow name="kbd">
          <kbd>kbd</kbd>
        </ExampleRow>

        <ExampleRow name="shadow">
          <div className="shadow--tl">shadow (KO)</div>
        </ExampleRow>

        <ExampleRow name="table">
          <table>
            <thead>
              <tr>
                <th>Col1</th>
                <th>Col2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cell1</td>
                <td>Cell2</td>
              </tr>
              <tr>
                <td>Cell3</td>
                <td>Cell3</td>
              </tr>
            </tbody>
          </table>
        </ExampleRow>

        <ExampleRow name="Infima button primary">
          <button className="button button--primary">button</button>
        </ExampleRow>

        <ExampleRow name="Infima alert danger">
          <div className="alert alert--danger">danger</div>
        </ExampleRow>
        <ExampleRow name="Infima badge success">
          <div className="badge badge--success">success</div>
        </ExampleRow>
      </tbody>
    </table>
  );
}

export default function StyleIsolation(): ReactNode {
  return (
    <Layout>
      <main
        style={{padding: 30}}
        className="markdown" // class added on purpose, creates extra pollution
      >
        <Heading as="h1">Style Isolation tests</Heading>

        <p>
          This shows how to isolate your components from Docusaurus global
          styles. A workaround for{' '}
          <Link
            target="_blank"
            href="https://github.com/facebook/docusaurus/issues/6032">
            this issue
          </Link>
          .
        </p>
        <ExamplesTable />
      </main>
    </Layout>
  );
}
