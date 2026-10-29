#!/usr/bin/env bash

# Copyright (c) Facebook, Inc. and its affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

set -xeuo pipefail

rm -rf ../test-website

CUSTOM_REGISTRY_URL="http://localhost:4873"
NEW_VERSION="$(node -p "require('./packages/docusaurus/package.json').version")-NEW-$RANDOM"
CONTAINER_NAME="verdaccio"
EXTRA_OPTS=""

usage() { echo "Usage: $0 [-s] [-t]" 1>&2; exit 1; }

while getopts ":st" o; do
  case "${o}" in
    s)
      EXTRA_OPTS="${EXTRA_OPTS} --skip-install"
      ;;
    t)
      EXTRA_OPTS="${EXTRA_OPTS} --typescript"
      ;;
    *)
      usage
      ;;
  esac
done
shift $((OPTIND-1))


if [ -n "$EXTRA_OPTS" ]
then
  echo create-docusaurus extra options = ${EXTRA_OPTS}
fi

# Run Docker container with private npm registry Verdaccio
docker rm -f verdaccio
docker run -d --rm --name "$CONTAINER_NAME" -p 4873:4873 -v "$PWD/admin/verdaccio.yaml":/verdaccio/conf/config.yaml verdaccio/verdaccio:latest

# Build packages
pnpm build:packages

# Version the monorepo
# Private init templates are versioned too, create-docusaurus ships them
npx --no-install lerna version "$NEW_VERSION" \
  --exact \
  --force-publish \
  --yes \
  --no-git-tag-version \
  --no-push

# Publish the monorepo, private packages are skipped
pnpm --recursive publish --registry "$CUSTOM_REGISTRY_URL" --no-git-checks

# Revert version changes
git restore -- '**/package.json' lerna.json pnpm-lock.yaml


# The website is generated outside the repo to minimize chances of pnpm resolving the wrong version
cd ..

echo Generating test-website in `pwd`

# Build skeleton website with new version
pnpm_config_registry="$CUSTOM_REGISTRY_URL" \
  pnpm_config_minimum_release_age_exclude='["create-docusaurus","@docusaurus/*","stylelint-copyright"]' \
  pnpm --loglevel debug dlx create-docusaurus@"$NEW_VERSION" test-website classic --javascript $EXTRA_OPTS


# Stop Docker container
if [[ -z "${KEEP_CONTAINER:-true}" ]] && ( $(docker container inspect "$CONTAINER_NAME" > /dev/null 2>&1) ); then
  # Remove Docker container
  docker container stop $CONTAINER_NAME > /dev/null
fi

echo "The website with to-be published packages was successfully build to the $(tput setaf 2)test-website$(tput sgr 0) directory."
