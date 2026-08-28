import { bindFullscreenButton } from "./ui.js";
import { filterWordPool, weightedWordChoice, blankCountFor, wordLetterGroups, longestBlankRun, eachWordKeepsVisibleLetter } from "./missing-word-logic.js";
import { createMissingWordTopicPicker } from "./missing-word-topic-picker.js";
import { missingWordTemplate } from "./missing-word-template.js";
import { createMissingWordRenderer } from "./missing-word-renderer.js";
function initializeGame(root, app, config) {
    const { wordPool, topics: configuredTopics, screenId, topicMode = "general", initialTopics = ["General"] } = config;

    // Shared Missing Word engine. Game-specific data/topic behavior is injected by the wrapper.
    const GAME_CONFIG = {
      wordLength: {
        minLetters: 2,
        maxLetters: 20,
        maxWords: 3
      },

      masking: {
        profiles: {
          medium: {
            blankRatio: 0.42,
            preserveFirstChance: 0.72,
            preserveLastChance: 0.72,
            maxBlankRun: 2
          },
          hard: {
            blankRatio: 0.58,
            preserveFirstChance: 0.22,
            preserveLastChance: 0.22,
            maxBlankRun: 3
          }
        }
      },

      animation: {
        nextWordDuration: 1500,
        frameInterval: 55,
        revealDuration: 240
      },

      history: {
        recentWordLimit: 20
      },

      difficulty: {
        enabled: true,
        activeLevel: "mixed",
        mixedWeights: {
          medium: 0.65,
          hard: 0.35
        }
      }
    };

    

    const fullscreenButton = root.getElementById("fullscreenButton");
    const fullscreenIcon = root.getElementById("fullscreenIcon");
    const fullscreenLabel = root.getElementById("fullscreenLabel");
    const wordDisplay = root.getElementById("wordDisplay");
    const actionButton = root.getElementById("actionButton");
    const wordCard = root.getElementById("wordCard");
    const difficultyButtons = [
      ...root.querySelectorAll(".difficulty-control button")
    ];
    const TOPICS = configuredTopics;
    const topicPicker = createMissingWordTopicPicker({
      root,
      topics: TOPICS,
      mode: topicMode,
      initialTopics
    });

    const renderer = createMissingWordRenderer({ wordDisplay });
    const recentWords = [];
    const previousMasks = new Map();

    let gameState = "empty";
    let currentRoundDifficulty = "medium";
    let currentWord = "";
    let currentMask = [];
    let isAnimating = false;

    function pickRoundDifficulty() {
      if (GAME_CONFIG.difficulty.activeLevel !== "mixed") {
        return GAME_CONFIG.difficulty.activeLevel === 2
          ? "medium"
          : "hard";
      }

      return Math.random() < GAME_CONFIG.difficulty.mixedWeights.medium
        ? "medium"
        : "hard";
    }

    function filteredWordPool(roundDifficulty = currentRoundDifficulty) {
      const { selectedTopics, allTopicsMode } = topicPicker.getState();
      return filterWordPool({
        wordPool,
        roundDifficulty,
        gameConfig: GAME_CONFIG,
        recentWords,
        allTopicsMode,
        selectedTopics
      });
    }

    function chooseWord() {
      let pool = filteredWordPool(currentRoundDifficulty);

      if (pool.length === 0) {
        recentWords.splice(0, recentWords.length);
        pool = filteredWordPool(currentRoundDifficulty);
      }

      if (pool.length === 0) {
        return null;
      }

      const picked = weightedWordChoice(pool, currentRoundDifficulty);
      return picked.word.toUpperCase();
    }

    function createMask(word, roundDifficulty = currentRoundDifficulty) {
      const profile = GAME_CONFIG.masking.profiles[roundDifficulty];

      const letterIndexes = [...word]
        .map((character, index) => (
          /[A-Z]/.test(character) ? index : null
        ))
        .filter((index) => index !== null);

      const groups = wordLetterGroups(word);
      const desiredBlanks = blankCountFor(
        letterIndexes.length,
        profile
      );

      const firstLetterIndex = letterIndexes[0];
      const lastLetterIndex = letterIndexes[letterIndexes.length - 1];

      let bestChoice = [];
      let bestScore = -Infinity;

      // Generate many candidate masks and keep the best one.
      // This avoids predictable blank positions while enforcing difficulty rules.
      for (let attempt = 0; attempt < 80; attempt += 1) {
        const pool = [...letterIndexes];

        const filtered = pool.filter((index) => {
          if (
            index === firstLetterIndex &&
            Math.random() < profile.preserveFirstChance
          ) {
            return false;
          }

          if (
            index === lastLetterIndex &&
            Math.random() < profile.preserveLastChance
          ) {
            return false;
          }

          return true;
        });

        const candidates =
          filtered.length >= desiredBlanks ? filtered : pool;

        const chosen = [...candidates]
          .sort(() => Math.random() - 0.5)
          .slice(0, desiredBlanks);

        const chosenSet = new Set(chosen);

        if (!eachWordKeepsVisibleLetter(chosenSet, groups)) {
          continue;
        }

        const run = longestBlankRun(chosenSet, groups);

        if (run > profile.maxBlankRun) {
          continue;
        }

        const signature = [...chosen].sort((a, b) => a - b).join(",");
        const previous = previousMasks.get(word);

        let score = Math.random();

        if (signature !== previous) score += 2;

        // Medium tolerates some adjacency.
        if (roundDifficulty === "medium" && run === 2) {
          score += 0.25;
        }

        // Hard rewards less predictable masks and occasional blank clusters.
        if (roundDifficulty === "hard") {
          if (chosenSet.has(firstLetterIndex)) score += 0.35;
          if (chosenSet.has(lastLetterIndex)) score += 0.35;
          if (run >= 2) score += 0.45;
        }

        if (score > bestScore) {
          bestScore = score;
          bestChoice = [...chosen];
        }
      }

      // Safe fallback if all candidate masks were rejected.
      if (bestChoice.length === 0) {
        bestChoice = [...letterIndexes]
          .sort(() => Math.random() - 0.5)
          .slice(0, desiredBlanks);
      }

      bestChoice.sort((a, b) => a - b);
      previousMasks.set(word, bestChoice.join(","));

      const chosenSet = new Set(bestChoice);

      return [...word].map((character, index) =>
        /[A-Z]/.test(character) && chosenSet.has(index)
      );
    }

    function wait(milliseconds) {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }
    async function nextWord() {
      actionButton.classList.remove("reveal-mode");

      currentRoundDifficulty = pickRoundDifficulty();
      currentWord = chooseWord();

      if (!currentWord) {
        wordDisplay.replaceChildren();
        wordDisplay.classList.remove("empty");
        wordDisplay.textContent = "No matching words";
        gameState = "empty";
        actionButton.textContent = "Next Word";
        return;
      }

      currentMask = createMask(currentWord, currentRoundDifficulty);
      recentWords.push(currentWord.toLowerCase());
      while (recentWords.length > GAME_CONFIG.history.recentWordLimit) {
        recentWords.shift();
      }

      gameState = "generating";
      // The reel animation is decorative. A browser can interrupt its timing
      // during a page lifecycle change, so a round must never depend on the
      // animation promise alone to become playable.
      let animationSettled = false;
      const generation = renderer.animateNextWord(
        currentWord,
        currentMask,
        GAME_CONFIG.animation.nextWordDuration
      )
        .then(() => {
          animationSettled = true;
        })
        .catch((error) => {
          console.warn("Missing Word generation animation failed.", error);
        });

      await Promise.race([
        generation,
        wait(GAME_CONFIG.animation.nextWordDuration + 500)
      ]);

      if (!animationSettled) {
        renderer.cancelGeneration();
        renderer.renderMaskedWord(currentWord, currentMask);
      }

      gameState = "masked";
      actionButton.textContent = "Reveal";
      actionButton.classList.add("reveal-mode");
    }

    async function handleAction() {
      if (isAnimating) {
        if (gameState === "generating") renderer.cancelGeneration();
        return;
      }

      isAnimating = true;
      actionButton.classList.remove("press");
      void actionButton.offsetWidth;
      actionButton.classList.add("press");

      try {
        if (gameState === "masked") {
          actionButton.disabled = true;
          await renderer.revealWord(
            currentWord,
            GAME_CONFIG.animation.revealDuration
          );
          gameState = "revealed";
          actionButton.textContent = "Next Word";
          actionButton.classList.remove("reveal-mode");
        } else {
          actionButton.disabled = false;
          actionButton.classList.add("generating");
          await nextWord();
        }
      } catch (error) {
        console.error("Missing Word action failed.", error);
        // Never leave the game visually or logically locked. If a word was
        // already selected, show the playable masked round without animation.
        if (currentWord && currentMask.length) {
          renderer.renderMaskedWord(currentWord, currentMask);
          gameState = "masked";
          actionButton.textContent = "Reveal";
          actionButton.classList.add("reveal-mode");
        } else {
          gameState = "empty";
          actionButton.textContent = "Next Word";
        }
      } finally {
        renderer.clearGeneration();
        actionButton.classList.remove("generating", "press");
        actionButton.disabled = false;
        isAnimating = false;
      }
    }

    function setDifficulty(level) {
      GAME_CONFIG.difficulty.activeLevel =
        level === "mixed" ? "mixed" : Number(level);

      difficultyButtons.forEach((button) => {
        const active = button.dataset.level === String(level);
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }

    difficultyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setDifficulty(button.dataset.level);
      });
    });

    bindFullscreenButton({ button: fullscreenButton, icon: fullscreenIcon, label: fullscreenLabel, app });

    root.getElementById("homeButton").addEventListener("click", () => {
      app.haptic(12);
      topicPicker.close();
      app.showHome();
    });


    actionButton.addEventListener("click", handleAction);

    wordCard.addEventListener("click", () => {
      handleAction();
    });

    wordCard.addEventListener("keydown", (event) => {
      if (event.code === "Enter" || event.code === "Space") {
        event.preventDefault();
        handleAction();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (!app.isScreenActive(screenId)) return;
      if (
        event.code === "Space" &&
        event.target.tagName !== "BUTTON"
      ) {
        event.preventDefault();
        handleAction();
      }
    });

  
}

export function registerMissingWordGame({
  app,
  elementName,
  stylesheet,
  screenId,
  wordPool,
  topics,
  initialTopics = ["General"],
  topicMode = "general"
}) {
  if (customElements.get(elementName)) return;

  class QuizMissingWordGame extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({mode:"open"});
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = stylesheet;
      const wrapper = document.createElement("div");
      wrapper.innerHTML = missingWordTemplate;
      root.append(link, wrapper);
      initializeGame(root, app, { wordPool, topics, screenId, initialTopics, topicMode });
    }
  }

  customElements.define(elementName, QuizMissingWordGame);
}
