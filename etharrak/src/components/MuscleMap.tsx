interface Zone {
  id: string;
  view: "front" | "back";
  cx: number;
  cy: number;
  label: string;
  keywords: string[];
  animClass: string;
}

const ZONES: Zone[] = [
  { id: "shoulders", view: "front", cx: 50, cy: 30, label: "الأكتاف", keywords: ["كتف", "أكتاف", "shoulder", "delt"], animClass: "anim-swing-arms" },
  { id: "chest", view: "front", cx: 50, cy: 45, label: "الصدر", keywords: ["صدر", "chest", "pec"], animClass: "anim-swing-arms" },
  { id: "biceps", view: "front", cx: 20, cy: 65, label: "الباي", keywords: ["باي", "bicep"], animClass: "anim-swing-arms" },
  { id: "forearm", view: "front", cx: 20, cy: 95, label: "الساعد", keywords: ["ساعد", "forearm", "قبضة", "grip"], animClass: "anim-swing-arms" },
  { id: "abs", view: "front", cx: 50, cy: 78, label: "البطن", keywords: ["بطن", "كرش", "abs", "core", "خاصرة", "oblique"], animClass: "anim-bend-torso" },
  { id: "quads", view: "front", cx: 50, cy: 130, label: "الفخذ", keywords: ["فخذ", "أرجل", "رجل", "ساق", "quad", "leg"], animClass: "anim-bend-legs" },
  { id: "calves", view: "front", cx: 50, cy: 175, label: "السمانة", keywords: ["سمانة", "calf", "calves"], animClass: "anim-bend-legs" },
  { id: "back", view: "back", cx: 50, cy: 45, label: "الظهر", keywords: ["ظهر", "back", "lat", "عريض"], animClass: "anim-swing-arms" },
  { id: "triceps", view: "back", cx: 80, cy: 65, label: "الترايسبس", keywords: ["ترايسبس", "tricep"], animClass: "anim-swing-arms" },
  { id: "glutes", view: "back", cx: 50, cy: 100, label: "الأرداف", keywords: ["ارداف", "أرداف", "مؤخرة", "glute", "hip"], animClass: "anim-pulse-hips" },
  { id: "hamstrings", view: "back", cx: 50, cy: 130, label: "خلف الفخذ", keywords: ["خلف الفخذ", "hamstring"], animClass: "anim-bend-legs" },
];

function findZone(targetMuscle: string): Zone {
  const t = targetMuscle.toLowerCase();
  return (
    ZONES.find((z) => z.keywords.some((k) => t.includes(k.toLowerCase()))) ??
    ZONES[1]
  );
}

function BodySilhouette({ zone }: { zone: Zone }) {
  const armsAnim = zone.animClass === "anim-swing-arms" ? zone.animClass : "";
  const legsAnim = zone.animClass === "anim-bend-legs" ? zone.animClass : "";
  const torsoAnim = zone.animClass === "anim-bend-torso" ? zone.animClass : "";
  const hipsAnim = zone.animClass === "anim-pulse-hips" ? zone.animClass : "";

  return (
    <g fill="#1f2937" stroke="#374151" strokeWidth="1">
      <circle cx="50" cy="14" r="10" />
      <g className={torsoAnim}>
        <rect x="35" y="24" width="30" height="70" rx="10" />
      </g>
      <g className={armsAnim}>
        <rect x="18" y="26" width="12" height="75" rx="6" />
      </g>
      <g className={armsAnim}>
        <rect x="70" y="26" width="12" height="75" rx="6" />
      </g>
      <g className={hipsAnim}>
        <rect x="33" y="94" width="34" height="20" rx="6" />
      </g>
      <g className={legsAnim}>
        <rect x="35" y="114" width="12" height="45" rx="5" />
      </g>
      <g className={legsAnim}>
        <rect x="53" y="114" width="12" height="45" rx="5" />
      </g>
      <g className={legsAnim}>
        <rect x="36" y="159" width="10" height="35" rx="4" />
      </g>
      <g className={legsAnim}>
        <rect x="54" y="159" width="10" height="35" rx="4" />
      </g>
    </g>
  );
}

export default function MuscleMap({ targetMuscle }: { targetMuscle: string }) {
  const zone = findZone(targetMuscle);
  const arrowFromX = zone.cx < 50 ? zone.cx - 22 : zone.cx + 22;
  const arrowFromY = zone.cy - 10;

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <svg viewBox="0 0 100 200" className="h-28 w-16">
        <BodySilhouette zone={zone} />
        <line
          x1={arrowFromX}
          y1={arrowFromY}
          x2={zone.cx}
          y2={zone.cy}
          stroke="#4ade80"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="3"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="#4ade80" />
          </marker>
        </defs>
        <circle cx={zone.cx} cy={zone.cy} r="6" fill="#4ade80" fillOpacity="0.3" />
        <circle cx={zone.cx} cy={zone.cy} r="3" fill="#4ade80" />
      </svg>
      <span className="text-[10px] font-semibold text-primary">{zone.label}</span>
    </div>
  );
}
