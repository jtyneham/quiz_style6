import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("both Hangman variants use the shared topic picker module", async () => {
  const [engine, picker] = await Promise.all([
    read("js/core/hangman-engine.js"),
    read("js/core/hangman-topic-picker.js")
  ]);

  assert.match(engine, /createHangmanTopicPicker/);
  assert.match(picker, /bindOutsideDismiss/);
  assert.match(picker, /onApply\?\.\(getState\(\)\)/);
  assert.match(picker, /topicsOverlay/);
});
