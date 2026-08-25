"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/lib/types";

const STEPS = [
  "نحلل بياناتك الشخصية...",
  "نحسب احتياجك من السعرات...",
  "نبني برنامج التمارين المناسب لك...",
  "نجهز خطة الوجبات...",
  "نلمس اللمسات الأخيرة...",
];

export default function GeneratingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(6);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const raw = sessionStorage.getItem("etharrak_profile");
    if (!raw) {
      router.replace("/form");
      return;
    }
    const profile: UserProfile = JSON.parse(raw);

    // Smooth, fake-but-honest progress: creeps toward 90% while waiting on the API,
    // then jumps to 100% only once the real response has arrived.
    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.random() * 4 : p));
    }, 350);

    const stepTimer = setInterval(() => {
      setStepIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 1800);

    async function run() {
      try {
        const res = await fetch("/api/generate-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "تعذر توليد البرنامج");
        }

        const plan = await res.json();
        sessionStorage.setItem("etharrak_plan", JSON.stringify(plan));

        clearInterval(progressTimer);
        clearInterval(stepTimer);
        setProgress(100);
        setStepIndex(STEPS.length - 1);

        setTimeout(() => router.replace("/result"), 500);
      } catch (err) {
        clearInterval(progressTimer);
        clearInterval(stepTimer);
        setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
      }
    }

    run();

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-grid-glow" />

      {!error ? (
        <div className="relative z-10 w-full max-w-md">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-10 w-10 animate-spin"
              style={{ animationDuration: "2.5s" }}
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="40 15"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold sm:text-3xl">
            الذكاء الاصطناعي يحلل بياناتك...
          </h1>
          <p className="mt-3 min-h-[1.5rem] text-gray-400 transition-all">
            {STEPS[stepIndex]}
          </p>

          <div className="mt-8 h-3 w-full overflow-hidden rounded-full border border-border bg-surface">
            <div
              className="h-full rounded-full bg-gradient-to-l from-primary via-primary-light to-accent bg-[length:200%_100%] animate-shimmer transition-[width] duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {Math.min(Math.round(progress), 100)}%
          </p>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
              <path
                d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold">صار في مشكلة</h1>
          <p className="mt-2 text-gray-400">{error}</p>
          <button
            onClick={() => location.reload()}
            className="btn-primary mt-6"
          >
            حاول مرة أخرى
          </button>
        </div>
      )}
    </main>
  );
}
