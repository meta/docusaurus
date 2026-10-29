# Day 9 – Controlled Validation of Docusaurus Issue #12429

I am contributing to the `facebook/docusaurus` open-source repository to investigate GitHub Issue #12429: “Sidebar Navigation Font Style Randomly Changes While Scrolling.”

**Repository:** `D:\Kalvium\Semester 3\Open Source\docusaurus`

**Branch:** `fix/issue-12429-sidebar-font-flicker`

## Previous progress

- Reviewed the sidebar CSS and related rendering logic.
- Experimentally commented out `will-change: width;` in `packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css`.
- Saved the change in commit `cd732b7c8`.
- Identified `clip-path: inset(0)` and announcement bar scroll behavior as alternative hypotheses.
- Documented the investigation in `day7_investigation_report.md`.
- The original issue has not been consistently reproduced, and the experimental change has not been confirmed as a fix.

## Today's objectives

### 1. Verify the repository state

Run:

- `git status`
- `git branch --show-current`
- `git log --oneline -5`
- `git diff`

Read `AGENTS.md` and any relevant contribution instructions. Preserve existing work and do not reset, rebase, amend, or overwrite commits without explaining why first.

### 2. Establish a reliable baseline

Inspect the original CSS from Git history and compare it with the current experimental version.

Identify the exact difference between:

- Original: `will-change: width;`
- Experimental: `/* will-change: width; */`

Explain what this change might affect and which conclusions remain unverified.

### 3. Perform controlled testing

If the local website is available:

- Start it using `pnpm start:website`.
- Open a documentation page with a long sidebar.
- Test slow scrolling, fast scrolling, scrolling upward, and scrolling downward.
- Repeat with the announcement bar enabled if possible.
- Compare the baseline and experimental CSS under identical conditions.
- Observe font appearance, sidebar layout, animation behavior, and any visual regressions.

Record only tests actually performed. If the flicker does not occur, state that it was not reproduced.

### 4. Investigate alternative hypotheses

Review `clip-path: inset(0)` and the announcement bar's scroll-dependent class changes.

Determine whether the source code provides evidence connecting either mechanism to the reported issue. Do not assume that a stacking context necessarily causes GPU compositing or font flickering.

Do not modify multiple CSS properties at once. Do not remove `clip-path` or replace it with `overflow: hidden` unless the investigation supports that experiment.

### 5. Prepare a report

Create or update `day9_validation_report.md` with:

- Repository status
- Baseline and experimental CSS comparison
- Tests performed and their actual results
- Whether the issue was reproduced
- Evidence supporting or weakening each hypothesis
- Any visual regressions
- Remaining limitations
- Recommended next action

## Important constraints

- Do not invent browser test results.
- Do not claim the issue is fixed without verification.
- Do not introduce speculative changes simply to demonstrate progress.
- Do not create a pull request.
- Do not amend the existing commit yet.
- If browser testing is unavailable, complete the source-level investigation and document the limitation.

Start by checking the repository state, then proceed with the safest available validation. Finish by presenting the findings and recommending whether the experimental change should be retained, revised, or reverted.# Investigation Report: Issue #12429 — Sidebar Navigation Font Style Randomly Changes While Scrolling

**Repository:** `facebook/docusaurus`  
**Branch:** `fix/issue-12429-sidebar-font-flicker`  
**Investigation Date:** 2026-10-21  
**Status:** In Progress / Investigation Only (No production modifications)

---

## 1. Files and Functions Examined

1. **Sidebar Layout & CSS Container:**
   - [`packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css)
   - [`packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/index.tsx`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/index.tsx) (`DocRootLayoutSidebar`, `ResetOnSidebarChange`, `toggleSidebar`)
   - [`packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/index.tsx`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/index.tsx) (`DocRootLayout`)
   - [`packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/styles.module.css`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/styles.module.css)

2. **Sidebar Desktop Content & Dynamic Announcement Bar Integration:**
   - [`packages/docusaurus-theme-classic/src/theme/DocSidebar/index.tsx`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebar/index.tsx) (`DocSidebar`)
   - [`packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/index.tsx`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/index.tsx) (`DocSidebarDesktop`)
   - [`packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/styles.module.css`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/styles.module.css)
   - [`packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/Content/index.tsx`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/Content/index.tsx) (`DocSidebarDesktopContent`, `useShowAnnouncementBar`)
   - [`packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/Content/styles.module.css`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/Content/styles.module.css)

3. **Sidebar Navigation Items & Active Link Determination:**
   - [`packages/docusaurus-theme-classic/src/theme/DocSidebarItem/Link/index.tsx`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebarItem/Link/index.tsx) (`DocSidebarItemLink`, `LinkLabel`)
   - [`packages/docusaurus-theme-classic/src/theme/DocSidebarItem/Link/styles.module.css`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebarItem/Link/styles.module.css)
   - [`packages/docusaurus-theme-classic/src/theme/DocSidebarItem/Category/index.tsx`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebarItem/Category/index.tsx) (`useAutoExpandActiveCategory`)
   - [`packages/docusaurus-theme-classic/src/theme/DocSidebarItem/Category/styles.module.css`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebarItem/Category/styles.module.css)

4. **Scroll Listeners & State Providers:**
   - [`packages/docusaurus-theme-common/src/utils/scrollUtils.tsx`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-common/src/utils/scrollUtils.tsx) (`useScrollPosition`)
   - [`packages/docusaurus-theme-common/src/contexts/announcementBar.tsx`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-common/src/contexts/announcementBar.tsx) (`AnnouncementBarProvider`, `useAnnouncementBar`)
   - [`packages/docusaurus-theme-classic/src/theme/AnnouncementBar/styles.module.css`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/AnnouncementBar/styles.module.css)
   - [`packages/docusaurus-theme-common/src/hooks/useHideableNavbar.ts`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-common/src/hooks/useHideableNavbar.ts) (`useHideableNavbar`)
   - [`packages/docusaurus-theme-classic/src/theme/Navbar/Layout/index.tsx`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/Navbar/Layout/index.tsx)

5. **Infima Design System CSS Rules:**
   - [`node_modules/infima/styles/components/menu.pcss`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/node_modules/infima/styles/components/menu.pcss)
   - [`node_modules/infima/styles/common/variables.pcss`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/node_modules/infima/styles/common/variables.pcss)

6. **Test Suites Examined:**
   - [`packages/docusaurus-theme-classic/src/__tests__`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/__tests__)
   - [`packages/docusaurus-theme-common/src/utils/__tests__`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-common/src/utils/__tests__)
   - [`argos/tests/screenshot.spec.ts`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/argos/tests/screenshot.spec.ts)

---

## 2. Relevant Code Excerpts with File Paths and Line Numbers

### A. Sidebar Positioning, Compositing & Clipping

File: [`packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css:17-39`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocRoot/Layout/Sidebar/styles.module.css#L17-L39)

```css
@media (width >= 997px) {
  .docSidebarContainer {
    display: block;
    width: var(--doc-sidebar-width);
    margin-top: calc(-1 * var(--ifm-navbar-height));
    border-right: 1px solid var(--ifm-toc-border-color);
    will-change: width;
    transition: width var(--ifm-transition-fast) ease;
    clip-path: inset(0);
  }

  .docSidebarContainerHidden {
    width: var(--doc-sidebar-hidden-width);
    cursor: pointer;
  }

  .sidebarViewport {
    top: 0;
    position: sticky;
    height: 100%;
    max-height: 100vh;
  }
}
```

### B. Announcement Bar Scroll Listener & React State Toggle

File: [`packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/Content/index.tsx:21-34`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/Content/index.tsx#L21-L34)

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

File: [`packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/Content/index.tsx:50-55`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/Content/index.tsx#L50-L55)

```tsx
      className={clsx(
        'menu thin-scrollbar',
        styles.menu,
        showAnnouncementBar && styles.menuWithAnnouncementBar,
        className,
      )}>
```

File: [`packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/Content/styles.module.css:21-23`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/Content/styles.module.css#L21-L23)

```css
.menuWithAnnouncementBar {
  margin-bottom: var(--docusaurus-announcement-bar-height);
}
```

### C. Active Link Handling in Sidebar Links

File: [`packages/docusaurus-theme-classic/src/theme/DocSidebarItem/Link/index.tsx:31-50`](file:///D:/Kalvium/Semester%203/Open%20Source/docusaurus/packages/docusaurus-theme-classic/src/theme/DocSidebarItem/Link/index.tsx#L31-L50)

```tsx
  const {href, label, className, autoAddBaseUrl} = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);
  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        'menu__list-item',
        className,
      )}
      key={label}>
      <Link
        className={clsx(
          'menu__link',
          !isInternalLink && styles.menuExternalLink,
          {
            'menu__link--active': isActive,
          },
        )}
```

_Note: `activePath` is derived strictly from `pathname` via React Router's `useLocation()` in `DocRootLayoutSidebar` line 36. It does not update or mutate during page scrolling._

---

## 3. Confirmed Scroll-Triggered Changes

Based on rigorous static tracing of all scroll listeners and event subscriptions:

1. **Announcement Bar Nav Class Toggle (Only at `scrollY === 0`):**
   - **Condition:** Occurs **only** when `announcementBar` is active in theme config and has not been dismissed (`isClosed === false`).
   - **Trigger:** When `scrollY` transitions from `0` to `> 0`, `showAnnouncementBar` switches from `true` to `false`.
   - **DOM Mutation:** The `<nav>` element loses class `styles.menuWithAnnouncementBar`.
   - **Geometry Mutation:** The `<nav>` element's `margin-bottom` switches from `var(--docusaurus-announcement-bar-height)` (30px on desktop) to `0`.
   - **Reverse Trigger:** When scrolling back to the exact top (`scrollY === 0`), `styles.menuWithAnnouncementBar` is re-added, restoring `margin-bottom: 30px`.
   - **When Announcement Bar is Dismissed or Not Configured:** `isActive` is `false`. `useShowAnnouncementBar()` returns `false` continuously. **Zero DOM changes, zero style changes, and zero re-renders occur.**

2. **Hideable Navbar Transform (`hideOnScroll` config):**
   - When enabled via `themeConfig.navbar.hideOnScroll = true`, `useHideableNavbar` toggles `styles.navbarHidden` (`transform: translate3d(0, calc(-100% - 2px), 0)`) on the `<nav className="navbar">` element when scrolling down vs up.
   - However, in `DocSidebarDesktop`, `styles.sidebarWithHideableNavbar` is applied based solely on static config (`hideOnScroll`), **not** dynamic per-scroll state.

3. **Back to Top Button Visibility:**
   - `useBackToTopButton` toggles `.backToTopButton--show` at `scrollY > 300`, which affects an isolated fixed floating button outside the sidebar tree.

4. **Sidebar Navigation Links & DOM Tree:**
   - **No DOM structure, class names, inline styles, or attributes within `.menu__list`, `.menu__list-item`, or `.menu__link` change during scrolling.**
   - Active link determination is strictly bound to client-side route navigation (`useLocation().pathname`), not scroll position.

---

## 4. Comprehensive CSS Rules Affecting Sidebar Navigation Links

Every rule affecting sidebar links and parent containers:

| Property | Value | Rule Selector / Origin | File / Line |
| :-- | :-- | :-- | :-- |
| **`font-weight`** | `500` (`var(--ifm-font-weight-semibold)`) | `.menu` (inherited by `.menu__link`) | `infima/styles/components/menu.pcss:39`, `infima/styles/common/variables.pcss:124` |
| **`font-weight`** | _(no override)_ | `.menu__link`, `.menu__link--active` | Infima does NOT alter `font-weight` for active or hovered links |
| **`font-style`** | `normal` (inherited) | `html`, `body` | Infima sets no `font-style` on `.menu` or `.menu__link` |
| **`font-family`** | `system-ui, -apple-system, Segoe UI, Roboto, ...` | `html` (`--ifm-font-family-base`) | `infima/dist/css/default/default.min.css:1` |
| **`-webkit-font-smoothing`** | `antialiased` | `html` | `infima/dist/css/default/default.min.css:1` |
| **`text-rendering`** | `optimizelegibility` | `html` | `infima/dist/css/default/default.min.css:1` |
| **`will-change`** | `width` | `.docSidebarContainer` (media `width >= 997px`) | `DocRoot/Layout/Sidebar/styles.module.css:23` |
| **`clip-path`** | `inset(0)` | `.docSidebarContainer` (media `width >= 997px`) | `DocRoot/Layout/Sidebar/styles.module.css:25` |
| **`position`** | `sticky` | `.sidebarViewport` (media `width >= 997px`) | `DocRoot/Layout/Sidebar/styles.module.css:35` |
| **`contain`** | `none` | _(no contain rules present)_ | N/A |
| **`filter`** | `none` (links); invert/sepia (caret icon only) | `.menu__link--sublist-caret::after` | `infima/styles/components/menu.pcss:21`, `dark.min.css` |
| **`opacity`** | `0` (only when collapsed) | `.sidebarHidden` | `DocSidebar/Desktop/styles.module.css:22` |
| **`transform`** | `rotate(180deg)` / `rotate(90deg)` (caret only) | `.menu__link--sublist-caret:after`, `.menu__list-item--collapsed` | `infima/styles/components/menu.pcss:23, 72` |
| **`transition`** | `width var(--ifm-transition-fast) ease` | `.docSidebarContainer` | `DocRoot/Layout/Sidebar/styles.module.css:24` |
| **`transition`** | `background var(--ifm-transition-fast) ...` | `.menu__link`, `.menu__list-item-collapsible` | `infima/styles/components/menu.pcss:31` |
| **`transition`** | `color var(--ifm-transition-fast) ...` | `.menu__link:hover` | `infima/styles/components/menu.pcss:120` |

---

## 5. Plausible Rendering Mechanisms (Ranked by Evidence)

### Rank 1: Chromium / WebKit Compositor Layer & Subpixel Text Antialiasing Switching (Highest Evidence)

- **Mechanism:** `.docSidebarContainer` specifies `will-change: width` and `clip-path: inset(0)`. In Chromium (Blink) and WebKit, elements with `will-change` or clipping masks are promoted to separate GPU compositing layers (`cc::Layer`). During page scrolling, browsers often dynamically toggle text rasterization between **Subpixel Antialiasing (RGB ClearType)** and **Grayscale Antialiasing**. Subpixel AA renders thicker, sharper glyph strokes tuned to display subpixel geometry; grayscale AA renders perceptually thinner, softer glyph strokes. When a composited layer scrolls, accelerates, or rasterizes offscreen, the browser reverts to grayscale AA, making `font-weight: 500` text visually pop/flicker as if it momentarily snapped between normal (400) and semi-bold (500).
- **Supporting Evidence:**
  - `styles.module.css:23-25` explicitly pairs `will-change: width` and `clip-path: inset(0)` on the desktop sidebar container.
  - No DOM or font style changes occur on sidebar links during mid-page scrolling, proving the issue is an engine-level rasterization/compositing artifact rather than a CSS/JS bug.

### Rank 2: Announcement Bar Dynamic Margin Toggle at Top Boundary (Medium-High Evidence)

- **Mechanism:** In `DocSidebarDesktopContent`, `useScrollPosition` fires `setShowAnnouncementBar(scrollY === 0)`. When the user initiates a scroll from `0px` to `1px`, the removal of `margin-bottom: 30px` forces a synchronous style recalculation, layout reflow, and repaint of `<nav className="menu">`.
- **Supporting Evidence:**
  - Traced directly in `packages/docusaurus-theme-classic/src/theme/DocSidebar/Desktop/Content/index.tsx:28`.
  - Limitation: This only occurs at `scrollY: 0 <-> 1`, not repeatedly while scrolling continuously down a document.

### Rank 3: Fractional Subpixel Geometry Jitter on Sticky Container (Medium Evidence)

- **Mechanism:** The desktop sidebar combines `position: sticky; top: 0;` inside `.docSidebarContainer` having `margin-top: calc(-1 * var(--ifm-navbar-height))`. On displays with fractional device pixel ratios (e.g. 125%, 150%, common on Windows High-DPI screens), scroll offsets can produce fractional pixel offsets (e.g. `top: 12.333px`), causing font stem rasterization to oscillate between pixel grid boundaries.
- **Supporting Evidence:**
  - Common rendering artifact on Windows ClearType with display scaling.

### Rank 4: Downstream Custom Web Font FOUT / Font Swapping (Low Evidence)

- **Mechanism:** If a site overrides `--ifm-font-family-base` with an external web font using `font-display: swap`, font swapping during initial scroll can cause an abrupt weight/style change.
- **Supporting Evidence:** Default Docusaurus uses a system font stack (`system-ui, -apple-system, Segoe UI...`), eliminating FOUT out of the box unless downstream custom fonts are introduced.

### Rank 5: DOM / Active Class Mutation of Sidebar Items During Scrolling (Refuted)

- **Mechanism:** Hypothesis that sidebar item links change classes or inline styles during document scrolling.
- **Evidence:** **Refuted.** Traced code confirms active link state depends solely on URL `pathname`, not viewport scroll position.

---

## 6. Test Suite Analysis & Proposed Additional Tests

### Existing Test Coverage

- **Vitest (`packages/docusaurus-theme-classic`):** 4 test suites (`translations.test.ts`, `options.test.ts`, `inlineScripts.test.ts`, `Tabs/index.test.tsx`). **0 tests** for `DocSidebar`, `DocRootLayoutSidebar`, or announcement bar scroll behavior.
- **Vitest (`packages/docusaurus-theme-common`):** Tests for general utilities (`tocUtils`, `historyUtils`, `jsUtils`). **0 tests** verifying scroll-triggered sidebar state changes.
- **Argos Visual Regression (`argos/tests/screenshot.spec.ts`):** Takes static `fullPage` screenshots after hydration. **Does not perform scroll interactions, viewport resize gestures, or announcement bar toggles.**

### Proposed Additional Tests

1. **Unit Test for `useShowAnnouncementBar` (`DocSidebar/Desktop/Content`):**
   - Simulate window scroll events at `scrollY = 0` vs `scrollY = 100` with announcement bar active and dismissed.
   - Assert that `styles.menuWithAnnouncementBar` is present at `scrollY = 0`, removed at `scrollY > 0`, and permanently absent when dismissed.
2. **Playwright E2E Sidebar Scroll Stability Test:**
   - Load long documentation page (`/docs/api/themes/configuration`).
   - Query all `.menu__link` elements.
   - Execute progressive scroll steps (`0px`, `50px`, `500px`, `2000px`, `0px`).
   - Assert via `page.evaluate()` that `getComputedStyle(link).fontWeight` and `fontStyle` remain strictly `500` and `normal` throughout all scroll steps.
3. **MutationObserver Assertion Test:**
   - Attach a `MutationObserver` to `nav.menu` during scroll.
   - Assert that zero mutations occur in child nodes (`.menu__list-item`, `.menu__link`) during scrolling.

---

## 7. Recommended Next Experiment (Manual in Chrome DevTools)

To definitively confirm whether the perceived font flicker is caused by **Compositing Layer Antialiasing Shifts (Rank 1)** versus **Announcement Bar Margin Reflow (Rank 2)**:

### DevTools Procedure

1. **Launch Site Locally or Open Production Docusaurus Docs:** Navigate to a long documentation page (e.g. `http://localhost:3000/docs` or `https://docusaurus.io/docs/api/themes/configuration`).

2. **Setup DOM Mutation Monitoring (Tests Hypothesis 2 & 5):** Open Chrome DevTools (`F12`), switch to the **Console** tab, and execute:

   ```javascript
   const nav = document.querySelector('.menu');
   const observer = new MutationObserver((mutations) => {
     mutations.forEach((m) => {
       console.log(
         `[Mutation at scrollY=${window.scrollY}] Target:`,
         m.target,
         'Attr:',
         m.attributeName,
         'OldVal:',
         m.oldValue,
       );
     });
   });
   observer.observe(nav, {
     attributes: true,
     subtree: true,
     attributeOldValue: true,
   });
   console.log('MutationObserver active on .menu');
   ```

   - Slowly scroll down from `scrollY = 0` past `100px`.
   - **Verification:** Confirm that only ONE mutation occurs at `scrollY: 0 -> 1` (`class` attribute changed due to `menuWithAnnouncementBar`), and ZERO mutations occur while continuing to scroll through the rest of the page.

3. **Inspect Compositing Layers & Paint Flashing (Tests Hypothesis 1):**
   - Open Command Menu (`Ctrl+Shift+P` / `Cmd+Shift+P`).
   - Type `Show Rendering` and press Enter.
   - Check **Paint flashing** (repaints highlighted in green).
   - Check **Layer borders** (composited layer bounds outlined in blue/green).
   - Type `Show Layers` in the Command Menu to open the **Layers** panel.
   - Inspect `.docSidebarContainer`:
     - Note the composite reason (typically `will-change: width` or clipping).
   - Slowly scroll the document:
     - Check if `.docSidebarContainer` or `.menu` repaints during scroll or stays on a GPU composited layer.

4. **Isolate `will-change: width` and `clip-path: inset(0)`:**
   - In the **Elements** panel, select `<aside class="... docSidebarContainer ...">`.
   - In the **Styles** pane, toggle checkbox off for:
     ```css
     will-change: width;
     clip-path: inset(0);
     ```
   - Observe in the **Layers** panel whether the sidebar collapses into the main page layer.
   - Perform smooth scrolling at 125% or 150% Windows display scaling to observe whether text rasterization remains stable with subpixel antialiasing intact.
