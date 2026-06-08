interface ProgressBarProps {
  studiedPct: number;
  newPct: number;
}

export function ProgressBar({ studiedPct, newPct }: ProgressBarProps) {
  return (
    <div>
      <div className="flex justify-between text-xs md:text-sm mb-1 md:mb-1.5">
        <span className="text-gray-600 font-medium">全体</span>
        <span className="text-gray-900 font-semibold tabular-nums">
          {Math.round(studiedPct)}%
        </span>
      </div>
      <div className="h-2.5 md:h-3 bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className="bg-[#22c55e] transition-all duration-500"
          style={{ width: `${studiedPct}%` }}
        />
        <div
          className="bg-[#e5e7eb] transition-all duration-500"
          style={{ width: `${newPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] md:text-xs text-gray-400 mt-1 md:mt-1.5">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-[#22c55e]" />
          学習済み
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-[#e5e7eb]" />
          未着手
        </span>
      </div>
    </div>
  );
}
