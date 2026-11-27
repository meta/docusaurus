---
name: code-style
description: How to structure code so that humans can review it. Use whenever you write or modify code (packages, scripts, tests, website), before writing it.
---

# Code style

Humans review all the code of this repository: write code that is easy to read and understand, even if it requires introducing intermediate abstractions.

## Structure code as a tree

Readers should see the high-level picture first, and dive into the implementation details only if needed.

- Don't inline all the low-level calls sequentially in a single long function or script.
- Start with a short top-level function (`main()`, the exported function…) that reads like a summary of what the code does, delegating each step to a well-named function.
- Don't mix different levels of abstraction in the same function: a function either orchestrates high-level steps, or implements a low-level detail.
- Order the code top-down: high-level functions first, then the functions they call, then the low-level helpers.

```js
async function main() {
  const monorepo = await loadMonorepo();

  const errors = [
    ...checkCatalogsSplit(monorepo),
    ...checkTemplatesMatchCatalogs(monorepo),
  ];

  reportErrors(errors);
}
```

## Make the intent explicit

- Use well-named intermediate variables and functions to name what a piece of code computes, instead of long expressions or comments.
- Group related lines together with line breaks, and `{}` blocks when it helps.
- Prefer pure functions, that compute a result from their arguments, over functions with side effects. Keep side effects (I/O, logging, `process.exit()`…) at the edges, in the top-level functions.
- Keep data loading separate from the logic using it: load everything first, then pass the data to pure functions.

## Comments

- Unnecessary comments are harmful: spare them. Don't comment what is self-explanatory, explicit or covered by a unit test: when the names, the signature, the code or a test already say it (like an explicit option or attribute name), add no comment.
- Comment the code that is weird, unexpected or surprising (a workaround, a non-obvious constraint, an order that matters): that's where readers need one.
- Keep comments terse, one line when possible, phrased as concisely as possible. Point to the details instead of writing them out: link the issue, PR, documentation or upstream bug that explains them.
- Never explain a third-party feature (a tool setting, a library API…) in a comment: link its documentation instead, and only comment a usage of it that is non-obvious.
- Start the comment of a temporary workaround, like one for an upstream bug that will probably be fixed, with `TODO`, and link the issue tracking the fix.
- When you come across a `TODO` linking an issue, check whether the issue is fixed. If it is, suggest removing the workaround, upgrading the dependency if needed.
- Prefer linking the PR that adds the comment over older references: its description can hold all the context, and link to those older issues and PRs.
- When moving an existing comment, keep its wording: fix typos, don't rephrase it.
- Put each comment on the code it applies to, never floating between unrelated lines. To explain why an option keeps its default value, write that option with its default value, like `trailingSlash: undefined`, and comment it.

```ts
// The toggle event also fires when React syncs the open attribute
// See https://github.com/meta/docusaurus/pull/12277
```

## Readability over micro-optimizations

Unless the code is on a hot path where performance matters, favor readability over micro-optimizations and clever one-liners. Iterating over a list several times with well-named steps is fine when the list is small.

## Mark retro-compatibility code for removal

Code that only exists for retro-compatibility or to help users migrate must be cleaned up in the next major version. This includes deprecation warnings, `@deprecated` JSDoc tags, Joi `.forbidden()` schemas with a migration error message, `never` types for removed attributes, legacy code paths, escape hatches…

When adding such code, always add a `TODO Docusaurus v<NextVersion>` comment next to it, saying what to clean up. `<NextVersion>` is the major version of `lerna.json` plus one. It makes the code easy to find with a search when we start working on the next set of breaking changes.

```ts
// TODO Docusaurus v5: remove this migration error
```

While the major version of `lerna.json` has no stable release yet (`npm view @docusaurus/core version` is still on the previous major), breaking changes are allowed, but keep major version upgrades easy:

- Minimize the impact of each breaking change on users. If it stays disruptive, ask a maintainer to validate it.
- Don't add fallbacks, shims or legacy code paths that only keep the behavior of older versions working, even marked with a `TODO Docusaurus v<NextVersion>` comment, unless a maintainer asks for it.
- When possible, add an easy migration path that users discover progressively during the upgrade, like a clear validation error saying what to change, and mark it for removal as above.
