/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import siteConfig from '@generated/docusaurus.config';
import type {Location} from '@docusaurus/router';

function logPage(
  event: string,
  location: Location,
  previousLocation: Location | null,
): void {
  console.log(event, location.pathname, {
    location,
    prevLocation: previousLocation,
    heading: document.getElementsByTagName('h1')[0]?.innerText,
    title: document.title,
    description: document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    )?.content,
    htmlClassName: document.getElementsByTagName('html')[0]?.className,
  });
}

export function onRouteUpdate({
  location,
  previousLocation,
}: {
  location: Location;
  previousLocation: Location | null;
}): (() => void) | void {
  if (
    process.env.NODE_ENV === 'development' ||
    siteConfig.customFields!.isDeployPreview
  ) {
    logPage('onRouteUpdate', location, previousLocation);
    return () => logPage('onRouteUpdate cleanup', location, previousLocation);
  }
  return undefined;
}

export function onRouteDidUpdate({
  location,
  previousLocation,
}: {
  location: Location;
  previousLocation: Location | null;
}): void {
  if (
    process.env.NODE_ENV === 'development' ||
    siteConfig.customFields!.isDeployPreview
  ) {
    logPage('onRouteDidUpdate', location, previousLocation);
  }
}
