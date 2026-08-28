import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("semantic theme stylesheet loads before component styles", async () => {
  const html = await read("index.html");
  const theme = html.indexOf('href="css/theme.css"');
  const app = html.indexOf('href="css/app.css"');
  const rngl = html.indexOf('href="css/rngl.css"');
  assert.ok(theme >= 0);
  assert.ok(theme < app);
  assert.ok(theme < rngl);
});

test("theme exposes core cross-component tokens", async () => {
  const css = await read("css/theme.css");
  for (const token of [
    "--qb-font-family",
    "--qb-color-page",
    "--qb-color-surface",
    "--qb-color-text",
    "--qb-color-accent",
    "--qb-color-success",
    "--qb-color-danger",
    "--qb-radius-card",
    "--qb-shadow-card",
    "--qb-motion-normal",
    "--qb-keyboard-bg",
    "--qb-ticker-bg",
    "--qb-hangman-figure",
  ]) assert.match(css, new RegExp(token));
});

test("Shadow DOM component styles consume inherited theme tokens", async () => {
  const [mw, hangman] = await Promise.all([
    read("css/missing-word.css"),
    read("css/hangman-shared.css"),
  ]);
  assert.match(mw, /var\(--qb-color-page\)/);
  assert.match(mw, /var\(--qb-color-accent\)/);
  assert.match(hangman, /var\(--qb-color-game-page\)/);
  assert.match(hangman, /var\(--qb-keyboard-bg\)/);
});

test("major app and game roles expose semantic data-ui hooks", async () => {
  const [html, mwEngine, mwTemplate, hangmanEngine] = await Promise.all([
    read("index.html"),
    read("js/core/missing-word-engine.js"),
    read("js/core/missing-word-template.js"),
    read("js/core/hangman-engine.js"),
  ]);
  for (const hook of ["app-shell", "game-launch", "game-root", "home-action", "fullscreen-action", "primary-action"]) {
    assert.ok(`${html}\n${mwEngine}\n${mwTemplate}\n${hangmanEngine}`.includes(`data-ui="${hook}"`), hook);
  }
  assert.match(mwTemplate, /data-ui="topic-picker"/);
  assert.match(hangmanEngine, /data-ui="game-keyboard"/);
  assert.match(hangmanEngine, /data-ui="answer-display"/);
});
