/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Benchmarks the Markdown parsers of website/src/remark/markdownParsers.ts
// against remark-parse (micromark):
// - parse: Markdown/MDX to mdast only, the part that the parser replaces
// - compile: the full Docusaurus MDX compilation (compileToJSX)
// Usage:
// node --no-warnings=MODULE_TYPELESS_PACKAGE_JSON \
//   admin/scripts/benchmarkMarkdownParsers.ts [iterations]

import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {pathToFileURL} from 'node:url';

const rootDir = path.resolve(import.meta.dirname, '../..');
const websiteDir = path.join(rootDir, 'website');
const mdxLoaderDir = path.join(rootDir, 'packages/docusaurus-mdx-loader');

const ContentGlob = '{docs,blog,_dogfooding,versioned_docs}/**/*.{md,mdx}';

const Baseline = 'micromark';

type Format = 'md' | 'mdx';
type MarkdownParser = (params: {format: Format}) => unknown;
type Results<T> = {[parserName: string]: T};

type ContentFile = {
  relativePath: string;
  filePath: string;
  fileContent: string;
  preprocessedContent: string;
  frontMatter: {[key: string]: unknown};
  format: Format;
};

type Parse = (content: string) => unknown;
type Compile = (file: ContentFile) => Promise<string>;

async function main() {
  const iterations = Number(process.argv[2] ?? 5);
  const deps = await loadDependencies();
  const files = await loadContentFiles(deps);

  const parserNames = Object.keys(deps.MarkdownParsers);
  const parsers = mapParsers(parserNames, (name) =>
    createParsers(deps, deps.MarkdownParsers[name]),
  );
  const compilers = mapParsers(parserNames, (name) =>
    createCompiler(deps, deps.MarkdownParsers[name]),
  );

  const parseTimings = await benchmark(iterations, parserNames, (name) =>
    parseAll(files, parsers[name]!),
  );
  const compileTimings = await benchmark(iterations, parserNames, (name) =>
    compileAll(files, compilers[name]!).then(() => {}),
  );
  const parseDiffs = await diffResults(files, parserNames, (name, file) =>
    parsers[name]![file.format](file.preprocessedContent),
  );
  const compileDiffs = await diffResults(files, parserNames, (name, file) =>
    compilers[name]!(file).then(hash),
  );

  printReport({
    iterations,
    files,
    parseTimings,
    compileTimings,
    parseDiffs,
    compileDiffs,
  });
}

function mapParsers<T>(
  parserNames: string[],
  fn: (name: string) => T,
): Results<T> {
  return Object.fromEntries(parserNames.map((name) => [name, fn(name)]));
}

// Warmup, then alternate the parsers to spread the machine noise evenly
async function benchmark(
  iterations: number,
  parserNames: string[],
  run: (name: string) => Promise<void>,
): Promise<Results<number[]>> {
  const timingsMs = mapParsers(parserNames, (): number[] => []);
  for (let i = 0; i <= iterations; i += 1) {
    for (const name of parserNames) {
      const start = performance.now();
      await run(name);
      if (i > 0) {
        timingsMs[name]!.push(performance.now() - start);
      }
    }
  }
  return timingsMs;
}

async function parseAll(
  files: ContentFile[],
  parsers: Record<Format, Parse>,
): Promise<void> {
  for (const file of files) {
    parsers[file.format](file.preprocessedContent);
  }
}

async function compileAll(
  files: ContentFile[],
  compile: Compile,
): Promise<string[]> {
  const results: string[] = [];
  for (const file of files) {
    results.push(await compile(file));
  }
  return results;
}

// The files where each alternative parser differs from the baseline
async function diffResults(
  files: ContentFile[],
  parserNames: string[],
  getResult: (name: string, file: ContentFile) => unknown,
): Promise<Results<string[]>> {
  const alternatives = getAlternatives(parserNames);
  const differentFiles = mapParsers(alternatives, (): string[] => []);
  for (const file of files) {
    const baselineResult = await settle(() => getResult(Baseline, file));
    for (const name of alternatives) {
      const result = await settle(() => getResult(name, file));
      if (!isDeepStrictEqual(baselineResult, result)) {
        differentFiles[name]!.push(file.relativePath);
      }
    }
  }
  return differentFiles;
}

function getAlternatives(parserNames: string[]): string[] {
  return parserNames.filter((name) => name !== Baseline);
}

// Errors are results to compare, JSON drops class instances and undefined
async function settle(getResult: () => unknown): Promise<unknown> {
  try {
    return JSON.parse(JSON.stringify(await getResult()));
  } catch (err) {
    return `Error: ${(err as Error).message}`;
  }
}

function printReport({
  iterations,
  files,
  parseTimings,
  compileTimings,
  parseDiffs,
  compileDiffs,
}: {
  iterations: number;
  files: ContentFile[];
  parseTimings: Results<number[]>;
  compileTimings: Results<number[]>;
  parseDiffs: Results<string[]>;
  compileDiffs: Results<string[]>;
}) {
  const mdxCount = files.filter((file) => file.format === 'mdx').length;
  const sizeMB =
    files.reduce((sum, file) => sum + file.fileContent.length, 0) / 1e6;
  console.log(
    `${files.length} files (${mdxCount} mdx, ${files.length - mdxCount} md, ${sizeMB.toFixed(1)} MB)` +
      `, median of ${iterations} iterations after a warmup, Node ${process.version}\n`,
  );
  console.log(formatTimings('parse', parseTimings));
  console.log(formatTimings('compile', compileTimings));
  for (const name of Object.keys(parseDiffs)) {
    const parseDiff = parseDiffs[name]!;
    const compileDiff = compileDiffs[name]!;
    console.log(
      `\n${name}: identical mdast trees ${files.length - parseDiff.length}/${files.length}` +
        `, identical compiled JS ${files.length - compileDiff.length}/${files.length}`,
    );
    for (const file of new Set([...parseDiff, ...compileDiff])) {
      console.log(`  - ${file}`);
    }
  }
}

function formatTimings(label: string, timings: Results<number[]>) {
  const baselineMs = median(timings[Baseline]!);
  const alternatives = getAlternatives(Object.keys(timings)).map((name) => {
    const ms = median(timings[name]!);
    return ` | ${name} ${formatMs(ms)} (${(baselineMs / ms).toFixed(2)}x)`;
  });
  return `${label.padEnd(8)} ${Baseline} ${formatMs(baselineMs)}${alternatives.join('')}`;
}

function median(values: number[]): number {
  const sorted = values.toSorted((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)]!;
}

function formatMs(ms: number): string {
  return `${ms.toFixed(0)} ms`.padStart(8);
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex');
}

type Dependencies = Awaited<ReturnType<typeof loadDependencies>>;

async function loadDependencies() {
  const mdxDir = await fs.realpath(
    path.join(mdxLoaderDir, 'node_modules/@mdx-js/mdx'),
  );
  const fromRoot = (file: string) => importFrom(rootDir, `./${file}`);
  const loadWebsiteModule = await createWebsiteModuleLoader();
  return {
    DEFAULT_CONFIG: (
      await fromRoot('packages/docusaurus/lib/server/configValidation.js')
    ).DEFAULT_CONFIG,
    DEFAULT_PARSE_FRONT_MATTER: (
      await fromRoot('packages/docusaurus-utils/lib/index.js')
    ).DEFAULT_PARSE_FRONT_MATTER,
    getFormat: (await fromRoot('packages/docusaurus-mdx-loader/lib/format.js'))
      .getFormat,
    compileToJSX: (
      await fromRoot('packages/docusaurus-mdx-loader/lib/utils.js')
    ).compileToJSX,
    preprocessor: await importDefault(
      rootDir,
      './packages/docusaurus-mdx-loader/lib/preprocessor.js',
    ),
    MarkdownParsers: (
      await loadWebsiteModule('./src/remark/markdownParsers.ts')
    ).MarkdownParsers as Results<MarkdownParser | undefined>,
    // Same module instance as the parsers, that check if the site uses it
    remarkMath: (await loadWebsiteModule('remark-math')).default,
    unified: (await importFrom(mdxLoaderDir, 'unified')).unified,
    remarkParse: await importDefault(mdxDir, 'remark-parse'),
    remarkMdx: await importDefault(mdxLoaderDir, 'remark-mdx'),
    remarkGfm: await importDefault(mdxLoaderDir, 'remark-gfm'),
    remarkFrontmatter: await importDefault(mdxLoaderDir, 'remark-frontmatter'),
    remarkDirective: await importDefault(mdxLoaderDir, 'remark-directive'),
    rehypeKatex: await importDefault(websiteDir, 'rehype-katex'),
    npm2yarn: await importDefault(
      websiteDir,
      '@docusaurus/remark-plugin-npm2yarn',
    ),
  };
}

// The packages are dependencies of other workspace packages (isolated linker)
async function importFrom(packageDir: string, specifier: string) {
  const require = createRequire(path.join(packageDir, 'package.json'));
  return import(pathToFileURL(require.resolve(specifier)).href);
}

async function importDefault(packageDir: string, specifier: string) {
  const {default: defaultExport} = await importFrom(packageDir, specifier);
  // CommonJS modules compiled by TypeScript: module.exports.default
  return defaultExport?.__esModule ? defaultExport.default : defaultExport;
}

// Like Docusaurus loads docusaurus.config.ts: Node can't import the website
// TS modules, their relative imports have no extension
async function createWebsiteModuleLoader() {
  const {createJiti} = await importFrom(
    path.join(rootDir, 'packages/docusaurus-utils'),
    'jiti',
  );
  const jiti = createJiti(path.join(websiteDir, 'docusaurus.config.ts'), {
    tryNative: false,
  });
  return (specifier: string) => jiti.import(specifier);
}

async function loadContentFiles(deps: Dependencies): Promise<ContentFile[]> {
  const markdownConfig = createMarkdownConfig(deps, undefined);
  const relativePaths = await Array.fromAsync(
    fs.glob(ContentGlob, {cwd: websiteDir}),
  );
  return Promise.all(
    relativePaths.sort().map(async (relativePath) => {
      const filePath = path.join(websiteDir, relativePath);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const {frontMatter} = await deps.DEFAULT_PARSE_FRONT_MATTER({
        filePath,
        fileContent,
      });
      return {
        relativePath,
        filePath,
        fileContent,
        // compileToJSX preprocesses too, needed for the parse benchmark
        preprocessedContent: deps.preprocessor({
          filePath,
          fileContent,
          admonitions: true,
          markdownConfig,
        }),
        frontMatter,
        format: deps.getFormat({
          filePath,
          frontMatterFormat: frontMatter.mdx?.format,
          markdownConfigFormat: markdownConfig.format,
        }),
      };
    }),
  );
}

// Matches the markdown config of website/docusaurus.config.ts
function createMarkdownConfig(
  deps: Dependencies,
  parser: MarkdownParser | undefined,
) {
  return {
    ...deps.DEFAULT_CONFIG.markdown,
    format: 'detect',
    mermaid: true,
    parser,
    mdx1Compat: {comments: false, admonitions: true, headingIds: true},
    hooks: {
      onBrokenMarkdownLinks: 'ignore',
      onBrokenMarkdownImages: 'ignore',
      onUnusedMarkdownDirectives: 'ignore',
    },
  };
}

// Matches the docs plugin config of website/docusaurus.config.ts
function createCompiler(
  deps: Dependencies,
  parser: MarkdownParser | undefined,
): Compile {
  const options = {
    markdownConfig: createMarkdownConfig(deps, parser),
    admonitions: true,
    remarkPlugins: [[deps.npm2yarn, {sync: true}], deps.remarkMath],
    rehypePlugins: [deps.rehypeKatex],
    staticDirs: [path.join(websiteDir, 'static')],
    siteDir: websiteDir,
  };
  return async (file) => {
    const result = await deps.compileToJSX({
      ...file,
      options,
      compilerName: 'server',
    });
    return result.content;
  };
}

// The syntax plugins of the Docusaurus MDX processor, without the transforms
function createParsers(
  deps: Dependencies,
  parser: MarkdownParser | undefined,
): Record<Format, Parse> {
  function createParser(format: Format): Parse {
    const processor = deps.unified().use(deps.remarkParse);
    if (format === 'mdx') {
      processor.use(deps.remarkMdx, {
        acornOptions: {ecmaVersion: 2025, sourceType: 'module'},
      });
    }
    processor
      .use(deps.remarkFrontmatter)
      .use(deps.remarkDirective)
      .use(deps.remarkGfm)
      .use(deps.remarkMath);
    if (parser) {
      processor.use([parser({format})]);
    }
    processor.freeze();
    return (content) => processor.parse(content);
  }
  return {md: createParser('md'), mdx: createParser('mdx')};
}

await main();
