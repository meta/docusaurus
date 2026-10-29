# `create-docusaurus`

Create Docusaurus apps easily with simplified commands:

```bash
npm init docusaurus
```

```bash
yarn create docusaurus
```

```bash
npx create-docusaurus@latest
```

## Usage

Please see the [installation documentation](https://docusaurus.io/docs/installation).

## For maintainers

For Docusaurus maintainers, templates can be tested with:

```bash
cd `git rev-parse --show-toplevel` # Back to repo root
rm -rf test-website
yarn create-docusaurus test-website classic --javascript
cd test-website
yarn start
```

Note: `test-website` is not part of the workspace and use packages from npm.

Use the following to test the templates against local packages:

```bash
cd `git rev-parse --show-toplevel` # Back to repo root
rm -rf test-website-in-workspace
yarn create-docusaurus test-website-in-workspace classic --javascript
cd test-website-in-workspace
yarn build
yarn start
```

For the TypeScript template:

```bash
cd `git rev-parse --show-toplevel` # Back to repo root
rm -rf test-website-in-workspace
yarn create-docusaurus test-website-in-workspace classic --typescript
cd test-website-in-workspace
yarn typecheck
yarn build
yarn start
```

### End-to-end tests

To run end-to-end tests similar to our CI workflows, publishing monorepo packages to a local Verdaccio repository inside Docker.

**Important**: this modifies `package.json` files before publish, so make sure to commit your work first!

```bash
cd `git rev-parse --show-toplevel` # Back to repo root
pnpm install

docker rm -f verdaccio
pnpm test:build:website -st

cd ../test-website # website is generated outside of the monorepo

pnpm_config_registry=http://localhost:4873 pnpm install

pnpm run typecheck
pnpm start --no-open
pnpm run build --locale en --locale fr
```
