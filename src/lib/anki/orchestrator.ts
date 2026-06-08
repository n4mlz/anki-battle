import { loadConfig, getUserKeys } from "@/lib/config";
import { saveSnapshot } from "@/lib/snapshot";
import { buildDeckSnapshot } from "@/lib/scoring";
import { loginAnkiWeb } from "./login";
import { fetchDeckList, findDeckByName } from "./deck-list";
import { getCachedSession, setCachedSession } from "./session-cache";
import type { UserSnapshot } from "@/types";

async function fetchForUser(
  key: string,
  email: string,
  password: string,
  deckName: string
): Promise<UserSnapshot> {
  const snapshot: UserSnapshot = {
    user: key,
    email,
    timestamp: new Date().toISOString(),
    deck: null,
  };

  // Try with cached session
  let session = getCachedSession(key);
  if (session) {
    try {
      const { topNode } = await fetchDeckList(session);
      const deck = findDeckByName(topNode, deckName);
      if (deck) {
        snapshot.deck = buildDeckSnapshot(deck);
      } else {
        snapshot.error = `デッキ "${deckName}" が見つかりません`;
      }
      return snapshot;
    } catch (err) {
      if (err instanceof Error && err.message !== "AUTH_REQUIRED") {
        snapshot.error = err.message;
        return snapshot;
      }
      // AUTH_REQUIRED — re-login below
    }
  }

  // Fresh login
  try {
    session = await loginAnkiWeb(email, password);
    setCachedSession(key, session);

    const { topNode } = await fetchDeckList(session);
    const deck = findDeckByName(topNode, deckName);
    if (!deck) {
      snapshot.error = `デッキ "${deckName}" が見つかりません`;
    } else {
      snapshot.deck = buildDeckSnapshot(deck);
    }
  } catch (err) {
    snapshot.error =
      err instanceof Error ? err.message : "不明なエラー";
  }

  return snapshot;
}

export async function fetchAllUsers(): Promise<UserSnapshot[]> {
  const config = loadConfig();
  if (!config) return [];

  const keys = getUserKeys();
  const results: UserSnapshot[] = [];

  for (const key of keys) {
    const user = config.users[key];
    const snapshot = await fetchForUser(
      key,
      user.email,
      user.password,
      config.anki.deck_name
    );
    saveSnapshot(key, snapshot);
    results.push(snapshot);
  }

  return results;
}
