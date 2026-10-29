/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createContext, useContext} from 'react';
import type {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useRouteContext from '@docusaurus/useRouteContext';
import {ReactContextError} from './reactUtils';

type TitleFormatterParams = {
  /**
   * The page title to format
   * Usually provided with these APIs:
   * - <PageMetadata title={title}>
   * - useTitleFormatter().format(title)
   */
  title: string;

  /**
   * The siteConfig.title value
   */
  siteTitle: string;

  /**
   * The siteConfig.titleDelimiter value
   */
  titleDelimiter: string;

  /**
   * The plugin that created the page you are on
   */
  plugin: {
    id: string;
    name: string;
  };
};

/**
 * This is the full formatting function, including all useful params
 * Can be customized through React context with the provider
 */
export type TitleFormatterFn = (params: TitleFormatterParams) => string;

/**
 * The default formatter is provided in params for convenience
 */
export type TitleFormatterFnWithDefault = (
  params: TitleFormatterParams & {
    defaultFormatter: (params: TitleFormatterParams) => string;
  },
) => string;

export const TitleFormatterFnDefault: TitleFormatterFn = ({
  title,
  siteTitle,
  titleDelimiter,
}): string => {
  const trimmedTitle = title?.trim();
  if (!trimmedTitle || trimmedTitle === siteTitle) {
    return siteTitle;
  }
  return `${trimmedTitle} ${titleDelimiter} ${siteTitle}`;
};

/**
 * This is the simpler API exposed to theme/users
 */
type TitleFormatter = {format: (title: string) => string};

const TitleFormatterContext = createContext<TitleFormatterFnWithDefault | null>(
  null,
);

export function TitleFormatterProvider({
  formatter,
  children,
}: {
  children: ReactNode;
  formatter: TitleFormatterFnWithDefault;
}): ReactNode {
  return (
    <TitleFormatterContext value={formatter}>{children}</TitleFormatterContext>
  );
}

function useTitleFormatterContext() {
  const value = useContext(TitleFormatterContext);
  if (value === null) {
    throw new ReactContextError('TitleFormatterProvider');
  }
  return value;
}

/**
 * Returns a function to format the page title
 */
export function useTitleFormatter(): TitleFormatter {
  const formatter = useTitleFormatterContext();
  const {siteConfig} = useDocusaurusContext();
  const {title: siteTitle, titleDelimiter} = siteConfig;

  // Unfortunately we can only call this hook here, not in the provider
  // Route context can't be accessed in any provider applied above the router
  const {plugin} = useRouteContext();

  return {
    format: (title: string) =>
      formatter({
        title,
        siteTitle,
        titleDelimiter,
        plugin,
        defaultFormatter: TitleFormatterFnDefault,
      }),
  };
}
