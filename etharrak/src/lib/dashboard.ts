import type {
  DashboardState,
  Exercise,
  GeneratedPlan,
  MeasurementEntry,
  UserProfile,
  WorkoutDifficulty,
} from "./types";

const STORAGE_KEY = "etharrak_dashboard";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadDashboardState(): DashboardState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DashboardState;
  } catch {
    return null;
  }
}

export function saveDashboardState(state: DashboardState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Called whenever a new plan is generated — becomes the active tracked plan.
// If the user was already tracking the same starting weight, we keep their
// weight/measurement history instead of wiping it.
export function initDashboardFromPlan(
  profile: UserProfile,
  plan: GeneratedPlan
): DashboardState {
  const existing = loadDashboardState();

  const state: DashboardState = {
    profile,
    plan,
    startWeight: existing?.startWeight ?? profile.weight,
    weightLog: existing?.weightLog ?? [
      { date: todayStr(), weight: profile.weight },
    ],
    measurements: existing?.measurements ?? [],
    difficulty: existing?.difficulty ?? {
      level: 0,
      easyStreak: 0,
      hardStreak: 0,
    },
    dailyTip: existing?.dailyTip,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };

  saveDashboardState(state);
  return state;
}

export function logWeight(state: DashboardState, weight: number): DashboardState {
  const today = todayStr();
  const weightLog = state.weightLog.filter((e) => e.date !== today);
  weightLog.push({ date: today, weight });
  weightLog.sort((a, b) => a.date.localeCompare(b.date));
  const next = { ...state, weightLog };
  saveDashboardState(next);
  return next;
}

export function logMeasurement(
  state: DashboardState,
  entry: Omit<MeasurementEntry, "date">
): DashboardState {
  const today = todayStr();
  const measurements = state.measurements.filter((e) => e.date !== today);
  measurements.push({ date: today, ...entry });
  measurements.sort((a, b) => a.date.localeCompare(b.date));
  const next = { ...state, measurements };
  saveDashboardState(next);
  return next;
}

// Difficulty auto-adjustment: 3 "easy" in a row bumps the level up (harder
// program); 2 "hard" in a row bumps it down (easier program). "ok" resets
// both streaks. Level is clamped to [-2, 2] and applied client-side to the
// displayed sets/reps — no extra API call needed.
export function recordWorkoutDifficulty(
  state: DashboardState,
  rating: WorkoutDifficulty
): DashboardState {
  const d = { ...state.difficulty };

  if (rating === "easy") {
    d.easyStreak += 1;
    d.hardStreak = 0;
    if (d.easyStreak >= 3) {
      d.level = Math.min(2, d.level + 1);
      d.easyStreak = 0;
    }
  } else if (rating === "hard") {
    d.hardStreak += 1;
    d.easyStreak = 0;
    if (d.hardStreak >= 2) {
      d.level = Math.max(-2, d.level - 1);
      d.hardStreak = 0;
    }
  } else {
    d.easyStreak = 0;
    d.hardStreak = 0;
  }

  const next = { ...state, difficulty: d };
  saveDashboardState(next);
  return next;
}

export function applyDifficultyAdjustment(
  exercise: Exercise,
  level: number
): Exercise {
  if (level === 0) return exercise;
  const sets = Math.min(6, Math.max(2, exercise.sets + level));
  return { ...exercise, sets };
}
