"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  applyDifficultyAdjustment,
  loadDashboardState,
  logMeasurement,
  logWeight,
  recordWorkoutDifficulty,
  saveDashboardState,
} from "@/lib/dashboard";
import { generateQuickWorkout } from "@/lib/quickWorkout";
import type { DashboardState, Exercise, WorkoutDifficulty } from "@/lib/types";
import ExerciseGif from "@/components/ExerciseGif";
import MuscleMap from "@/components/MuscleMap";
import WeightChart from "@/components/WeightChart";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const DIFFICULTY_LABELS: { value: WorkoutDifficulty; label: string }[] = [
  { value: "easy", label: "سهل" },
  { value: "ok", label: "مناسب" },
  { value: "hard", label: "صعب" },
];

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState | null | "empty">(null);
  const [weightInput, setWeightInput] = useState("");
  const [waist, setWaist] = useState("");
  const [chest, setChest] = useState("");
  const [hips, setHips] = useState("");
  const [ratedDays, setRatedDays] = useState<Set<string>>(new Set());
  const [difficultyMsg, setDifficultyMsg] = useState("");

  const [tipLoading, setTipLoading] = useState(false);
  const [tipError, setTipError] = useState("");

  const [quickMinutes, setQuickMinutes] = useState<10 | 15 | 20 | null>(null);
  const [quickExercises, setQuickExercises] = useState<Exercise[] | null>(null);

  const tipFetchStarted = useRef(false);

  useEffect(() => {
    const loaded = loadDashboardState();
    setState(loaded ?? "empty");
    if (loaded) {
      setWeightInput(
        String(
          loaded.weightLog[loaded.weightLog.length - 1]?.weight ??
            loaded.startWeight
        )
      );
    }
  }, []);

  useEffect(() => {
    if (state === null || state === "empty") return;
    if (state.dailyTip?.date === todayStr()) return;
    if (tipFetchStarted.current) return;
    tipFetchStarted.current = true;

    setTipLoading(true);
    setTipError("");
    fetch("/api/daily-tip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.profile),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "تعذر توليد النصيحة");
        const next = {
          ...state,
          dailyTip: { date: todayStr(), text: data.tip as string },
        };
        saveDashboardState(next);
        setState(next);
      })
      .catch((err) => setTipError(err.message))
      .finally(() => setTipLoading(false));
  }, [state]);

  if (state === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-gray-400">
        جارٍ التحميل...
      </main>
    );
  }

  if (state === "empty") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="text-2xl font-bold">ما فيه برنامج نشط بعد</h1>
        <p className="text-gray-400">
          ولّد برنامجك الأول عشان تقدر تستخدم لوحة المتابعة.
        </p>
        <Link href="/form" className="btn-primary mt-2">
          ابدأ الآن
        </Link>
      </main>
    );
  }

  const { profile, plan, difficulty } = state;
  const currentWeight =
    state.weightLog[state.weightLog.length - 1]?.weight ?? state.startWeight;
  const weightDelta = Math.round((currentWeight - state.startWeight) * 10) / 10;

  const firstMeasurement = state.measurements[0];
  const lastMeasurement = state.measurements[state.measurements.length - 1];

  function handleLogWeight(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!val || val <= 0 || state === "empty" || state === null) return;
    setState(logWeight(state, val));
  }

  function handleLogMeasurements(e: React.FormEvent) {
    e.preventDefault();
    if (state === "empty" || state === null) return;
    const entry: { waist?: number; chest?: number; hips?: number } = {};
    if (waist) entry.waist = parseFloat(waist);
    if (chest) entry.chest = parseFloat(chest);
    if (hips) entry.hips = parseFloat(hips);
    if (Object.keys(entry).length === 0) return;
    setState(logMeasurement(state, entry));
    setWaist("");
    setChest("");
    setHips("");
  }

  function handleRateDay(dayName: string, rating: WorkoutDifficulty) {
    if (state === "empty" || state === null) return;
    const prevLevel = state.difficulty.level;
    const next = recordWorkoutDifficulty(state, rating);
    setState(next);
    setRatedDays((prev) => new Set(prev).add(dayName));

    if (next.difficulty.level > prevLevel) {
      setDifficultyMsg("تم تصعيب البرنامج تلقائياً بناءً على أدائك 💪");
    } else if (next.difficulty.level < prevLevel) {
      setDifficultyMsg("تم تخفيف البرنامج قليلاً عشان يناسبك أكثر");
    }
    if (next.difficulty.level !== prevLevel) {
      setTimeout(() => setDifficultyMsg(""), 4000);
    }
  }

  function handleQuickWorkout(minutes: 10 | 15 | 20) {
    setQuickMinutes(minutes);
    setQuickExercises(generateQuickWorkout(minutes));
  }

  const workoutDays = plan.weeklyPlan.filter((d) => !d.isRestDay);

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">
            لوحة متابعة {profile.name}
          </h1>
          <Link href="/result" className="text-sm text-gray-400 hover:text-primary">
            رجوع لبرنامجي
          </Link>
        </div>

        {/* Daily tip */}
        <div className="glass-card rounded-2xl p-5">
          <p className="mb-1 text-xs font-semibold text-primary">نصيحة اليوم</p>
          {tipLoading && (
            <p className="text-sm text-gray-400">جارٍ تجهيز نصيحتك...</p>
          )}
          {tipError && <p className="text-sm text-red-400">{tipError}</p>}
          {!tipLoading && !tipError && state.dailyTip && (
            <p className="text-lg leading-relaxed">{state.dailyTip.text}</p>
          )}
        </div>

        {/* Emergency workout */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">عندي وقت قليل اليوم</h2>
              <p className="text-sm text-gray-400">
                اختر وقتك ونجهز لك روتين سريع فوري.
              </p>
            </div>
            <div className="flex gap-2">
              {[10, 15, 20].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleQuickWorkout(m as 10 | 15 | 20)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                    quickMinutes === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {m} دقيقة
                </button>
              ))}
            </div>
          </div>

          {quickExercises && (
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              {quickExercises.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
                >
                  <div>
                    <p className="font-semibold">{ex.nameAr}</p>
                    <p className="text-sm text-gray-400">
                      {ex.sets} سيتات &times; {ex.reps}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{ex.targetMuscle}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="mb-4 font-bold">تقدمي</h2>

          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface2 p-4">
              <p className="text-xs text-gray-400">الوزن عند البداية</p>
              <p className="text-xl font-extrabold">{state.startWeight} كجم</p>
            </div>
            <div className="rounded-xl border border-border bg-surface2 p-4">
              <p className="text-xs text-gray-400">الوزن الحالي</p>
              <p className="text-xl font-extrabold text-primary">
                {currentWeight} كجم
              </p>
            </div>
            <div className="col-span-2 rounded-xl border border-border bg-surface2 p-4 sm:col-span-1">
              <p className="text-xs text-gray-400">الفرق</p>
              <p
                className={`text-xl font-extrabold ${
                  weightDelta <= 0 ? "text-primary" : "text-accent"
                }`}
              >
                {weightDelta > 0 ? "+" : ""}
                {weightDelta} كجم
              </p>
            </div>
          </div>

          <div className="mt-5">
            <WeightChart log={state.weightLog} />
          </div>

          <form
            onSubmit={handleLogWeight}
            className="mt-4 flex items-end gap-3"
          >
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-400">
                سجّل وزنك اليوم (كجم)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-secondary">
              تسجيل
            </button>
          </form>

          <form
            onSubmit={handleLogMeasurements}
            className="mt-4 border-t border-border pt-4"
          >
            <p className="mb-2 text-xs text-gray-400">
              قياسات اختيارية (سم)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                inputMode="decimal"
                placeholder="الخصر"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                className="input-field text-sm"
              />
              <input
                type="number"
                inputMode="decimal"
                placeholder="الصدر"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                className="input-field text-sm"
              />
              <input
                type="number"
                inputMode="decimal"
                placeholder="الأرداف"
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <button type="submit" className="btn-secondary mt-3 w-full">
              تسجيل القياسات
            </button>

            {firstMeasurement && lastMeasurement && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
                {(["waist", "chest", "hips"] as const).map((key) => {
                  const first = firstMeasurement[key];
                  const last = lastMeasurement[key];
                  if (first == null || last == null) return <div key={key} />;
                  const diff = Math.round((last - first) * 10) / 10;
                  return (
                    <div key={key}>
                      {diff > 0 ? "+" : ""}
                      {diff} سم
                    </div>
                  );
                })}
              </div>
            )}
          </form>
        </div>

        {/* Workout difficulty + adjusted plan */}
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">تمارين هذا الأسبوع</h2>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              مستوى الصعوبة الحالي: {difficulty.level > 0 ? "+" : ""}
              {difficulty.level}
            </span>
          </div>

          {difficultyMsg && (
            <p className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
              {difficultyMsg}
            </p>
          )}

          <div className="space-y-5">
            {workoutDays.map((day) => (
              <div key={day.day} className="rounded-xl border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold">{day.day}</h3>
                  {day.focus && (
                    <span className="text-sm text-gray-400">{day.focus}</span>
                  )}
                </div>

                <div className="space-y-3">
                  {day.exercises.map((ex, idx) => {
                    const adjusted = applyDifficultyAdjustment(
                      ex,
                      difficulty.level
                    );
                    return (
                      <div
                        key={idx}
                        className="flex gap-3 rounded-lg bg-surface p-3"
                      >
                        <ExerciseGif nameEn={ex.nameEn} displayName={ex.nameAr} />
                        <MuscleMap targetMuscle={ex.targetMuscle} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{ex.nameAr}</p>
                          <p className="text-sm text-primary">
                            {adjusted.sets} سيتات &times; {ex.reps}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  <span className="text-sm text-gray-400">
                    كيف كان التمرين؟
                  </span>
                  {DIFFICULTY_LABELS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => handleRateDay(day.day, d.value)}
                      className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-gray-300 hover:border-primary/50 hover:text-primary"
                    >
                      {d.label}
                    </button>
                  ))}
                  {ratedDays.has(day.day) && (
                    <span className="text-xs text-primary">تم التسجيل ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
