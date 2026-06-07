import { cn } from "@/lib/utils";
import type { ChunkProgress } from "@/types";

const levelColors: Record<string, string> = {
  "600": "bg-[#22c55e]",
  "730": "bg-[#3b82f6]",
  "860": "bg-[#f59e0b]",
  "990": "bg-[#fef3c7] border border-dashed border-[#f59e0b]",
};

const levelDoneText: Record<string, string> = {
  "600": "text-white",
  "730": "text-white",
  "860": "text-white",
  "990": "text-[#d97706]",
};

interface ChunkChipsProps {
  chunks: ChunkProgress[];
}

export function ChunkChips({ chunks }: ChunkChipsProps) {
  return (
    <div className="text-center">
      <div className="text-[11px] text-muted-foreground mb-1.5">100語ごとの進捗</div>
      <div className="flex gap-1 flex-wrap justify-center">
        {chunks.map((chunk) => (
          <div
            key={chunk.index}
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold",
              chunk.done
                ? cn(levelColors[chunk.level] ?? "bg-gray-200", levelDoneText[chunk.level] ?? "text-white")
                : "bg-[#e5e7eb] text-muted-foreground"
            )}
            title={`${chunk.label}: ${chunk.done ? "完了" : `${chunk.mature}/${chunk.total}`}`}
          >
            {chunk.level === "990" ? "+" : chunk.index}
          </div>
        ))}
      </div>
    </div>
  );
}
