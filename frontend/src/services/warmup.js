const KEEP_WARM_MS = 4 * 60 * 1000;
const RETRY_MS = 5000;
const MAX_STARTUP_RETRIES = 40;

function healthUrl() {
  const base = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  return `${base}/health`;
}

function ping() {
  return fetch(healthUrl(), { method: "GET", cache: "no-store" }).catch(() => null);
}

export function startApiWarmup() {
  if (typeof window === "undefined") return () => {};

  let attempts = 0;
  const warmStart = async () => {
    const ok = await ping();
    if (!ok && attempts < MAX_STARTUP_RETRIES) {
      attempts += 1;
      setTimeout(warmStart, RETRY_MS);
    }
  };
  warmStart();

  const interval = setInterval(() => {
    if (document.visibilityState === "visible") ping();
  }, KEEP_WARM_MS);

  return () => clearInterval(interval);
}
