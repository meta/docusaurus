/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';

import DebugLayout from '@theme/DebugLayout';
import DebugJsonView from '@theme/DebugJsonView';
import type {Props} from '@theme/DebugContent';

function PluginInstanceContent({
  pluginId,
  pluginInstanceContent,
}: {
  pluginId: string;
  pluginInstanceContent: unknown;
}) {
  return (
    <section style={{marginBottom: 30}}>
      <code>{pluginId}</code>
      <DebugJsonView src={pluginInstanceContent} collapseDepth={2} />
    </section>
  );
}

function PluginContent({
  pluginName,
  pluginContent,
}: {
  pluginName: string;
  pluginContent: {[pluginId: string]: unknown};
}) {
  return (
    <section style={{marginBottom: 60}}>
      <h3>{pluginName}</h3>
      <div>
        {Object.entries(pluginContent)
          // Filter plugin instances with no content
          .filter(([, pluginInstanceContent]) => !!pluginInstanceContent)
          .map(([pluginId, pluginInstanceContent]) => (
            <PluginInstanceContent
              key={pluginId}
              pluginId={pluginId}
              pluginInstanceContent={pluginInstanceContent}
            />
          ))}
      </div>
    </section>
  );
}

export default function DebugContent({allContent}: Props): ReactNode {
  return (
    <DebugLayout>
      <h2>Plugin content</h2>
      <div>
        {Object.entries(allContent)
          // Filter plugins with no content
          .filter(([, pluginContent]) =>
            Object.values(pluginContent).some(
              (instanceContent) => !!instanceContent,
            ),
          )
          .map(([pluginName, pluginContent]) => (
            <PluginContent
              key={pluginName}
              pluginName={pluginName}
              pluginContent={pluginContent}
            />
          ))}
      </div>
    </DebugLayout>
  );
}
