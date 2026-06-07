import { cn } from "@/lib/utils";

const rankStyles: Record<number, { border: string; bg: string; badge: string; badgeText: string }> = {
  1: { border: "border-[#FFD700]", bg: "bg-[#fffbeb]", badge: "bg-[#FFD700]", badgeText: "text-black" },
  2: { border: "border-[#C0C0C0]", bg: "bg-[#f8fafc]", badge: "bg-[#C0C0C0]", badgeText: "text-black" },
  3: { border: "border-[#CD7F32]", bg: "bg-[#fff7ed]", badge: "bg-[#CD7F32]", badgeText: "text-white" },
  4: { border: "border-gray-200", bg: "bg-[#f9fafb]", badge: "bg-gray-400", badgeText: "text-white" },
};

interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  const style = rankStyles[rank] ?? rankStyles[4];
  return (
    <span
      className={cn(
        "absolute -top-3 left-3 px-3 py-0.5 rounded-full text-xs font-bold",
        style.badge,
        style.badgeText
      )}
    >
      {rank}位
    </span>
  );
}
