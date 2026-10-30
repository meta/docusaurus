/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import {useEvent, usePrevious} from './reactUtils';
import type {Location} from 'history';

/**
 * Fires an effect when the location changes (which includes hash, query, etc.).
 * Importantly, doesn't fire when there's no previous location: see
 * https://github.com/meta/docusaurus/pull/6696
 */
export function useLocationChange(
  onLocationChange: (locationChangeEvent: {
    location: Location;
    previousLocation: Location | undefined;
  }) => void,
): void {
  const location = useLocation();
  const previousLocation = usePrevious(location);

  const onLocationChangeDynamic = useEvent(onLocationChange);

  useEffect(() => {
    if (!previousLocation) {
      return;
    }

    if (location !== previousLocation) {
      onLocationChangeDynamic({
        location,
        previousLocation,
      });
    }
  }, [onLocationChangeDynamic, location, previousLocation]);
}
