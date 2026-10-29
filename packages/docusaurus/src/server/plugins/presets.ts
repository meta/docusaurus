/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createRequire} from 'node:module';
import {loadFreshModule} from '@docusaurus/utils';
import {resolveModuleName} from './moduleShorthand';
import type {
  LoadContext,
  PresetConfigDefined,
  PresetModule,
  Preset,
  DocusaurusConfig,
} from '@docusaurus/types';

type ImportedPresetModule = PresetModule & {default?: PresetModule};

/**
 * Calls preset functions, aggregates each of their return values, and returns
 * the plugin and theme configs.
 */
export async function loadPresets(
  context: LoadContext,
): Promise<Pick<DocusaurusConfig, 'plugins' | 'themes'>> {
  // We need to resolve plugins from the perspective of the site config, as if
  // we are using `require.resolve` on those module names.
  const presetRequire = createRequire(context.siteConfigPath);

  const presets = context.siteConfig.presets.filter(
    (p): p is PresetConfigDefined => !!p,
  );

  async function loadPreset(presetItem: PresetConfigDefined): Promise<Preset> {
    let presetModuleImport: string;
    let presetOptions = {};
    if (typeof presetItem === 'string') {
      presetModuleImport = presetItem;
    } else {
      [presetModuleImport, presetOptions] = presetItem;
    }
    const presetName = resolveModuleName(
      presetModuleImport,
      presetRequire,
      'preset',
    );

    const presetPath = presetRequire.resolve(presetName);
    const presetModule = (await loadFreshModule(
      presetPath,
    )) as ImportedPresetModule;

    const presetFunction = presetModule.default ?? presetModule;

    return presetFunction(context, presetOptions);
  }

  const loadedPresets = await Promise.all(presets.map(loadPreset));

  const plugins = loadedPresets.flatMap((preset) => preset.plugins ?? []);
  const themes = loadedPresets.flatMap((preset) => preset.themes ?? []);

  return {plugins, themes};
}
