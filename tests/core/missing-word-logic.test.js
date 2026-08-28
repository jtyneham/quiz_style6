import test from "node:test";
import assert from "node:assert/strict";
import {
  filterWordPool,
  weightedWordChoice,
  blankCountFor,
  wordLetterGroups,
  longestBlankRun,
  eachWordKeepsVisibleLetter
} from "../../js/core/missing-word-logic.js";

const gameConfig = {
  wordLength: { minLetters: 2, maxLetters: 20, maxWords: 3 },
  difficulty: { enabled: true }
};

const pool = [
  { word: "cat", difficulty: 1, topics: ["Animals"] },
  { word: "blue whale", difficulty: 2, topics: ["Animals"] },
  { word: "quasar", difficulty: 3, topics: ["Space"] },
  { word: "a", difficulty: 1, topics: ["General"] }
];

test("word filtering preserves topic, difficulty, length and recent-word contracts", () => {
  const result = filterWordPool({
    wordPool: pool,
    roundDifficulty: "medium",
    gameConfig,
    recentWords: ["cat"],
    allTopicsMode: false,
    selectedTopics: new Set(["Animals"])
  });
  assert.deepEqual(result.map((entry) => entry.word), ["blue whale"]);
});

test("all-topics mode bypasses topic filtering but not difficulty", () => {
  const result = filterWordPool({
    wordPool: pool,
    roundDifficulty: "medium",
    gameConfig,
    recentWords: [],
    allTopicsMode: true,
    selectedTopics: new Set()
  });
  assert.deepEqual(result.map((entry) => entry.word), ["cat", "blue whale"]);
});

test("weighted selection honors deterministic roll boundaries", () => {
  const choices = [
    { word: "easy", difficulty: 1 },
    { word: "medium", difficulty: 2 }
  ];
  assert.equal(weightedWordChoice(choices, "medium", () => 0).word, "easy");
  assert.equal(weightedWordChoice(choices, "medium", () => 0.99).word, "medium");
});

test("mask helpers preserve at least one visible letter per word", () => {
  const groups = wordLetterGroups("BLUE WHALE");
  assert.deepEqual(groups, [[0,1,2,3],[5,6,7,8,9]]);
  const valid = new Set([1,2,6,7]);
  assert.equal(eachWordKeepsVisibleLetter(valid, groups), true);
  assert.equal(longestBlankRun(valid, groups), 2);
  const invalid = new Set([0,1,2,3]);
  assert.equal(eachWordKeepsVisibleLetter(invalid, groups), false);
});

test("blank count respects ratio while never blanking every letter", () => {
  assert.equal(blankCountFor(10, { blankRatio: 0.42 }), 4);
  assert.equal(blankCountFor(2, { blankRatio: 1 }), 1);
});
