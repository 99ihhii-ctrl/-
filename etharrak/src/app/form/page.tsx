"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { calculateBmi } from "@/lib/bmi";
import type {
  DaysPerWeek,
  Gender,
  Goal,
  Level,
  Place,
  UserProfile,
} from "@/lib/types";

const goalOptions: { value: Goal; label: string }[] = [
  { value: "lose", label: "تنحيف" },
  { value: "gain", label: "تضخيم" },
  { value: "fitness", label: "لياقة عامة" },
];

const levelOptions: { value: Level; label: string }[] = [
  { value: "beginner", label: "مبتدئ" },
  { value: "intermediate", label: "متوسط" },
];

const placeOptions: { value: Place; label: string }[] = [
  { value: "home", label: "بيت" },
  { value: "gym", label: "نادي" },
];

const daysOptions: DaysPerWeek[] = [3, 4, 5];

export default function FormPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState<Goal>("fitness");
  const [level, setLevel] = useState<Level>("beginner");
  const [place, setPlace] = useState<Place>("home");
  const [daysPerWeek, setDaysPerWeek] = useState<DaysPerWeek>(3);
  const [error, setError] = useState("");

  const bmi = useMemo(
    () => calculateBmi(parseFloat(weight), parseFloat(height)),
    [weight, height]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const ageNum = parseInt(age, 10);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!name.trim()) return setError("الرجاء إدخال الاسم");
    if (!ageNum || ageNum < 10 || ageNum > 90)
      return setError("الرجاء إدخال عمر صحيح");
    if (!weightNum || weightNum < 30 || weightNum > 300)
      return setError("الرجاء إدخال وزن صحيح");
    if (!heightNum || heightNum < 100 || heightNum > 250)
      return setError("الرجاء إدخال طول صحيح");

    const profile: UserProfile = {
      name: name.trim(),
      age: ageNum,
      gender,
      weight: weightNum,
      height: heightNum,
      goal,
      level,
      place,
      daysPerWeek,
    };

    sessionStorage.setItem("etharrak_profile", JSON.stringify(profile));
    router.push("/generating");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary"
        >
          العودة للرئيسية
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M14 7l5 5-5 5M19 12H5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <h1 className="text-3xl font-extrabold">أخبرنا عن نفسك</h1>
        <p className="mt-2 text-gray-400">
          كل هذي المعلومات تساعد الذكاء الاصطناعي يبني لك برنامج دقيق ومخصص.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسمك"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">العمر</label>
              <input
                type="number"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="مثال: 25"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">الجنس</label>
              <div className="grid grid-cols-2 gap-2">
                {(["male", "female"] as Gender[]).map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGender(g)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                      gender === g
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-surface text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {g === "male" ? "ذكر" : "أنثى"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                الوزن (كيلو)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="مثال: 70"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">
                الطول (سم)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="مثال: 175"
                className="input-field"
              />
            </div>
          </div>

          {bmi && (
            <div className="glass-card flex items-center justify-between rounded-2xl p-5">
              <div>
                <p className="text-sm text-gray-400">مؤشر كتلة الجسم (BMI)</p>
                <p className={`text-2xl font-extrabold ${bmi.colorClass}`}>
                  {bmi.bmi}
                </p>
              </div>
              <div
                className={`rounded-full border border-current/30 px-4 py-1.5 text-sm font-bold ${bmi.colorClass}`}
              >
                {bmi.category}
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold">الهدف</label>
            <div className="grid grid-cols-3 gap-2">
              {goalOptions.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => setGoal(o.value)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                    goal === o.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">المستوى</label>
            <div className="grid grid-cols-2 gap-2">
              {levelOptions.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => setLevel(o.value)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                    level === o.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              مكان التمرين
            </label>
            <div className="grid grid-cols-2 gap-2">
              {placeOptions.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => setPlace(o.value)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                    place === o.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              عدد أيام التمرين أسبوعياً
            </label>
            <div className="grid grid-cols-3 gap-2">
              {daysOptions.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDaysPerWeek(d)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                    daysPerWeek === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {d} أيام
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full text-lg">
            توليد برنامجي الآن
          </button>
        </form>
      </div>
    </main>
  );
}
