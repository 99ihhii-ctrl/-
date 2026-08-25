import type { Exercise } from "./types";

// A small curated bank of equipment-free exercises, so the "short on time"
// button on the dashboard can respond instantly without another Claude
// API round trip (we just fixed a timeout/truncation bug on the main
// generation call — this keeps that risk away from a button people may
// tap daily).
const BANK: Exercise[] = [
  {
    nameAr: "تمرين الضغط",
    nameEn: "push-up",
    targetMuscle: "الصدر",
    sets: 3,
    reps: "12-15",
    stepsAr: ["ضع يديك بعرض الكتفين على الأرض", "انزل جسمك حتى يقترب صدرك من الأرض", "ادفع للأعلى حتى تستقيم ذراعاك"],
    commonMistake: "إسقاط الحوض للأسفل بدل تثبيت الجسم كخط مستقيم.",
  },
  {
    nameAr: "سكوات",
    nameEn: "squat",
    targetMuscle: "الأرجل",
    sets: 3,
    reps: "15",
    stepsAr: ["قف وباعد قدميك بعرض الكتفين", "انزل كأنك تجلس على كرسي حتى توازي الفخذ الأرض", "ادفع من كعبيك للوقوف"],
    commonMistake: "ثني الظهر للأمام بدل تثبيته مستقيماً.",
  },
  {
    nameAr: "بلانك",
    nameEn: "plank",
    targetMuscle: "البطن",
    sets: 3,
    reps: "30-40 ثانية",
    stepsAr: ["استند على ساعديك وأطراف أصابع قدميك", "شد البطن واجعل جسمك خط مستقيم", "ثبت الوضعية للمدة المطلوبة"],
    commonMistake: "رفع الحوض للأعلى أو إسقاطه للأسفل.",
  },
  {
    nameAr: "طعنات",
    nameEn: "lunge",
    targetMuscle: "الأرجل",
    sets: 3,
    reps: "12 لكل رجل",
    stepsAr: ["اخطُ بقدم واحدة للأمام", "انزل حتى تصبح الركبتان بزاوية 90 درجة", "ادفع للعودة للوقوف وكرر بالرجل الثانية"],
    commonMistake: "ترك الركبة الأمامية تتجاوز أصابع القدم.",
  },
  {
    nameAr: "قفز جامبينج جاك",
    nameEn: "jumping jack",
    targetMuscle: "كامل الجسم",
    sets: 3,
    reps: "30 ثانية",
    stepsAr: ["قف بقدمين متلاصقتين وذراعين على الجانبين", "اقفز وباعد القدمين مع رفع الذراعين للأعلى", "اقفز وارجع للوضع الأصلي بسرعة ثابتة"],
    commonMistake: "فقدان الإيقاع بدل حركة سريعة منتظمة.",
  },
  {
    nameAr: "ديبس على الكرسي",
    nameEn: "triceps dip",
    targetMuscle: "الترايسبس",
    sets: 3,
    reps: "12-15",
    stepsAr: ["استند بيديك على حافة كرسي ثابت", "انزل جسمك بثني المرفقين للخلف", "ادفع للأعلى حتى تستقيم الذراعان"],
    commonMistake: "إبعاد المرفقين للجانبين بدل تركهما للخلف.",
  },
  {
    nameAr: "بيرد دوق",
    nameEn: "bird dog",
    targetMuscle: "أسفل الظهر",
    sets: 3,
    reps: "10 لكل جانب",
    stepsAr: ["ابدأ على أربع (يدين وركبتين)", "مد ذراعاً ورجلاً معاكسة بنفس الوقت", "ثبت لثانيتين وارجع وكرر بالجانب الآخر"],
    commonMistake: "التواء الحوض بدل تثبيته موازياً للأرض.",
  },
  {
    nameAr: "جسر الأرداف",
    nameEn: "glute bridge",
    targetMuscle: "الأرداف",
    sets: 3,
    reps: "15",
    stepsAr: ["استلق على ظهرك وثنِ ركبتيك", "ارفع الحوض للأعلى بالضغط على الأرداف", "انزل ببطء وكرر"],
    commonMistake: "الدفع بأسفل الظهر بدل الأرداف.",
  },
  {
    nameAr: "تسلق الجبل",
    nameEn: "mountain climber",
    targetMuscle: "كامل الجسم",
    sets: 3,
    reps: "30 ثانية",
    stepsAr: ["ابدأ بوضعية الضغط", "اجذب ركبة واحدة نحو صدرك بسرعة", "بدّل الرجلين بحركة متتابعة سريعة"],
    commonMistake: "رفع الحوض للأعلى بدل الحفاظ على خط مستقيم.",
  },
  {
    nameAr: "سكوات مع قفزة",
    nameEn: "jump squat",
    targetMuscle: "الأرجل",
    sets: 3,
    reps: "10",
    stepsAr: ["ابدأ بوضعية سكوات عادية", "اقفز للأعلى بقوة من الأرجل", "اهبط بنعومة وارجع مباشرة لوضعية سكوات"],
    commonMistake: "الهبوط بقوة على الركبتين المستقيمتين.",
  },
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
