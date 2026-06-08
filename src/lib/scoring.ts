import type { ChunkProgress, DeckSnapshot, UserSnapshot, RankedUser } from "@/types";
import { RawDeckNode, getInt } from "./anki/deck-list";

function calcNodeStats(node: RawDeckNode) {
  const total = getInt(node.totalInDeck);
  // new_uncapped is the true count of unseen cards. node.newCount is only the
  // daily-due number shown in the deck list (capped by the new-cards/day limit),
  // so it must NOT be used to infer how much has been studied.
  const uncapped = getInt(node.newUncapped);
  const capped = getInt(node.newCount);
  // When newUncapped is 0 but newCount (capped) > 0, the API may not have
  // returned newUncapped. Fall back to newCount to avoid false 100% progress.
  const newCount = uncapped > 0
    ? Math.min(uncapped, total)
    : Math.max(capped, 0);
  const studied = Math.max(0, total - newCount);
  return { total, newCount, studied };
}

export function buildChunks(children: RawDeckNode[]): ChunkProgress[] {
  const sorted = [...children].sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "", "ja")
  );

  return sorted.map((child, i) => {
    const { total, newCount, studied } = calcNodeStats(child);

    const rangeMatch = (child.name ?? "").match(/\((\d+)-(\d+)\)/);
    const label = rangeMatch ? `${rangeMatch[1]}-${rangeMatch[2]}` : `chunk${i + 1}`;

    let level = "unknown";
    if (child.name?.includes("600")) level = "600";
    else if (child.name?.includes("730")) level = "730";
    else if (child.name?.includes("860")) level = "860";
    else if (child.name?.includes("990")) level = "990";

    return { index: i + 1, label, level, total, studied, newCount };
  });
}

export function buildDeckSnapshot(deck: RawDeckNode): DeckSnapshot {
  const children = deck.children ?? [];
  const chunks = buildChunks(children);

  const totalIncluding = getInt(deck.totalIncludingChildren);
  const studied = chunks.reduce((s, c) => s + c.studied, 0);
  const newCount = chunks.reduce((s, c) => s + c.newCount, 0);

  const totalProgress = totalIncluding > 0 ? Math.round((studied / totalIncluding) * 1000) / 10 : 0;

  return {
    deck_id: String(deck.deckId ?? ""),
    name: deck.name ?? "",
    total_including_children: totalIncluding,
    studied_total: studied,
    new_total: newCount,
    total_progress_pct: totalProgress,
    chunks,
  };
}

export function rankUsers(snapshots: UserSnapshot[]): RankedUser[] {
  const ranked = snapshots.map((s) => ({
    ...s,
    rank: 0,
  }));

  ranked.sort((a, b) => {
    const aPct = a.deck?.total_progress_pct ?? 0;
    const bPct = b.deck?.total_progress_pct ?? 0;
    if (bPct !== aPct) return bPct - aPct;
    return (a.deck?.studied_total ?? 0) > (b.deck?.studied_total ?? 0) ? -1 : 1;
  });

  ranked.forEach((u, i) => {
    u.rank = i + 1;
  });

  return ranked;
}
