import { cn } from "@/lib/utils";

const levels = [
  { level: "600", color: "bg-[#22c55e]", label: "600pt" },
  { level: "730", color: "bg-[#3b82f6]", label: "730pt" },
  { level: "860", color: "bg-[#f59e0b]", label: "860pt" },
  { level: "990", color: "bg-[#fef3c7] border border-dashed border-[#f59e0b]", label: "990pt" },
] as const;

export function LevelLegend() {
  return (
    <div className="flex justify-center gap-3 mt-1">
      {levels.map((l) => (
        <span key={l.level} className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className={cn("inline-block w-2 h-2 rounded-sm", l.color)} />
          {l.label}
        </span>
      ))}
    </div>
  );
}
