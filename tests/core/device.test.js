import test from "node:test";
import assert from "node:assert/strict";
import { createFullscreenService, haptic } from "../../js/core/device.js";

function fakeDocument() {
  const listeners = new Map();
  const doc = {
    fullscreenElement: null,
    webkitFullscreenElement: null,
    addEventListener(type, fn) { listeners.set(type, fn); },
    async exitFullscreen() { doc.fullscreenElement = null; listeners.get("fullscreenchange")?.(); },
    documentElement: {
      async requestFullscreen() { doc.fullscreenElement = doc.documentElement; listeners.get("fullscreenchange")?.(); }
    }
  };
  return doc;
}

test("haptic delegates to navigator.vibrate when supported", () => {
  let value = null;
  haptic(18, { vibrate(ms) { value = ms; } });
  assert.equal(value, 18);
});

test("fullscreen service toggles and publishes state", async () => {
  const doc = fakeDocument();
  const service = createFullscreenService(doc);
  const states = [];
  service.onChange((active) => states.push(active));
  await service.toggle();
  assert.equal(service.isFullscreen(), true);
  await service.toggle();
  assert.equal(service.isFullscreen(), false);
  assert.deepEqual(states, [true, false]);
});
