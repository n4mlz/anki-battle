import { ankiFetch, AnkiSession } from "./client";
import {
  DeckListRequestSchema,
  DeckListResponseSchema,
} from "./proto";

export interface RawDeckNode {
  deckId?: bigint;
  name?: string;
  children?: RawDeckNode[];
  level?: number;
  collapsed?: boolean;
  reviewCount?: number;
  learnCount?: number;
  newCount?: number;
  totalInDeck?: number;
  totalIncludingChildren?: number;
  filtered?: boolean;
}

export function getInt(raw: unknown): number {
  if (typeof raw === "bigint") return Number(raw);
  if (typeof raw === "number") return raw;
  return 0;
}

export async function fetchDeckList(
  session: AnkiSession
): Promise<{ topNode: RawDeckNode; currentDeckId: string }> {
  const { data, session: newSession } = await ankiFetch(
    "/svc/decks/deck-list-info",
    DeckListRequestSchema,
    { minutesWestOfUtc: new Date().getTimezoneOffset() },
    DeckListResponseSchema,
    session
  );

  return {
    topNode: data.topNode as unknown as RawDeckNode,
    currentDeckId: String(data.currentDeckId ?? ""),
  };
}

export function findDeckByName(
  node: RawDeckNode,
  name: string
): RawDeckNode | null {
  if (node.name === name) return node;

  if (node.children) {
    for (const child of node.children) {
      const found = findDeckByName(child, name);
      if (found) return found;
    }
  }

  return null;
}
