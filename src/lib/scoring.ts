import type { ChunkProgress, DeckSnapshot, UserSnapshot, RankedUser } from "@/types";
import { RawDeckNode, getInt } from "./anki/deck-list";

export function calcMature(node: RawDeckNode): number {
  const total = getInt(node.totalInDeck);
  const newCount = getInt(node.newCount);
  const learn = getInt(node.learnCount);
  const review = getInt(node.reviewCount);
  return Math.max(0, total - newCount - learn - review);
}

export function buildChunks(children: RawDeckNode[]): ChunkProgress[] {
  // Sort children by name (which contains the range like "001-100")
  const sorted = [...children].sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "", "ja")
  );

  return sorted.map((child, i) => {
    const total = getInt(child.totalInDeck);
    const mature = calcMature(child);
    const done = mature >= total && total > 0;

    // Parse range: e.g. "001-100" or "901-1000"
    const rangeMatch = (child.name ?? "").match(/\((\d+)-(\d+)\)/);
    const label = rangeMatch ? `${rangeMatch[1]}-${rangeMatch[2]}` : `chunk${i + 1}`;

    // Determine level from the name
    let level = "unknown";
    if (child.name?.includes("600")) level = "600";
    else if (child.name?.includes("730")) level = "730";
    else if (child.name?.includes("860")) level = "860";
    else if (child.name?.includes("990")) level = "990";

    return { index: i + 1, label, level, total, mature, done };
  });
}

export function buildDeckSnapshot(deck: RawDeckNode): DeckSnapshot {
  const children = deck.children ?? [];
  const chunks = buildChunks(children);
  const matureTotal = calcMature(deck);

  // Base = chunks 1-9 (levels 600, 730, 860), Bonus = chunk 10 (level 990)
  const baseChunks = chunks.filter((c) => c.level !== "990");
  const bonusChunks = chunks.filter((c) => c.level === "990");

  const baseMature = baseChunks.reduce((sum, c) => sum + c.mature, 0);
  const baseTotal = baseChunks.reduce((sum, c) => sum + c.total, 0);
  const bonusMature = bonusChunks.reduce((sum, c) => sum + c.mature, 0);
  const bonusTotal = bonusChunks.reduce((sum, c) => sum + c.total, 0);

  return {
    deck_id: String(deck.deckId ?? ""),
    name: deck.name ?? "",
    total_including_children: getInt(deck.totalIncludingChildren),
    mature_total: matureTotal,
    base_progress_pct: baseTotal > 0 ? Math.round((baseMature / baseTotal) * 1000) / 10 : 0,
    bonus_progress_pct: bonusTotal > 0 ? Math.round((bonusMature / bonusTotal) * 1000) / 10 : 0,
    chunks,
  };
}

export function rankUsers(snapshots: UserSnapshot[]): RankedUser[] {
  const ranked = snapshots.map((s) => ({
    ...s,
    rank: 0,
  }));

  ranked.sort((a, b) => {
    const aPct = a.deck?.base_progress_pct ?? 0;
    const bPct = b.deck?.base_progress_pct ?? 0;
    if (bPct !== aPct) return bPct - aPct;
    const aBonus = a.deck?.bonus_progress_pct ?? 0;
    const bBonus = b.deck?.bonus_progress_pct ?? 0;
    return bBonus - aBonus;
  });

  ranked.forEach((u, i) => {
    u.rank = i + 1;
  });

  return ranked;
}
