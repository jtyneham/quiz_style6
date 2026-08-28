import { expect } from "@playwright/test";

export const games = [
  { name: "Missing Word", screen: "missingWordScreen", hash: "#missingword" },
  { name: "Missing Word - Pokemon", screen: "missingWordPokemonScreen", hash: "#missingwordpokemon" },
  { name: "Hangman", screen: "hangmanScreen", hash: "#hangman" },
  { name: "Hangman - Pokemon", screen: "hangmanPokemonScreen", hash: "#hangmanpokemon" },
  { name: "Random Letter", screen: "rnglScreen", hash: "#rngl" },
];

export async function openGame(page, game) {
  const canonicalGame = games.find(candidate =>
    candidate.name === game.name || candidate.screen === game.screen
  );
  if (!canonicalGame) {
    throw new Error(`Unknown Quizbase game: ${game.name ?? game.screen ?? "(unnamed)"}`);
  }

  await page.goto("/");
  await page.getByRole("button", { name: canonicalGame.name, exact: true }).click();
  const screen = page.locator(`#${canonicalGame.screen}`);
  await expect(screen).toHaveClass(/active/);
  await expect(page).toHaveURL(new RegExp(`${canonicalGame.hash}$`));
  await expect(screen.locator('[data-ui="game-root"]')).toBeVisible();
  return screen;
}

export async function assertNoPageOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
  }));
  expect(dimensions.width, "page should not overflow horizontally").toBeLessThanOrEqual(dimensions.clientWidth + 1);
  expect(dimensions.height, "page should not overflow vertically").toBeLessThanOrEqual(dimensions.clientHeight + 1);
}
