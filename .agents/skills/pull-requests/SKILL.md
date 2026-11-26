---
name: pull-requests
description: Create, update, check the CI of, or merge a meta/docusaurus pull request. Use before running `gh pr create`, pushing commits to an existing PR, reading its CI checks or bot comments, or merging it. Docusaurus maintainers only.
---

# Pull requests

Only Docusaurus maintainers (`DOCUSAURUS_MAINTAINER=true`) can create pull requests. For everyone else, the non-maintainer rules of `AGENTS.md` apply: never create a PR.

## Creating a PR

Write the description from the GitHub pull request template in `.github/PULL_REQUEST_TEMPLATE.md`, adapted for maintainers:

- Remove the `## Pre-flight checklist` section. It is only relevant for external contributors: we assume maintainers did their best, so it only adds noise.
- Remove all the HTML comments of the template.
- Remove the `## Related issues/PRs` section if there is nothing relevant to link.
- If the PR fixes an issue, write `Fixes #<ISSUE-NUMBER>` in the `## Related issues/PRs` section: GitHub links the issue and closes it when the PR is merged.
- If a benchmark is useful to review the change (performance, bundle size…), add a `## Benchmark` section right after `## Motivation`.
- If there are breaking changes, start with a `## Breaking Changes` section explaining:
  - The breaking change.
  - How to upgrade. Link to the release notes or blog posts if they exist.
  - How to restore the behavior of the previous major version, only if there is a straightforward way. Don't write convoluted guides.

Be concise in every section. If something important is verbose (long logs, detailed benchmark results…), hide it in a `<details><summary>…</summary>…</details>` block.

Write the description to a uniquely named file in your session scratchpad (like `pr-<topic>-body.md`, without the slashes of branch names), never to a shared path like `$TMPDIR/pr-body.md`: parallel sessions overwrite it.

After creating the PR, update the deploy preview link in its description with the assigned PR number: `https://deploy-preview-<PR-NUMBER>--docusaurus-2.netlify.app/`. Include links to relevant preview pages in the template's Test links section so that reviewers can easily find them.

## Pushing to a PR

Before pushing new commits to a PR, rebase the branch on a freshly fetched `origin/main`, and resolve the conflicts if any. Pull first to keep the commits others pushed to the PR branch, like the lint autofix commit. For a stacked PR, rebase on its lower PR branch instead.

```bash
git pull --rebase
git fetch origin main
git rebase origin/main
git push --force-with-lease
```

## Scope and stacked PRs

- Keep each PR strictly minimal: every hunk must be required by the PR. Put unrelated refactors and cleanups in another PR, stacked on top.
- For a bug fix, start the stack with a PR that only reproduces the bug. For a bug visible on the site, add a dogfood page (see [Dogfooding](../../../AGENTS.md#dogfooding)): its deploy preview and Argos show the bug, and the fix PR shows the fix as a visual diff. Otherwise, add tests capturing the current behavior.
- To stack a PR, create it with the lower PR branch as its base, then run `gh stack link <bottom-PR> <top-PR>` ([`gh-stack`](https://github.com/github/gh-stack) extension) from the checkout. Otherwise, GitHub doesn't show the stack, and the CI doesn't run on the upper PR.
- Linking doesn't trigger `argos.yml`: if the upper PR has the `Argos` label, remove and re-add it.
- After the bottom PR is merged, GitHub rebases the upper PR onto `main` and force-pushes it: `git fetch` before rebasing it locally.

## Dependabot PRs

When a Dependabot PR needs more than the version bump to pass CI, don't push to its branch: open a dedicated PR with the bump and the fixes, then close the Dependabot PR with a comment linking it.

## Labels

- Give each PR exactly one `pr: <type>` label, picked from the existing labels (`gh label list --search "pr:"`). It categorizes the PR in the changelog. Use `pr: ignore` for changes too insignificant to appear in a user-facing changelog.
- If the PR can affect visual rendering (HTML markup, CSS, theme components…), also add the `Argos` label. It runs the visual regression tests (see `.github/workflows/argos.yml`).

## CI checks

After creating a PR or pushing new commits to it, check its CI status. Wait for the result with a single blocking command instead of polling in a loop:

```bash
gh pr checks <PR-NUMBER> --watch --fail-fast
```

It exits with `0` once all checks pass, or non-zero on the first failure. CI takes around 10 minutes, so run it in the background if your agent supports it. If it exits immediately with "no checks reported", the checks haven't registered yet: run it again. On failure, report the failing check and read its logs with `gh run view <RUN-ID> --log-failed`.

When the last commit of a PR branch is a `refactor: apply lint autofix` commit, the `lint-autofix.yml` workflow pushed it, and most CI jobs don't run on it properly (they wait for a manual approval). Pull it, then push an empty commit so that all the CI jobs run:

```bash
git pull --ff-only
git commit --allow-empty -m "chore: trigger CI"
git push
```

Known flaky failure: the `Supply Chain - Site Template @canary` job often fails because canary releases are not published atomically. npm scans each package for malware, so they become available at different times. A failure with `ERR_PNPM_NO_MATCHING_VERSION` on a `@docusaurus/*` canary version is this known issue: ignore it. If the job fails for any other reason, in particular a third-party dependency blocked for a vulnerability or malware by one of the workflow's tools (sfw, pnpm…), report it and block the PR merge.

## Bot comments

Bots post comments on every PR: Lighthouse scores, Netlify deploy preview, Socket Security, and two build size reports (faster/slower). Don't report these comments in the conversation unless they show a clear problem or something suspicious (score drop, unexpected size increase, security alert…).

## Merging

- Never use auto-merge, including `gh pr merge --auto`. The repository doesn't use auto-merge, and `--auto` merges immediately when the PR is already mergeable.
- If CI checks are still running, wait for all of them to finish before merging (see [CI checks](#ci-checks)).
- If any CI check fails, report the failure and do not merge. The only exception is the known canary supply chain failure above.
- If the PR adds a package to `packages/`, it must exist on npm with Trusted Publishing configured before or right when the PR merges, or the next canary publishes no package at all. Ask the maintainer to follow [Add a new package](../../../admin/publish.md#add-a-new-package).
