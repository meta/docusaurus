/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {program} from 'commander';
import {logger} from '@docusaurus/logger';
import sharp from 'sharp';
import {imageSizeFromFile} from 'image-size/fromFile';

// You can use it as:
//
// # Resize all images in showcase (which is most likely)
// node admin/scripts/resizeImage.js
//
// # Resize specified images / all images in a folder
// # This does not read folders recursively as of now
// node admin/scripts/resizeImage.js image1.png some-folder ...
//
// By default, showcase images are resized to 640×320; everything else is
// resized to width 1000. You can explicitly give a width/height as arguments.
// node admin/scripts/resizeImage.js --width 640 --height 320 image1.png

function maybeParseInt(n) {
  const res = Number.parseInt(n, 10);
  if (Number.isNaN(res)) {
    return undefined;
  }
  return res;
}

const showcasePath = 'website/src/data/showcase';

program
  .arguments('[imagePaths...]')
  .option('-w, --width <width>', 'Image width', maybeParseInt)
  .option('-h, --height <height>', 'Image height', maybeParseInt)
  .action(async (imagePaths, options) => {
    if (imagePaths.length === 0) {
      imagePaths.push(showcasePath);
    }
    const rootDir = fileURLToPath(new URL('../..', import.meta.url));
    const images = (
      await Promise.all(
        imagePaths.map(async (p) =>
          path.extname(p)
            ? [path.resolve(rootDir, p)]
            : (await fs.readdir(p)).map((f) => path.resolve(rootDir, p, f)),
        ),
      )
    )
      .flat()
      .filter((p) => ['.png', 'jpg', '.jpeg'].includes(path.extname(p)));

    const stats = {
      skipped: 0,
      resized: 0,
    };

    await Promise.all(
      images.map(async (imgPath) => {
        const {width, height} = await imageSizeFromFile(imgPath);
        const targetWidth =
          options.width ?? (imgPath.includes(showcasePath) ? 640 : 1000);
        const targetHeight =
          options.height ?? (imgPath.includes(showcasePath) ? 320 : undefined);
        if (
          width <= targetWidth &&
          (!targetHeight || height <= targetHeight) &&
          imgPath.endsWith('.png')
        ) {
          // Do not emit if not resized. Important because we can't guarantee
          // idempotency during resize -> optimization
          stats.skipped += 1;
          return;
        }
        logger.info`Resized path=${imgPath}: before number=${width}×number=${height}; now number=${targetWidth}×number=${
          targetHeight ?? Math.floor((height / width) * targetWidth)
        }`;
        const data = await sharp(imgPath)
          .resize(targetWidth, targetHeight, {fit: 'cover', position: 'top'})
          .png()
          .toBuffer();
        await fs.writeFile(imgPath.replace(/jpe?g/, 'png'), data);
        stats.resized += 1;
      }),
    );

    logger.info`Images resizing complete.
        resized: number=${stats.resized}
        skipped: number=${stats.skipped}`;
  });

program.parse(process.argv);

// You should also run
// optimizt `find website/src/data/showcase -type f -name '*.png'`.
// This is not included here because @funboxteam/optimizt doesn't seem to play
// well with M1 so I had to run this in a Rosetta terminal.
// TODO integrate this as part of the script
