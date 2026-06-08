import type { ChunkProgress } from "@/types";

interface ChunkBarsProps {
  chunks: ChunkProgress[];
}

export function ChunkBars({ chunks }: ChunkBarsProps) {
  const total = chunks.reduce((s, c) => s + c.total, 0);

  return (
    <div>
      <div className="text-[11px] text-gray-400 mb-1.5">100語ごとの進捗</div>
      <div className="flex flex-col gap-1">
        <div className="flex gap-1">
          {chunks.slice(0, 5).map((c) => (
            <ChunkBar key={c.index} chunk={c} total={total} />
          ))}
        </div>
        <div className="flex gap-1">
          {chunks.slice(5, 10).map((c) => (
            <ChunkBar key={c.index} chunk={c} total={total} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChunkBar({ chunk, total }: { chunk: ChunkProgress; total: number }) {
  const pct = (n: number) => total > 0 ? (n / chunk.total) * 100 : 0;

  return (
    <div className="flex-1 text-center">
      <div className="text-[9px] text-gray-400 mb-0.5">
        {chunk.index}
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className="bg-[#22c55e]"
          style={{ width: `${pct(chunk.studied)}%` }}
        />
        <div className="flex-1" />
      </div>
    </div>
  );
}
