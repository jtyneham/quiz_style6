import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile(new URL("../../package.json", import.meta.url), "utf8"));
const config = await readFile(new URL("../../playwright.config.js", import.meta.url), "utf8");

const specs = [
  "navigation.spec.js",
  "missing-word.spec.js",
  "hangman.spec.js",
  "random-letter.spec.js",
  "fullscreen.spec.js",
];

test("Playwright regression gate is wired into Quizbase", async () => {
  assert.match(packageJson.scripts["test:e2e"], /playwright test/);
  assert.match(packageJson.scripts["test:all"], /test:e2e/);
  assert.equal(typeof packageJson.devDependencies?.["@playwright/test"], "string");
  assert.match(config, /phone-portrait/);
  assert.match(config, /tablet-portrait/);
  assert.match(config, /desktop/);

  for (const spec of specs) {
    const source = await readFile(new URL(`../e2e/${spec}`, import.meta.url), "utf8");
    assert.match(source, /@playwright\/test/);
  }
});
