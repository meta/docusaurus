# Publishing Instructions

These instructions have been updated on April 2026, after the [adoption of npm Trusted Publishing](https://docusaurus.io/blog/releases/3.10#trusted-publishing) in v3.10 ([PR](https://github.com/facebook/docusaurus/pull/11819)).

This guide is designed to be a very concise overview. Read the [publish-legacy.md](./publish-legacy.md) guide for more details, many steps remain the same, and it provides more details.

---

## General

For simplicity, usually don't maintain multiple major-version release lines in parallel:

- new features and breaking changes are always merged on main
- we only merge breaking changes once we are ready to release the next major version

However, we might occasionally have to backport critical bug and security fixes to a branch that could be cut on-demand. For major versions we usually create a `docusaurus-vX` branch once we have started merging breaking changes for the upcoming major version.

---

## Publish a minor/major release

We'll consider that the latest version is `3.10.0`, and we are now releasing `3.11.0`.

Using npm Trusted Publishing, our releases are published from the `.deploy.yml` GitHub action directly from the `main` branch. Make sure that branch works well and pass all of our CI tests.

However, we need a release branch to cut the new docs version, publish a release blog post and update our changelog.

1. Create a release branch: `git co -b slorber/release-3.11.0`

2. Make sure all the recent PRs have a `pr: ` GitHub label. This [link](https://github.com/facebook/docusaurus/pulls?q=is%3Apr+is%3Amerged+sort%3Aupdated-desc+-label%3A%22pr%3A+breaking+change%22%2C%22pr%3A+new+feature%22%2C%22pr%3A+bug+fix%22%2C%22pr%3A+performance%22%2C%22pr%3A+polish%22%2C%22pr%3A+documentation%22%2C%22pr%3A+maintenance%22%2C%22pr%3A+internal%22%2C%22pr%3A+dependencies%22%2C%22pr%3A+showcase%22%2C%22pr%3A+ignore%22%2C%22pr%3A+translations%22+) helps you find untagged PRs.

3. Run `pnpm changelog --from v3.10.0` to generate a changelog from the tagged PRs since a given release/tag.

4. Copy that at the top of the `CHANGELOG.md` file with title `## 3.11.0 (date)`.

5. Write a release blog post, inspired by former release posts.

6. Create the docs version: `pnpm --filter website docusaurus docs:version 3.11.0`

7. Make sure there's no Crowdin translation problem. Run this:

```bash
pnpm --filter website write-translations
pnpm crowdin:upload:website
pnpm crowdin:download:website
pnpm build:website
```

8. Create a PR ([example](https://github.com/facebook/docusaurus/pull/11825)). Make sure all CI checks pass. If useful, create it earlier to get a deploy preview to review.

9. Upgrade the `package.json` versions: `pnpm lerna version 3.11.0 --exact --no-push --yes` (mostly useful for canary releases versions).

10. Go to the [Publish workflow](https://github.com/facebook/docusaurus/actions/workflows/publish.yml) and click the "Run workflow" button. Fill in the form with:

- From branch: `main`
- NPM version: `3.10.0`
- NPM Dist tag: `latest`

10. Once the workflow finishes and code is on npm, you can merge the release PR.

11. Follow the "After any release" section.

---

## Release a patch

### Simple patch

If you haven't merged any feature or breaking change on `main`, you can just follow the regular process above

### Maintenance patch

If you already merged features or breaking changes on `main`, you can't release a patch from `main` anymore and need to create a dedicated branch. We usually have protected `docusaurus-v<number>` maintenance branches for that reason (v3 is an exception, named `docusaurus-v3-maintenance` because `docusaurus-v3` was a mistake and I can't reset it).

#### Feature merged on `main`

If you want to release a fix for v3 while a feature has already been merged on `main`, you have 2 choices:

- The fix waits for the next minor version
- The fix is critical/urgent: you can update the `docusaurus-v<number>` branch, merge or backport the fix on this branch, and release from there

#### Breaking change merged on `main`

If a breaking change has already been merged on `main`, this means `main` is for the upcoming major version. If a patch is critical/urgent, you'll also want fix and/or backport it to the appropriate `docusaurus-v<number>` branch.

#### How to backport a commit from `main`

Cut a branch from `docusaurus-v<number>` and cherry pick commits to it, then open a PR and merge it.

```bash
git co docusaurus-v3-maintenance
git pull
git co -b slorber/v3.10.1-backports
git cherry-pick <commit1>
git cherry-pick <commit2>
git cherry-pick <commit3>
git push
```

#### Full example

If you want to release `3.10.1` while `main` is already for `4.0.0`

0. Make sure `docusaurus-v3-maintenance` is up to date. If not, upgrade it from the latest v3 release. The branch is protected so you need to use PRs.

1. Backport/merge all the fixes for the patch release to `docusaurus-v3-maintenance` (using a PR, [example](https://github.com/facebook/docusaurus/pull/11982))

2. Create a release branch from **main**: `git co main && git pull && git co -b slorber/release-v3.10.1`

3. Rename the docs version from `3.10.0` to `3.10.1`

4. Create the `3.10.1` changelog entry: `pnpm changelog --from v3.10.0 --to docusaurus-v3-maintenance`

5. Create a release PR that targets `main` ([example](https://github.com/facebook/docusaurus/pull/11983))

6. Go to the [Publish workflow](https://github.com/facebook/docusaurus/actions/workflows/publish.yml) and click the "Run workflow" button. Fill in the form with:

- From branch: `docusaurus-v3-maintenance` - ⚠️ Do not use `main`!
- NPM version: `3.10.1`
- NPM Dist tag: `latest` or `v3-stable` - ⚠️ Do not use `latest` if `4.0.0` is already out, use `v3-stable`

7. Once the workflow finishes and code is on npm, you can merge the release PR in `main`.

8. Follow the "After any release" section.

---

## After any release

### Update the examples

Do this on a separate branch/PR after a major/minor/patch release:

```bash
git co -b slorber/release-v3.11.0-examples
pnpm examples:generate
git push
```

Open the PR, then merge it.

Make sure the [Docusaurus Playground](https://docusaurus.new) sandboxes keeps working.

### Publish the GitHub release

- Go to https://github.com/facebook/docusaurus/releases/new
- Use tag `v3.11.0`
- Use title `3.11.0`
- Paste the release changelog
- Check "Create a discussion for this release", use type "Release feedback"
- Publish

### Marketing

Post about the new release on:

- X - [example](https://x.com/sebastienlorber/status/2041532494076371044)
- Bluesky - [example](https://bsky.app/profile/did:plc:hxmev3uady7j4litwnr5fzbg/post/3miw5wx5kck2t)
- LinkedIn - [example](https://www.linkedin.com/posts/sebastienlorber_docusaurus-310-is-out-a-milestone-release-share-7447314350014517248-u2LR?utm_source=share&utm_medium=member_desktop&rcm=ACoAAASnHqkBaWvOyS4Hb4oFczVnrE8AA7RA6pU)
- Discord #announcements channel - [example](https://discord.com/channels/398180168688074762/867060988717301780/1491091672250191963)

It's not always easy to get access to an official [@docusaurus](https://x.com/docusaurus) account, but marketing is important, so at least publish something under your own name/account.
