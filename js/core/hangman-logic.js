export function normalizePlayableChar(ch) {
  const base = (ch || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  return /^[A-Z]$/.test(base) ? base : "";
}

export function normalizePlayableAnswer(value) {
  return [...String(value || "")].map(ch => normalizePlayableChar(ch) || ch).join("");
}

export function uniquePlayableLetters(value) {
  return [...new Set([...String(value || "")].map(normalizePlayableChar).filter(Boolean))];
}

export function isSolved(answer, guessed) {
  return uniquePlayableLetters(answer).every(letter => guessed.has(letter));
}

export function isCorrectGuess(answer, letter) {
  return normalizePlayableAnswer(answer).includes(String(letter || "").toUpperCase());
}

export function normalizeSolveAttempt(value) {
  return normalizePlayableAnswer(String(value || "").trim().replace(/\s+/g, " ").toUpperCase());
}

export function pickDifferent(pool, previous, getAnswer = value => value) {
  if (!pool.length) return "";
  let index = Math.floor(Math.random() * pool.length);
  let next = getAnswer(pool[index]);
  if (pool.length > 1 && next === previous) {
    index = (index + 1) % pool.length;
    next = getAnswer(pool[index]);
  }
  return next;
}
