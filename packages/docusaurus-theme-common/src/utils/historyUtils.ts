/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useCallback, useMemo} from 'react';
import {useLocation, useNavigate, type Location} from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';

/**
 * Permits to subscribe to a slice of the history location
 * @param selector
 */
export function useHistorySelector<Value>(
  selector: (history: {location: Location}) => Value,
): Value {
  const location = useLocation();
  const isBrowser = useIsBrowser();
  return selector({
    location: isBrowser
      ? location
      : {
          ...location,
          // On the server/hydration, these attributes should always be empty
          // Forcing empty state makes this hook safe from hydration errors
          search: '',
          hash: '',
          state: undefined,
        },
  });
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
  const {search} = useLocation();
  const navigate = useNavigate();
  return useCallback(
    (newValue, options) => {
      const searchParams = new URLSearchParams(search);
      if (newValue) {
        searchParams.set(key, newValue);
      } else {
        searchParams.delete(key);
      }
      navigate({search: searchParams.toString()}, {replace: !options?.push});
    },
    [key, search, navigate],
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
  const {search} = useLocation();
  const navigate = useNavigate();
  const setValues: ListUpdateFunction = useCallback(
    (update, options) => {
      const searchParams = new URLSearchParams(search);
      const newValues = Array.isArray(update)
        ? update
        : update(searchParams.getAll(key));
      searchParams.delete(key);
      newValues.forEach((v) => searchParams.append(key, v));

      navigate({search: searchParams.toString()}, {replace: !options?.push});
    },
    [key, search, navigate],
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
  const navigate = useNavigate();
  return useCallback(() => {
    navigate({search: ''}, {replace: true});
  }, [navigate]);
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
