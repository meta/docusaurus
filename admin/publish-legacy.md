# Publishing Instructions - Legacy

These instructions are out of date.

Since April 2026, Docusaurus releases are published in a GitHub Action `deploy.yml` workflow, using npm Trusted Publishing.

See also:

- https://docusaurus.io/blog/releases/3.10#trusted-publishing
- https://github.com/facebook/docusaurus/pull/11819
- ***

Docusaurus is published as an npm package that can be installed via `npm` or `yarn`.

# Check publish rights

Get access from the Docusaurus npm admins (@yangshun/@JoelMarcey).

## GitHub

You need publish access to **the main Docusaurus repository** (not a fork).

## npm

Publishing will only work if you are logged into npm with an account with publishing rights to the package.

If you are not currently logged into npm on your CLI, do the following:

1. `npm login`
1. Enter username, password and associated email address
1. **Enable 2FA** on your account (preferably for D2: select 2FA mode `Authorization`, not `Authorization and Publishing`)

---

## Docusaurus 2

<!-- TODO: describe the process of hotfix releases -->

If you're publishing new v2 versions, 2FA might get in the way as the pin might expire during the publishing as there are over 10 packages to publish. Use 2FA mode `Authorization`, not `Authorization and Publishing`.

### 1. Git setup

From the **main branch** (up to date, main repo, not a fork), create a new branch for the release.

The branch name does not matter much, but you can use the `<your_username>/<version_to_release>` pattern.

```sh
# up to date main
git co main
git pull

# create a new release branch
git co -b <your_username>/<version_to_release>
```

### 2. Clean, Build and test the project

Build all the packages from a clean state:

```sh
yarn clear
yarn install
```

**Optional**: to make sure that all packages will work correctly when they are published, we can initialize a new D2 skeleton website, and test that it can start/built.

```sh
# This will build all the packages and publish them in a local Verdaccio npm registry
# and then initialize a new website in the `test-website` directory using those locally published packages
yarn test:build:website

# Now you can test the site in dev/prod mode
cd test-website
yarn start
yarn build
yarn serve
```

This local test step is optional because it will be run by the CI on your release PR ([see](https://github.com/facebook/docusaurus/pull/2954/checks?check_run_id=780871959))

### 3. Update the changelog

The changelog uses GitHub labels to classify each pull request. Use the GitHub interface to assign each newly merged pull request to a GitHub label starting with `pr:`, otherwise the PR won't appear in the changelog.

Not all labels will appear in the changelog—some are designed not to. However, you should **always** label each PR, so that before release, we can do a quick scan and confirm no PR is accidentally left out. Here's a search query (pity that GH doesn't have wildcard queries yet):

```
is:pr is:merged sort:updated-desc -label:"pr: breaking change","pr: new feature","pr: bug fix","pr: performance","pr: polish","pr: documentation","pr: maintenance","pr: internal","pr: dependencies","pr: showcase"
```

[Check tags of all recently merged Pull-Requests](https://github.com/facebook/docusaurus/pulls?q=is%3Apr+is%3Amerged+sort%3Aupdated-desc+-label%3A%22pr%3A+breaking+change%22%2C%22pr%3A+new+feature%22%2C%22pr%3A+bug+fix%22%2C%22pr%3A+performance%22%2C%22pr%3A+polish%22%2C%22pr%3A+documentation%22%2C%22pr%3A+maintenance%22%2C%22pr%3A+internal%22%2C%22pr%3A+dependencies%22%2C%22pr%3A+showcase%22%2C%22pr%3A+ignore%22%2C%22pr%3A+translations%22+)

Some general principles about the labeling process:

- "Will an average user be interested in this entry?" Items like "improve test coverage", "upgrade dependencies" can probably be left out (we have `pr: internal` and `pr: dependencies` for this). However, "pin GitHub actions to an SHA", "add visual testing infrastructure", etc., albeit internal, could be interesting to the user, and can be included in the "maintenance" section.
- "Will this change have tangible impact on the user?" A common case is when a PR implements a feature X, then there are immediately follow-up PRs that fix bugs or polish feature X. These follow-up PRs don't necessarily have to be in the changelog, and even if they alter the API, they are not breaking changes, because to an average user bumping their version, they will only see the new feature X as a whole. Make the entries atomic.

The `pr:` label prefix is for PRs only. Other labels are not used by the changelog tool, and it's not necessary to assign such labels to issues, only PRs.

Generate a GitHub auth token by going to https://github.com/settings/tokens (the only permission needed is `public_repo`). Save the token somewhere for future reference.

Fetch the tags from GitHub (lerna-changelog looks for commits since last tag by default):

```sh
git fetch --tags
```

Generate the changelog with:

```sh
GITHUB_AUTH=<Your GitHub auth token> yarn changelog
```

Copy the generated contents and paste them in `CHANGELOG.md`.

**Note**: sometimes `lerna-changelog` gives an empty changelog ([bug report](https://github.com/lerna/lerna-changelog/issues/354)).

Adding the `--from` options seems to help:

```sh
yarn changelog --from v2.0.0-beta.0
```

### 4. Cut a new version of the docs

```sh
yarn workspace website docusaurus docs:version 2.0.0-beta.0
```

Test running the website with the new version locally.

To keep versions number small, delete the oldest version and add a link to it in `archivedVersions.json`.

Check [Netlify site deployments](https://app.netlify.com/sites/docusaurus-2/deploys) to pick a recent immutable deployment URL.

### 5. Create a Pull Request

You should still be on your local branch `<your_username>/<version_to_release>`

Make a commit/push, create a pull request with the changes.

Example PR: [#3114](https://github.com/facebook/docusaurus/pull/5098), using title such as `chore: prepare v2.0.0-beta.0 release`

**Don't merge it yet**, but wait for the CI checks to complete.

### 6. Build and publish to npm

Stay on your local branch `<your_username>/<version_to_release>`

As we have a monorepo structure, we use `lerna publish ... --exact` to publish the new version of packages to npm in one shot.

Using the `--exact` is important to ensure we keep using fixed versions (without the ^ prefix added by Lerna).

First, be sure to run the command below to verify that you have access to all the necessary repositories.

```sh
npm access ls-packages
```

<details>
 <summary>The list of packages which need access (as of April 2020)</summary>
 <pre>
{
  "@docusaurus/plugin-sitemap": "read-write",
  "@docusaurus/mdx-loader": "read-write",
  "@docusaurus/utils": "read-write",
  "@docusaurus/core": "read-write",
  "@docusaurus/plugin-content-blog": "read-write",
  "@docusaurus/plugin-content-docs": "read-write",
  "@docusaurus/plugin-content-pages": "read-write",
  "@docusaurus/preset-classic": "read-write",
  "@docusaurus/theme-search-algolia": "read-write",
  "@docusaurus/theme-classic": "read-write",
  "@docusaurus/theme-live-codeblock": "read-write",
  "@docusaurus/plugin-google-gtag": "read-write",
  "@docusaurus/plugin-content-docs-legacy": "read-write",
  "@docusaurus/plugin-ideal-image": "read-write",
  "@docusaurus/types": "read-write",
  "create-docusaurus": "read-write",
  "docusaurus": "read-write",
  "stylelint-copyright": "read-write"
}
</pre>
</details>

It can happen that some accesses are not granted, as an admin might add you to the @docusaurus npm organization, but you don't have access to the packages that are not in that organization.

Please **double-check your permissions on these packages**, otherwise you'll publish a half-release and will have to release a new version.

```
  "create-docusaurus": "read-write",
  "stylelint-copyright": "read-write"
```

If all accesses are available, build all the necessary packages, and then run the lerna command to release a new version:

```sh
yarn build:packages
yarn lerna publish  --force-publish --exact 2.0.0-beta.0
```

This command does a few things:

- Modifies the versions of all the `package.json` in the repository to be `2.0.0-beta.0` and creates a commit
- Creates a new Git tag `v2.0.0-beta.0`
- Pushes the new release commit on your branch, and add a git tag

You should receive many emails notifying you that a new version of the packages has been published.

If above command fail (network issue or whatever), you can try to recover with `yarn lerna publish from-package`: it will try to publish the packages that are missing on npm.

Now that the release is done, **merge the pull request**.

### 7. Create a release on GitHub

- Go to https://github.com/facebook/docusaurus/releases/new
- Under the "Tag version" field, look for the newly-created tag, which is `v2.0.0-beta.0` in this case
- Paste the CHANGELOG changes in the textarea below
- Hit the green "Publish release" button
- Profit! 💰

### 8. Update example projects (optional but desirable)

After a release, update the examples to keep them in sync with the latest release. This will ensure that playgrounds are able to use the new version at [docusaurus.new](https://docusaurus.new).

Create a separate branch/PR and run `yarn examples:generate`

### 9. Notify people about new release (optional but desirable)

After new release, it is cool to notify our users about this in the Discord chat (`#announcements` channel) and write summaries on X using the following templates.

For Discord:

```
A new version %VER% is available now! 🎉
See release notes at the following link https://github.com/facebook/docusaurus/releases/tag/%VER%
```

For X:

```
💥 A new version %VER% is available now! 💥

###
LIST HERE MAJOR FEATURES, SEE EXAMPLES BELOW

- Dropdown nav 🔗
- New code blocks features 🖥️
- Draft blog posts ✏️
- Announcement bar 📢

..

NOTE: most likely this last item will be relevant for each new release, so do not forget include it
- Many documentation improvements and bug fixes! 🐛
###

https://github.com/facebook/docusaurus/releases/tag/%VER%
```
