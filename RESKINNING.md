# Quizbase Reskinning Guide

Quizbase is a functional base for visual-language reconstruction. A reskin may radically change composition and presentation while preserving the games' behavior contracts.

## Source-of-truth rule

- `data/` is content/data source of truth.
- `js/core/` owns shared game behavior.
- `js/games/` should stay thin configuration wrappers.
- `css/theme.css` is the first-stop visual contract.
- `data-ui` attributes are stable semantic presentation hooks.

A reskin is not required to keep the current five-card launcher, current component geometry, or current arrangement of controls. Preserve what an element *does*, not where the default skin happens to put it.

## Recommended workflow

1. Inspect the current product and understand all five game flows before styling.
2. Accumulate the complete reference set before implementation.
3. Reverse-engineer the reference system: core rules, recurring patterns, contextual treatments, decorative motifs, redundant evidence, and unsuitable transplants.
4. Override semantic tokens first.
5. Use semantic `data-ui` hooks for structural treatments that tokens cannot express.
6. Change component markup only when the new visual language genuinely requires a different composition.
7. Keep game logic and datasets unchanged unless a functional change is explicitly requested.
8. Validate every affected state on phone portrait, phone landscape, tablet portrait, and desktop.
9. Run `npm test` after changes.

For visual work, also run `npm run test:e2e`. The browser gate covers direct
links, topic overlays, Missing Word generation/reveal, Hangman solve mode, the
keyboard, Random Letter Ideas, fullscreen controls, and viewport overflow.

## Theme tokens and Shadow DOM

`css/theme.css` defines the public `--qb-*` theme variables on `:root`. CSS custom properties inherit through Shadow DOM hosts, so Missing Word and Hangman components can consume the same global theme without piercing their Shadow DOM.

This is intentional: do not copy a complete reskin stylesheet independently into every Shadow DOM.

Tokens are semantic rather than screen-specific. Main groups are:

- typography: `--qb-font-*`;
- surfaces: `--qb-color-page`, `--qb-color-surface`, `--qb-color-surface-subtle`, overlay;
- text/lines: `--qb-color-text*`, `--qb-color-line*`;
- accent/state: accent, reveal, success, danger, generating, focus;
- geometry: card/control/pill radii and utility-control size;
- effects: card/control/game shadows;
- motion: durations/easing;
- component contracts: picker, keyboard, ticker, and Hangman artwork tokens.

A source-game reskin can replace these values centrally, for example:

```css
:root {
  --qb-color-page: #101214;
  --qb-color-surface: rgba(20, 24, 30, .82);
  --qb-color-text: #f4f0e8;
  --qb-color-accent: #d4473f;
  --qb-radius-card: 0;
  --qb-shadow-card: none;
}
```

Do not turn every numeric CSS value into a token. Tokens should represent decisions a visual-language reconstruction is likely to change across multiple components. Local layout math can remain local.

## Semantic hooks

Important presentation roles carry `data-ui` attributes. These are preferred reskin hooks because class names can still describe implementation details.

Common roles include:

- `app-shell`
- `home-screen`
- `game-launcher`
- `game-launch`
- `game-launch-surface`
- `game-launch-label`
- `game-root`
- `game-toolbar`
- `utility-actions`
- `home-action`
- `fullscreen-action`
- `primary-action`
- `secondary-action`
- `difficulty-control`
- `topic-picker`
- `topic-picker-trigger`
- `overlay`
- `overlay-panel`
- `game-primary-surface`
- `answer-display`
- `status-counter`
- `status-detail`
- `solve-panel`
- `game-keyboard`
- `game-artwork`
- `supporting-panel`

Inside Shadow DOM, reskin rules that need structural changes belong in the component stylesheet or a stylesheet imported by it. Global selectors cannot cross the Shadow boundary; inherited `--qb-*` tokens can.

## What is safe to change

Visual work may change, when appropriate:

- launcher composition;
- backgrounds and layering;
- typography;
- spacing and alignment;
- component geometry;
- borders, shadows, transparency, textures and gradients;
- button/picker/dialog presentation;
- icons and decorative motifs;
- Hangman artwork presentation;
- animation timing/presentation when the interaction contract remains intact;
- responsive composition.

A reskin may use cards, lists, terminals, diegetic panels, abstract navigation, or another composition entirely. Do not preserve the default layout merely because it exists.

## Behavior contracts to preserve

Unless the product explicitly changes, preserve:

### App
- all five routes and Home navigation, including direct hash links and browser Back/Forward;
- fullscreen enter/exit and icon state;
- haptics where supported;
- no accidental page scrolling.

### Missing Word siblings
- topic selection and all/none semantics;
- difficulty behavior;
- masking and word selection;
- reel/slot generation animation;
- ability to accelerate/stop generation where supported;
- reveal behavior and round lifecycle.

### Hangman siblings
- six-miss round lifecycle;
- correct/wrong/repeated guesses;
- keyboard state and reset;
- Solve Word, Cancel, caret/input behavior;
- New Word and confirmation behavior;
- win/loss presentation state;
- topic filtering;
- visible multiline answer slots;
- gallows progression.

Hangman topic selection is shared through
`js/core/hangman-topic-picker.js`. Keep its selection, random-mode, Apply,
Cancel, and outside-dismiss contracts when changing the picker presentation.

Hangman artwork state is isolated in `js/core/hangman-artwork.js`. The default
renderer is a small PixiJS scene mounted in `#hangmanPixiStage`; it receives
only `reset()` and `render(missCount)` calls from the game engine. A reskin may
replace that adapter with SVG, Canvas, Rive, or another Pixi scene, provided it
keeps those two methods. The rules engine does not depend on drawing
coordinates, element IDs, or a stickman design.

## Routing contract

`js/app.js` owns route resolution.  Keep game screens addressable by their
canonical hashes when changing the launcher or app shell:

- `#rngl`
- `#missingword`
- `#missingwordpokemon`
- `#hangman`
- `#hangmanpokemon`

Older human-readable hashes remain accepted as aliases.  A visual reskin may
replace launcher markup, but launch controls must call the app navigation API
or provide the matching `data-file` value so direct links, Home, and browser
history continue to work.

## Missing Word UI boundaries

The two Missing Word variants deliberately share presentation structure as
well as gameplay behavior:

- `js/core/missing-word-template.js` — static Shadow DOM markup and stable
  `data-ui` hooks;
- `js/core/missing-word-topic-picker.js` — topic picker interaction and
  selection state;
- `js/core/missing-word-renderer.js` — slot layout, reel generation, static
  fallback rendering, and reveal animation;
- `js/core/missing-word-engine.js` — round state, word choice, masking, and
  event wiring.

Changing the template for a creative layout is supported. Preserve the element
IDs/data hooks consumed by the engine, or update the engine and its regression
tests in the same change.

### Random Letter
- random generation behavior and animation modes;
- Ideas toggle and ticker behavior;
- generation interruption/acceleration behavior where present.

## Topic picker contract

Topic pickers must support their existing apply/cancel/clear/all behavior and dismiss naturally by outside click/tap where implemented. The opener control must be excluded from outside-dismiss handling so opening a picker does not immediately close it.

A reskin can radically alter picker presentation, but should preserve those interaction semantics.

## Responsive contract

Mobile-first means independent validation, not merely relative CSS units.

Validate at least:

- phone portrait;
- phone landscape;
- tablet portrait;
- desktop.

Protect large tap targets, safe areas, readable text, visible answer blanks, non-overlapping utility controls, and no-scroll gameplay. When space is constrained, decorative/artwork regions should generally yield before essential game information or controls.

## Accessibility contract

Preserve accessible names and interaction semantics when replacing visual controls. Icon-only Home and Fullscreen controls still require their accessible labels. Maintain keyboard/focus behavior where it already exists. Do not remove focus indication without replacing it with an equally clear treatment.

## Reference-driven visual reconstruction

Do not mechanically map every reference screenshot to a component. Extract the visual grammar first. A reference may reveal a useful palette, hierarchy, geometry, texture, transition, or motif without requiring a literal counterpart in Quizbase.

For each candidate reference element, consider distinctiveness, recurrence, system relevance, recognition value, applicability, coherence, redundancy, context dependence, usability, and artificiality.

The objective is maximum authenticity with good design judgment, not maximum reference density.

## Regression checklist

After meaningful reskin work:

- run `npm test`;
- launch all five routes;
- Home out of every game;
- enter and exit fullscreen;
- open/apply/cancel/outside-dismiss topic pickers;
- exercise Missing Word topic/difficulty/generate/reveal flows;
- exercise Hangman guesses, misses, win, loss, Solve Word, Cancel, New Word and keyboard reset;
- test short, long, multiword and punctuation Hangman answers;
- exercise Random Letter generation and Ideas/ticker behavior;
- inspect phone portrait, phone landscape, tablet portrait and desktop;
- check that no old visual-language fragments remain accidentally after the reskin.

## Architecture guardrail

Do not fork shared engines to make a visual variant. Missing Word siblings share one engine; Hangman siblings share one engine. Keep game-specific data/configuration and visual entry points configurable around those engines.

If a reskin seems to require gameplay-engine duplication, first look for a semantic hook, theme token, configuration option, or component-level presentation extension instead.

## Automated browser regression gate

A reskin is not complete just because it looks correct. Run the real-browser regression suite after meaningful visual or structural work:

```bash
npm test
npm run test:e2e
```

`npm run test:e2e` uses Playwright to exercise the actual app at desktop, phone-portrait, and tablet-portrait sizes. It protects the behaviors most likely to be broken by aggressive visual reconstruction: launcher routing, Home, fullscreen controls, topic pickers, Missing Word generation/difficulty, Hangman keyboard/Solve/New Word, Random Letter generation, and page-level no-scroll behavior.

Semantic `data-ui` hooks are deliberately used by the browser suite where possible. Preserve those hooks even when a reskin completely changes layout or appearance. Do not make tests depend on decorative class names merely to satisfy a theme.

If a reskin intentionally changes a behavior contract, update the corresponding test deliberately. Do not weaken or delete a failing regression test simply because a new layout made the old selector inconvenient.

For first-time Playwright setup after cloning:

```bash
npm install
npx playwright install chromium
```

Failed Playwright runs retain traces/screenshots so layout and interaction regressions can be inspected rather than guessed at.
