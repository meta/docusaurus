/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/// <reference types="@docusaurus/module-type-aliases" />

declare module '@docusaurus/plugin-debug' {
  import type {LoadContext, Plugin} from '@docusaurus/types';

  export default function pluginDebug(context: LoadContext): Plugin<undefined>;
}

declare module '@theme/DebugConfig' {
  import type {ReactNode} from 'react';

  export default function DebugMetadata(): ReactNode;
}

declare module '@theme/DebugContent' {
  import type {ReactNode} from 'react';
  import type {AllContent} from '@docusaurus/types';

  export interface Props {
    readonly allContent: AllContent;
  }
  export default function DebugContent(props: Props): ReactNode;
}

declare module '@theme/DebugGlobalData' {
  import type {ReactNode} from 'react';

  export default function DebugGlobalData(): ReactNode;
}

declare module '@theme/DebugJsonView' {
  import type {ReactNode} from 'react';

  export interface Props {
    readonly src: unknown;
    readonly collapseDepth?: number;
  }
  export default function DebugJsonView(props: Props): ReactNode;
}

declare module '@theme/DebugLayout' {
  import type {ReactNode} from 'react';

  export default function DebugLayout(props: {children: ReactNode}): ReactNode;
}

declare module '@theme/DebugRegistry' {
  import type {ReactNode} from 'react';

  export default function DebugRegistry(): ReactNode;
}

declare module '@theme/DebugRoutes' {
  import type {ReactNode} from 'react';

  export default function DebugRoutes(): ReactNode;
}

declare module '@theme/DebugSiteMetadata' {
  import type {ReactNode} from 'react';

  export default function DebugSiteMetadata(): ReactNode;
}
