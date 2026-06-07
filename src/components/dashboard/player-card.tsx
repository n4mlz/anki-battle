"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { RankBadge } from "./rank-badge";
import { DonutChart } from "./donut-chart";
import { ChunkChips } from "./chunk-chips";
import { LevelLegend } from "./level-legend";
import type { RankedUser } from "@/types";

const rankStyles: Record<number, { border: string; bg: string }> = {
  1: { border: "border-[#FFD700]", bg: "bg-[#fffbeb]" },
  2: { border: "border-[#C0C0C0]", bg: "bg-[#f8fafc]" },
  3: { border: "border-[#CD7F32]", bg: "bg-[#fff7ed]" },
  4: { border: "border-gray-200", bg: "bg-[#f9fafb]" },
};

const rankColors: Record<number, string> = {
  1: "#22c55e",
  2: "#3b82f6",
  3: "#f97316",
  4: "#6b7280",
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
  const style = rankStyles[user.rank] ?? rankStyles[4];
  const color = rankColors[user.rank] ?? "#6b7280";

  if (user.error || !user.deck) {
    return (
      <Card className={cn("relative border-2", style.border, style.bg)}>
        <CardContent className="p-4">
          <RankBadge rank={user.rank} />
          <div className="mt-2 text-center">
            <h3 className="text-lg font-bold">{user.user}</h3>
            <p className="text-sm text-destructive mt-2">{user.error ?? "データなし"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { deck } = user;

  return (
    <Card className={cn("relative border-2", style.border, style.bg)}>
      <CardContent className="p-4">
        <RankBadge rank={user.rank} />

        <div className="flex justify-between items-start mt-1 mb-2">
          <h3 className="text-xl font-bold">{user.user}</h3>
          <span className="text-xs text-muted-foreground">
            最終同期: {formatTimeAgo(user.timestamp)}
          </span>
        </div>

        <DonutChart
          basePct={deck.base_progress_pct}
          bonusPct={deck.bonus_progress_pct}
          color={color}
        />

        <div className="mt-3">
          <ChunkChips chunks={deck.chunks} />
          <LevelLegend />
        </div>
      </CardContent>
    </Card>
  );
}
