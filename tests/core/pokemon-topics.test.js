import test from "node:test";
import assert from "node:assert/strict";
import { POKEMON_TOPICS } from "../../js/core/pokemon-topics.js";

test("Pokémon topics use the documented ordering", () => {
  assert.deepEqual(POKEMON_TOPICS.slice(0, 14), [
    "Pokemon All Names", "Gen 1", "Gen 2", "Gen 3", "Gen 4", "Gen 5", "Gen 6", "Gen 7", "Gen 8", "Gen 9",
    "Final Evolutions", "Moves + Abilities", "Moves", "Abilities"
  ]);
});
