export type Gender = "male" | "female";
export type Goal = "lose" | "gain" | "fitness";
export type Level = "beginner" | "intermediate";
export type Place = "home" | "gym";
export type DaysPerWeek = 3 | 4 | 5;

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

export interface Meal {
  name: string; // فطور / غداء / عشاء / سناك
  items: string; // ingredients with grams
  steps: string[]; // 3 steps
  calories: number;
}

export interface MealPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
}

export interface GeneratedPlan {
  personalMessage: string;
  weeklyPlan: DayPlan[];
  mealPlan: MealPlan;
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
