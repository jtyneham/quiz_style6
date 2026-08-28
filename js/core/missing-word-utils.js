/** Pure helpers shared by the standard and Pokémon Missing Word games. */
export function randomInteger(maximum) {
  return Math.floor(Math.random() * maximum);
}

export function chooseRandom(items) {
  return items[randomInteger(items.length)];
}

export function countLetters(value) {
  return [...value].filter((character) => /[A-Za-z]/.test(character)).length;
}

export function countWords(value) {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}
