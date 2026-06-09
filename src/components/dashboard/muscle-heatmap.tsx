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

const BASE = "rgba(247,244,213,0.06)";
function muscleColor(sessions: number): string {
  if (sessions === 0) return BASE;
  if (sessions === 1) return "rgba(211,150,140,0.38)";
  if (sessions <= 3) return "rgba(211,150,140,0.65)";
  return "rgba(211,150,140,0.92)";
}

const BODY_BG = "#0D2B1E";
const OUTLINE = "rgba(247,244,213,0.07)";

function FrontBody({ c }: { c: (r: string) => string }) {
  return (
    <svg viewBox="0 0 100 250" className="h-[260px] w-auto">
      {/* Silhouette base */}
      <circle cx="50" cy="16" r="14" fill={BODY_BG} stroke={OUTLINE} strokeWidth="1" />
      <rect x="44" y="29" width="12" height="11" rx="3" fill={BODY_BG} />
      <rect x="26" y="38" width="48" height="74" rx="10" fill={BODY_BG} stroke={OUTLINE} strokeWidth="0.5" />
      <rect x="10" y="39" width="17" height="76" rx="8" fill={BODY_BG} stroke={OUTLINE} strokeWidth="0.5" />
      <rect x="73" y="39" width="17" height="76" rx="8" fill={BODY_BG} stroke={OUTLINE} strokeWidth="0.5" />
      <rect x="28" y="110" width="20" height="132" rx="10" fill={BODY_BG} stroke={OUTLINE} strokeWidth="0.5" />
      <rect x="52" y="110" width="20" height="132" rx="10" fill={BODY_BG} stroke={OUTLINE} strokeWidth="0.5" />

      {/* Shoulders */}
      <ellipse cx="22" cy="46" rx="12" ry="10" fill={c("shoulder")}><title>Shoulders</title></ellipse>
      <ellipse cx="78" cy="46" rx="12" ry="10" fill={c("shoulder")}><title>Shoulders</title></ellipse>

      {/* Chest */}
      <path d="M 30,40 Q 50,36 70,40 L 70,66 Q 50,72 30,66 Z" fill={c("chest")}><title>Chest</title></path>

      {/* Biceps */}
      <ellipse cx="18" cy="65" rx="7.5" ry="16" fill={c("bicep")}><title>Biceps</title></ellipse>
      <ellipse cx="82" cy="65" rx="7.5" ry="16" fill={c("bicep")}><title>Biceps</title></ellipse>

      {/* Forearms */}
      <ellipse cx="15" cy="97" rx="6" ry="14" fill={c("forearm")}><title>Forearms</title></ellipse>
      <ellipse cx="85" cy="97" rx="6" ry="14" fill={c("forearm")}><title>Forearms</title></ellipse>

      {/* Abs */}
      <rect x="36" y="66" width="28" height="42" rx="8" fill={c("abs")}><title>Abs</title></rect>

      {/* Quads */}
      <ellipse cx="37" cy="152" rx="13" ry="26" fill={c("quad")}><title>Quads</title></ellipse>
      <ellipse cx="63" cy="152" rx="13" ry="26" fill={c("quad")}><title>Quads</title></ellipse>

      {/* Calves */}
      <ellipse cx="37" cy="204" rx="9" ry="20" fill={c("calf")}><title>Calves</title></ellipse>
      <ellipse cx="63" cy="204" rx="9" ry="20" fill={c("calf")}><title>Calves</title></ellipse>
    </svg>
  );
}

function BackBody({ c }: { c: (r: string) => string }) {
  return (
    <svg viewBox="0 0 100 250" className="h-[260px] w-auto">
      {/* Silhouette base */}
      <circle cx="50" cy="16" r="14" fill={BODY_BG} stroke={OUTLINE} strokeWidth="1" />
      <rect x="44" y="29" width="12" height="11" rx="3" fill={BODY_BG} />
      <rect x="26" y="38" width="48" height="74" rx="10" fill={BODY_BG} stroke={OUTLINE} strokeWidth="0.5" />
      <rect x="10" y="39" width="17" height="76" rx="8" fill={BODY_BG} stroke={OUTLINE} strokeWidth="0.5" />
      <rect x="73" y="39" width="17" height="76" rx="8" fill={BODY_BG} stroke={OUTLINE} strokeWidth="0.5" />
      <rect x="28" y="110" width="20" height="132" rx="10" fill={BODY_BG} stroke={OUTLINE} strokeWidth="0.5" />
      <rect x="52" y="110" width="20" height="132" rx="10" fill={BODY_BG} stroke={OUTLINE} strokeWidth="0.5" />

      {/* Traps */}
      <ellipse cx="50" cy="43" rx="22" ry="12" fill={c("trap")}><title>Traps</title></ellipse>

      {/* Rear delts */}
      <ellipse cx="22" cy="46" rx="11" ry="9" fill={c("rear_shoulder")}><title>Rear Delts</title></ellipse>
      <ellipse cx="78" cy="46" rx="11" ry="9" fill={c("rear_shoulder")}><title>Rear Delts</title></ellipse>

      {/* Triceps */}
      <ellipse cx="18" cy="65" rx="7.5" ry="16" fill={c("tricep")}><title>Triceps</title></ellipse>
      <ellipse cx="82" cy="65" rx="7.5" ry="16" fill={c("tricep")}><title>Triceps</title></ellipse>

      {/* Lats */}
      <ellipse cx="28" cy="80" rx="15" ry="23" fill={c("lat")}><title>Lats</title></ellipse>
      <ellipse cx="72" cy="80" rx="15" ry="23" fill={c("lat")}><title>Lats</title></ellipse>

      {/* Lower back */}
      <rect x="34" y="102" width="32" height="20" rx="7" fill={c("lower_back")}><title>Lower Back</title></rect>

      {/* Glutes */}
      <ellipse cx="37" cy="132" rx="15" ry="14" fill={c("glute")}><title>Glutes</title></ellipse>
      <ellipse cx="63" cy="132" rx="15" ry="14" fill={c("glute")}><title>Glutes</title></ellipse>

      {/* Hamstrings */}
      <ellipse cx="37" cy="162" rx="13" ry="23" fill={c("hamstring")}><title>Hamstrings</title></ellipse>
      <ellipse cx="63" cy="162" rx="13" ry="23" fill={c("hamstring")}><title>Hamstrings</title></ellipse>

      {/* Calves */}
      <ellipse cx="37" cy="204" rx="9" ry="20" fill={c("calf")}><title>Calves</title></ellipse>
      <ellipse cx="63" cy="204" rx="9" ry="20" fill={c("calf")}><title>Calves</title></ellipse>
    </svg>
  );
}

export function MuscleHeatmap({ muscles }: Props) {
  if (muscles.length === 0) return null;

  const regionMap = new Map<string, number>();
  for (const { muscle, sessions } of muscles) {
    const region = resolveRegion(muscle);
    if (region) regionMap.set(region, Math.max(regionMap.get(region) ?? 0, sessions));
  }

  const c = (region: string) => muscleColor(regionMap.get(region) ?? 0);

  return (
    <Card className="lg:col-span-2">
      <h2 className="mb-5 text-lg font-black text-cream">Muscle activation</h2>
      <div className="flex flex-wrap items-start justify-around gap-6">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-steel">Front</p>
          <FrontBody c={c} />
        </div>

        {/* Legend + top muscles */}
        <div className="flex flex-col gap-4 py-4">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-steel">Intensity</p>
            <div className="space-y-2">
              {[
                { label: "High (4+ sessions)", color: muscleColor(4) },
                { label: "Medium (2–3)", color: muscleColor(2) },
                { label: "Low (1 session)", color: muscleColor(1) },
                { label: "Not trained", color: BASE },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="h-3 w-5 rounded-sm border border-white/5" style={{ backgroundColor: color }} />
                  <span className="text-xs text-steel">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-steel">Most worked</p>
            <div className="space-y-2">
              {muscles.slice(0, 5).map(({ muscle, sessions }) => (
                <div key={muscle} className="flex items-center justify-between gap-6">
                  <span className="text-xs text-cream">{muscle}</span>
                  <span className="text-xs font-black text-acid">{sessions}×</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-steel">Back</p>
          <BackBody c={c} />
        </div>
      </div>
    </Card>
  );
}
