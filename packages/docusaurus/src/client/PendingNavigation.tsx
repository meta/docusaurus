/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode} from 'react';
import {Route} from 'react-router-dom';
import ClientLifecyclesDispatcher, {
  dispatchLifecycleAction,
} from './ClientLifecyclesDispatcher';
import preload from './preload';
import type {Location} from 'history';

type Props = {
  readonly location: Location;
  readonly children: ReactNode;
};
type State = {
  renderedLocation: Location;
  previousLocation: Location | null;
};

class PendingNavigation extends React.Component<Props, State> {
  private routeUpdateCleanupCb: () => void = () => {};
  private isUnmounted = false;

  constructor(props: Props) {
    super(props);

    // Store renderedLocation in state so the old screen stays visible
    // while the new route is being preloaded.
    this.state = {
      renderedLocation: props.location,
      previousLocation: null,
    };
  }

  override componentDidMount(): void {
    this.routeUpdateCleanupCb = dispatchLifecycleAction('onRouteUpdate', {
      previousLocation: null,
      location: this.props.location,
    });
  }

  // Intercept location updates in commit phase and still show old route
  // until next route is done loading.
  override componentDidUpdate(prevProps: Props): void {
    if (this.props.location !== prevProps.location) {
      this.routeUpdateCleanupCb();

      // props.location being different means the router is trying to navigate
      // to a new route. We will preload the new route.
      const nextLocation = this.props.location;
      this.routeUpdateCleanupCb = dispatchLifecycleAction('onRouteUpdate', {
        previousLocation: prevProps.location,
        location: nextLocation,
      });

      // Load data while the old screen remains. Force preload instead of using
      // `window.docusaurus`, because we want to avoid loading screen even when
      // user is on saveData
      preload(nextLocation.pathname)
        .then(() => {
          if (this.isUnmounted) {
            return;
          }
          this.routeUpdateCleanupCb();
          this.setState({
            renderedLocation: nextLocation,
            previousLocation: prevProps.location,
          });
        })
        .catch((e: unknown) => {
          if (this.isUnmounted) {
            return;
          }
          console.warn(e);
          // If chunk loading failed, it could be because the path to a chunk
          // no longer exists due to a new deployment. Force refresh the page
          // instead of just not navigating.
          window.location.reload();
        });
    }
  }

  override componentWillUnmount(): void {
    this.isUnmounted = true;
    this.routeUpdateCleanupCb();
  }

  override render(): ReactNode {
    const {children} = this.props;
    const {renderedLocation, previousLocation} = this.state;

    // Use a controlled <Route> to trick all descendants into rendering the old
    // location.
    return (
      <ClientLifecyclesDispatcher
        previousLocation={previousLocation}
        location={renderedLocation}>
        <Route location={renderedLocation} render={() => children} />
      </ClientLifecyclesDispatcher>
    );
  }
}

export default PendingNavigation;
