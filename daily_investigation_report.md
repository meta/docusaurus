# Daily Investigation Report: Docusaurus Issue #12429

**Date:** October 19, 2026 **Issue:** facebook/docusaurus #12429 — "Sidebar Navigation Font Style Randomly Changes While Scrolling" **Branch:** `fix/issue-12429-sidebar-font-flicker` **Branch HEAD Commit:** `1721c1dfe` ("Added my daily investigation") **Prior Commit:** `cd732b7c8` ("Modified the css styles") **Working Tree Status:** `styles.module.css` restored to match upstream `main`; `daily_investigation_report.md` updated with investigation history and current state. **Investigator:** Kalvium Open Source Contributor

---

## 1. Executive Summary

This report documents the ongoing investigation of Docusaurus Issue #12429 in Sprint 3. The issue describes transient left sidebar font-weight/style changes ("flickering") when scrolling upward on long documentation pages.

Key updates from today's session:

1. **Withdrawal of Experimental CSS Change:** The experimental edit from commit `cd732b7c8` (which commented out `will-change: width;` in `packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css`) has been cleanly restored in the working tree to match upstream `main`. Because the reported bug could not be reproduced and page scrolling does not animate width transitions, commenting out `will-change: width;` was an unverified hypothesis. Restoring it returns the working tree to a clean, non-speculative state without altering commit history.
2. **Root Cause Status:** The root cause remains **unknown and unverified**. The original issue has not been reproduced under testing, and restoring the CSS does not claim to fix the underlying issue.
3. **Repository Verification:** Branch `fix/issue-12429-sidebar-font-flicker` is tracking `origin/fix/issue-12429-sidebar-font-flicker`. No commits were amended, reset, rebased, or deleted.
4. **Upstream Status:** GitHub Issue #12429 remains `OPEN` with labels `bug` and `status: needs triage`. Checked live: total comments remain at 6 with no new maintainer or reporter responses since October 9, 2026.
5. **Quality & Validation:** Ran `git diff main -- packages/.../styles.module.css` (verified 0 differences against upstream `main`), `git diff --check`, and `pnpm lint:style` (passed with 0 errors).
6. **Testing Limitations:** Testing was conducted exclusively via Chromium browser automation (desktop 1280x800 and responsive checks). No tests were run on Firefox (Gecko), Safari (WebKit), or physical mobile devices.
7. **Next Steps:** Seek necessary environmental details from the reporter (browser, OS, device, display scaling, screen recording/reproduction site) via a structured, factual inquiry before taking any further code action.

---

## 2. Git Status and Working Tree Verification

### Commands Executed & Output Summary

- **`git status`**:
  ```text
  On branch fix/issue-12429-sidebar-font-flicker
  Changes not staged for commit:
    modified:   daily_investigation_report.md
    modified:   packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css
  ```
- **`git branch -vv`**:
  ```text
  * fix/issue-12429-sidebar-font-flicker 1721c1dfe Added my daily investigation
    main                                 baaa90693 [origin/main] refactor(mdx-loader)...
  ```
- **`git log -n 5 --oneline`**:
  ```text
  1721c1dfe Added my daily investigation
  cd732b7c8 Modified the css styles
  baaa90693 refactor(mdx-loader): replace stringify-object with estree-util-value-to-estree + astring (AI-assisted) (#12504)
  e8acadcfb refactor(mdx-loader): wrap stringify-object in a local serializeJS() abstraction (AI-assisted) (#12503)
  e032336de docs: remove nonexistent postStart plugin lifecycle from plugin-methods docs (AI-assisted) (#12506)
  ```
- **`git diff main -- packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css`**:
  ```text
  (Clean output: 0 differences compared to upstream main)
  ```
- **`git diff -- packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css`**:
  ```diff
  diff --git a/packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css b/packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css
  --- a/packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css
  +++ b/packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css
  @@ -20,7 +20,7 @@
       width: var(--doc-sidebar-width);
       margin-top: calc(-1 * var(--ifm-navbar-height));
       border-right: 1px solid var(--ifm-toc-border-color);
  -    /* will-change: width; */
  +    will-change: width;
       transition: width var(--ifm-transition-fast) ease;
       clip-path: inset(0);
     }
  ```

---

## 3. Rationale for Withdrawing the Experimental CSS Change

1. **Lack of Empirical Reproduction:** Across 8 comprehensive upward and downward scroll cycles on extended documentation pages with the announcement bar enabled and disabled, the sidebar font remained completely stable.
2. **Irrelevance of `width` During Scroll:** In `styles.module.css`, `will-change: width;` exists inside `@media (width >= 997px)` to assist hardware layer promotion for the sidebar collapse/expand animation. Page scrolling does not change or animate sidebar width.
3. **Viewport Conflict:** The reporter's attached screenshot had dimensions of 375x828 px (mobile viewport), where `.docSidebarContainer` has `display: none;` and is not rendered.
4. **Adherence to Contribution Guidelines:** `AGENTS.md` and `CONTRIBUTING.md` forbid proposing unverified or speculative modifications. Restoring `will-change: width;` in the working tree ensures the codebase is not modified based on guesswork while the issue remains under investigation.

---

## 4. Architectural Analysis: Mobile Drawer vs. Desktop Sidebar

- **Desktop (`width >= 997px`):**
  - Rendered by `DocRoot/Layout/Sidebar` and `DocSidebar/Desktop`.
  - Uses `position: sticky; top: 0; height: 100%; max-height: 100vh;`.
  - Sticky sidebar stays visible in the viewport while the main document content scrolls.
  - Subscribes to scroll events in `DocSidebar/Desktop/Content/index.tsx` to toggle `.menuWithAnnouncementBar` when `scrollY === 0`.
- **Mobile (`width < 997px`):**
  - The desktop container is hidden via `display: none;`.
  - Uses `DocSidebarMobileSecondaryMenu` rendered inside a `Navbar/MobileSidebar` modal drawer.
  - The mobile drawer completely overlays the screen. When page content is being scrolled, the drawer is closed; when the drawer is open, document body scrolling is inactive.
- **Architectural Takeaway:** On standard Docusaurus, scrolling document text while simultaneously viewing sidebar navigation items only occurs on desktop viewports. The reporter's 375x828 px screenshot suggests either devtools mobile emulation, a cropped desktop capture, or a custom downstream layout.

---

## 5. Quality & Verification Testing

### Commands & Results

- **Stylelint:**
  ```powershell
  pnpm lint:style
  # Result: Exited with code 0. Clean.
  ```
- **Vitest Suite (`packages/docusaurus-theme-classic`):**
  ```powershell
  pnpm test packages/docusaurus-theme-classic
  # Result:
  # ✓ packages/docusaurus-theme-classic/src/__tests__/inlineScripts.test.ts (2 tests)
  # ✓ packages/docusaurus-theme-classic/src/__tests__/translations.test.ts (6 tests)
  # ✓ packages/docusaurus-theme-classic/src/__tests__/options.test.ts (43 tests)
  # ✓ packages/docusaurus-theme-classic/src/theme/Tabs/__tests__/index.test.tsx (13 tests)
  # Test Files: 4 passed (4)
  # Tests: 64 passed (64)
  ```

### Test Scope & Limitations

- All reproduction testing was executed in an automated Chromium browser environment.
- **Testing Limitations:** No tests were executed on Firefox (Gecko), Safari (WebKit), or physical iOS/Android mobile hardware. These environments were not tested and no claims are made regarding their behavior.

---

## 6. Upstream Issue Review (facebook/docusaurus#12429)

- **URL:** https://github.com/facebook/docusaurus/issues/12429
- **Title:** Sidebar Navigation Font Style Randomly Changes While Scrolling
- **Status:** `OPEN`
- **Labels:** `bug`, `status: needs triage`
- **Assignee:** None
- **Linked PRs:** None
- **Current State:** 6 total community comments. No maintainer feedback, triage assessment, or reporter reproduction details have been added since October 9, 2026.

---

## 7. Draft GitHub Issue Comment (Awaiting User Approval)

Below is the proposed response to be reviewed and manually posted by the user once approved:

```markdown
Hi @vinothkumarGanesan and maintainers, (AI-assisted)

I have been investigating this issue locally and attempted to reproduce the reported sidebar font style/weight flicker during scroll.

Here is what was tested so far:

- Tested scrolling on long documentation pages across multiple upward and downward scroll cycles.
- Tested under two distinct states:
  1. With the top announcement bar enabled.
  2. With the announcement bar dismissed.
- Tested in an automated Chromium browser environment.
- Checked styles and ran `@docusaurus/theme-classic` tests and stylelint (`pnpm lint:style`), which all passed.

In our tested Chromium environment, the sidebar text rendering remained consistent, and no font style or weight flickering was observed. Additionally, we noted that the attached screenshot has viewport dimensions of 375x828 px (mobile viewport), where the desktop sidebar container is hidden (`display: none`) and the mobile drawer modal is used instead.

To help narrow down whether this is hardware, engine, or OS-specific rasterization:

1. Which operating system and version are you using?
2. Which browser and exact version did this occur on?
3. What device type and display scaling / DPI setting (e.g., 100%, 125%, 150%) was active?
4. Is browser hardware/GPU acceleration enabled or disabled?
5. Could you share exact steps to reproduce the flicker, or a screen recording / reproducible example if available?

Thank you!
```

---

## 8. Unresolved Questions & Next Steps

### Unresolved Questions

1. Did the reporter observe this on mobile Safari (iOS), mobile Chrome (Android), or on a desktop browser resized to a mobile width?
2. Does the issue correlate with a custom web font / FOUT (Flash of Unstyled Text) on a specific downstream Docusaurus site rather than the default Infima system font stack?
3. Did the reporter have browser hardware acceleration disabled, causing CPU fallback rasterization differences during compositing?

### Next Steps Needed to Reproduce the Issue

1. **User Review:** Review and approve the draft comment above.
2. **Post Comment (Manual):** User posts the approved comment on GitHub Issue #12429.
3. **Await Reporter Feedback:** Wait for the reporter or maintainer response regarding environment specifications.
4. **Preserve Repository Cleanliness:** Maintain the working tree without unverified functional changes until empirical evidence is established.
