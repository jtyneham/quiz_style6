import { chooseRandom, countLetters, countWords } from "./missing-word-utils.js";

export function wordAllowedForRound(entry, roundDifficulty, difficultyEnabled = true) {
  if (!difficultyEnabled) return true;
  if (roundDifficulty === "medium") return entry.difficulty <= 2;
  return entry.difficulty <= 3;
}

export function filterWordPool({
  wordPool,
  roundDifficulty,
  gameConfig,
  recentWords,
  allTopicsMode,
  selectedTopics
}) {
  return wordPool.filter((entry) => {
    const normalized = entry.word.toLowerCase();
    const letterCount = countLetters(normalized);
    const validLength =
      letterCount >= gameConfig.wordLength.minLetters &&
      letterCount <= gameConfig.wordLength.maxLetters &&
      countWords(normalized) <= gameConfig.wordLength.maxWords;
    const notRecent = !recentWords.includes(normalized);
    const allowedByDifficulty = wordAllowedForRound(
      entry,
      roundDifficulty,
      gameConfig.difficulty.enabled
    );
    const allowedByTopic =
      allTopicsMode || entry.topics.some((topic) => selectedTopics.has(topic));
    return validLength && notRecent && allowedByDifficulty && allowedByTopic;
  });
}

export function weightedWordChoice(pool, roundDifficulty, random = Math.random) {
  if (pool.length === 0) return null;
  const weightsByRound = {
    medium: { 1: 0.45, 2: 0.55, 3: 0 },
    hard: { 1: 0.20, 2: 0.45, 3: 0.35 }
  };
  const weights = weightsByRound[roundDifficulty];
  const weighted = pool.map((entry) => ({ entry, weight: weights[entry.difficulty] || 0 }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return chooseRandom(pool);
  let roll = random() * total;
  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) return item.entry;
  }
  return weighted[weighted.length - 1].entry;
}

export function blankCountFor(length, profile) {
  const target = Math.round(length * profile.blankRatio);
  return Math.max(1, Math.min(target, Math.max(1, length - 1)));
}

export function wordLetterGroups(word) {
  const groups = [];
  let current = [];
  [...word].forEach((character, index) => {
    if (/[A-Z]/.test(character)) current.push(index);
    else if (current.length > 0) {
      groups.push(current);
      current = [];
    }
  });
  if (current.length > 0) groups.push(current);
  return groups;
}

export function longestBlankRun(chosenSet, groups) {
  let longest = 0;
  groups.forEach((group) => {
    let run = 0;
    group.forEach((index) => {
      if (chosenSet.has(index)) {
        run += 1;
        longest = Math.max(longest, run);
      } else run = 0;
    });
  });
  return longest;
}

export function eachWordKeepsVisibleLetter(chosenSet, groups) {
  return groups.every((group) => group.some((index) => !chosenSet.has(index)));
}
