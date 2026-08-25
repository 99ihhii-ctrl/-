import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import {
  FOCUS_AREA_LABELS,
  GOAL_LABELS,
  LEVEL_LABELS,
  PLACE_LABELS,
  WEEK_DAYS_AR,
  type UserProfile,
} from "@/lib/types";
import { calculateBmi } from "@/lib/bmi";

export const runtime = "nodejs";
// A full week of exercises plus 6 days x 4 meals x 3 alternative options is
// a lot of structured content. claude-sonnet-4-6 supports up to 128K output
// tokens; 16000 is comfortably inside the range the Anthropic SDK considers
// safe for a single non-streaming call. maxDuration/ANTHROPIC_TIMEOUT_MS are
// sized with real headroom above the latency that budget can take, and
// ANTHROPIC_TIMEOUT_MS stays below maxDuration so our own try/catch returns
// a clean JSON error instead of the platform hard-killing the function.
export const maxDuration = 280;
const ANTHROPIC_TIMEOUT_MS = 260_000;
const MAX_OUTPUT_TOKENS = 16_000;

const MODEL = "claude-sonnet-4-6";

const ExerciseSchema = z.object({
  nameAr: z.string().describe("اسم التمرين بالعربي"),
  nameEn: z
    .string()
    .describe(
      "الاسم الرسمي للتمرين بالإنجليزي كما يظهر بالضبط في قاعدة بيانات ExerciseDB (مثال: 'barbell bench press', 'push-up', 'squat') — بسيط ودقيق، 1-4 كلمات، مطابق لتسميات تمارين شائعة"
    ),
  targetMuscle: z.string().describe("العضلة المستهدفة بالعربي"),
  sets: z.number().int().min(1).max(6),
  reps: z.string().describe("مثال: 12-15"),
  notes: z.string().describe("شرح مختصر لطريقة الأداء أو نصيحة، لا يتجاوز 15 كلمة"),
});

const DayPlanSchema = z.object({
  day: z.string().describe("اسم اليوم بالعربي"),
  isRestDay: z.boolean(),
  focus: z
    .string()
    .describe("العضلة أو التركيز الرئيسي لليوم، نص فارغ إذا كان يوم راحة"),
  exercises: z
    .array(ExerciseSchema)
    .describe("فارغة [] إذا كان يوم راحة"),
});

const MealOptionSchema = z.object({
  name: z.string().describe("اسم الوجبة، مثال: كبسة دجاج"),
  items: z
    .string()
    .describe(
      "المقادير بالجرام، من المطبخ السعودي/العربي (أرز، دجاج، تمر، لبن، عدس، خضار...)، مختصرة"
    ),
  steps: z.array(z.string()).length(3).describe("3 خطوات تحضير مختصرة"),
  calories: z.number().int().describe("السعرات التقريبية لهذا الخيار"),
});

const DayMealsSchema = z.object({
  day: z.string().describe("اسم اليوم بالعربي"),
  breakfast: z
    .array(MealOptionSchema)
    .length(3)
    .describe("3 خيارات فطور مختلفة يختار المستخدم بينها"),
  lunch: z.array(MealOptionSchema).length(3).describe("3 خيارات غداء"),
  dinner: z.array(MealOptionSchema).length(3).describe("3 خيارات عشاء"),
  snack: z.array(MealOptionSchema).length(3).describe("3 خيارات سناك"),
});

const GeneratedPlanSchema = z.object({
  personalMessage: z
    .string()
    .describe(
      "جملة تشجيعية شخصية قصيرة موجهة للمستخدم باسمه، بناءً على هدفه ومستواه"
    ),
  weeklyPlan: z
    .array(DayPlanSchema)
    .length(6)
    .describe("6 أيام بالترتيب: السبت، الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس"),
  mealPlan: z
    .array(DayMealsSchema)
    .length(6)
    .describe(
      "6 أيام بنفس ترتيب weeklyPlan، بوجبات مختلفة كل يوم (لا تكرر نفس الوجبات بين الأيام)"
    ),
});

function buildPrompt(profile: UserProfile) {
  const bmi = calculateBmi(profile.weight, profile.height);

  return `أنت مدرب لياقة بدنية وأخصائي تغذية سعودي محترف. اصنع برنامج تمارين ووجبات أسبوعي مخصص للمستخدم التالي.

بيانات المستخدم:
- الاسم: ${profile.name}
- العمر: ${profile.age}
- الجنس: ${profile.gender === "male" ? "ذكر" : "أنثى"}
- الوزن: ${profile.weight} كيلوجرام
- الطول: ${profile.height} سم
- مؤشر كتلة الجسم (BMI): ${bmi?.bmi ?? "غير محدد"} (${bmi?.category ?? ""})
- الهدف: ${GOAL_LABELS[profile.goal]}
- المستوى: ${LEVEL_LABELS[profile.level]}
- مكان التمرين: ${PLACE_LABELS[profile.place]}
- عدد أيام التمرين أسبوعياً: ${profile.daysPerWeek}
- المنطقة اللي يبي يركز عليها أكثر: ${FOCUS_AREA_LABELS[profile.focusArea]}

الأسبوع يبدأ بيوم السبت وينتهي بالخميس، بهذا الترتيب بالضبط: ${WEEK_DAYS_AR.join(
    "، "
  )}. وزّع أيام التمرين (${profile.daysPerWeek} أيام) وأيام الراحة على هذا الترتيب بشكل منطقي (لا يكون فيه يومين تمرين شاق متتاليين لنفس العضلة بدون راحة كافية).

خصص وزناً أكبر من التمارين (بدون إهمال باقي الجسم) لمنطقة "${
    FOCUS_AREA_LABELS[profile.focusArea]
  }" لأنها أكثر شي يضايق المستخدم ويبي يركز عليه.
${
  profile.gender === "female"
    ? 'المستخدمة أنثى: أعطِ تركيزاً إضافياً لتمارين الأرداف والمؤخرة والبطن (glutes, hips, core) ضمن البرنامج الأسبوعي، وفي خطة الوجبات راعِ احتياجات المرأة الغذائية (مصادر حديد وكالسيوم وبروتين كافية).'
    : ""
}

خطة الوجبات: كل يوم من الأيام الستة له وجبات مختلفة عن باقي الأيام (تنوع حقيقي، بدون تكرار نفس الأطباق)، من المطبخ السعودي/العربي المألوف (أرز، دجاج، تمر، لبن، عدس، خضار، سمك، لحم...). كل وجبة (فطور/غداء/عشاء/سناك) تجي مع 3 خيارات بديلة مختلفة يختار المستخدم من بينها. اجعل السعرات موزونة حسب هدف المستخدم (${
    GOAL_LABELS[profile.goal]
  }) ووزنه.

كن مختصراً ومباشراً في كل حقل نصي لتوفير المساحة.`;
}

export async function POST(req: NextRequest) {
  try {
    const profile = (await req.json()) as UserProfile;

    if (!profile?.name || !profile?.weight || !profile?.height) {
      return NextResponse.json(
        { error: "بيانات المستخدم غير مكتملة" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY غير مهيأ في الخادم" },
        { status: 500 }
      );
    }

    // maxRetries: 0 — the SDK retries timeouts by default, which could push
    // the total wait past Vercel's maxDuration and get the function killed
    // before we can return a clean JSON error.
    const anthropic = new Anthropic({
      apiKey,
      timeout: ANTHROPIC_TIMEOUT_MS,
      maxRetries: 0,
    });

    const message = await anthropic.messages.parse({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [{ role: "user", content: buildPrompt(profile) }],
      output_config: {
        format: zodOutputFormat(GeneratedPlanSchema),
      },
    });

    if (message.stop_reason === "max_tokens") {
      console.error(
        "generate-plan truncated: hit max_tokens",
        MAX_OUTPUT_TOKENS
      );
      return NextResponse.json(
        {
          error:
            "البرنامج طويل جداً على المساحة المتاحة، جرب تقليل عدد أيام التمرين أو حاول مرة أخرى",
        },
        { status: 502 }
      );
    }

    if (!message.parsed_output) {
      console.error("generate-plan: parsed_output was null");
      return NextResponse.json(
        { error: "تعذر تحليل رد الذكاء الاصطناعي" },
        { status: 502 }
      );
    }

    return NextResponse.json(message.parsed_output);
  } catch (err) {
    console.error("generate-plan error", err);

    if (err instanceof Anthropic.APIConnectionTimeoutError) {
      return NextResponse.json(
        { error: "توليد البرنامج استغرق وقتاً أطول من المتوقع، حاول مرة أخرى" },
        { status: 504 }
      );
    }

    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "مفتاح ANTHROPIC_API_KEY غير صالح، تأكد منه في إعدادات الخادم" },
        { status: 500 }
      );
    }

    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "تم تجاوز الحد المسموح من الطلبات، حاول بعد قليل" },
        { status: 429 }
      );
    }

    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `خطأ من خدمة الذكاء الاصطناعي: ${err.message}` },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "حدث خطأ أثناء توليد البرنامج، حاول مرة أخرى" },
      { status: 500 }
    );
  }
}
