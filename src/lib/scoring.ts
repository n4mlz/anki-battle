import type { ChunkProgress, DeckSnapshot, UserSnapshot, RankedUser } from "@/types";
import { RawDeckNode, getInt } from "./anki/deck-list";

function calcNodeStats(node: RawDeckNode) {
  const total = getInt(node.totalInDeck);
  const newCount = getInt(node.newCount);
  const learn = getInt(node.learnCount);
  const review = getInt(node.reviewCount);
  const mature = Math.max(0, total - newCount - learn - review);
  const inProgress = learn + review;
  return { total, newCount, inProgress, mature };
}

export function buildChunks(children: RawDeckNode[]): ChunkProgress[] {
  const sorted = [...children].sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "", "ja")
  );

  return sorted.map((child, i) => {
    const { total, newCount, inProgress, mature } = calcNodeStats(child);

    const rangeMatch = (child.name ?? "").match(/\((\d+)-(\d+)\)/);
    const label = rangeMatch ? `${rangeMatch[1]}-${rangeMatch[2]}` : `chunk${i + 1}`;

    let level = "unknown";
    if (child.name?.includes("600")) level = "600";
    else if (child.name?.includes("730")) level = "730";
    else if (child.name?.includes("860")) level = "860";
    else if (child.name?.includes("990")) level = "990";

    return { index: i + 1, label, level, total, mature, inProgress, newCount };
  });
}

export function buildDeckSnapshot(deck: RawDeckNode): DeckSnapshot {
  const children = deck.children ?? [];
  const chunks = buildChunks(children);

  const totalIncluding = getInt(deck.totalIncludingChildren);
  const mature = chunks.reduce((s, c) => s + c.mature, 0);
  const inProgress = chunks.reduce((s, c) => s + c.inProgress, 0);
  const newCount = chunks.reduce((s, c) => s + c.newCount, 0);

  const totalStudied = mature + inProgress;
  const totalProgress = totalIncluding > 0 ? Math.round((totalStudied / totalIncluding) * 1000) / 10 : 0;

  return {
    deck_id: String(deck.deckId ?? ""),
    name: deck.name ?? "",
    total_including_children: totalIncluding,
    mature_total: mature,
    in_progress_total: inProgress,
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
    return (a.deck?.mature_total ?? 0) > (b.deck?.mature_total ?? 0) ? -1 : 1;
  });

  ranked.forEach((u, i) => {
    u.rank = i + 1;
  });

  return ranked;
}
