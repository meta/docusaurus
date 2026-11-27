---
name: verification
description: Prove how code behaves before reporting it. Use before claiming that a change works, fails or is needed, in particular on another platform than the one you run on (like Windows from macOS), and before posting screenshots in a PR.
---

# Verification

Report what you proved, not what you inferred. Don't present the result of reading the code, or of a local simulation, as a fact: run the code. Until you can, report it as unverified.

## Other platforms

You can't prove locally how code behaves on a platform you don't run on. For example, faking `process.platform` on macOS proves nothing about Windows: Node.js and third-party libraries still behave like on macOS.

Prove it on the real platform instead. For Windows, push a commit to a PR (a temporary one if needed, reverted afterwards) and let the Windows CI confirm or refute your assumption. It runs `pnpm test` and builds the website on Windows, but only when the PR changes a file matching its `paths` filter (see `.github/workflows/tests-windows.yml`).

The same goes for how a page renders or behaves on an OS or browser you don't run locally (fonts, layout, text rendering, browser-specific CSS). Argos doesn't prove it either: it only screenshots headless Chromium on a Linux runner. Before claiming anything, take screenshots and measurements on the real platforms with a temporary GitHub Actions workflow:

- Push it (like `.github/workflows/tmp-<topic>.yml`) in a commit titled `DO NOT MERGE: …`, on the PR or on a temporary branch. Trigger it on `pull_request` or `push`: `workflow_dispatch` only runs workflows that exist on the default branch.
- Run a matrix of Linux, Windows and macOS runners, and drive the browsers with Playwright (Chrome, Edge, Firefox, WebKit).
- Upload each screenshot as its own unzipped artifact (an `actions/upload-artifact` step per file, with `archive: false` and a short `retention-days`), and print measured values in the log, like the fonts that the Chrome DevTools Protocol `CSS.getPlatformFontsForNode` reports for a node.
- Download the artifacts with `gh run download`, look at the screenshots yourself before reporting, and link the run.
- Delete the workflow afterwards with a normal commit, never a force-push.

A runner can't change every OS setting. For example, a Windows display language only applies after a new sign-in: simulate it through the setting the code reads (like the UI fonts that the `SystemParametersInfo` Win32 API sets), and report it as a simulation.

## Screenshots in PRs

When screenshots back the test plan, post them in the PR. They matter most for visual changes that Argos and CI don't report or validate (other OSes and browsers, fonts, installed software).

- Never use the maintainer's own browser (Claude in Chrome) to take, upload or post them. Take them with headless tooling, and publish them from a GitHub Actions workflow, as above.
- Link each artifact in a PR comment that says what each image shows. Its URL is `https://github.com/<owner>/<repo>/actions/runs/<run-id>/artifacts/<artifact-id>`, with the ids listed by `gh api repos/<owner>/<repo>/actions/runs/<run-id>/artifacts`.
- Prefer cropped, labeled before/after images to raw full-page screenshots.
