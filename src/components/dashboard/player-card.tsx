"use client";

import type { RankedUser } from "@/types";
import { formatJstDateTime } from "@/lib/date-format";
import { ProgressBar } from "./progress-bar";
import { ChunkBars } from "./chunk-bars";

const rankColors: Record<number, string> = {
  1: "#fbbf24",
  2: "#c0c0c0",
  3: "#cd7f32",
  4: "#d1d5db",
};

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

interface PlayerCardProps {
  user: RankedUser;
}

export function PlayerCard({ user }: PlayerCardProps) {
  const accentColor = rankColors[user.rank] ?? "#d1d5db";

  if (user.error || !user.deck) {
    return (
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden p-5 md:p-7">
        <div
          className="absolute top-0 left-0 w-1 md:w-1.5 h-10 md:h-12 rounded-tl-xl"
          style={{ background: accentColor }}
        />
        <div className="text-center">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">{user.user}</h3>
          <p className="text-sm md:text-base text-red-500 mt-2">{user.error ?? "データなし"}</p>
        </div>
      </div>
    );
  }

  const { deck } = user;
  const total = deck.mature_total + deck.in_progress_total + deck.new_total;
  const maturePct = total > 0 ? (deck.mature_total / total) * 100 : 0;
  const inProgressPct = total > 0 ? (deck.in_progress_total / total) * 100 : 0;
  const newPct = total > 0 ? (deck.new_total / total) * 100 : 0;

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden p-5 md:p-7">
      <div
        className="absolute top-0 left-0 w-1 md:w-1.5 h-10 md:h-12"
        style={{ background: accentColor }}
      />

      <div className="flex justify-between items-center mb-4 md:mb-5">
        <div className="flex items-center gap-2 md:gap-3">
          <span
            className="text-sm md:text-lg font-bold tabular-nums"
            style={{ color: accentColor }}
          >
            {user.rank}
          </span>
          <span className="text-base md:text-xl font-semibold text-gray-900">
            {user.user}
          </span>
        </div>
        <span
          className="text-[11px] md:text-xs text-gray-300"
          title={`最終更新: ${formatJstDateTime(user.timestamp)} JST`}
        >
          {formatTimeAgo(user.timestamp)}
        </span>
      </div>

      <div className="mb-5 md:mb-6">
        <ProgressBar
          maturePct={maturePct}
          inProgressPct={inProgressPct}
          newPct={newPct}
        />
      </div>

      <ChunkBars chunks={deck.chunks} />
    </div>
  );
}
