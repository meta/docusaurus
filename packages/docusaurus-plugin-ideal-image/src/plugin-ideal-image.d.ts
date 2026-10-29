/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/// <reference types="@docusaurus/module-type-aliases" />

declare module '@docusaurus/plugin-ideal-image' {
  export type PluginOptions = {
    /**
     * Filename template for output files.
     */
    name?: string;
    /**
     * Specify all widths you want to use; if a specified size exceeds the
     * original image's width, the latter will be used (i.e. images won't be
     * scaled up).
     */
    sizes?: number[];
    /**
     * Specify one width you want to use; if the specified size exceeds the
     * original image's width, the latter will be used (i.e. images won't be
     * scaled up)
     */
    size?: number;
    /**
     * As an alternative to manually specifying `sizes`, you can specify `min`,
     * `max` and `steps`, and the `sizes` will be generated for you.
     */
    min?: number;
    /**
     * @see {@link PluginOptions.min}
     */
    max?: number;
    /**
     * Configure the number of images generated between `min` and `max`
     * (inclusive)
     */
    steps?: number;
    /**
     * JPEG compression quality
     */
    quality?: number;
    /**
     * You can test ideal image behavior in dev mode by setting this to `false`.
     * Tip: use network throttling in your browser to simulate slow networks.
     */
    disableInDev?: boolean;
  };

  export type Options = Partial<PluginOptions>;
}

declare module '@theme/IdealImage' {
  import type {ComponentProps, ReactNode} from 'react';

  export type SrcType = {
    width: number;
    path?: string;
    size?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'gif';
  };

  export type SrcImage = {
    height?: number;
    width?: number;
    preSrc: string;
    src: string;
    images: SrcType[];
  };

  export interface Props extends ComponentProps<'img'> {
    readonly img: {default: string} | {src: SrcImage; preSrc: string} | string;
  }
  export default function IdealImage(props: Props): ReactNode;
}

declare module '@theme/IdealImageLegacy' {
  /**
   * @see https://github.com/endiliey/react-ideal-image/blob/master/index.d.ts
   * Note: the original type definition is WRONG. getIcon & getMessage receive
   * full state object.
   */

  import type {
    ComponentProps,
    ComponentType,
    CSSProperties,
    ReactNode,
  } from 'react';

  export type LoadingState = 'initial' | 'loading' | 'loaded' | 'error';

  export type State = {
    pickedSrc: {
      size: number;
    };
    loadInfo: 404 | null;
    loadState: LoadingState;
  };

  export type IconKey =
    | 'load'
    | 'loading'
    | 'loaded'
    | 'error'
    | 'noicon'
    | 'offline';

  export type SrcType = {
    width: number;
    src?: string;
    size?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'gif';
  };

  type ThemeKey = 'placeholder' | 'img' | 'icon' | 'noscript';

  export interface ImageProps extends Omit<
    ComponentProps<'img'>,
    'srcSet' | 'placeholder'
  > {
    /**
     * This function decides what icon to show based on the current state of the
     * component.
     */
    getIcon?: (state: State) => IconKey;
    /**
     * This function decides what message to show based on the icon (returned
     * from `getIcon` prop) and the current state of the component.
     */
    getMessage?: (icon: IconKey, state: State) => string | null;
    /**
     * This function is called as soon as the component enters the viewport and
     * is used to generate urls based on width and format if `props.srcSet`
     * doesn't provide `src` field.
     */
    getUrl?: (srcType: SrcType) => string;
    /**
     * The Height of the image in px.
     */
    height: number;
    /**
     * This provides a map of the icons. By default, the component uses icons
     * from material design, Implemented as React components with the SVG
     * element. You can customize icons
     */
    icons?: Partial<{[icon in IconKey]: ComponentType}>;
    /**
     * This prop takes one of the 2 options, xhr and image.
     * Read more about it:
     * https://github.com/stereobooster/react-ideal-image/blob/master/introduction.md#cancel-download
     */
    loader?: 'xhr' | 'image';
    /**
     * https://github.com/stereobooster/react-ideal-image/blob/master/introduction.md#lqip
     */
    placeholder: {color: string} | {lqip: string};
    /**
     * This function decides if image should be downloaded automatically. The
     * default function returns false for a 2g network, for a 3g network it
     * decides based on `props.threshold` and for a 4g network it returns true
     * by default.
     */
    shouldAutoDownload?: (options: {
      connection?: 'slow-2g' | '2g' | '3g' | '4g';
      size?: number;
      threshold?: number;
      possiblySlowNetwork?: boolean;
    }) => boolean;
    /**
     * This provides an array of sources of different format and size of the
     * image. Read more about it:
     * https://github.com/stereobooster/react-ideal-image/blob/master/introduction.md#srcset
     */
    srcSet: SrcType[];
    /**
     * This provides a theme to the component. By default, the component uses
     * inline styles, but it is also possible to use CSS modules and override
     * all styles.
     */
    theme?: Partial<{[key in ThemeKey]: string | CSSProperties}>;
    /**
     * Tells how much to wait in milliseconds until consider the download to be
     * slow.
     */
    threshold?: number;
    /**
     * Width of the image in px.
     */
    width: number;
  }

  export interface Props extends ImageProps {}

  export default function IdealImageLegacy(props: ImageProps): ReactNode;
}
