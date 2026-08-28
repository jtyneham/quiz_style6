import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

const routes = [
  ["random-letter", "rnglScreen"],
  ["missing-word", "missingWordScreen"],
  ["missing-word-pokemon", "missingWordPokemonScreen"],
  ["hangman", "hangmanScreen"],
  ["hangman-pokemon", "hangmanPokemonScreen"]
];

test("all five game screens are present in the app shell", async () => {
  const html = await read("index.html");
  for (const [, screenId] of routes) assert.match(html, new RegExp(`id=["']${screenId}["']`));
});

test("all five route hashes are represented by app screen names", async () => {
  const app = await read("js/app.js");
  for (const [route] of routes) {
    assert.match(app, new RegExp(`"#${route}"`));
  }
  assert.match(app, /void navigate\(routeFromHash\(\), \{ updateHistory: false \}\)/);
});

test("every game exposes Home navigation directly or through its shared engine", async () => {
  const rngl = await read("js/games/rngl.js");
  assert.match(rngl, /showHome\(\)/, "Random Letter should call the shared Home API");

  const missingWordEngine = await read("js/core/missing-word-engine.js");
  assert.match(missingWordEngine, /showHome\(\)/, "shared Missing Word engine should call the Home API");
  for (const path of ["js/games/missing-word.js", "js/games/missing-word-pokemon.js"]) {
    const source = await read(path);
    assert.match(source, /registerMissingWordGame/, `${path} should register through the shared engine`);
  }

  const hangmanEngine = await read("js/core/hangman-engine.js");
  assert.match(hangmanEngine, /showHome\(\)/, "shared Hangman engine should call the Home API");
  for (const path of ["js/games/hangman.js", "js/games/hangman-pokemon.js"]) {
    const source = await read(path);
    assert.match(source, /defineHangmanElement/, `${path} should register through the shared engine`);
  }
});

test("shared utility assets exist", async () => {
  for (const path of ["assets/home.svg", "assets/fullscreen.svg", "assets/fullscreen-exit.svg"]) {
    assert.ok((await read(path)).includes("<svg"), `${path} should be a valid SVG asset`);
  }
});
