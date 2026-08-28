# Quizbase

Quizbase is the reusable functional base for five browser quiz games: Missing Word, Missing Word Pokémon, Hangman, Hangman Pokémon, and Random Letter. It is a static GitHub Pages app with modular game code/data, shared gameplay engines, a semantic reskin layer, and automated regression coverage.

## Development

PixiJS is installed for the Hangman artwork renderer and its browser module is
vendored in `vendor/` (including its MIT licence) so the static GitHub Pages
build works without a bundler.

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

The local preview server starts at `http://localhost:8000` by default. Set `PORT` to use another port.

## Tests

Fast Node unit/contract tests:

```bash
npm test
```

Real-browser Playwright regression tests across desktop, phone portrait, and tablet portrait:

```bash
npm run test:e2e
```

Run the complete gate:

```bash
npm run test:all
```

First-time Playwright setup requires:

```bash
npx playwright install chromium
```

The current fast gate contains **32 Node unit/contract tests**. Run the
Playwright suite in a normal local browser environment for end-to-end visual
coverage.

## Architecture

- `js/core/missing-word-engine.js` powers both Missing Word variants; its template, topic picker, and reel renderer live in dedicated core modules, while data/configuration remain separate.
- `js/core/hangman-engine.js` powers both Hangman variants; its shared topic picker is isolated in `js/core/hangman-topic-picker.js`, while data/configuration remain separate.
- `js/core/random-letter-ticker.js` owns the Random Letter Ideas ticker; generation animations remain in its game module.
- `js/core/*-logic.js` modules hold pure, testable gameplay logic.
- `js/games/` contains thin game-specific wrappers.
- `data/` contains game datasets.
- `css/theme.css` exposes inherited semantic `--qb-*` design tokens.
- Stable `data-ui` hooks provide presentation targets without coupling reskins to decorative class names.
- Shared Hangman structure lives in `css/hangman-shared.css`; game-specific styles remain separate entry points.

## Reskinning

`RESKINNING.md` is the visual-extension contract. Future skins may radically reconstruct the launcher and game presentation while preserving gameplay, responsive behavior, accessibility, semantic hooks, and automated regression contracts.

Do not fork shared gameplay engines for visual variants. Prefer semantic tokens, `data-ui` hooks, component presentation styles, and only then intentional markup changes when the target visual language requires them.

## Regression coverage

The browser suite exercises all five launcher routes, direct hash routes, Home navigation, fullscreen controls, Missing Word generation/difficulty/topic-picker flows, Hangman keyboard/Solve/New Word/topic-picker flows, Random Letter generation/Ideas behavior, and representative viewport overflow checks.

Failed Playwright runs write ignored traces/screenshots under `test-results/` for diagnosis.
