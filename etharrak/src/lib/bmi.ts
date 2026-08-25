import type { BmiResult } from "./types";

export function calculateBmi(weightKg: number, heightCm: number): BmiResult | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;

  if (bmi < 18.5) {
    return { bmi: rounded, category: "نقص في الوزن", colorClass: "text-blue-400" };
  }
  if (bmi < 25) {
    return { bmi: rounded, category: "وزن طبيعي", colorClass: "text-primary" };
  }
  if (bmi < 30) {
    return { bmi: rounded, category: "وزن زائد", colorClass: "text-accent" };
  }
  return { bmi: rounded, category: "سمنة", colorClass: "text-red-500" };
}
