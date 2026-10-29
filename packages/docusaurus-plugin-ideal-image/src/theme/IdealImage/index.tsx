/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import {translate} from '@docusaurus/Translate';
import ReactIdealImage, {
  type IconKey,
  type State,
} from '@theme/IdealImageLegacy';

import type {Props} from '@theme/IdealImage';

// Adopted from https://github.com/endiliey/react-ideal-image/blob/master/src/components/helpers.js#L59-L65
function bytesToSize(bytes: number) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return 'n/a';
  }
  const scale = Math.floor(Math.log(bytes) / Math.log(1024));
  if (scale === 0) {
    return `${bytes} ${sizes[scale]!}`;
  }
  return `${(bytes / 1024 ** scale).toFixed(1)} ${sizes[scale]!}`;
}

// Adopted from https://github.com/endiliey/react-ideal-image/blob/master/src/components/IdealImage/index.js#L43-L75
function getMessage(icon: IconKey, state: State) {
  switch (icon) {
    case 'noicon':
    case 'loaded':
      return null;
    case 'loading':
      return translate({
        id: 'theme.IdealImageMessage.loading',
        message: 'Loading...',
        description: 'When the full-scale image is loading',
      });
    case 'load': {
      // We can show `alt` here
      const {pickedSrc} = state;
      const {size} = pickedSrc;
      const sizeMessage = size ? ` (${bytesToSize(size)})` : '';
      return translate(
        {
          id: 'theme.IdealImageMessage.load',
          message: 'Click to load{sizeMessage}',
          description:
            'To prompt users to load the full image. sizeMessage is a parenthesized size figure.',
        },
        {sizeMessage},
      );
    }
    case 'offline':
      return translate({
        id: 'theme.IdealImageMessage.offline',
        message: 'Your browser is offline. Image not loaded',
        description: 'When the user is viewing an offline document',
      });
    case 'error': {
      const {loadInfo} = state;
      if (loadInfo === 404) {
        return translate({
          id: 'theme.IdealImageMessage.404error',
          message: '404. Image not found',
          description: 'When the image is not found',
        });
      }
      return translate({
        id: 'theme.IdealImageMessage.error',
        message: 'Error. Click to reload',
        description: 'When the image fails to load for unknown error',
      });
    }
    default:
      throw new Error(`Wrong icon: ${icon}`);
  }
}

export default function IdealImage(props: Props): ReactNode {
  const {img, ...propsRest} = props;

  // In dev env just use regular img with original file
  if (typeof img === 'string' || 'default' in img) {
    return (
      // eslint-disable-next-line jsx-a11y/alt-text
      <img src={typeof img === 'string' ? img : img.default} {...propsRest} />
    );
  }

  return (
    <ReactIdealImage
      {...propsRest}
      height={img.src.height ?? 100}
      width={img.src.width ?? 100}
      placeholder={{lqip: img.preSrc}}
      src={img.src.src}
      srcSet={img.src.images.map((image) => ({
        ...image,
        src: image.path,
      }))}
      getMessage={getMessage}
    />
  );
}
