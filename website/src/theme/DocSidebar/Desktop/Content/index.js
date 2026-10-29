/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useLocation} from '@docusaurus/router';
import Content from '@theme-original/DocSidebar/Desktop/Content';

function SidebarAd() {
  return (
    // eslint-disable-next-line @docusaurus/no-untranslated-text
    <div style={{border: 'solid thin red', padding: 10, textAlign: 'center'}}>
      Sidebar Ad
    </div>
  );
}

export default function ContentWrapper(props) {
  const {pathname} = useLocation();
  const shouldShowSidebarAd = pathname.includes('/tests/');
  return (
    <>
      {shouldShowSidebarAd && <SidebarAd />}
      <Content {...props} />
      {shouldShowSidebarAd && <SidebarAd />}
    </>
  );
}
