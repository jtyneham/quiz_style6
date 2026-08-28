import { WORDS } from "../../data/missing-word-words.js";
import { registerMissingWordGame } from "../core/missing-word-engine.js";

const TOPICS = ["General", "Animals", "Food & Drink", "Geography", "Nature", "Space", "Science", "Human Body", "Medicine", "History", "Mythology", "Sports", "Games", "Video Games", "Pokemon", "Movies & TV", "Music", "Books & Literature", "People & Professions", "IT & Technology", "Vehicles", "Household", "Clothing", "Tools", "Buildings & Places", "Everyday Objects", "Brands", "Nouns", "Verbs", "Adjectives"];

export function registerMissingWord(app) {
  registerMissingWordGame({
    app,
    elementName: "quiz-missing-word",
    stylesheet: "css/missing-word.css",
    screenId: "missingword",
    wordPool: WORDS,
    topics: TOPICS,
    initialTopics: ["General"],
    topicMode: "general"
  });
}
