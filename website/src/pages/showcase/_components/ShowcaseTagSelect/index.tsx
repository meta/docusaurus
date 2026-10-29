/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  useCallback,
  type ComponentProps,
  type ReactNode,
  type ReactElement,
  useId,
} from 'react';
import type {TagType} from '@site/src/data/users';
import {useTags} from '../../_utils';

import styles from './styles.module.css';

function useTagState(tag: string) {
  const [tags, setTags] = useTags();
  const isSelected = tags.includes(tag);
  const toggle = useCallback(() => {
    setTags((list) => {
      return list.includes(tag)
        ? list.filter((t) => t !== tag)
        : [...list, tag];
    });
  }, [tag, setTags]);

  return [isSelected, toggle] as const;
}

interface Props extends ComponentProps<'input'> {
  tag: TagType;
  label: string;
  description: string;
  icon: ReactElement<ComponentProps<'svg'>>;
}

export default function ShowcaseTagSelect({
  icon,
  label,
  description,
  tag,
  ...rest
}: Props): ReactNode {
  const id = useId();
  const [isSelected, toggle] = useTagState(tag);
  return (
    <>
      <input
        type="checkbox"
        id={id}
        checked={isSelected}
        onChange={toggle}
        className="screen-reader-only"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            toggle();
          }
        }}
        {...rest}
      />
      <label htmlFor={id} className={styles.checkboxLabel} title={description}>
        {label}
        {icon}
      </label>
    </>
  );
}
