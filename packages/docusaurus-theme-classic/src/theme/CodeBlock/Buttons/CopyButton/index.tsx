/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useCallback, useState, useRef, useEffect, type ReactNode} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import {useCodeBlockContext} from '@docusaurus/theme-common/internal';
import Button from '@theme/CodeBlock/Buttons/Button';
import type {Props} from '@theme/CodeBlock/Buttons/CopyButton';
import IconCopy from '@theme/Icon/Copy';
import IconSuccess from '@theme/Icon/Success';

import styles from './styles.module.css';

function title() {
  return translate({
    id: 'theme.CodeBlock.copy',
    message: 'Copy',
    description: 'The copy button label on code blocks',
  });
}

function ariaLabel(isCopied: boolean) {
  return isCopied
    ? translate({
        id: 'theme.CodeBlock.copied',
        message: 'Copied',
        description: 'The copied button label on code blocks',
      })
    : translate({
        id: 'theme.CodeBlock.copyButtonAriaLabel',
        message: 'Copy code to clipboard',
        description: 'The ARIA label for copy code blocks button',
      });
}

async function copyToClipboard(text: string) {
  // The clipboard API is only defined in secure contexts (HTTPS / localhost).
  // See https://developer.mozilla.org/en-US/docs/Web/API/Clipboard
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Fall back to copy-text-to-clipboard for non-secure contexts (e.g. HTTP
  // on a local network). The fallback is lazily loaded to avoid bundle
  // overhead for the common HTTPS case.
  const {default: copy} = await import('copy-text-to-clipboard');
  return copy(text);
}

function useCopyButton() {
  const {
    metadata: {code},
  } = useCodeBlockContext();
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeout = useRef<number | undefined>(undefined);

  const copyCode = useCallback(() => {
    copyToClipboard(code).then(() => {
      setIsCopied(true);
      copyTimeout.current = window.setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    });
    // Errors are intentionally not caught so they remain unhandled and can
    // be captured by observability tools (e.g. Sentry, PostHog).
  }, [code]);

  useEffect(() => () => window.clearTimeout(copyTimeout.current), []);

  return {copyCode, isCopied};
}

export default function CopyButton({className}: Props): ReactNode {
  const {copyCode, isCopied} = useCopyButton();

  return (
    <Button
      aria-label={ariaLabel(isCopied)}
      title={title()}
      className={clsx(
        className,
        styles.copyButton,
        isCopied && styles.copyButtonCopied,
      )}
      onClick={copyCode}>
      <span className={styles.copyButtonIcons} aria-hidden="true">
        <IconCopy className={styles.copyButtonIcon} />
        <IconSuccess className={styles.copyButtonSuccessIcon} />
      </span>
    </Button>
  );
}
