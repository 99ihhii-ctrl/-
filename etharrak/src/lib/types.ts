export type Gender = "male" | "female";
export type Goal = "lose" | "gain" | "fitness";
export type Level = "beginner" | "intermediate";
export type Place = "home" | "gym";
export type DaysPerWeek = 3 | 4 | 5;
export type FocusArea =
  | "belly"
  | "arms"
  | "chest"
  | "glutes"
  | "back"
  | "full_body";

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  weight: number; // kg
  height: number; // cm
  goal: Goal;
  level: Level;
  place: Place;
  daysPerWeek: DaysPerWeek;
  focusArea: FocusArea;
}

export interface Exercise {
  nameAr: string;
  nameEn: string;
  targetMuscle: string;
  sets: number;
  reps: string;
  notes: string;
}

export interface DayPlan {
  day: string; // e.g. السبت
  isRestDay: boolean;
  focus?: string; // e.g. صدر وترايسبس
  exercises: Exercise[];
}

export interface MealOption {
  name: string; // e.g. أرز بخاري بالدجاج
  items: string; // ingredients with grams
  steps: string[]; // 3 steps
  calories: number;
}

export interface DayMeals {
  day: string; // e.g. السبت
  breakfast: MealOption[]; // 3 alternative options
  lunch: MealOption[];
  dinner: MealOption[];
  snack: MealOption[];
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "فطور",
  lunch: "غداء",
  dinner: "عشاء",
  snack: "سناك",
};

export interface GeneratedPlan {
  personalMessage: string;
  weeklyPlan: DayPlan[];
  mealPlan: DayMeals[]; // one entry per day, matching WEEK_DAYS_AR
}

export interface BmiResult {
  bmi: number;
  category: string;
  colorClass: string;
}

export const WEEK_DAYS_AR = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
] as const;

export const GOAL_LABELS: Record<Goal, string> = {
  lose: "تنحيف",
  gain: "تضخيم",
  fitness: "لياقة عامة",
};

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
};

export const PLACE_LABELS: Record<Place, string> = {
  home: "بيت",
  gym: "نادي",
};

export const FOCUS_AREA_LABELS: Record<FocusArea, string> = {
  belly: "الكرش",
  arms: "الذراعين",
  chest: "الصدر",
  glutes: "الأرداف",
  back: "الظهر",
  full_body: "الجسم كله",
};

// ---- Dashboard (localStorage-backed, no login yet) ----

export type WorkoutDifficulty = "easy" | "ok" | "hard";

export interface WeightLogEntry {
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface MeasurementEntry {
  date: string; // YYYY-MM-DD
  waist?: number;
  chest?: number;
  hips?: number;
}

export interface DailyTip {
  date: string; // YYYY-MM-DD, so we only fetch once per day
  text: string;
}

export interface DifficultyState {
  level: number; // -2..+2, applied to displayed sets
  easyStreak: number;
  hardStreak: number;
}

export interface DashboardState {
  profile: UserProfile;
  plan: GeneratedPlan;
  startWeight: number;
  weightLog: WeightLogEntry[];
  measurements: MeasurementEntry[];
  difficulty: DifficultyState;
  dailyTip?: DailyTip;
  createdAt: string;
}
