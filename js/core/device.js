// Shared device/browser services. Games consume these through the app API so
// they do not each need to know about browser prefixes or capability checks.
export function haptic(ms = 14, navigatorRef = navigator) {
  if ("vibrate" in navigatorRef) navigatorRef.vibrate(ms);
}

export function createFullscreenService(documentRef = document) {
  const callbacks = new Set();
  const isFullscreen = () => Boolean(documentRef.fullscreenElement || documentRef.webkitFullscreenElement);
  const notify = () => callbacks.forEach((callback) => callback(isFullscreen()));

  documentRef.addEventListener("fullscreenchange", notify);
  documentRef.addEventListener("webkitfullscreenchange", notify);

  return {
    isFullscreen,
    async toggle() {
      try {
        if (isFullscreen()) {
          if (documentRef.exitFullscreen) await documentRef.exitFullscreen();
          else documentRef.webkitExitFullscreen?.();
        } else {
          const root = documentRef.documentElement;
          if (root.requestFullscreen) await root.requestFullscreen({ navigationUI: "hide" });
          else root.webkitRequestFullscreen?.();
        }
      } catch (error) {
        console.warn("Fullscreen request failed", error);
      }
    },
    onChange(callback) {
      callbacks.add(callback);
      return () => callbacks.delete(callback);
    }
  };
}
