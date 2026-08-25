import type { Exercise } from "./types";

// A small curated bank of equipment-free exercises, so the "short on time"
// button on the dashboard can respond instantly without another Claude
// API round trip (we just fixed a timeout/truncation bug on the main
// generation call — this keeps that risk away from a button people may
// tap daily).
const BANK: Exercise[] = [
  { nameAr: "تمرين الضغط", nameEn: "push-up", targetMuscle: "الصدر", sets: 3, reps: "12-15", notes: "حافظ على استقامة الجسم بالكامل." },
  { nameAr: "سكوات", nameEn: "squat", targetMuscle: "الأرجل", sets: 3, reps: "15", notes: "انزل حتى توازي الفخذ الأرض." },
  { nameAr: "بلانك", nameEn: "plank", targetMuscle: "البطن", sets: 3, reps: "30-40 ثانية", notes: "شد البطن وحافظ على استقامة الظهر." },
  { nameAr: "طعنات", nameEn: "lunge", targetMuscle: "الأرجل", sets: 3, reps: "12 لكل رجل", notes: "حافظ على توازنك ولا تلمس الركبة الأرض بقوة." },
  { nameAr: "قفز جامبينج جاك", nameEn: "jumping jack", targetMuscle: "كامل الجسم", sets: 3, reps: "30 ثانية", notes: "حركة سريعة لرفع نبض القلب." },
  { nameAr: "ديبس على الكرسي", nameEn: "bench dip", targetMuscle: "الترايسبس", sets: 3, reps: "12-15", notes: "استخدم كرسياً ثابتاً." },
  { nameAr: "بيرد دوق", nameEn: "bird dog", targetMuscle: "أسفل الظهر", sets: 3, reps: "10 لكل جانب", notes: "حافظ على ثبات الحوض." },
  { nameAr: "جسر الأرداف", nameEn: "glute bridge", targetMuscle: "الأرداف", sets: 3, reps: "15", notes: "اضغط بالأرداف في الأعلى." },
  { nameAr: "تسلق الجبل", nameEn: "mountain climber", targetMuscle: "كامل الجسم", sets: 3, reps: "30 ثانية", notes: "حافظ على سرعة ثابتة." },
  { nameAr: "سكوات مع قفزة", nameEn: "jump squat", targetMuscle: "الأرجل", sets: 3, reps: "10", notes: "اهبط بنعومة لحماية الركبتين." },
];

const COUNT_BY_MINUTES: Record<10 | 15 | 20, number> = {
  10: 3,
  15: 4,
  20: 6,
};

export function generateQuickWorkout(minutes: 10 | 15 | 20): Exercise[] {
  const count = COUNT_BY_MINUTES[minutes];
  const shuffled = [...BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
