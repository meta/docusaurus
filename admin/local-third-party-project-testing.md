Sometimes you want to test the latest version of Docusaurus on a third-party project via `npm` or `yarn` without having to publish it to npm itself. For example, you may want to use the latest code in `main`.

> If you want to use Docusaurus to test Docusaurus, see the [testing changes on Docusaurus itself doc](./testing-changes-on-Docusaurus-itself.md)

There are two reasonable ways to use a local version of the Docusaurus npm package to test changes you make to the Docusaurus core on a third-party project.

## Install from a local Docusaurus repo

### Install in an existing project

Let's say you have an existing project with this snippet inside package.json:

```json
{
  "dependencies": {
    "@docusaurus/core": "^2.0.0-beta.8",
    "@docusaurus/preset-classic": "^2.0.0-beta.8"
  }
}
```

Now, you have made changes to @docusaurus/core (this lives in packages/docusaurus) and would like to test the changes. In the local docusaurus repo, run `pnpm install`. This will also build the local docusaurus packages and install them within the repo itself:

```sh
cd /path/to/local/docusaurus
# can use pnpm build:packages if dependencies have not been modified
pnpm install
```

In the existing project, add the local package:

```sh
cd /path/to/existing/project
# this can be an absolute or relative path
yarn add @docusaurus/core@../../local/docusaurus/packages/docusaurus
```

Check package.json again and you will find this:

```json
{
  "dependencies": {
    "@docusaurus/core": "../../local/docusaurus/packages/docusaurus",
    "@docusaurus/preset-classic": "^2.0.0-beta.8"
  }
}
```

If you make further changes to the local docusaurus repo, run `yarn install` inside the existing project so that the changes will be applied.

Note that:

- The format is `scoped-package-name@local/path/to/specific/package/directory`.
- The last component of the supplied path cannot be a symbolic link, it has to be the package directory itself.
- If you supplied the wrong directory name, `yarn add` may not complain, but `yarn build` and `yarn start` will fail. To avoid this, check `package.json` inside the package directory to make sure you have the correct path.
- These commands don't work:
  ```
  yarn add @docusaurus/core@../../local/docusaurus/node_modules/@docusaurus/core
  yarn add file:../../local/docusaurus/packages/docusaurus
  yarn add link:../../local/docusaurus/packages/docusaurus
  yarn add ../../local/docusaurus/node_modules/@docusaurus/core
  yarn add ../../local/docusaurus/packages/docusaurus
  ```
- You cannot use `npm install` instead of `yarn add` for this purpose.
- `yarn link` is very likely to fail with react, unless you also manually link react. See https://github.com/facebook/react/issues/14257.

## Use Verdaccio

Verdaccio is a good local npm server that you can use to test your packages.

We have a script `test:build:website` that starts a docker with verdaccio, publishes the packages, and initializes a new website in the parent directory. Alternatively, to install a package in the existing project, after you have started the verdaccio service, run

```bash
pnpm_config_registry="http://localhost:4873" pnpm install @docusaurus/core@"2.0.0-beta.8.NEW" # The version should be the latest
```

You can refer to [the implementation](./scripts/test-release.sh) for more details.

If you don't have docker, you can still invoke the CLI manually to start the service.

```bash
npx verdaccio --listen 4873 --config admin/verdaccio.yaml
```
