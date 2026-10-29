---
id: code-blocks
description: Handling code blocks in Docusaurus Markdown
slug: /markdown-features/code-blocks
---

# Code blocks

import BrowserWindow from '@site/src/components/BrowserWindow';
import CodeBlock from '@theme/CodeBlock';

Code blocks within documentation are super-powered 💪.

## Code title {/* #code-title */}

You can add a title to the code block by adding a `title` key after the language (leave a space between them).

````md
```jsx title="/src/components/HelloCodeTitle.js"
function HelloCodeTitle(props) {
  return <h1>Hello, {props.name}</h1>;
}
```
````

```mdx-code-block
<BrowserWindow>
```

```jsx title="/src/components/HelloCodeTitle.js"
function HelloCodeTitle(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

```mdx-code-block
</BrowserWindow>
```

## Syntax highlighting {/* #syntax-highlighting */}

Code blocks are text blocks wrapped around by strings of 3 backticks. You may check out [this reference](https://mdxjs.com/docs/) for the specifications of MDX.

````md
```js
console.log('Every repo must come with a mascot.');
```
````

Use the matching language meta string for your code block, and Docusaurus will pick up syntax highlighting automatically, powered by [Prism React Renderer](https://github.com/FormidableLabs/prism-react-renderer).

<BrowserWindow>

```js
console.log('Every repo must come with a mascot.');
```

</BrowserWindow>

### Theming {/* #theming */}

By default, the Prism [syntax highlighting theme](https://github.com/FormidableLabs/prism-react-renderer#theming) we use is [Palenight](https://github.com/FormidableLabs/prism-react-renderer/blob/master/packages/prism-react-renderer/src/themes/palenight.ts). You can change this to another theme by passing `theme` field in `prism` as `themeConfig` in your docusaurus.config.js.

For example, if you prefer to use the `dracula` highlighting theme:

```js title="docusaurus.config.js"
import {themes as prismThemes} from 'prism-react-renderer';

export default {
  themeConfig: {
    prism: {
      // highlight-next-line
      theme: prismThemes.dracula,
    },
  },
};
```

Because a Prism theme is just a JS object, you can also write your own theme if you are not satisfied with the default. Docusaurus enhances the `github` and `vsDark` themes to provide richer highlight, and you can check our implementations for the [light](https://github.com/facebook/docusaurus/blob/main/website/src/utils/prismLight.ts) and [dark](https://github.com/facebook/docusaurus/blob/main/website/src/utils/prismDark.ts) code block themes.

### Supported Languages {/* #supported-languages */}

By default, Docusaurus comes with a subset of [commonly used languages](https://github.com/FormidableLabs/prism-react-renderer/blob/master/packages/generate-prism-languages/index.ts#L10-L25).

:::warning

Some popular languages like Java, C#, or PHP are not enabled by default.

:::

To add syntax highlighting for any of the other [Prism-supported languages](https://prismjs.com/#supported-languages), define it in an array of additional languages.

:::note

Each additional language has to be a valid Prism component name. For example, Prism would map the _language_ `cs` to `csharp`, but only `prism-csharp.js` exists as a _component_, so you need to use `additionalLanguages: ['csharp']`. You can look into `node_modules/prismjs/components` to find all components (languages) available.

:::

For example, if you want to add highlighting for the PowerShell language:

```js title="docusaurus.config.js"
export default {
  // ...
  themeConfig: {
    prism: {
      // highlight-next-line
      additionalLanguages: ['powershell'],
    },
    // ...
  },
};
```

After adding `additionalLanguages`, restart Docusaurus.

If you want to add highlighting for languages not yet supported by Prism, you can swizzle `prism-include-languages`:

```bash npm2yarn
npm run swizzle @docusaurus/theme-classic prism-include-languages
```

It will produce `prism-include-languages.js` in your `src/theme` folder. You can add highlighting support for custom languages by editing `prism-include-languages.js`:

```js title="src/theme/prism-include-languages.js"
const prismIncludeLanguages = (Prism) => {
  // ...

  additionalLanguages.forEach((lang) => {
    require(`prismjs/components/prism-${lang}`);
  });

  // highlight-next-line
  require('/path/to/your/prism-language-definition');

  // ...
};
```

You can refer to [Prism's official language definitions](https://github.com/PrismJS/prism/tree/master/components) when you are writing your own language definitions.

When adding a custom language definition, you do not need to add the language to the `additionalLanguages` config array, since Docusaurus only looks up the `additionalLanguages` strings in languages that Prism provides. Adding the language import in `prism-include-languages.js` is sufficient.

## Line highlighting {/* #line-highlighting */}

### Highlighting with comments {/* #highlighting-with-comments */}

You can use comments with `highlight-next-line`, `highlight-start`, and `highlight-end` to select which lines are highlighted.

````md
```js
function HighlightSomeText(highlight) {
  if (highlight) {
    // highlight-next-line
    return 'This text is highlighted!';
  }

  return 'Nothing highlighted';
}

function HighlightMoreText(highlight) {
  // highlight-start
  if (highlight) {
    return 'This range is highlighted!';
  }
  // highlight-end

  return 'Nothing highlighted';
}
```
````

```mdx-code-block
<BrowserWindow>
```

```js
function HighlightSomeText(highlight) {
  if (highlight) {
    // highlight-next-line
    return 'This text is highlighted!';
  }

  return 'Nothing highlighted';
}

function HighlightMoreText(highlight) {
  // highlight-start
  if (highlight) {
    return 'This range is highlighted!';
  }
  // highlight-end

  return 'Nothing highlighted';
}
```

```mdx-code-block
</BrowserWindow>
```

Supported commenting syntax:

| Style      | Syntax                   |
| ---------- | ------------------------ |
| C-style    | `/* ... */` and `// ...` |
| JSX-style  | `{/* ... */}`            |
| Bash-style | `# ...`                  |
| HTML-style | `<!-- ... -->`           |

We will do our best to infer which set of comment styles to use based on the language, and default to allowing _all_ comment styles. If there's a comment style that is not currently supported, we are open to adding them! Pull requests welcome. Note that different comment styles have no semantic difference, only their content does.

You can set your own background color for highlighted code line in your `src/css/custom.css` which will better fit to your selected syntax highlighting theme. The color given below works for the default highlighting theme (Palenight), so if you are using another theme, you will have to tweak the color accordingly.

```css title="/src/css/custom.css"
:root {
  --docusaurus-highlighted-code-line-bg: rgb(72, 77, 91);
}

/* If you have a different syntax highlighting theme for dark mode. */
[data-theme='dark'] {
  /* Color which works with dark mode syntax highlighting theme */
  --docusaurus-highlighted-code-line-bg: rgb(100, 100, 100);
}
```

If you also need to style the highlighted code line in some other way, you can target on `theme-code-block-highlighted-line` CSS class.

### Highlighting with metadata string {/* #highlighting-with-metadata-string */}

You can also specify highlighted line ranges within the language meta string (leave a space after the language). To highlight multiple lines, separate the line numbers by commas or use the range syntax to select a chunk of lines. This feature uses the `parse-number-range` library and you can find [more syntax](https://www.npmjs.com/package/parse-numeric-range) on their project details.

````md
```jsx {1,4-6,11}
import React from 'react';

function MyComponent(props) {
  if (props.isBar) {
    return <div>Bar</div>;
  }

  return <div>Foo</div>;
}

export default MyComponent;
```
````

```mdx-code-block
<BrowserWindow>
```

```jsx {1,4-6,11}
import React from 'react';

function MyComponent(props) {
  if (props.isBar) {
    return <div>Bar</div>;
  }

  return <div>Foo</div>;
}

export default MyComponent;
```

```mdx-code-block
</BrowserWindow>
```

:::tip prefer comments

Prefer highlighting with comments where you can. By inlining highlight in the code, you don't have to manually count the lines if your code block becomes long. If you add/remove lines, you also don't have to offset your line ranges.

````diff
- ```jsx {3}
+ ```jsx {4}
  function HighlightSomeText(highlight) {
    if (highlight) {
+     console.log('Highlighted text found');
      return 'This text is highlighted!';
    }

    return 'Nothing highlighted';
  }
  ```
````

Below, we will introduce how the magic comment system can be extended to define custom directives and their functionalities. The magic comments would only be parsed if a highlight metastring is not present.

:::

### Custom magic comments {/* #custom-magic-comments */}

`// highlight-next-line` and `// highlight-start` etc. are called "magic comments", because they will be parsed and removed, and their purposes are to add metadata to the next line, or the section that the pair of start- and end-comments enclose.

You can declare custom magic comments through theme config. For example, you can register another magic comment that adds a `code-block-error-line` class name:

```mdx-code-block
<Tabs>
<TabItem value="docusaurus.config.js">
```

```js
export default {
  themeConfig: {
    prism: {
      magicComments: [
        // Remember to extend the default highlight class name as well!
        {
          className: 'theme-code-block-highlighted-line',
          line: 'highlight-next-line',
          block: {start: 'highlight-start', end: 'highlight-end'},
        },
        // highlight-start
        {
          className: 'code-block-error-line',
          line: 'This will error',
        },
        // highlight-end
      ],
    },
  },
};
```

```mdx-code-block
</TabItem>
<TabItem value="src/css/custom.css">
```

```css
.code-block-error-line {
  background-color: #ff000020;
  display: block;
  margin: 0 calc(-1 * var(--ifm-pre-padding));
  padding: 0 var(--ifm-pre-padding);
  border-left: 3px solid #ff000080;
}
```

```mdx-code-block
</TabItem>
<TabItem value="myDoc.md">
```

````md
In JavaScript, trying to access properties on `null` will error.

```js
const name = null;
// This will error
console.log(name.toUpperCase());
// Uncaught TypeError: Cannot read properties of null (reading 'toUpperCase')
```
````

```mdx-code-block
</TabItem>
</Tabs>
```

```mdx-code-block
<BrowserWindow>
```

In JavaScript, trying to access properties on `null` will error.

```js
const name = null;
// This will error
console.log(name.toUpperCase());
// Uncaught TypeError: Cannot read properties of null (reading 'toUpperCase')
```

```mdx-code-block
</BrowserWindow>
```

If you use number ranges in metastring (the `{1,3-4}` syntax), Docusaurus will apply the **first `magicComments` entry**'s class name. This, by default, is `theme-code-block-highlighted-line`, but if you change the `magicComments` config and use a different entry as the first one, the meaning of the metastring range will change as well.

You can disable the default line highlighting comments with `magicComments: []`. If there's no magic comment config, but Docusaurus encounters a code block containing a metastring range, it will error because there will be no class name to apply—the highlighting class name, after all, is just a magic comment entry.

Every magic comment entry will contain three keys: `className` (required), `line`, which applies to the directly next line, or `block` (containing `start` and `end`), which applies to the entire block enclosed by the two comments.

Using CSS to target the class can already do a lot, but you can unlock the full potential of this feature through [swizzling](../../swizzling.mdx).

```bash npm2yarn
npm run swizzle @docusaurus/theme-classic CodeBlock/Line
```

The `Line` component will receive the list of class names, based on which you can conditionally render different markup.

## Line numbering {/* #line-numbering */}

You can enable line numbering for your code block by using `showLineNumbers` key within the language meta string (don't forget to add space directly before the key).

````md
```jsx showLineNumbers
import React from 'react';

export default function MyComponent(props) {
  return <div>Foo</div>;
}
```
````

```mdx-code-block
<BrowserWindow>
```

```jsx showLineNumbers
import React from 'react';

export default function MyComponent(props) {
  return <div>Foo</div>;
}
```

```mdx-code-block
</BrowserWindow>
```

By default, the counter starts at line number 1. It's possible to pass a custom counter start value to split large code blocks for readability:

````md
```jsx showLineNumbers=3
export default function MyComponent(props) {
  return <div>Foo</div>;
}
```
````

```mdx-code-block
<BrowserWindow>
```

```jsx showLineNumbers=3
export default function MyComponent(props) {
  return <div>Foo</div>;
}
```

```mdx-code-block
</BrowserWindow>
```

## Interactive code editor {/* #interactive-code-editor */}

(Powered by [React Live](https://github.com/FormidableLabs/react-live))

You can create an interactive coding editor with the `@docusaurus/theme-live-codeblock` plugin. First, add the plugin to your package.

```bash npm2yarn
npm install --save @docusaurus/theme-live-codeblock
```

You will also need to add the plugin to your `docusaurus.config.js`.

```js {3}
export default {
  // ...
  themes: ['@docusaurus/theme-live-codeblock'],
  // ...
};
```

To use the plugin, create a code block with `live` attached to the language meta string.

````md
```jsx live
function Clock(props) {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h2>It is {date.toLocaleTimeString()}.</h2>;
}
```
````

The code block will be rendered as an interactive editor. Changes to the code will reflect on the result panel live.

```mdx-code-block
<BrowserWindow>
```

```jsx live
function Clock(props) {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h2>It is {date.toLocaleTimeString()}.</h2>;
}
```

```mdx-code-block
</BrowserWindow>
```

### Imports {/* #imports */}

:::warning react-live and imports

It is not possible to import components directly from the react-live code editor, you have to define available imports upfront.

:::

By default, all React imports are available. If you need more imports available, swizzle the react-live scope:

```bash npm2yarn
npm run swizzle @docusaurus/theme-live-codeblock ReactLiveScope -- --eject
```

```jsx title="src/theme/ReactLiveScope/index.js"
import React from 'react';

// highlight-start
const ButtonExample = (props) => (
  <button
    {...props}
    style={{
      backgroundColor: 'white',
      color: 'black',
      border: 'solid red',
      borderRadius: 20,
      padding: 10,
      cursor: 'pointer',
      ...props.style,
    }}
  />
);
// highlight-end

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  // highlight-next-line
  ButtonExample,
};

export default ReactLiveScope;
```

The `ButtonExample` component is now available to use:

```mdx-code-block
<BrowserWindow>
```

```jsx live
function MyPlayground(props) {
  return (
    <div>
      <ButtonExample onClick={() => alert('hey!')}>Click me</ButtonExample>
    </div>
  );
}
```

```mdx-code-block
</BrowserWindow>
```

### Imperative Rendering (noInline) {/* #imperative-rendering-noinline */}

The `noInline` option should be used to avoid errors when your code spans multiple components or variables.

````md
```jsx live noInline
const project = 'Docusaurus';

const Greeting = () => <p>Hello {project}!</p>;

render(<Greeting />);
```
````

Unlike an ordinary interactive code block, when using `noInline` React Live won't wrap your code in an inline function to render it.

You will need to explicitly call `render()` at the end of your code to display the output.

````mdx-code-block
<BrowserWindow>

```jsx live noInline
const project = "Docusaurus";

const Greeting = () => (
  <p>Hello {project}!</p>
);

render(
  <Greeting />
);
```

</BrowserWindow>
````

## Using JSX markup in code blocks {/* #using-jsx-markup */}

Code block in Markdown always preserves its content as plain text, meaning you can't do something like:

```ts
type EditUrlFunction = (params: {
  // This doesn't turn into a link (for good reason!)
  version: <a href="/docs/versioning">Version</a>;
  versionDocsDirPath: string;
  docPath: string;
  permalink: string;
  locale: string;
}) => string | undefined;
```

If you want to embed HTML markup such as anchor links or bold type, you can use the `<pre>` tag, `<code>` tag, or `<CodeBlock>` component.

```jsx
<pre>
  <b>Input: </b>1 2 3 4{'\n'}
  <b>Output: </b>"366300745"{'\n'}
</pre>
```

<BrowserWindow>
  <pre>
    <b>{'Input: '}</b>
    {'1 2 3 4\n'}
    <b>{'Output: '}</b>
    {'"366300745"\n'}
  </pre>
</BrowserWindow>

:::warning MDX is whitespace insensitive

MDX is in line with JSX behavior: line break characters, even when inside `<pre>`, are turned into spaces. You have to explicitly write the new line character for it to be printed out.

:::

:::warning

Syntax highlighting only works on plain strings. Docusaurus will not attempt to parse code block content containing JSX children.

:::

## Multi-language support code blocks {/* #multi-language-support-code-blocks */}

With MDX, you can easily create interactive components within your documentation, for example, to display code in multiple programming languages and switch between them using a tabs component.

Instead of implementing a dedicated component for multi-language support code blocks, we've implemented a general-purpose [`<Tabs>`](./markdown-features-tabs.mdx) component in the classic theme so that you can use it for other non-code scenarios as well.

The following example is how you can have multi-language code tabs in your docs. Note that the empty lines above and below each language block are **intentional**. This is a [current limitation of MDX](./markdown-features-react.mdx#markdown-and-jsx-interoperability): you have to leave empty lines around Markdown syntax for the MDX parser to know that it's Markdown syntax and not JSX.

````jsx
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="js" label="JavaScript">

```js
function helloWorld() {
  console.log('Hello, world!');
}
```

</TabItem>
<TabItem value="py" label="Python">

```py
def hello_world():
  print("Hello, world!")
```

</TabItem>
<TabItem value="java" label="Java">

```java
class HelloWorld {
  public static void main(String args[]) {
    System.out.println("Hello, World");
  }
}
```

</TabItem>
</Tabs>
````

And you will get the following:

```mdx-code-block
<BrowserWindow>
<Tabs>
<TabItem value="js" label="JavaScript">
```

```js
function helloWorld() {
  console.log('Hello, world!');
}
```

```mdx-code-block
</TabItem>
<TabItem value="py" label="Python">
```

```py
def hello_world():
  print("Hello, world!")
```

```mdx-code-block
</TabItem>
<TabItem value="java" label="Java">
```

```java
class HelloWorld {
  public static void main(String args[]) {
    System.out.println("Hello, World");
  }
}
```

```mdx-code-block
</TabItem>
</Tabs>
</BrowserWindow>
```

If you have multiple of these multi-language code tabs, and you want to sync the selection across the tab instances, refer to the [Syncing tab choices section](markdown-features-tabs.mdx#syncing-tab-choices).

### Docusaurus npm2yarn remark plugin {/* #npm2yarn-remark-plugin */}

Displaying CLI commands in both npm and Yarn is a very common need, for example:

```bash npm2yarn
npm install @docusaurus/remark-plugin-npm2yarn
```

Docusaurus provides such a utility out of the box, freeing you from using the `Tabs` component every time. To enable this feature, first install the `@docusaurus/remark-plugin-npm2yarn` package as above, and then in `docusaurus.config.js`, for the plugins where you need this feature (doc, blog, pages, etc.), register it in the `remarkPlugins` option. (See [Docs configuration](../../api/plugins/plugin-content-docs.mdx#ex-config) for more details on configuration format)

```js title="docusaurus.config.js"
export default {
  // ...
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // highlight-start
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), {sync: true}],
          ],
          // highlight-end
        },
        pages: {
          // highlight-next-line
          remarkPlugins: [require('@docusaurus/remark-plugin-npm2yarn')],
        },
        blog: {
          // highlight-start
          remarkPlugins: [
            [
              require('@docusaurus/remark-plugin-npm2yarn'),
              {converters: ['pnpm']},
            ],
          ],
          // highlight-end
          // ...
        },
      },
    ],
  ],
};
```

And then use it by adding the `npm2yarn` key to the code block:

````md
```bash npm2yarn
npm install @docusaurus/remark-plugin-npm2yarn
```
````

#### Configuration {/* #npm2yarn-remark-plugin-configuration */}

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `sync` | `boolean` | `false` | Whether to sync the selected converter across all code blocks. |
| `converters` | `array` | `'yarn'`, `'pnpm'` | The list of converters to use. The order of the converters is important, as the first converter will be used as the default choice. |

## Usage in JSX {/* #usage-in-jsx */}

Outside of Markdown, you can use the `@theme/CodeBlock` component to get the same output.

```jsx
import CodeBlock from '@theme/CodeBlock';

export default function MyReactPage() {
  return (
    <div>
      {/* highlight-start */}
      <CodeBlock
        language="jsx"
        title="/src/components/HelloCodeTitle.js"
        showLineNumbers>
        {`function HelloCodeTitle(props) {
  return <h1>Hello, {props.name}</h1>;
}`}
      </CodeBlock>
      {/* highlight-end */}
    </div>
  );
}
```

```mdx-code-block
<BrowserWindow>
  <CodeBlock
    language="jsx"
    title="/src/components/HelloCodeTitle.js"
    showLineNumbers>
    {`function HelloCodeTitle(props) {
  return <h1>Hello, {props.name}</h1>;
}`}
  </CodeBlock>
</BrowserWindow>
```

The props accepted are `language`, `title` and `showLineNumbers`, in the same way as you write Markdown code blocks.

Although discouraged, you can also pass in a `metastring` prop like `metastring='{1-2} title="/src/components/HelloCodeTitle.js" showLineNumbers'`, which is how Markdown code blocks are handled under the hood. However, we recommend you [use comments for highlighting lines](#highlighting-with-comments).

As [previously stated](#using-jsx-markup), syntax highlighting is only applied when the children is a simple string.
