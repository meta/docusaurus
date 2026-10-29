# Day 9 – Controlled Validation Report: Docusaurus Issue #12429

**Date:** October 29, 2026  
**Repository:** `facebook/docusaurus`  
**Branch:** `fix/issue-12429-sidebar-font-flicker`  
**Investigated Issue:** [#12429](https://github.com/facebook/docusaurus/issues/12429) — "Sidebar Navigation Font Style Randomly Changes While Scrolling"  
**Investigator:** Contributor (AI-assisted)

---

## 1. Repository Status

### Git State Verification

- **Current Branch:** `fix/issue-12429-sidebar-font-flicker`
- **Recent Commit History (`git log --oneline -5`):**
  ```text
  1721c1dfe Added my daily investigation
  cd732b7c8 Modified the css styles
  baaa90693 refactor(mdx-loader): replace stringify-object with estree-util-value-to-estree + astring (AI-assisted) (#12504)
  e8acadcfb refactor(mdx-loader): wrap stringify-object in a local serializeJS() abstraction (AI-assisted) (#12503)
  e032336de docs: remove nonexistent `postStart` plugin lifecycle from plugin-methods docs (AI-assisted) (#12506)
  ```
- **Working Tree Status (`git status`):**

  ```text
  On branch fix/issue-12429-sidebar-font-flicker
  Changes not staged for commit:
    modified:   daily_investigation_report.md
    modified:   packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css

  Untracked files:
    issue_12429_next_investigation.md
  ```

- **Working Tree Diff for CSS:** `packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css` has an unstaged change restoring `will-change: width;` to match upstream `main` (counteracting the experimental comment in commit `cd732b7c8`):
  ```diff
  diff --git a/packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css b/packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css
  index 1d70ba93e..97903b7ce 100644
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
- **Commit Preservation:** All commits (`cd732b7c8` and `1721c1dfe`) remain intact. No commits have been reset, amended, rebased, or overwritten.

---

## 2. Baseline vs. Experimental CSS Comparison

### Code Inspection

File: `packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css` (lines 17–27)

```css
@media (width >= 997px) {
  .docSidebarContainer {
    display: block;
    width: var(--doc-sidebar-width);
    margin-top: calc(-1 * var(--ifm-navbar-height));
    border-right: 1px solid var(--ifm-toc-border-color);
    will-change: width; /* Baseline */
    /* will-change: width; */ /* Experimental (commit cd732b7c8) */
    transition: width var(--ifm-transition-fast) ease;
    clip-path: inset(0);
  }
```

### Exact Technical Difference

| Aspect | Baseline (`will-change: width;`) | Experimental (`/* will-change: width; */`) |
| :-- | :-- | :-- |
| **Compositing Layer Promotion** | Hints browser rendering engines (Chromium Blink, WebKit) to promote `.docSidebarContainer` to an independent GPU compositor layer in anticipation of width changes. | Element is not preemptively promoted to a compositor layer specifically for width animations. |
| **Sidebar Collapse/Expand** | Optimized transition: width animation runs with pre-allocated compositor backing store, minimizing reflow/re-rasterization spikes during toggle. | Potential micro-stutter (layout reflow spike) during the initial frames of the collapse animation as the browser allocates or resizes backing textures. |
| **Scrolling Behavior** | `width` does not change during vertical document scrolling. Sidebar is positioned via `position: sticky; top: 0;` inside the viewport. | `width` still does not change during vertical document scrolling. |
| **Text Antialiasing Interaction** | On some GPU/OS configurations (especially with fractional DPI scaling), composited layers may force grayscale text antialiasing instead of subpixel ClearType antialiasing. | Text might render via standard subpixel antialiasing if no other layer-promoting property is active. |

### Unverified Conclusions Regarding `will-change: width;`

1. **Unverified Causality:** There is no empirical evidence demonstrating that `will-change: width;` causes font flickering during scroll. Scrolling does not mutate the `width` property.
2. **Viewport Disconnect:** The original bug report submitted an image with viewport dimensions 375x828 px (mobile). At mobile viewports (< 997px), `.docSidebarContainer` has `display: none;`, meaning this rule is not applied at all.
3. **Speculative Fix:** Commenting out `will-change: width;` was an experimental probe, not a verified fix.

---

## 3. Controlled Testing Performed & Results

### Tests Actually Executed

1. **Static Analysis & Code Tracing:**
   - Traced all scroll listeners across `@docusaurus/theme-classic` and `@docusaurus/theme-common`.
   - Verified that neither `.menu__link`, `.menu__list`, nor `.menu__list-item` subscribe to scroll events or mutate inline styles/classes during document scrolling. Active link state is strictly derived from client router `pathname` (`useLocation()`).

2. **Stylelint Validation (`pnpm lint:style`):**
   - Executed against all stylesheets in the monorepo.
   - **Result:** Exited with code `0`. Clean, no stylelint violations.

3. **Vitest Unit & Component Suite (`pnpm test packages/docusaurus-theme-classic`):**
   - Executed 4 test suites:
     - `packages/docusaurus-theme-classic/src/__tests__/inlineScripts.test.ts` (2 tests)
     - `packages/docusaurus-theme-classic/src/__tests__/translations.test.ts` (6 tests)
     - `packages/docusaurus-theme-classic/src/__tests__/options.test.ts` (43 tests)
     - `packages/docusaurus-theme-classic/src/theme/Tabs/__tests__/index.test.tsx` (13 tests)
   - **Result:** All 4 test files passed (64/64 tests passed).

4. **TypeScript Typecheck (`pnpm --filter website typecheck`):**
   - Executed `tsc` for website package.
   - **Result:** Exited with code `0`. Clean, no TypeScript errors.

5. **Automated Browser Testing Availability Probe:**
   - Evaluated Playwright browser environment for automated scroll cycles.
   - **Finding:** Playwright Chromium headless binary is not pre-installed in the local cache (`~/.cache/ms-playwright` / `AppData/Local/ms-playwright`), and host browser execution via Microsoft Edge is restricted by the Windows sandbox process/named-pipe isolation policy.
   - **Constraint Handling:** In accordance with instructions, browser test results were not invented or simulated.

6. **Historical Sprint 3 Browser Reproduction Cycles (from Day 8):**
   - 8 scroll cycles (fast, slow, upward, downward) were performed on `/docs/api/themes/configuration` in desktop and responsive modes with the announcement bar active and dismissed.
   - **Reproduction Result:** The font flickering issue was **NOT reproduced**. Sidebar navigation font weights and styles remained completely stable.

---

## 4. Source-Level Investigation of Alternative Hypotheses

### Hypothesis 1: `clip-path: inset(0)`

- **Location:** `packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css:25`
- **Architectural Purpose:**
  - During sidebar collapse, `.docSidebarContainer` animates width from 300px down to 30px (`var(--doc-sidebar-hidden-width)`).
  - Its child element `.sidebarViewport` is sticky (`position: sticky; top: 0; max-height: 100vh;`).
  - Standard CSS rules dictate that setting `overflow: hidden` on a parent element creates a new clipping box and breaks `position: sticky` relative to the scrolling viewport.
  - Therefore, `clip-path: inset(0)` was specifically introduced to visually clip overflowing sidebar content during width collapse without interfering with the sticky viewport container.
- **Evidence Analysis:**
  - `clip-path` creates a CSS stacking context. Stacking contexts define paint hierarchy (z-order); they do not dictate text rasterization or font styles.
  - `clip-path: inset(0)` is static and immutable during document scrolling. No JavaScript or CSS animation modifies it while scrolling.
  - Modern browser engines treat axis-aligned rectangular `inset(0)` clips efficiently without offscreen render-target thrashing.
  - **Verdict:** There is **no source-level evidence** connecting `clip-path: inset(0)` to scroll-induced font style flickering. Removing `clip-path` would cause visual overflow during sidebar collapse, while replacing it with `overflow: hidden` would break sticky sidebar positioning.

### Hypothesis 2: Announcement Bar Scroll-Dependent Class Changes

- **Location:** `packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/Content/index.tsx:21-34` and `styles.module.css:21-23`
- **Mechanism:**

  ```tsx
  function useShowAnnouncementBar() {
    const {isActive} = useAnnouncementBar();
    const [showAnnouncementBar, setShowAnnouncementBar] = useState(isActive);

    useScrollPosition(
      ({scrollY}) => {
        if (isActive) {
          setShowAnnouncementBar(scrollY === 0);
        }
      },
      [isActive],
    );
    return isActive && showAnnouncementBar;
  }
  ```

  When `showAnnouncementBar` changes, class `styles.menuWithAnnouncementBar` is toggled on `<nav class="menu">`, changing `margin-bottom` from `30px` to `0px`.

- **Evidence Analysis:**
  - **Supporting Evidence:** This is the sole dynamic layout mutation tied to scroll position in the desktop sidebar. A change in `margin-bottom` forces a layout recalculation and repaint on `<nav class="menu">`.
  - **Weakening Evidence:**
    1. The toggle fires **exclusively** at the boundary `scrollY === 0` vs `scrollY > 0`. It does NOT fire repeatedly while scrolling down or up long pages (`scrollY > 0` remains false, so React skips re-rendering).
    2. The rule only adjusts `margin-bottom`. It does not modify `font-family`, `font-weight`, `font-style`, or `-webkit-font-smoothing`.
    3. If an announcement bar is not configured or is dismissed, `isActive` is `false`, and no scroll-dependent logic executes at all.
  - **Verdict:** While an initial margin reflow occurs when scrolling away from `scrollY = 0`, it does not explain random font flickering occurring throughout continuous scrolling on long documentation pages.

### Hypothesis 3: Subpixel vs. Grayscale Text Antialiasing on Windows / GPU Compositing

- **Mechanism:** On Windows (especially with 125% or 150% fractional display scaling and ClearType enabled), Chromium frequently toggles text rasterization between subpixel RGB antialiasing and grayscale antialiasing when elements are placed on composited layers or undergo scrolling momentum. Grayscale antialiasing renders glyph strokes perceptually thinner than subpixel RGB antialiasing, causing `font-weight: 500` text to visually snap between seemingly normal and bold weights.
- **Evidence:** This matches the note in Docusaurus's own `argos/playwright.config.ts`:
  ```ts
  // Recommended by Argos to stabilize text rendering
  launchOptions: {
    args: ['--disable-lcd-text', '--font-render-hinting=none'],
  }
  ```
  This is a known engine-level artifact rather than a theme CSS bug.

---

## 5. Visual Regressions & Side Effects Analysis

- **Baseline (`will-change: width;`):** No regressions observed in layout or text rendering. Provides compositor optimization during collapse/expand transition.
- **Experimental (`/* will-change: width; */`):** Does not resolve the reported bug (unreproduced), but removes the compositor pre-allocation hint for width animation, potentially causing frame drops during collapse on low-end hardware.
- **Hypothetical `overflow: hidden` (replacing `clip-path`):** Would break `position: sticky;` on `.sidebarViewport`, causing the sidebar to scroll out of view or clip improperly.

---

## 6. Remaining Limitations

1. **Issue Non-Reproducibility:** Issue #12429 has not been reproduced in controlled testing environments.
2. **Missing Environmental Metadata:** The issue report lacks crucial client details:
   - Specific OS version and display scaling factor (e.g., Windows 11 at 125% or 150% DPI).
   - Exact browser vendor and build version.
   - Hardware acceleration state (enabled/disabled in browser flags).
   - Clarification on viewport: why a mobile viewport screenshot (375x828) was attached to an issue regarding desktop navigation sidebar behavior.
3. **Execution Sandbox Boundary:** Host browser processes cannot be automated within the sandboxed environment due to OS pipe/security restrictions.

---

## 7. Recommended Next Action

### Recommendation: Revert / Withdraw the Experimental Change

1. **Revert Commit `cd732b7c8` (or restore `will-change: width;` cleanly):**
   - The experimental edit `/* will-change: width; */` has no verified causal connection to the scroll flickering issue.
   - Docusaurus contribution guidelines (`AGENTS.md`) strictly mandate against speculative fixes.
   - Restoring `will-change: width;` preserves the intended performance optimization for sidebar collapse transitions.

2. **Do Not Alter `clip-path: inset(0)`:**
   - Retain `clip-path: inset(0)` to prevent breaking sticky sidebar scrolling and visual clipping.

3. **Request Reporter Clarification:**
   - Provide the reporter and maintainers with structured reproduction findings on GitHub Issue #12429, requesting specific reproduction hardware/software configurations (OS, browser, display scaling, screen recording).
   - If no reproduction steps or environment details can be provided, recommend closing the issue as `cannot reproduce`.
