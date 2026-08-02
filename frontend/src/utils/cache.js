const CACHE_PREFIX = "sl_cache_";
const DEFAULT_TTL = 3600000;

export function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, expiry: Date.now() + ttl })
    );
  } catch {}
}

export function clearCache(key) {
  if (key) {
    localStorage.removeItem(CACHE_PREFIX + key);
  } else {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  }
}

export async function withCache(key, fetcher, ttl = DEFAULT_TTL) {
  const cached = getCached(key);
  if (cached) return cached;
  const fresh = await fetcher();
  setCache(key, fresh, ttl);
  return fresh;
}
