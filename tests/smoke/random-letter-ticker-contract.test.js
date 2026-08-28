import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("Random Letter delegates its Ideas ticker to a shared module", async () => {
  const [game, ticker] = await Promise.all([
    read("js/games/rngl.js"),
    read("js/core/random-letter-ticker.js")
  ]);

  assert.match(game, /createRandomLetterTicker\(\{ root, topics \}\)/);
  assert.match(ticker, /requestAnimationFrame\(animate\)/);
  assert.match(ticker, /window\.addEventListener\("resize", measure\)/);
});
