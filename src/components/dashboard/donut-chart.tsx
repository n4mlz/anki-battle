"use client";

import { PieChart, Pie, Cell } from "recharts";

interface DonutChartProps {
  basePct: number;
  bonusPct: number;
  color: string;
}

export function DonutChart({ basePct, bonusPct, color }: DonutChartProps) {
  const remainingBase = Math.max(0, 100 - basePct - bonusPct);

  const data = [
    { name: "base", value: basePct },
    { name: "bonus", value: bonusPct },
    { name: "remaining", value: remainingBase },
  ];

  const baseColor = color;
  const bonusColor = "#fef3c7";
  const remainingColor = "#e5e7eb";

  return (
    <div className="flex justify-center relative w-[90px] h-[90px] mx-auto">
      <PieChart width={90} height={90}>
        <Pie
          data={data}
          cx={45}
          cy={45}
          innerRadius={30}
          outerRadius={42}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill={baseColor} />
          <Cell fill={bonusColor} />
          <Cell fill={remainingColor} />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-bold" style={{ color }}>
          {basePct}%
        </span>
        <span className="text-[10px] text-muted-foreground leading-tight">
          {Math.round(basePct * 9)}/900
        </span>
        <span className="text-[9px] text-amber-600 leading-tight">
          +{Math.round(bonusPct)}%
        </span>
      </div>
    </div>
  );
}
