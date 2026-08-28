import { countLetters } from "./missing-word-utils.js";

/**
 * Owns Missing Word's Shadow DOM rendering and decorative reel lifecycle.
 * Game state, selection, and button state remain in missing-word-engine.js.
 */
export function createMissingWordRenderer({ wordDisplay }) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let activeReelAnimations = [];
  let finishGeneration = null;

  function slotFontSize(wordLength) {
    if (wordLength <= 4) return "clamp(4.6rem, 16vw, 8rem)";
    if (wordLength <= 7) return "clamp(3.4rem, 11vw, 6.2rem)";
    if (wordLength <= 10) return "clamp(2.65rem, 8vw, 4.8rem)";
    if (wordLength <= 14) return "clamp(2.1rem, 6vw, 3.7rem)";
    return "clamp(1.65rem, 4.8vw, 3rem)";
  }

  function shuffledAlphabet() {
    const letters = [...alphabet];

    for (let index = letters.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [letters[index], letters[randomIndex]] = [
        letters[randomIndex],
        letters[index]
      ];
    }

    return letters;
  }

  function createReelSequence(finalCharacter, slotIndex) {
    const sequence = [];
    const cycles = 4;

    for (let cycle = 0; cycle < cycles; cycle += 1) {
      const cycleLetters = shuffledAlphabet();
      const offset =
        (slotIndex * 5 + Math.floor(Math.random() * alphabet.length)) %
        alphabet.length;

      sequence.push(
        ...cycleLetters.slice(offset),
        ...cycleLetters.slice(0, offset)
      );
    }

    sequence.push(finalCharacter);
    return sequence;
  }

  function measureCharacterWidth(character, fontSize) {
    const measure = document.createElement("span");
    measure.className = "measure-character";
    measure.style.setProperty("--slot-size", fontSize);
    measure.style.fontSize = fontSize;
    measure.style.fontWeight = "700";
    measure.textContent = character;

    wordDisplay.appendChild(measure);
    const width = measure.getBoundingClientRect().width;
    measure.remove();
    return Math.max(Math.ceil(width), 10);
  }

  function renderStructuralSlot(slot, character) {
    slot.classList.add("structural");

    if (character === " ") {
      slot.classList.add("space");
    } else if (character === "-") {
      slot.classList.add("hyphen");
      slot.textContent = "–";
    } else {
      slot.textContent = character;
    }
  }

  function createSpinningSlots(word, mask) {
    wordDisplay.replaceChildren();
    wordDisplay.classList.remove("empty");

    const fontSize = slotFontSize(countLetters(word));

    return [...word].map((character, index) => {
      const slot = document.createElement("span");
      slot.className = "slot";
      slot.style.setProperty("--slot-size", fontSize);
      slot.style.fontSize = fontSize;

      if (!/[A-Z]/.test(character)) {
        renderStructuralSlot(slot, character);
        wordDisplay.appendChild(slot);
        return { reelStrip: null, finalIndex: null, isBlank: false, isStructural: true };
      }

      if (mask[index]) {
        slot.classList.add("blank");
        slot.style.width = "var(--blank-slot-width)";
        wordDisplay.appendChild(slot);
        return { reelStrip: null, finalIndex: null, isBlank: true, isStructural: false };
      }

      slot.style.width = `${measureCharacterWidth(character, fontSize)}px`;
      const reelWindow = document.createElement("span");
      reelWindow.className = "reel-window";
      const reelStrip = document.createElement("span");
      reelStrip.className = "reel-strip";
      const sequence = createReelSequence(character, index);

      sequence.forEach((reelCharacter) => {
        const cell = document.createElement("span");
        cell.className = "reel-cell";
        cell.textContent = reelCharacter;
        reelStrip.appendChild(cell);
      });

      reelWindow.appendChild(reelStrip);
      slot.appendChild(reelWindow);
      wordDisplay.appendChild(slot);
      return { reelStrip, finalIndex: sequence.length - 1, isBlank: false, isStructural: false };
    });
  }

  function renderMaskedWord(word, mask) {
    wordDisplay.replaceChildren();
    wordDisplay.classList.remove("empty");
    const fontSize = slotFontSize(countLetters(word));

    [...word].forEach((character, index) => {
      const slot = document.createElement("span");
      slot.className = "slot";
      slot.style.setProperty("--slot-size", fontSize);
      slot.style.fontSize = fontSize;

      if (!/[A-Z]/.test(character)) {
        renderStructuralSlot(slot, character);
      } else if (mask[index]) {
        slot.classList.add("blank");
        slot.style.width = "var(--blank-slot-width)";
      } else {
        slot.textContent = character;
        slot.classList.add("settled");
      }

      wordDisplay.appendChild(slot);
    });
  }

  function settleGeneration() {
    activeReelAnimations.forEach(({ reelStrip, finalOffset }) => {
      reelStrip.style.transition = "none";
      reelStrip.style.transform = `translateY(${finalOffset}em)`;
    });
    activeReelAnimations = [];
  }

  function cancelGeneration() {
    settleGeneration();
    finishGeneration?.();
  }

  async function animateNextWord(word, mask, duration) {
    let reels;
    try {
      reels = createSpinningSlots(word, mask);
    } catch (error) {
      console.error("Missing Word reel rendering failed; using static fallback.", error);
      renderMaskedWord(word, mask);
      return;
    }

    const cellHeight = 1.12;
    activeReelAnimations = reels
      .filter(({ isBlank, isStructural }) => !isBlank && !isStructural)
      .map(({ reelStrip, finalIndex }) => ({
        reelStrip,
        finalOffset: -(finalIndex * cellHeight)
      }));

    if (prefersReducedMotion || activeReelAnimations.length === 0) {
      settleGeneration();
      return;
    }

    await new Promise((resolve) => {
      let done = false;
      let timer = 0;
      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        settleGeneration();
        if (finishGeneration === finish) finishGeneration = null;
        resolve();
      };
      finishGeneration = finish;

      activeReelAnimations.forEach(({ reelStrip, finalOffset }, index) => {
        reelStrip.style.transition = `transform ${duration}ms cubic-bezier(0.10, 0.70, 0.14, 1)`;
        void reelStrip.offsetHeight;
        window.setTimeout(() => {
          if (!done && reelStrip.isConnected) {
            reelStrip.style.transform = `translateY(${finalOffset}em)`;
          }
        }, Math.min(index * 12, 72));
      });

      timer = window.setTimeout(finish, duration + 120);
    });
  }

  async function revealWord(word, duration) {
    const newlyRevealed = [];

    [...wordDisplay.querySelectorAll(".slot")].forEach((slot, index) => {
      if (!slot.classList.contains("blank")) return;

      slot.classList.remove("blank");
      slot.classList.add("revealed-fixed");
      const reelWindow = document.createElement("span");
      reelWindow.className = "reel-window";
      const reelStrip = document.createElement("span");
      reelStrip.className = "reel-strip";
      const cell = document.createElement("span");
      cell.className = "reel-cell";
      cell.textContent = word[index];
      reelStrip.appendChild(cell);
      reelWindow.appendChild(reelStrip);
      slot.replaceChildren(reelWindow);
      newlyRevealed.push(slot);
    });

    if (!prefersReducedMotion && newlyRevealed.length > 0) {
      void wordDisplay.offsetWidth;
      newlyRevealed.forEach((slot) => slot.classList.add("revealed"));
      await new Promise((resolve) => window.setTimeout(resolve, duration));
      newlyRevealed.forEach((slot) => slot.classList.remove("revealed"));
    }
  }

  return { animateNextWord, cancelGeneration, clearGeneration: cancelGeneration, renderMaskedWord, revealWord };
}
