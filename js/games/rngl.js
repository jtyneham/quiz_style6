import { topics } from "../../data/rngl-topics.js";
import { bindFullscreenButton } from "../core/ui.js";
import { createRandomLetterTicker } from "../core/random-letter-ticker.js";

let initialized = false;

export function initRandomLetter(root, app) {
  if (initialized) return;
  initialized = true;


    const regularLetters = "ABCDEFGHIJKLMNOPRSTUVW".split("");
    const rareLetters = ["Q", "X", "Y", "Z"];

    // Every regular letter has weight 2.
    // Q, X, Y and Z have weight 1.
    const weightedLetters = [
      ...regularLetters,
      ...regularLetters,
      ...rareLetters
    ];

    const ANIMATION = {
      reveal: 1150,
      pop: 360,
      flipCount: 5,
      tunnelPasses: 5,
      wheelTurns: 5,
      wheelHold: 110,
      wheelTravel: 300
    };

    const REVEAL_ANIMATIONS = [
      "slot",
      "multiFlip",
      "zoomTunnel",
      "letterWheel"
    ];

    

    const letterElement = root.querySelector("#letter");
    const letterCard = root.querySelector("#letterCard");
    const generateButton = root.querySelector("#generateButton");

    const tunnelLayer = root.querySelector("#tunnelLayer");
    const wheelScene = root.querySelector("#wheelScene");
    const wheelLayout = root.querySelector("#wheelLayout");
    const wheelVisual = root.querySelector("#wheelVisual");
    const wheelSpinner = root.querySelector("#wheelSpinner");
    const wheelWinner = root.querySelector("#wheelWinner");

    const fullscreenButton = root.querySelector("#fullscreenButton");
    const fullscreenIcon = root.querySelector("#fullscreenIcon");
    const fullscreenLabel = root.querySelector("#fullscreenLabel");

    const ideasToggle = root.querySelector("#ideasToggle");
    const tickerShell = root.querySelector("#tickerShell");

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let isGenerating = false;
    let wheelRotation = 0;

    function randomWeightedLetter() {
      return weightedLetters[
        Math.floor(Math.random() * weightedLetters.length)
      ];
    }

    function randomDisplayLetter() {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    function wait(milliseconds) {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    function randomRevealAnimation() {
      return REVEAL_ANIMATIONS[
        Math.floor(Math.random() * REVEAL_ANIMATIONS.length)
      ];
    }

    function polar(cx, cy, radius, angleDegrees) {
      const angle = (angleDegrees - 90) * Math.PI / 180;

      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    }

    function wedgePath(cx, cy, radius, startDegrees, endDegrees) {
      const start = polar(cx, cy, radius, endDegrees);
      const end = polar(cx, cy, radius, startDegrees);
      const largeArc = endDegrees - startDegrees <= 180 ? 0 : 1;

      return [
        `M ${cx} ${cy}`,
        `L ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
        "Z"
      ].join(" ");
    }

    function buildLetterWheel() {
      const namespace = "http://www.w3.org/2000/svg";
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const segment = 360 / alphabet.length;

      wheelSpinner.replaceChildren();

      alphabet.split("").forEach((character, index) => {
        const start = index * segment - segment / 2;
        const end = start + segment;

        const wedge = document.createElementNS(namespace, "path");
        wedge.setAttribute(
          "d",
          wedgePath(150, 150, 138, start, end)
        );
        wedge.setAttribute(
          "fill",
          index % 2 === 0 ? "#edf1f5" : "#dfe5ec"
        );
        wedge.setAttribute("stroke", "#ffffff");
        wedge.setAttribute("stroke-width", "1.4");
        wheelSpinner.appendChild(wedge);

        const angle = index * segment;
        const point = polar(150, 150, 108, angle);

        const text = document.createElementNS(namespace, "text");
        text.setAttribute("x", point.x);
        text.setAttribute("y", point.y);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "#26303d");
        text.setAttribute("font-size", "14");
        text.setAttribute("font-weight", "800");
        text.setAttribute(
          "font-family",
          "Inter, system-ui, sans-serif"
        );
        text.setAttribute(
          "transform",
          `rotate(${angle} ${point.x} ${point.y})`
        );
        text.textContent = character;
        wheelSpinner.appendChild(text);
      });

      const rim = document.createElementNS(namespace, "circle");
      rim.setAttribute("cx", "150");
      rim.setAttribute("cy", "150");
      rim.setAttribute("r", "138");
      rim.setAttribute("fill", "none");
      rim.setAttribute("stroke", "#cfd7e1");
      rim.setAttribute("stroke-width", "3");
      wheelSpinner.appendChild(rim);
    }

    function resetRevealVisuals() {
      letterElement.hidden = false;
      letterElement.className = "letter";
      letterElement.style.transform = "";
      letterElement.style.opacity = "";

      tunnelLayer.className = "tunnel-layer";
      tunnelLayer.textContent = "";

      wheelScene.classList.remove("visible");
      wheelScene.setAttribute("aria-hidden", "true");
      wheelVisual.classList.remove("greyed");

      wheelWinner.style.display = "none";
      wheelWinner.textContent = "";
      wheelWinner.getAnimations().forEach((animation) => {
        animation.cancel();
      });

      wheelSpinner.getAnimations().forEach((animation) => {
        animation.cancel();
      });
      wheelSpinner.style.transform = `rotate(${wheelRotation}deg)`;
    }

    async function playFinalPop(finalLetter) {
      letterElement.hidden = false;
      letterElement.textContent = finalLetter;
      letterElement.classList.remove("pop");
      void letterElement.offsetWidth;
      letterElement.classList.add("pop");
      await wait(ANIMATION.pop);
      letterElement.classList.remove("pop");
    }

    async function playSlotMachine(finalLetter) {
      const delays = [
        45, 45, 50, 55, 60, 70, 80, 95, 115, 140, 175, 220
      ];

      for (const delay of delays) {
        letterElement.textContent = randomDisplayLetter();
        await wait(delay);
      }

      await playFinalPop(finalLetter);
    }

    async function playMultiFlip(finalLetter) {
      const stepTime = ANIMATION.reveal / ANIMATION.flipCount;

      for (let index = 0; index < ANIMATION.flipCount; index += 1) {
        letterElement.className = "letter";
        void letterElement.offsetWidth;
        letterElement.classList.add("flip-step");

        await wait(stepTime * 0.5);

        letterElement.textContent =
          index === ANIMATION.flipCount - 1
            ? randomDisplayLetter()
            : randomDisplayLetter();

        await wait(stepTime * 0.5);
      }

      letterElement.classList.remove("flip-step");
      await playFinalPop(finalLetter);
    }

    async function playZoomTunnel(finalLetter) {
      const passTime =
        ANIMATION.reveal / ANIMATION.tunnelPasses;

      letterElement.hidden = true;

      for (
        let index = 0;
        index < ANIMATION.tunnelPasses;
        index += 1
      ) {
        tunnelLayer.textContent = randomDisplayLetter();
        tunnelLayer.className = "tunnel-layer";
        void tunnelLayer.offsetWidth;
        tunnelLayer.classList.add("tunnel-run");
        await wait(passTime);
      }

      tunnelLayer.className = "tunnel-layer";
      await playFinalPop(finalLetter);
    }

    async function playLetterWheel(finalLetter) {
      letterElement.hidden = true;
      wheelScene.classList.add("visible");
      wheelScene.setAttribute("aria-hidden", "false");
      wheelVisual.classList.remove("greyed");

      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const spinTime =
        ANIMATION.reveal -
        ANIMATION.wheelHold -
        ANIMATION.wheelTravel;

      const segment = 360 / alphabet.length;
      const selectedIndex = alphabet.indexOf(finalLetter);
      const selectedAngle = selectedIndex * segment;
      const normalized =
        ((wheelRotation % 360) + 360) % 360;

      let delta =
        ANIMATION.wheelTurns * 360 -
        selectedAngle -
        normalized;

      while (delta < ANIMATION.wheelTurns * 360) {
        delta += 360;
      }

      const targetRotation = wheelRotation + delta;

      const spin = wheelSpinner.animate(
        [
          { transform: `rotate(${wheelRotation}deg)` },
          { transform: `rotate(${targetRotation}deg)` }
        ],
        {
          duration: spinTime,
          easing: "cubic-bezier(0.10, 0.66, 0.08, 1)",
          fill: "forwards"
        }
      );

      await spin.finished;

      wheelRotation = targetRotation;
      wheelSpinner.style.transform =
        `rotate(${wheelRotation}deg)`;
      spin.cancel();

      await wait(ANIMATION.wheelHold);

      const layoutRect = wheelLayout.getBoundingClientRect();
      const startY = layoutRect.height * 0.087;
      const centerY = layoutRect.height / 2;
      const travelY = centerY - startY;

      const finalFontSize = parseFloat(
        getComputedStyle(letterElement).fontSize
      );
      const startFontSize = Math.max(
        12,
        layoutRect.width * 0.046
      );
      const scaleToFinal = finalFontSize / startFontSize;

      wheelWinner.textContent = finalLetter;
      wheelWinner.style.display = "grid";
      wheelWinner.style.fontSize = `${startFontSize}px`;
      wheelWinner.style.opacity = "1";
      wheelWinner.style.transform =
        "translate(-50%, -50%) scale(1)";

      wheelVisual.classList.add("greyed");

      const reveal = wheelWinner.animate(
        [
          {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: 1,
            offset: 0
          },
          {
            transform:
              `translate(-50%, calc(-50% + ${travelY}px)) ` +
              `scale(${scaleToFinal})`,
            opacity: 1,
            offset: 0.455
          },
          {
            transform:
              `translate(-50%, calc(-50% + ${travelY}px)) ` +
              `scale(${scaleToFinal * 1.13})`,
            opacity: 1,
            offset: 0.735
          },
          {
            transform:
              `translate(-50%, calc(-50% + ${travelY}px)) ` +
              `scale(${scaleToFinal})`,
            opacity: 1,
            offset: 1
          }
        ],
        {
          duration: ANIMATION.wheelTravel + ANIMATION.pop,
          easing: "linear",
          fill: "forwards"
        }
      );

      await reveal.finished;

      wheelScene.classList.remove("visible");
      wheelScene.setAttribute("aria-hidden", "true");
      wheelWinner.style.display = "none";
      reveal.cancel();

      letterElement.hidden = false;
      letterElement.textContent = finalLetter;
    }

    async function generateLetter() {
      if (isGenerating) {
        return;
      }

      isGenerating = true;
      generateButton.disabled = true;
      generateButton.classList.remove("press");
      void generateButton.offsetWidth;
      generateButton.classList.add("press");
      generateButton.classList.add("generating");
      letterCard.disabled = true;

      resetRevealVisuals();

      const finalLetter = randomWeightedLetter();

      if (prefersReducedMotion) {
        letterElement.textContent = finalLetter;
      } else {
        const selectedAnimation = randomRevealAnimation();

        if (selectedAnimation === "slot") {
          await playSlotMachine(finalLetter);
        } else if (selectedAnimation === "multiFlip") {
          await playMultiFlip(finalLetter);
        } else if (selectedAnimation === "zoomTunnel") {
          await playZoomTunnel(finalLetter);
        } else {
          await playLetterWheel(finalLetter);
        }
      }

      generateButton.disabled = false;
      generateButton.classList.remove("generating");
      generateButton.classList.remove("press");
      letterCard.disabled = false;
      isGenerating = false;
    }

    bindFullscreenButton({ button: fullscreenButton, icon: fullscreenIcon, label: fullscreenLabel, app });

    root.querySelector("#rnglHomeButton").addEventListener("click", () => {
      app.haptic(12);
      app.showHome();
    });

    ideasToggle.addEventListener("change", () => {
      const visible = ideasToggle.checked;

      tickerShell.classList.toggle("visible", visible);
      tickerShell.setAttribute("aria-hidden", String(!visible));
    });

    generateButton.addEventListener("click", generateLetter);
    letterCard.addEventListener("click", generateLetter);

    window.addEventListener("keydown", (event) => {
      if (
        event.code === "Space" &&
        event.target.tagName !== "INPUT" &&
        event.target.tagName !== "BUTTON"
      ) {
        event.preventDefault();
        generateLetter();
      }
    });

    buildLetterWheel();
    wheelSpinner.style.transform = "rotate(0deg)";
    createRandomLetterTicker({ root, topics });
  

}
