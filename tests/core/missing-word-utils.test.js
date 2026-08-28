import test from "node:test";
import assert from "node:assert/strict";
import { randomInteger, chooseRandom, countLetters, countWords } from "../../js/core/missing-word-utils.js";

test("countLetters ignores spaces and punctuation", () => {
  assert.equal(countLetters("A p-p!le"), 5);
});

test("countWords handles surrounding and repeated whitespace", () => {
  assert.equal(countWords("  two   words\nthree "), 3);
});

test("randomInteger stays within its exclusive upper bound", () => {
  for (let i = 0; i < 100; i += 1) {
    const value = randomInteger(4);
    assert.ok(value >= 0 && value < 4);
  }
});

test("chooseRandom returns an item from the supplied list", () => {
  assert.ok(["a", "b", "c"].includes(chooseRandom(["a", "b", "c"])));
});
