import type { WeightLogEntry } from "@/lib/types";

export default function WeightChart({ log }: { log: WeightLogEntry[] }) {
  if (log.length < 2) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        سجّل وزنك لأكثر من يوم عشان يظهر لك الرسم البياني.
      </p>
    );
  }

  const width = 300;
  const height = 100;
  const padding = 10;

  const weights = log.map((e) => e.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  const points = log.map((entry, i) => {
    const x = padding + (i / (log.length - 1)) * (width - padding * 2);
    const y =
      height - padding - ((entry.weight - min) / range) * (height - padding * 2);
    return { x, y, entry };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <path d={pathD} fill="none" stroke="#4ade80" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#4ade80" />
      ))}
    </svg>
  );
}
