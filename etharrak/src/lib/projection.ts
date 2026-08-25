import type { DaysPerWeek, Goal } from "./types";

export interface WeightProjection {
  in1Month: number;
  in3Months: number;
}

// Rough, motivational estimate only — not medical advice. Uses a safe
// weekly rate of change as a percentage of bodyweight, scaled by how many
// days per week the user trains (more consistency -> closer to the full
// safe rate).
function weeklyRatePercent(goal: Goal, daysPerWeek: DaysPerWeek): number {
  const consistency = 0.6 + 0.4 * (daysPerWeek / 5);

  if (goal === "lose") return -0.5 * consistency;
  if (goal === "gain") return 0.3 * consistency;
  return -0.05 * consistency; // fitness: weight roughly stable
}

export function estimateWeightProjection(
  weightKg: number,
  goal: Goal,
  daysPerWeek: DaysPerWeek
): WeightProjection {
  const weeklyRate = weeklyRatePercent(goal, daysPerWeek) / 100;

  const project = (weeks: number) => {
    const value = weightKg * Math.pow(1 + weeklyRate, weeks);
    return Math.round(value * 10) / 10;
  };

  return {
    in1Month: project(4.345),
    in3Months: project(13.04),
  };
}
