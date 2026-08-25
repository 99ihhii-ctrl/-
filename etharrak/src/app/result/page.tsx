"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { calculateBmi } from "@/lib/bmi";
import { GOAL_LABELS } from "@/lib/types";
import type { GeneratedPlan, UserProfile } from "@/lib/types";
import { initDashboardFromPlan } from "@/lib/dashboard";
import ExerciseGif from "@/components/ExerciseGif";
import MuscleMap from "@/components/MuscleMap";
import MealDayCard from "@/components/MealDayCard";

export default function ResultPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => {
    const rawProfile = sessionStorage.getItem("etharrak_profile");
    const rawPlan = sessionStorage.getItem("etharrak_plan");
    if (!rawProfile || !rawPlan) {
      router.replace("/form");
      return;
    }
    const parsedProfile: UserProfile = JSON.parse(rawProfile);
    const parsedPlan: GeneratedPlan = JSON.parse(rawPlan);
    setProfile(parsedProfile);
    setPlan(parsedPlan);
    initDashboardFromPlan(parsedProfile, parsedPlan);
  }, [router]);

  if (!profile || !plan) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-gray-400">
        جارٍ التحميل...
      </main>
    );
  }

  const bmi = calculateBmi(profile.weight, profile.height);

  async function handleShare() {
    const shareData = {
      title: "اتحرك - برنامجي الرياضي",
      text: `شوف برنامجي الرياضي المخصص من اتحرك! 💪`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMsg("تم نسخ الرابط!");
        setTimeout(() => setShareMsg(""), 2500);
      }
    } catch {
      // user cancelled share sheet — no-op
    }
  }

  function handleSavePdf() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-10 print:max-w-none">
        {/* Section 1: Profile */}
        <section className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">أهلاً</p>
              <h1 className="text-3xl font-extrabold">{profile.name}</h1>
              <p className="mt-1 text-primary">
                الهدف: {GOAL_LABELS[profile.goal]}
              </p>
            </div>

            {bmi && (
              <div className="rounded-2xl border border-border bg-surface2 px-6 py-4 text-center">
                <p className="text-xs text-gray-400">مؤشر كتلة الجسم</p>
                <p className={`text-3xl font-extrabold ${bmi.colorClass}`}>
                  {bmi.bmi}
                </p>
                <p className={`text-sm font-semibold ${bmi.colorClass}`}>
                  {bmi.category}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5 text-lg leading-relaxed">
            {plan.personalMessage}
          </div>
        </section>

        {/* Section 2: Weekly Plan */}
        <section>
          <h2 className="mb-5 text-2xl font-extrabold">
            برنامجك الأسبوعي
          </h2>
          <div className="space-y-5">
            {plan.weeklyPlan.map((day) => (
              <div key={day.day} className="glass-card rounded-2xl p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-bold">{day.day}</h3>
                  {day.isRestDay ? (
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                      يوم راحة
                    </span>
                  ) : (
                    day.focus && (
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {day.focus}
                      </span>
                    )
                  )}
                </div>

                {day.isRestDay ? (
                  <p className="text-gray-400">
                    خذ راحتك اليوم، الجسم يحتاج وقت يتعافى ويبني عضلات.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {day.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border bg-surface p-4"
                      >
                        <ExerciseGif
                          nameEn={ex.nameEn}
                          targetMuscle={ex.targetMuscle}
                          displayName={ex.nameAr}
                        />
                        <div className="mt-3 flex gap-3">
                          <MuscleMap targetMuscle={ex.targetMuscle} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <h4 className="font-bold">{ex.nameAr}</h4>
                              <span className="text-sm text-gray-400">
                                {ex.targetMuscle}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-primary">
                              {ex.sets} سيتات &times; {ex.reps} تكرار
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-gray-400">
                              {ex.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Meal Plan */}
        <section>
          <h2 className="mb-2 text-2xl font-extrabold">خطة الوجبات</h2>
          <p className="mb-5 text-sm text-gray-400">
            وجبات مختلفة كل يوم، مع 3 خيارات بديلة لكل وجبة تختار منها.
          </p>
          <div className="space-y-4">
            {plan.mealPlan.map((dayMeals, i) => (
              <MealDayCard
                key={dayMeals.day}
                dayMeals={dayMeals}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </section>

        {/* Bottom actions */}
        <section className="glass-card space-y-6 rounded-2xl p-6 text-center sm:p-8 print:hidden">
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={handleShare} className="btn-secondary">
              شارك نتيجتي
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M8.5 12.5 15.5 8m-7 8 7 4.5M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button onClick={handleSavePdf} className="btn-secondary">
              احفظ برنامجي كـ PDF
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          {shareMsg && <p className="text-sm text-primary">{shareMsg}</p>}

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="font-semibold">
              عجبك برنامجك؟ افتح لوحة المتابعة اليومية عشان تسجل تقدمك وتقيّم
              تماريننك يوماً بيوم.
            </p>
            <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
              افتح لوحة المتابعة
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
