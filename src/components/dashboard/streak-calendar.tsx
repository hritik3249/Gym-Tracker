"use client";

import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";

type Props = { heatmap: { date: string; count: number }[] };

function cellColor(count: number) {
  if (count === 0) return "bg-white/[0.05]";
  if (count === 1) return "bg-acid/30";
  if (count === 2) return "bg-acid/55";
  return "bg-acid/85";
}

export function StreakCalendar({ heatmap }: Props) {
  if (heatmap.length === 0) return null;

  // Pad start so first column aligns to Monday (0=Mon … 6=Sun)
  const firstDow = (parseISO(heatmap[0].date).getDay() + 6) % 7;
  const padded: ({ date: string; count: number } | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...heatmap,
  ];

  // Split into weeks (columns of 7)
  const weeks: (typeof padded[0])[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  // Month labels: one per column showing the month of the first real day
  const monthLabels = weeks.map((week) => {
    const first = week.find((d) => d !== null);
    return first ? format(parseISO(first.date), "MMM") : "";
  });
  // Only show label when month changes
  const visibleLabels = monthLabels.map((label, i) =>
    i === 0 || label !== monthLabels[i - 1] ? label : "",
  );

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Card className="lg:col-span-2">
      <h2 className="mb-4 text-lg font-black text-cream">Activity calendar</h2>
      <div className="overflow-x-auto pb-1">
        <div className="min-w-max">
          {/* Month labels row */}
          <div className="mb-1 flex gap-[3px] pl-8">
            {visibleLabels.map((label, i) => (
              <div key={i} className="w-3 text-center text-[9px] leading-none text-steel">
                {label}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] pr-1">
              {days.map((d, i) => (
                <div key={d} className="flex h-3 items-center text-[9px] leading-none text-steel">
                  {i % 2 === 0 ? d.slice(0, 2) : ""}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, di) => {
                  const cell = week[di] ?? null;
                  return (
                    <div
                      key={di}
                      className={`h-3 w-3 rounded-sm transition-colors ${cell === null ? "opacity-0" : cellColor(cell.count)}`}
                      title={cell ? `${cell.date}: ${cell.count} workout${cell.count !== 1 ? "s" : ""}` : ""}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-2 text-[10px] text-steel">
            <span>Less</span>
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className={`h-3 w-3 rounded-sm ${cellColor(n)}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
