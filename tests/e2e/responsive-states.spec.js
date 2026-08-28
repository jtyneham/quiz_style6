import { test, expect } from "@playwright/test";
import { assertNoPageOverflow, openGame } from "./helpers.js";

const hangmanVariants = [
  { name: "Hangman", screen: "hangmanScreen" },
  { name: "Hangman - Pokemon", screen: "hangmanPokemonScreen" }
];

const missingWordVariants = [
  { name: "Missing Word", screen: "missingWordScreen" },
  { name: "Missing Word - Pokemon", screen: "missingWordPokemonScreen" }
];

for (const variant of hangmanVariants) {
  test(`${variant.name} keeps the solve state and topic sheet inside the viewport`, async ({ page }) => {
    const screen = await openGame(page, variant);
    const slots = screen.locator("#slots");

    await expect(slots.locator(".letter-slot").first()).toBeVisible();
    await assertNoPageOverflow(page);

    await screen.locator("#solveBtn").click();
    await expect(screen.locator("#solveUi")).toHaveClass(/open/);
    await expect(screen.locator('[data-ui="game-keyboard"]')).toBeVisible();
    await assertNoPageOverflow(page);

    await screen.locator("#solveCancelBtn").click();
    await screen.locator('[data-ui="topic-picker-trigger"]').click();
    await expect(screen.locator('[data-ui="overlay"]')).toHaveAttribute("aria-hidden", "false");
    await assertNoPageOverflow(page);
  });
}

for (const variant of missingWordVariants) {
  test(`${variant.name} keeps generated slots and its topic panel inside the viewport`, async ({ page }) => {
    const screen = await openGame(page, variant);
    const action = screen.locator('[data-ui="primary-action"]');

    await action.click();
    await expect(action).toHaveText("Reveal", { timeout: 4_000 });
    await expect(screen.locator("#wordDisplay .slot").first()).toBeVisible();
    await assertNoPageOverflow(page);

    const trigger = screen.locator('[data-ui="topic-picker-trigger"]');
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await assertNoPageOverflow(page);
  });
}

test("Random Letter remains contained while Ideas is open", async ({ page }) => {
  const screen = await openGame(page, { name: "Random Letter", screen: "rnglScreen" });
  await screen.locator(".ideas-control").click();
  await expect(screen.locator("#ideasToggle")).toBeChecked();
  await assertNoPageOverflow(page);
});
