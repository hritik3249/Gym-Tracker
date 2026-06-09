"use client";

import { Card } from "@/components/ui/card";

type Props = { muscles: { muscle: string; sessions: number }[] };

function resolveRegion(raw: string): string | null {
  const s = raw.toLowerCase();
  if (s.includes("lower back") || s.includes("erector") || s.includes("lumbar")) return "lower_back";
  if (s.includes("rear") || s.includes("rhomboid") || s.includes("posterior delt")) return "rear_shoulder";
  if (s.includes("chest") || s.includes("pec")) return "chest";
  if (s.includes("shoulder") || s.includes("delt")) return "shoulder";
  if (s.includes("bicep")) return "bicep";
  if (s.includes("tricep")) return "tricep";
  if (s.includes("forearm") || s.includes("brachialis")) return "forearm";
  if (s.includes("abs") || s.includes("core") || s.includes("abdom")) return "abs";
  if (s.includes("quad")) return "quad";
  if (s.includes("trap")) return "trap";
  if (s.includes("lat") || s.includes("back")) return "lat";
  if (s.includes("glute") || s.includes("butt") || s.includes("hip")) return "glute";
  if (s.includes("hamstring")) return "hamstring";
  if (s.includes("calf") || s.includes("calves") || s.includes("gastro")) return "calf";
  return null;
}

const SECTIONS = [
  {
    label: "Push",
    rows: [
      { label: "Chest", region: "chest" },
      { label: "Shoulders", region: "shoulder" },
      { label: "Triceps", region: "tricep" },
    ],
  },
  {
    label: "Pull",
    rows: [
      { label: "Lats / Back", region: "lat" },
      { label: "Biceps", region: "bicep" },
      { label: "Traps", region: "trap" },
      { label: "Rear Delts", region: "rear_shoulder" },
      { label: "Forearms", region: "forearm" },
    ],
  },
  {
    label: "Core",
    rows: [
      { label: "Abs / Core", region: "abs" },
      { label: "Lower Back", region: "lower_back" },
    ],
  },
  {
    label: "Legs",
    rows: [
      { label: "Quads", region: "quad" },
      { label: "Hamstrings", region: "hamstring" },
      { label: "Glutes", region: "glute" },
      { label: "Calves", region: "calf" },
    ],
  },
];

function barColor(sessions: number) {
  if (sessions === 0) return "rgba(247,244,213,0.07)";
  if (sessions === 1) return "rgba(211,150,140,0.35)";
  if (sessions <= 3) return "rgba(211,150,140,0.65)";
  return "#D3968C";
}

function MuscleRow({ label, sessions, max }: { label: string; sessions: number; max: number }) {
  const pct = max > 0 ? Math.round((sessions / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs font-semibold text-steel">{label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-white/[0.05]" style={{ height: 6 }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor(sessions) }}
        />
      </div>
      <span className="w-8 text-right text-xs font-black" style={{ color: sessions > 0 ? "#D3968C" : "rgba(247,244,213,0.2)" }}>
        {sessions > 0 ? `${sessions}×` : "—"}
      </span>
    </div>
  );
}

export function MuscleHeatmap({ muscles }: Props) {
  if (muscles.length === 0) return null;

  const regionMap = new Map<string, number>();
  for (const { muscle, sessions } of muscles) {
    const region = resolveRegion(muscle);
    if (region) regionMap.set(region, Math.max(regionMap.get(region) ?? 0, sessions));
  }

  const allValues = [...regionMap.values()];
  const max = allValues.length > 0 ? Math.max(...allValues) : 1;

  const get = (region: string) => regionMap.get(region) ?? 0;

  return (
    <Card className="lg:col-span-2">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-lg font-black text-cream">Muscle activation</h2>
        <span className="text-xs text-steel">Last 60 workouts</span>
      </div>
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-acid">{section.label}</p>
            <div className="space-y-3">
              {section.rows.map(({ label, region }) => (
                <MuscleRow key={region} label={label} sessions={get(region)} max={max} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
