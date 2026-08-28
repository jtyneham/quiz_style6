import { POKEMON_WORDS } from "../../data/missing-word-pokemon-words.js";
import { POKEMON_TOPICS } from "../core/pokemon-topics.js";
import { defineHangmanElement } from "../core/hangman-engine.js";

export function registerHangmanPokemon(app) {
  defineHangmanElement({
    tagName: "quiz-hangman-pokemon",
    stylesheet: "css/hangman-pokemon.css",
    app,
    config: {
      topics: POKEMON_TOPICS,
      randomMode: false,
      initialTopics: ["Pokemon All Names"],
      getAnswer: entry => entry.word.toUpperCase(),
      getPool: ({ selectedTopics }) => POKEMON_WORDS.filter(entry =>
        entry.topics.some(topic => selectedTopics.has(topic))
      ),
    },
  });
}
