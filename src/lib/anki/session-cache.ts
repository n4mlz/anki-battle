import type { AnkiSession } from "./client";

const cache = new Map<string, AnkiSession>();

export function getCachedSession(key: string): AnkiSession | undefined {
  return cache.get(key);
}

export function setCachedSession(key: string, session: AnkiSession): void {
  cache.set(key, session);
}

export function clearCachedSession(key: string): void {
  cache.delete(key);
}
