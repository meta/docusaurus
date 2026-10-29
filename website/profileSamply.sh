#!/usr/bin/env bash

# Copyright (c) Facebook, Inc. and its affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

echo "This Samply profiling script doesn't work when it's run with Yarn, but you can run it manually instead"

samply record -- DOCUSAURUS_EXIT_AFTER_BUNDLING=true node --perf-prof --perf-basic-prof --interpreted-frames-native-stack ./node_modules/.bin/docusaurus build --locale en
