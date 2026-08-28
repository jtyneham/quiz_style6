import { Application, Container, Graphics } from "pixi.js";

/**
 * Pixi artwork adapter for Hangman.
 *
 * Game code only relies on `reset()` and `render(missCount)`. This keeps a
 * future reskin free to replace this renderer with SVG, Canvas, Rive, or a
 * completely different Pixi scene without touching the rules engine.
 */

const ART_WIDTH = 300;
const ART_HEIGHT = 240;
const INK = 0x181713;
const INK_FAINT = 0x4a463f;
const STROKE_WIDTH = 4.2;
const STAGE_DURATION_MS = 220;
const DEATH_EYES_DELAY_MS = 80;

// Each entry after the head is one line segment: torso, arms, then legs.
const LIMBS = [
  [204, 112, 204, 150],
  [204, 119, 174, 140],
  [204, 119, 234, 140],
  [204, 150, 181, 191],
  [204, 150, 227, 191],
];

function drawLine(graphics, x1, y1, x2, y2, progress = 1) {
  const endX = x1 + (x2 - x1) * progress;
  const endY = y1 + (y2 - y1) * progress;

  // A faint offset pass gives each mark a dry, imperfect brush edge without
  // making the gameplay illustration fuzzy or expensive to render.
  graphics.moveTo(x1 + 1.1, y1 + .6).lineTo(endX + .45, endY + .25).stroke({
    color: INK_FAINT, alpha: .22, width: STROKE_WIDTH + 2.2, cap: "round", join: "round",
  });
  graphics.moveTo(x1, y1).lineTo(endX, endY).stroke({
    color: INK,
    width: STROKE_WIDTH,
    cap: "round",
    join: "round",
  });
  if (progress > .82) {
    graphics.circle(endX, endY, 1.25).fill({ color: INK, alpha: .62 });
  }
}

function drawStaticGallows(graphics) {
  // Minimal line structure based on the supplied reference: base, post, beam,
  // brace, and a deliberately empty noose before the first missed letter.
  drawLine(graphics, 31, 213, 124, 213);
  drawLine(graphics, 31, 213, 31, 229);
  drawLine(graphics, 31, 229, 124, 229);
  drawLine(graphics, 124, 229, 124, 213);
  drawLine(graphics, 54, 213, 54, 196);
  drawLine(graphics, 54, 196, 105, 196);
  drawLine(graphics, 105, 196, 105, 213);
  drawLine(graphics, 73, 196, 73, 28);
  drawLine(graphics, 73, 28, 252, 28);
  drawLine(graphics, 252, 28, 252, 47);
  drawLine(graphics, 252, 47, 73, 47);
  drawLine(graphics, 73, 47, 73, 98);
  drawLine(graphics, 73, 98, 135, 28);
  drawLine(graphics, 204, 47, 204, 74);
}

function drawHead(graphics, progress) {
  const start = -Math.PI / 2;
  const end = start + Math.PI * 2 * progress;
  graphics.arc(204.8, 93.4, 19.6, start, end).stroke({
    color: INK_FAINT, alpha: .20, width: STROKE_WIDTH + 2, cap: "round", join: "round",
  });
  graphics.arc(204, 93, 19, start, end).stroke({
    color: INK,
    width: STROKE_WIDTH,
    cap: "round",
    join: "round",
  });
}

function drawDeathEyes(graphics) {
  const eyeSize = 4;
  for (const centerX of [197, 211]) {
    drawLine(graphics, centerX - eyeSize, 88 - eyeSize, centerX + eyeSize, 88 + eyeSize);
    drawLine(graphics, centerX + eyeSize, 88 - eyeSize, centerX - eyeSize, 88 + eyeSize);
  }
}

/**
 * Creates one responsive Pixi canvas inside a Hangman component's shadow DOM.
 * The original SVG remains visible only while Pixi is initializing, so a
 * transient module-loading failure never leaves the game without artwork.
 */
export function createHangmanArtwork(root) {
  const host = root.querySelector("#hangmanPixiStage");
  const fallbackSvg = root.querySelector(".hangman");
  let app;
  let scene;
  let graphics;
  let misses = 0;
  let completedMisses = 0;
  let activeStage = 0;
  let stageProgress = 1;
  let showDeathEyes = false;
  let tickerCallback;
  let deathEyesTimer;

  function layout() {
    if (!app || !scene) return;
    const scale = Math.min(app.renderer.width / ART_WIDTH, app.renderer.height / ART_HEIGHT);
    scene.scale.set(scale);
    scene.x = (app.renderer.width - ART_WIDTH * scale) / 2;
    scene.y = (app.renderer.height - ART_HEIGHT * scale) / 2;
  }

  function draw() {
    if (!graphics) return;
    graphics.clear();
    drawStaticGallows(graphics);

    for (let stage = 1; stage <= misses; stage += 1) {
      const progress = stage === activeStage ? stageProgress : 1;
      if (stage === 1) drawHead(graphics, progress);
      else {
        const [x1, y1, x2, y2] = LIMBS[stage - 2];
        drawLine(graphics, x1, y1, x2, y2, progress);
      }
    }

    if (showDeathEyes) drawDeathEyes(graphics);
  }

  function stopStageAnimation() {
    if (app && tickerCallback) app.ticker.remove(tickerCallback);
    tickerCallback = undefined;
  }

  function animateNextStage(stage) {
    stopStageAnimation();
    activeStage = stage;
    stageProgress = 0;
    tickerCallback = (ticker) => {
      stageProgress = Math.min(1, stageProgress + ticker.deltaMS / STAGE_DURATION_MS);
      draw();
      if (stageProgress < 1) return;

      stopStageAnimation();
      completedMisses = stage;
      activeStage = 0;
      if (stage === 6) {
        deathEyesTimer = window.setTimeout(() => {
          showDeathEyes = true;
          draw();
        }, DEATH_EYES_DELAY_MS);
      }
    };
    app.ticker.add(tickerCallback);
    draw();
  }

  async function initialise() {
    if (!host) return;

    app = new Application();
    await app.init({ backgroundAlpha: 0, antialias: true });
    app.canvas.setAttribute("aria-hidden", "true");
    host.appendChild(app.canvas);

    scene = new Container();
    graphics = new Graphics();
    scene.addChild(graphics);
    app.stage.addChild(scene);
    // Keeping the renderer's bitmap exactly equal to the responsive host avoids
    // a canvas overflowing into the word and keyboard rows on wide layouts.
    const resizeCanvas = () => {
      app.renderer.resize(host.clientWidth, host.clientHeight);
      layout();
    };
    new ResizeObserver(resizeCanvas).observe(host);
    resizeCanvas();

    // Hide the legacy SVG only after the first usable Pixi draw.
    fallbackSvg?.setAttribute("aria-hidden", "true");
    if (fallbackSvg) fallbackSvg.style.display = "none";
    draw();
  }

  // Hangman can render before Pixi has finished loading; state is retained and
  // drawn as soon as the canvas is ready.
  void initialise();

  return {
    reset() {
      window.clearTimeout(deathEyesTimer);
      stopStageAnimation();
      misses = 0;
      completedMisses = 0;
      activeStage = 0;
      stageProgress = 1;
      showDeathEyes = false;
      draw();
    },

    render(nextMisses) {
      const safeMisses = Math.max(0, Math.min(6, Number(nextMisses) || 0));
      const isNewMiss = safeMisses > completedMisses && !activeStage;
      misses = safeMisses;

      if (isNewMiss && app) animateNextStage(safeMisses);
      else draw();
    },
  };
}
