---
name: dependencies
description: Add, remove or upgrade npm dependencies in the Docusaurus monorepo. Use before editing any `package.json` dependency field, running `pnpm add`/`pnpm remove`/`pnpm update`, or changing `pnpm-lock.yaml`.
---

# Dependencies

## Lockfile

- Run `pnpm dedupe` after any lockfile change. CI fails if `pnpm-lock.yaml` is not deduplicated (`pnpm lint:deps`).
- Site template dependencies live in `packages/create-docusaurus/templates/`. Never edit `examples/`, it is CLI-generated.

## Catalogs

All the monorepo dependencies are declared in the [pnpm catalogs](https://pnpm.io/catalogs) of `pnpm-workspace.yaml`. Packages reference them with the catalog protocol instead of a version range:

- `"catalog:"`: the default catalog, for dependencies used at runtime by at least one package (`dependencies`, `optionalDependencies` or `peerDependencies`).
- `"catalog:dev"`: the dev catalog, for dependencies only used as `devDependencies`.

Use pnpm commands to add and remove dependencies:

- `pnpm add` only accepts catalog versions (`catalogMode: strict`), and adds new dependencies to the default catalog. Move dev-only dependencies to the dev catalog.
- `pnpm remove` removes the catalog entries that are no longer used (`catalogPrune: true`). Manual `package.json` edits don't.

Move a dev catalog entry to the default catalog as soon as a package uses it at runtime.

Exceptions, keeping explicit versions:

- The site templates, copied to user sites. Their versions must match the catalogs.
- pnpm `overrides`. Their versions must match the catalogs.
- Peer dependencies whose range intentionally differs from the catalog (see the ignored version groups of `.syncpackrc.ts`).

Two checks enforce it:

- `pnpm lint:syncpack`: dependencies must use a catalog.
- `pnpm lint:catalogs` (`admin/scripts/lintCatalogs.js`): catalog entries are used and in the right catalog, templates and overrides match the catalogs, and dependency group members use the same version.

## Dependency groups

Some packages must always use the same version. They are declared as `groups` in `.github/dependabot.yml`:

- Dependabot upgrades them atomically in a single PR, instead of opening broken intermediate PRs.
- `pnpm lint:catalogs` fails if their catalog versions differ.

Packages belong to a group when, for example:

- One package pins an exact version of the other (`@svgr/webpack` pins `@svgr/core` and `@svgr/plugin-*`).
- One package has a peer dependency on the exact same version of the other (`@types/react-dom` and `@types/react`).
- The packages check at runtime that their versions match (`react` and `react-dom`).
- Mixing versions duplicates a singleton package (`react-router` and `react-router-dom`).
- The packages are released in lockstep and mixing versions breaks typechecking (`typescript-eslint`).

When you add a dependency, check whether it belongs to a group:

- If an existing group already matches it (`@svgr/*` matches `@svgr/plugin-jsx`), there is nothing to do.
- Otherwise, add it to the matching group, or create a new group. Follow the existing groups: one group per package family, with a comment explaining why the packages must stay in sync.

Do the same when a Dependabot PR can't pass CI on its own because a related package wasn't upgraded with it.
