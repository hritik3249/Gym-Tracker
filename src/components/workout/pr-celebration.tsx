"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Trophy } from "lucide-react";

type Props = {
  pr: { exercise: string; weight: number } | null;
  onDone: () => void;
};

const COLORS = ["#D3968C", "#839958", "#F7F4D5", "#c06050", "#105666", "#7a9e6a", "#D3968C", "#839958"];

export function PrCelebration({ pr, onDone }: Props) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        left: `${(i * 37 + 11) % 100}%`,
        color: COLORS[i % COLORS.length],
        delay: `${(i * 70) % 500}ms`,
        duration: `${950 + (i * 130) % 650}ms`,
        width: `${5 + (i * 4) % 9}px`,
        height: `${4 + (i * 3) % 8}px`,
        borderRadius: i % 3 === 0 ? "50%" : "2px",
      })),
    [],
  );

  const dismiss = useCallback(() => onDone(), [onDone]);

  useEffect(() => {
    if (!pr) return;
    const t = setTimeout(dismiss, 2800);
    return () => clearTimeout(t);
  }, [pr, dismiss]);

  if (!pr) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      aria-live="assertive"
    >
      {/* Confetti */}
      {confetti.map((c, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: c.left,
            width: c.width,
            height: c.height,
            backgroundColor: c.color,
            borderRadius: c.borderRadius,
            animation: `confetti-fall ${c.duration} ${c.delay} ease-in forwards`,
          }}
        />
      ))}

      {/* Banner */}
      <div
        className="mx-4 flex flex-col items-center gap-3 rounded-2xl border border-acid/30 bg-panel px-8 py-6 text-center shadow-glow"
        style={{ animation: "pr-pop 420ms cubic-bezier(0.34,1.56,0.64,1) forwards" }}
      >
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-acid/20 text-acid">
          <Trophy size={32} />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-acid">New Personal Record 🎉</p>
          <p className="mt-1 text-xl font-black text-cream">{pr.exercise}</p>
          <p className="mt-0.5 text-4xl font-black text-acid">{pr.weight} kg</p>
        </div>
        <p className="text-xs text-steel">Keep crushing it!</p>
      </div>
    </div>
  );
}
