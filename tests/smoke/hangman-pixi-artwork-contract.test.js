import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const artworkPath = new URL("../../js/core/hangman-artwork.js", import.meta.url);
const templatePath = new URL("../../js/core/hangman-engine.js", import.meta.url);

test("Hangman artwork keeps its six-stage Pixi renderer contract", async () => {
  const [artwork, template] = await Promise.all([
    readFile(artworkPath, "utf8"),
    readFile(templatePath, "utf8"),
  ]);

  assert.match(artwork, /from "pixi\.js"/);
  assert.match(artwork, /const LIMBS = \[/);
  assert.match(artwork, /DEATH_EYES_DELAY_MS/);
  assert.match(artwork, /return \{\s*reset\(\)/);
  assert.match(artwork, /render\(nextMisses\)/);
  assert.match(template, /id="hangmanPixiStage"/);
});
