"use client";

import { useEffect, useState } from "react";

export default function ExerciseGif({
  nameEn,
  targetMuscle,
  displayName,
}: {
  nameEn: string;
  targetMuscle?: string;
  displayName?: string;
}) {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty">(
    "loading"
  );
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setGifUrl(null);

    const params = new URLSearchParams({ name: nameEn });
    if (targetMuscle) params.set("targetMuscle", targetMuscle);

    fetch(`/api/exercise?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.gifUrl) {
          setGifUrl(data.gifUrl);
          setStatus("ready");
        } else {
          setStatus("empty");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("empty");
      });

    return () => {
      cancelled = true;
    };
  }, [nameEn, targetMuscle]);

  useEffect(() => {
    if (!zoomed) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomed(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomed]);

  if (status === "ready" && gifUrl) {
    return (
      <>
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="group relative h-56 w-full shrink-0 overflow-hidden rounded-xl border border-border bg-surface2 sm:h-64"
          aria-label="تكبير صورة التمرين"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gifUrl}
            alt={displayName || nameEn}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <span className="absolute bottom-2 left-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-90 transition-opacity group-hover:opacity-100">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M10 4v12M4 10h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
        </button>

        {zoomed && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
            onClick={() => setZoomed(false)}
          >
            <div
              className="max-w-lg rounded-2xl border border-border bg-surface p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold">{displayName || nameEn}</h3>
                <button
                  type="button"
                  onClick={() => setZoomed(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-surface2 hover:text-foreground"
                  aria-label="إغلاق"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gifUrl}
                alt={displayName || nameEn}
                className="max-h-[75vh] w-full rounded-xl object-contain"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex h-56 w-full shrink-0 items-center justify-center rounded-xl border border-border bg-surface2 text-gray-600 sm:h-64">
      {status === "loading" ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-8 w-8 animate-spin text-gray-500"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="35 15"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12">
          <path
            d="M6.5 6.5v11M17.5 6.5v11M3 9h3M3 15h3M18 9h3M18 15h3M6.5 12h11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
