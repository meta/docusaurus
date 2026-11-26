/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {describe, expect, it, vi} from 'vitest';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {injectManifest, type ManifestEntry} from 'workbox-build';
import {injectManifestFIPS} from '../injectManifestFIPS';

// injectManifestFIPS() only runs when MD5 is not available
vi.mock('node:crypto', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:crypto')>()),
  getHashes: () => ['sha256'],
}));

const SwSource = 'const manifest = self.__WB_MANIFEST;';

async function createOutDir() {
  const dir = await fs.mkdtempDisposable(
    path.join(await fs.realpath(tmpdir()), 'docusaurus-pwa-'),
  );
  await fs.mkdir(path.join(dir.path, 'assets'));
  await fs.writeFile(path.join(dir.path, 'index.html'), '<h1>Home</h1>');
  await fs.writeFile(path.join(dir.path, 'assets/main.css'), 'body{}');
  await fs.writeFile(path.join(dir.path, 'assets/main.js'), 'alert(1)');
  // A directory named like a file to precache, like the /docs/next.js route
  await fs.mkdir(path.join(dir.path, 'next.js'));
  await fs.writeFile(path.join(dir.path, 'next.js/photo.webp'), 'webp');
  await fs.writeFile(path.join(dir.path, 'sw.js'), SwSource);
  return dir;
}

// Sorted by URL, because Workbox doesn't sort the manifest
async function readSwManifest(outDir: string): Promise<ManifestEntry[]> {
  const swContent = await fs.readFile(path.join(outDir, 'sw.js'), 'utf8');
  const manifestJson = /^const manifest = (?<json>.*);$/.exec(swContent)!
    .groups!.json!;
  const manifest: ManifestEntry[] = JSON.parse(manifestJson);
  return manifest.toSorted((a, b) => a.url.localeCompare(b.url));
}

function getOptions(outDir: string) {
  const swFile = path.join(outDir, 'sw.js');
  return {
    globDirectory: outDir,
    globPatterns: ['**/*.{html,css,js}'],
    swSrc: swFile,
    swDest: swFile,
  };
}

describe('injectManifestFIPS', () => {
  it('injects the same files as Workbox', async () => {
    await using workboxOutDir = await createOutDir();
    await using outDir = await createOutDir();

    await injectManifest(getOptions(workboxOutDir.path));
    await injectManifestFIPS(getOptions(outDir.path));

    const workboxManifest = await readSwManifest(workboxOutDir.path);
    const manifest = await readSwManifest(outDir.path);
    expect(manifest.map((entry) => entry.url)).toEqual(
      workboxManifest.map((entry) => entry.url),
    );
    // Workbox hashes with MD5 anyway
    manifest.forEach((entry, index) => {
      expect(entry.revision).not.toBe(workboxManifest[index]!.revision);
    });
  });

  it('injects files hashed with SHA-256', async () => {
    await using outDir = await createOutDir();

    await injectManifestFIPS(getOptions(outDir.path));

    const manifest = await readSwManifest(outDir.path);
    expect(manifest).toEqual([
      {
        url: 'assets/main.css',
        revision:
          '7c98040a541657584690ae2a1cc3b42a8b53b159cc60c5d3abbfecbaeac6c94a',
      },
      {
        url: 'assets/main.js',
        revision:
          '6e11c72f7cf6bc383152dd16ddd5903aba6bb1c99d6b6639a4bb0b838185fa92',
      },
      {
        url: 'index.html',
        revision:
          '1a7133067a4ac7fe06565943dd44870f232041b1d28b4340e2b678244a3b79f6',
      },
    ]);
  });

  it("doesn't precache the service worker", async () => {
    await using outDir = await createOutDir();

    await injectManifestFIPS(getOptions(outDir.path));

    const manifest = await readSwManifest(outDir.path);
    expect(manifest.map((entry) => entry.url)).not.toContain('sw.js');
  });

  it('delegates templatedURLs to Workbox', async () => {
    await using outDir = await createOutDir();

    await injectManifestFIPS({
      ...getOptions(outDir.path),
      templatedURLs: {'/app-shell': 'shell'},
    });

    const manifest = await readSwManifest(outDir.path);
    expect(manifest).toContainEqual({
      url: '/app-shell',
      revision: crypto.createHash('md5').update('shell').digest('hex'),
    });
  });

  it('applies the Workbox manifest options', async () => {
    await using outDir = await createOutDir();

    await injectManifestFIPS({
      ...getOptions(outDir.path),
      globIgnores: ['**/*.css'],
      maximumFileSizeToCacheInBytes: 10,
      modifyURLPrefix: {'assets/': 'static/'},
      dontCacheBustURLsMatching: /main\.js$/,
      manifestTransforms: [
        (manifest) => ({
          manifest: manifest.map((entry) => ({...entry, url: `/${entry.url}`})),
        }),
      ],
      additionalManifestEntries: [{url: '/extra.txt', revision: '42'}],
    });

    const manifest = await readSwManifest(outDir.path);
    expect(manifest).toEqual([
      {url: '/extra.txt', revision: '42'},
      {url: '/static/main.js', revision: null},
    ]);
  });
});
