import { GAME_DATABASE, RANDOM_POOL } from "../../data/hangman-words.js";
import { defineHangmanElement } from "../core/hangman-engine.js";

export function registerHangman(app) {
  const topics = [...new Set(GAME_DATABASE.map(entry => entry.category))];
  const randomAnswers = new Set(RANDOM_POOL);

  defineHangmanElement({
    tagName: "quiz-hangman",
    stylesheet: "css/hangman.css",
    app,
    config: {
      topics,
      randomMode: true,
      initialTopics: [],
      getAnswer: entry => entry.answer,
      getPool: ({ selectedTopics, randomMode }) => randomMode
        ? GAME_DATABASE.filter(entry => randomAnswers.has(entry.answer))
        : GAME_DATABASE.filter(entry => selectedTopics.has(entry.category)),
    },
  });
}
