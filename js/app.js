import { initRandomLetter } from "./games/rngl.js";
import { createFullscreenService, haptic } from "./core/device.js";
import { createInkAmbient } from "./core/ink-ambient.js";

const screens = {
  home: document.getElementById("homeScreen"),
  rngl: document.getElementById("rnglScreen"),
  missingword: document.getElementById("missingWordScreen"),
  missingwordpokemon: document.getElementById("missingWordPokemonScreen"),
  hangman: document.getElementById("hangmanScreen"),
  hangmanpokemon: document.getElementById("hangmanPokemonScreen")
};

const fullscreenService = createFullscreenService();
void createInkAmbient(document.getElementById("homeInkStage"));
let current = "home";

const routes = {
  home: { hash: "", load: () => {} },
  rngl: {
    hash: "#rngl",
    aliases: ["#random-letter"],
    load: () => initRandomLetter(screens.rngl, api)
  },
  missingword: {
    hash: "#missingword",
    aliases: ["#missing-word"],
    load: async () => (await import("./games/missing-word.js")).registerMissingWord(api)
  },
  missingwordpokemon: {
    hash: "#missingwordpokemon",
    aliases: ["#missing-word-pokemon"],
    load: async () => (await import("./games/missing-word-pokemon.js")).registerMissingWordPokemon(api)
  },
  hangman: {
    hash: "#hangman",
    load: async () => (await import("./games/hangman.js")).registerHangman(api)
  },
  hangmanpokemon: {
    hash: "#hangmanpokemon",
    aliases: ["#hangman-pokemon"],
    load: async () => (await import("./games/hangman-pokemon.js")).registerHangmanPokemon(api)
  }
};

const fileRoutes = {
  "rngl.html": "rngl",
  "missingword.html": "missingword",
  "missingwordpokemon.html": "missingwordpokemon",
  "hangman1.html": "hangman",
  "hangmanpokemon.html": "hangmanpokemon"
};

const api = {
  haptic,
  isFullscreen: fullscreenService.isFullscreen,
  toggleFullscreen: fullscreenService.toggle,
  onFullscreenChange(callback) { return fullscreenService.onChange(callback); },
  showHome() { return navigate("home"); },
  isScreenActive(name) { return current === name; }
};

function routeFromHash(hash = location.hash) {
  return Object.entries(routes).find(([, route]) =>
    route.hash === hash || route.aliases?.includes(hash)
  )?.[0] || "home";
}

function showScreen(name, { updateHistory } = {}) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
  current = name;

  if (updateHistory) {
    history.pushState({ screen: name }, "", routes[name].hash || location.pathname);
  }
}

async function navigate(name, { updateHistory = true } = {}) {
  const target = routes[name] ? name : "home";
  await routes[target].load();
  showScreen(target, { updateHistory });
}

async function openTile(tile) {
  const target = fileRoutes[tile.dataset.file];
  if (!target) return;
  haptic(18);
  await navigate(target);
}

document.querySelectorAll(".app-tile").forEach((tile) => {
  tile.addEventListener("pointerdown", () => tile.classList.add("pressed"));
  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    tile.addEventListener(eventName, () => tile.classList.remove("pressed"));
  });
  tile.addEventListener("click", () => { void openTile(tile); });
});

window.addEventListener("popstate", () => { void navigate(routeFromHash(), { updateHistory: false }); });
window.addEventListener("hashchange", () => { void navigate(routeFromHash(), { updateHistory: false }); });

void navigate(routeFromHash(), { updateHistory: false });
