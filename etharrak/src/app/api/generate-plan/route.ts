import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  GOAL_LABELS,
  LEVEL_LABELS,
  PLACE_LABELS,
  WEEK_DAYS_AR,
  type GeneratedPlan,
  type UserProfile,
} from "@/lib/types";
import { calculateBmi } from "@/lib/bmi";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

function buildPrompt(profile: UserProfile) {
  const bmi = calculateBmi(profile.weight, profile.height);

  return `أنت مدرب لياقة بدنية وأخصائي تغذية محترف. اصنع برنامج تمارين ووجبات أسبوعي مخصص للمستخدم التالي، وأرجع الرد بصيغة JSON فقط بدون أي نص إضافي قبله أو بعده.

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

الأسبوع يبدأ بيوم السبت وينتهي بالخميس، بهذا الترتيب بالضبط: ${WEEK_DAYS_AR.join(
    "، "
  )}. وزّع أيام التمرين (${profile.daysPerWeek} أيام) وأيام الراحة على هذا الترتيب بشكل منطقي (لا يكون فيه يومين تمرين شاق متتاليين لنفس العضلة بدون راحة كافية).

مهم جداً بخصوص التمارين: لكل تمرين اكتب اسمه بالعربي (nameAr) واسمه الرسمي بالإنجليزي (nameEn) كما يظهر بالضبط في قاعدة بيانات ExerciseDB الشهيرة (مثال: "barbell bench press"، "push-up"، "squat")، لأن الاسم الإنجليزي سيُستخدم للبحث عن صورة GIF توضيحية عبر API خارجي، فيجب أن يكون الاسم بسيط ودقيق ومطابق لتسميات تمارين شائعة بالإنجليزية.

أرجع JSON بالضبط بهذا الشكل (schema):
{
  "personalMessage": "جملة تشجيعية شخصية قصيرة موجهة للمستخدم باسمه، بناءً على هدفه ومستواه",
  "weeklyPlan": [
    {
      "day": "اسم اليوم بالعربي",
      "isRestDay": false,
      "focus": "العضلة أو التركيز الرئيسي لليوم (فارغ إذا كان يوم راحة)",
      "exercises": [
        {
          "nameAr": "اسم التمرين بالعربي",
          "nameEn": "English exercise name matching ExerciseDB naming",
          "targetMuscle": "العضلة المستهدفة",
          "sets": 3,
          "reps": "12-15",
          "notes": "شرح مختصر لطريقة الأداء أو نصيحة"
        }
      ]
    }
  ],
  "mealPlan": {
    "breakfast": {
      "name": "فطور",
      "items": "المقادير بالجرام، كل مقدار بالجرام واضح",
      "steps": ["خطوة 1", "خطوة 2", "خطوة 3"],
      "calories": 400
    },
    "lunch": { "name": "غداء", "items": "...", "steps": ["...", "...", "..."], "calories": 600 },
    "dinner": { "name": "عشاء", "items": "...", "steps": ["...", "...", "..."], "calories": 450 },
    "snack": { "name": "سناك", "items": "...", "steps": ["...", "...", "..."], "calories": 150 }
  }
}

لأيام الراحة اجعل مصفوفة exercises فارغة []. اجعل خطط الوجبات مناسبة لهدف المستخدم (${GOAL_LABELS[profile.goal]}) ووزنه وسعراته التقريبية اليومية. أرجع JSON صالح فقط بدون markdown code fences.`;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1) return trimmed.slice(start, end + 1);
  return trimmed;
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

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: buildPrompt(profile) }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "رد غير متوقع من الذكاء الاصطناعي" },
        { status: 502 }
      );
    }

    const jsonStr = extractJson(textBlock.text);
    let plan: GeneratedPlan;
    try {
      plan = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "تعذر تحليل رد الذكاء الاصطناعي" },
        { status: 502 }
      );
    }

    return NextResponse.json(plan);
  } catch (err) {
    console.error("generate-plan error", err);
    return NextResponse.json(
      { error: "حدث خطأ أثناء توليد البرنامج، حاول مرة أخرى" },
      { status: 500 }
    );
  }
}
