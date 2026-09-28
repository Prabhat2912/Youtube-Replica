import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "playtube_pwa_dismissed";
const DISMISS_DAYS = 14;

const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
  !window.MSStream;

const isInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const dismissedRecently = () => {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() - at < DISMISS_DAYS * 24 * 3600 * 1000;
  } catch {
    return false;
  }
};

// Captures the browser install prompt so the UI can show it on purpose.
// iOS has no beforeinstallprompt — there we show manual steps instead.
export function usePwaInstall() {
  const [deferred, setDeferred] = useState(null);
  const [ready, setReady] = useState(false);
  const ios = isIos();

  useEffect(() => {
    if (isInstalled() || dismissedRecently()) return;
    if (ios) {
      const t = setTimeout(() => setReady(true), 6000);
      return () => clearTimeout(t);
    }
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      const t = setTimeout(() => setReady(true), 6000);
      return () => clearTimeout(t);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [ios]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch { /* private mode */ }
    setReady(false);
    setDeferred(null);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return false;
    deferred.prompt();
    const { outcome } = await deferred.userChoice.catch(() => ({ outcome: "dismissed" }));
    if (outcome === "accepted") dismiss();
    setDeferred(null);
    return outcome === "accepted";
  }, [deferred, dismiss]);

  return {
    // Android/desktop Chromium: true once the browser fires the event.
    canInstall: Boolean(deferred) && ready,
    // iOS Safari: manual instructions instead of a real prompt.
    iosHint: ios && ready && !isInstalled(),
    install,
    dismiss,
  };
}
