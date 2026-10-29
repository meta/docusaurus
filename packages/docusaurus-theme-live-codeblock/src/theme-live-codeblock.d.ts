/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/// <reference types="@docusaurus/theme-classic" />
/// <reference types="@docusaurus/module-type-aliases" />

declare module '@docusaurus/theme-live-codeblock' {
  import type {PlaygroundPosition} from '@theme/Playground';

  export type ThemeConfig = {
    liveCodeBlock: {
      playgroundPosition: PlaygroundPosition;
    };
  };
}

declare module '@theme/LiveCodeBlock' {
  import type {ReactNode} from 'react';
  import type {Props as BaseProps} from '@theme/CodeBlock';

  type CodeBlockProps = Omit<BaseProps, 'children'>;

  export interface Props extends CodeBlockProps {
    children?: string;
  }

  export default function LiveCodeBlock(props: Props): ReactNode;
}

declare module '@theme/Playground' {
  import type {ReactNode} from 'react';
  import type {Props as BaseProps} from '@theme/CodeBlock';
  import type {LiveProvider} from 'react-live';

  type CodeBlockProps = Omit<
    BaseProps,
    'children' | 'className' | 'language' | 'title'
  >;
  type LiveProviderProps = React.ComponentProps<typeof LiveProvider>;

  export type PlaygroundPosition = 'top' | 'bottom';

  export interface Props extends CodeBlockProps, LiveProviderProps {
    // Allow empty live playgrounds
    children?: string;
    position?: PlaygroundPosition;
  }

  export default function Playground(props: Props): ReactNode;
}

declare module '@theme/Playground/Provider' {
  import type {ReactNode} from 'react';
  import type {Props as PlaygroundProps} from '@theme/Playground';

  export interface Props extends Omit<PlaygroundProps, 'children'> {
    code: string | undefined;
    children: ReactNode;
  }

  export interface ResetContextValue {
    resetKey: number;
    reset: () => void;
  }

  export const PlaygroundResetContext: React.Context<ResetContextValue | null>;
  export function usePlaygroundReset(): ResetContextValue;
  export default function PlaygroundProvider(props: Props): ReactNode;
}

declare module '@theme/Playground/Container' {
  import type {ReactNode} from 'react';

  export interface Props {
    children: ReactNode;
  }

  export default function PlaygroundContainer(props: Props): ReactNode;
}

declare module '@theme/Playground/Layout' {
  import type {ReactNode} from 'react';
  import type {PlaygroundPosition} from '@theme/Playground';

  export interface Props {
    position?: PlaygroundPosition;
  }

  export default function PlaygroundLayout(props: Props): ReactNode;
}

declare module '@theme/Playground/Preview' {
  import type {ReactNode} from 'react';

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Props {}

  export default function PlaygroundPreview(props: Props): ReactNode;
}

declare module '@theme/Playground/Editor' {
  import type {ReactNode} from 'react';

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Props {}

  export default function PlaygroundEditor(props: Props): ReactNode;
}

declare module '@theme/Playground/Header' {
  import type {ReactNode} from 'react';

  export interface Props {
    children: ReactNode;
    buttons?: ReactNode;
  }

  export default function PlaygroundHeader(props: Props): ReactNode;
}

declare module '@theme/Playground/Buttons/ResetButton' {
  import type {ReactNode} from 'react';

  export interface Props {
    className?: string;
  }

  export default function ResetButton(props: Props): ReactNode;
}

declare module '@theme/ReactLiveScope' {
  type Scope = {
    [key: string]: unknown;
  };

  const ReactLiveScope: Scope;
  export default ReactLiveScope;
}
