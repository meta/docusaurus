/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useCallback, useEffect, useMemo, useSyncExternalStore} from 'react';
import {useHistory} from '@docusaurus/router';
import {useEvent} from './reactUtils';

import type {History, Location, Action} from 'history';

type HistoryBlockHandler = (location: Location, action: Action) => void | false;

/**
 * Permits to register a handler that will be called on history actions (pop,
 * push, replace). If the handler returns `false`, the navigation transition
 * will be blocked/cancelled.
 */
function useHistoryActionHandler(handler: HistoryBlockHandler): void {
  const history = useHistory();
  const stableHandler = useEvent(handler);
  useEffect(
    // See https://github.com/remix-run/history/blob/main/docs/blocking-transitions.md
    () => history.block((location, action) => stableHandler(location, action)),
    [history, stableHandler],
  );
}

/**
 * Permits to register a handler that will be called on history pop navigation
 * (backward/forward). If the handler returns `false`, the backward/forward
 * transition will be blocked. Unfortunately there's no good way to detect the
 * "direction" (backward/forward) of the POP event.
 */
export function useHistoryPopHandler(handler: HistoryBlockHandler): void {
  useHistoryActionHandler((location, action) => {
    if (action === 'POP') {
      // Maybe block navigation if handler returns false
      return handler(location, action);
    }
    // Don't block other navigation actions
    return undefined;
  });
}

/**
 * Permits to efficiently subscribe to a slice of the history
 * See https://thisweekinreact.com/articles/useSyncExternalStore-the-underrated-react-api
 * @param selector
 */
export function useHistorySelector<Value>(
  selector: (history: History<unknown>) => Value,
): Value {
  const history = useHistory();
  return useSyncExternalStore(
    history.listen,
    () => selector(history),
    () =>
      selector({
        ...history,
        location: {
          ...history.location,
          // On the server/hydration, these attributes should always be empty
          // Forcing empty state makes this hook safe from hydration errors
          search: '',
          hash: '',
          state: undefined,
        },
      }),
  );
}

/**
 * Permits to efficiently subscribe to a specific querystring value
 * @param key
 */
export function useQueryStringValue(key: string | null): string | null {
  return useHistorySelector((history) => {
    if (key === null) {
      return null;
    }
    return new URLSearchParams(history.location.search).get(key);
  });
}

function useQueryStringUpdater(
  key: string,
): (newValue: string | null, options?: {push: boolean}) => void {
  const history = useHistory();
  return useCallback(
    (newValue, options) => {
      const searchParams = new URLSearchParams(history.location.search);
      if (newValue) {
        searchParams.set(key, newValue);
      } else {
        searchParams.delete(key);
      }
      const updateHistory = options?.push ? history.push : history.replace;
      updateHistory({
        search: searchParams.toString(),
      });
    },
    [key, history],
  );
}

export function useQueryString(
  key: string,
): [string, (newValue: string | null, options?: {push: boolean}) => void] {
  const value = useQueryStringValue(key) ?? '';
  const update = useQueryStringUpdater(key);
  return [value, update];
}

function useQueryStringListValues(key: string): string[] {
  // Unfortunately we can't just use searchParams.getAll(key) in the selector
  // It would create a new array every time and lead to an infinite loop...
  // The selector has to return a primitive/string value to avoid that...
  const arrayJsonString = useHistorySelector((history) => {
    const values = new URLSearchParams(history.location.search).getAll(key);
    return JSON.stringify(values);
  });
  return useMemo(() => JSON.parse(arrayJsonString), [arrayJsonString]);
}

type ListUpdate = string[] | ((oldValues: string[]) => string[]);
type ListUpdateFunction = (
  update: ListUpdate,
  options?: {push: boolean},
) => void;

function useQueryStringListUpdater(key: string): ListUpdateFunction {
  const history = useHistory();
  const setValues: ListUpdateFunction = useCallback(
    (update, options) => {
      const searchParams = new URLSearchParams(history.location.search);
      const newValues = Array.isArray(update)
        ? update
        : update(searchParams.getAll(key));
      searchParams.delete(key);
      newValues.forEach((v) => searchParams.append(key, v));

      const updateHistory = options?.push ? history.push : history.replace;
      updateHistory({
        search: searchParams.toString(),
      });
    },
    [history, key],
  );
  return setValues;
}

export function useQueryStringList(
  key: string,
): [string[], ListUpdateFunction] {
  const values = useQueryStringListValues(key);
  const setValues = useQueryStringListUpdater(key);
  return [values, setValues];
}

export function useClearQueryString(): () => void {
  const history = useHistory();
  return useCallback(() => {
    history.replace({
      search: undefined,
    });
  }, [history]);
}

export function mergeSearchParams(
  params: URLSearchParams[],
  strategy: 'append' | 'set',
): URLSearchParams {
  const result = new URLSearchParams();
  for (const item of params) {
    for (const [key, value] of item.entries()) {
      if (strategy === 'append') {
        result.append(key, value);
      } else {
        result.set(key, value);
      }
    }
  }
  return result;
}

export function mergeSearchStrings(
  searchStrings: (string | undefined)[],
  strategy: 'append' | 'set',
): string {
  const params = mergeSearchParams(
    searchStrings.map((s) => new URLSearchParams(s ?? '')),
    strategy,
  );
  const str = params.toString();
  return str ? `?${str}` : str;
}
