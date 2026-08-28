# Quizbase — Project Handoff

## Status

Quizbase v1 is the frozen functional/reskin baseline for five games: Missing Word, Missing Word Pokémon, Hangman, Hangman Pokémon, and Random Letter. The goal is no longer speculative base refactoring. Future changes should be driven by a concrete defect, gameplay requirement, or friction discovered during an actual reskin.

The validated baseline is **30/30 Node tests + 57/57 Playwright browser tests** across desktop, phone portrait, and tablet portrait.

## Architecture

- `index.html` contains the launcher and five live game hosts. The obsolete integration placeholder has been removed.
- `js/app.js` owns launcher routing, lazy game registration, Home navigation, haptics, and shared fullscreen service wiring.
- `js/core/missing-word-engine.js` is the shared Missing Word controller; `missing-word-logic.js` contains pure selection/masking logic.
- `js/core/hangman-engine.js` is the shared Hangman controller; `hangman-logic.js` contains pure answer/guess logic.
- `js/games/` contains thin variant configuration wrappers rather than duplicated engines.
- Pokémon topic ordering/filtering is centralized in `js/core/pokemon-topics.js`.
- Shared device/fullscreen behavior lives in `js/core/device.js`; shared UI behavior lives in `js/core/ui.js`.
- Game datasets remain under `data/`.

## Reskin contract

`css/theme.css` defines inherited semantic `--qb-*` tokens for reusable visual decisions. Major UI roles expose stable `data-ui` hooks. These are the preferred extension points because four game components use Shadow DOM and global selectors cannot style their internals directly.

The current layout is not sacred. A reskin may radically reconstruct composition and presentation. Preserve gameplay behavior, data semantics, responsive usability, accessibility, interaction feedback, semantic hooks used by tests, and the shared-engine boundary.

See `RESKINNING.md` for the complete visual workflow and regression checklist.

## Important behavior contracts

- Missing Word siblings share one engine but retain separate datasets/topic configuration.
- Hangman siblings share one engine but retain separate datasets/topic configuration and visual entry points.
- Hangman New Word uses a two-click in-button confirmation: `New Word` -> `New Word?` -> reset.
- Hangman Solve mode uses the `solve-ui open` state.
- Hangman answer slots use `.letter-slot`; multiline answers must remain fully visible.
- Random Letter's Ideas checkbox is operated through its visible control/label; the checkbox input itself is intentionally non-pointer-interactive.
- Topic pickers must support Apply/Cancel and outside-dismiss without the opening click immediately closing them.
- Existing animation/transition behavior is product behavior unless a task explicitly changes it.

## Testing

First-time setup:

```bash
npm install
npx playwright install chromium
```

Normal development gate:

```bash
npm run test:all
```

Useful narrower commands:

```bash
npm test
npm run test:e2e
npm run test:e2e:desktop
```

Do not weaken a failing regression merely to make a reskin pass. Determine whether the failure is a real product regression or an obsolete test assumption, then fix the correct side.

## Historical lessons retained

The most expensive bugs in earlier versions came from visual/refactor work silently breaking interaction behavior: Home navigation, Hangman Pokémon New Word, topic-picker lifecycle, responsive Hangman answer visibility, and stale test selectors. Shared engines and browser-level tests now exist specifically to prevent those regressions from being rediscovered manually.

Mobile/tablet behavior must be validated independently rather than inferred from a resized desktop window. Maintain readable contrast and prevent controls, fullscreen actions, answer areas, and keyboards from overlapping at constrained viewports.

## Freeze rule

Treat this v1 state as the known-good master base. For a new visual language, clone/fork this baseline, implement the reskin, then run `npm run test:all`. Further Quizbase-core refactoring should happen only when an actual use case demonstrates that the current extension points are insufficient.


## Missing Word root-cause repair

The shared Missing Word refactor accidentally dropped the `countLetters` import
while the renderer still called `countLetters(...)`. The click handler therefore
entered its pressed/generating visual state and then threw a `ReferenceError` as
soon as it attempted to render a generated word. Both Missing Word variants
failed because both use the same shared engine.

Playwright had also been configured with `reuseExistingServer: true`. If an older
Quizbase preview was already listening on port 8000, Playwright could silently
test that stale server instead of the current repository. It is now false. If
port 8000 is occupied, stop the old preview before running the E2E suite.
