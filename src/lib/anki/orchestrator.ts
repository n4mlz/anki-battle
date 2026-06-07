import { loadConfig, getUserKeys } from "@/lib/config";
import { saveSnapshot } from "@/lib/snapshot";
import { buildDeckSnapshot } from "@/lib/scoring";
import { loginAnkiWeb } from "./login";
import { fetchDeckList, findDeckByName } from "./deck-list";
import type { UserSnapshot } from "@/types";

export async function fetchAllUsers(): Promise<UserSnapshot[]> {
  const config = loadConfig();
  if (!config) return [];

  const keys = getUserKeys();
  const results: UserSnapshot[] = [];

  for (const key of keys) {
    const user = config.users[key];
    const snapshot: UserSnapshot = {
      user: user.name,
      email: user.email,
      timestamp: new Date().toISOString(),
      deck: null,
    };

    try {
      const session = await loginAnkiWeb(user.email, user.password);
      const { topNode } = await fetchDeckList(session);
      const deck = findDeckByName(topNode, config.anki.deck_name);

      if (!deck) {
        snapshot.error = `デッキ "${config.anki.deck_name}" が見つかりません`;
      } else {
        snapshot.deck = buildDeckSnapshot(deck);
      }
    } catch (err) {
      snapshot.error =
        err instanceof Error ? err.message : "不明なエラー";
    }

    saveSnapshot(key, snapshot);
    results.push(snapshot);
  }

  return results;
}
