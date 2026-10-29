/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  isValidElement,
  useCallback,
  useLayoutEffect,
  useState,
  useMemo,
  createContext,
  type ReactNode,
  type ReactElement,
} from 'react';
import {useHistory} from '@docusaurus/router';
import {useQueryStringValue} from '@docusaurus/theme-common/internal';
import {duplicates, useStorageSlot} from '../index';

/**
 * TabValue is the "config" of a given Tab
 * Provided through <Tabs> "values" prop or through the children <TabItem> props
 */
export interface TabValue {
  readonly value: string;
  readonly label?: string;
  readonly attributes?: {[key: string]: unknown};
  readonly default?: boolean;
}

export interface TabsProps {
  readonly lazy?: boolean;
  readonly children: ReactNode;
  readonly defaultValue?: string | null;
  readonly values?: readonly TabValue[];
  readonly groupId?: string;
  readonly className?: string;
  readonly queryString?: string | boolean;
}

export interface TabItemProps {
  readonly children: ReactNode;
  readonly value: string;
  readonly default?: boolean;
  readonly label?: string;
  readonly className?: string;
  readonly attributes?: {[key: string]: unknown};
}

export function sanitizeTabsChildren(children: ReactNode): ReactNode {
  return React.Children.toArray(children).filter((child) => child !== '\n');
}

function extractChildrenTabValues(children: ReactNode): TabValue[] {
  // ✅ <TabItem value="red"/> => true
  // ✅ <CustomTabItem value="red"/> => true
  // ❌ <RedTabItem value="tab-value"/> => requires <Tabs values> prop
  function isTabItemWithValueProp(
    comp: ReactElement,
  ): comp is ReactElement<TabItemProps> {
    const {props} = comp;
    return !!props && typeof props === 'object' && 'value' in props;
  }

  const elements = React.Children.toArray(children).flatMap((child) => {
    // Historical case, not sure when it happens, do we really need this?
    if (!child) {
      return [];
    }
    if (isValidElement(child) && isTabItemWithValueProp(child)) {
      return [child];
    }
    // child.type.name will give non-sensical values in prod because of
    // minification, but we assume it won't throw in prod.
    const badChildTypeName =
      // @ts-expect-error: guarding against unexpected cases
      typeof child.type === 'string' ? child.type : child.type.name;
    throw new Error(
      `Docusaurus error: Bad <Tabs> child <${badChildTypeName}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.
If you do not want to pass on a "value" prop to the direct children of <Tabs>, you can also pass an explicit <Tabs values={...}> prop.`,
    );
  });

  return elements.map(
    ({props: {value, label, attributes, default: isDefault}}) => ({
      value,
      label,
      attributes,
      default: isDefault,
    }),
  );
}

function ensureNoDuplicateValue(values: readonly TabValue[]) {
  const dup = duplicates(values, (a, b) => a.value === b.value);
  if (dup.length > 0) {
    throw new Error(
      `Docusaurus error: Duplicate values "${dup
        .map((a) => `'${a.value}'`)
        .join(', ')}" found in <Tabs>. Every value needs to be unique.`,
    );
  }
}

function useTabValues(
  props: Pick<TabsProps, 'values' | 'children'>,
): readonly TabValue[] {
  const {values: valuesProp, children} = props;
  return useMemo(() => {
    const values = valuesProp ?? extractChildrenTabValues(children);
    ensureNoDuplicateValue(values);
    return values;
  }, [valuesProp, children]);
}

function isValidValue({
  value,
  tabValues,
}: {
  value: string | null | undefined;
  tabValues: readonly TabValue[];
}) {
  return tabValues.some((a) => a.value === value);
}

function getInitialStateValue({
  defaultValue,
  tabValues,
}: {
  defaultValue: TabsProps['defaultValue'];
  tabValues: readonly TabValue[];
}): string {
  if (tabValues.length === 0) {
    throw new Error(
      'Docusaurus error: the <Tabs> component requires at least one <TabItem> children component',
    );
  }
  if (defaultValue) {
    // Warn user about passing incorrect defaultValue as prop.
    if (!isValidValue({value: defaultValue, tabValues})) {
      throw new Error(
        `Docusaurus error: The <Tabs> has a defaultValue "${defaultValue}" but none of its children has the corresponding value. Available values are: ${tabValues
          .map((a) => a.value)
          .join(
            ', ',
          )}. If you intend to show no default tab, use defaultValue={null} instead.`,
      );
    }
    return defaultValue;
  }
  const defaultTabValue =
    tabValues.find((tabValue) => tabValue.default) ?? tabValues[0];
  if (!defaultTabValue) {
    throw new Error('Unexpected error: 0 tabValues');
  }
  return defaultTabValue.value;
}

function getStorageKey(groupId: string | undefined) {
  if (!groupId) {
    return null;
  }
  return `docusaurus.tab.${groupId}`;
}

function getQueryStringKey({
  queryString = false,
  groupId,
}: Pick<TabsProps, 'queryString' | 'groupId'>) {
  if (typeof queryString === 'string') {
    return queryString;
  }
  if (queryString === false) {
    return null;
  }
  if (queryString === true && !groupId) {
    throw new Error(
      `Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".`,
    );
  }
  return groupId ?? null;
}

function useTabQueryString({
  queryString = false,
  groupId,
}: Pick<TabsProps, 'queryString' | 'groupId'>) {
  const history = useHistory();
  const key = getQueryStringKey({queryString, groupId});
  const value = useQueryStringValue(key);

  const setValue = useCallback(
    (newValue: string) => {
      if (!key) {
        return; // no-op
      }
      const searchParams = new URLSearchParams(history.location.search);
      searchParams.set(key, newValue);
      history.replace({...history.location, search: searchParams.toString()});
    },
    [key, history],
  );

  return [value, setValue] as const;
}

function useTabStorage({groupId}: Pick<TabsProps, 'groupId'>) {
  const key = getStorageKey(groupId);
  const [value, storageSlot] = useStorageSlot(key);

  const setValue = useCallback(
    (newValue: string) => {
      if (!key) {
        return; // no-op
      }
      storageSlot.set(newValue);
    },
    [key, storageSlot],
  );

  return [value, setValue] as const;
}

type TabsContextValue = {
  selectedValue: string;
  selectValue: (value: string) => void;
  tabValues: readonly TabValue[];
  lazy: boolean;
};

export function useTabsContextValue(props: TabsProps): TabsContextValue {
  const {defaultValue, queryString = false, groupId} = props;
  const tabValues = useTabValues(props);

  const [selectedValue, setSelectedValue] = useState(() =>
    getInitialStateValue({defaultValue, tabValues}),
  );

  const [queryStringValue, setQueryString] = useTabQueryString({
    queryString,
    groupId,
  });

  const [storageValue, setStorageValue] = useTabStorage({
    groupId,
  });

  // We sync valid querystring/storage value to state on change + hydration
  const valueToSync = (() => {
    const value = queryStringValue ?? storageValue;
    if (!isValidValue({value, tabValues})) {
      return null;
    }
    return value;
  })();
  // Sync in a layout/sync effect is important, for useScrollPositionBlocker
  // See https://github.com/facebook/docusaurus/issues/8625
  useLayoutEffect(() => {
    if (valueToSync) {
      setSelectedValue(valueToSync);
    }
  }, [valueToSync]);

  const selectValue = useCallback(
    (newValue: string) => {
      if (!isValidValue({value: newValue, tabValues})) {
        throw new Error(`Can't select invalid tab value=${newValue}`);
      }
      setSelectedValue(newValue);
      setQueryString(newValue);
      setStorageValue(newValue);
    },
    [setQueryString, setStorageValue, tabValues],
  );

  return {
    selectedValue,
    selectValue,
    tabValues,
    lazy: props.lazy ?? false,
  };
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabs(): TabsContextValue {
  const contextValue = React.useContext(TabsContext);
  if (!contextValue) {
    throw new Error('useTabsContext() must be used within a Tabs component');
  }
  return contextValue;
}

export function TabsProvider(props: {
  children: ReactNode;
  value: TabsContextValue;
}): ReactNode {
  return <TabsContext value={props.value}>{props.children}</TabsContext>;
}
