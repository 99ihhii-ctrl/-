"use client";

import { useEffect, useState } from "react";

export default function ExerciseGif({ nameEn }: { nameEn: string }) {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setGifUrl(null);

    fetch(`/api/exercise?name=${encodeURIComponent(nameEn)}`)
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
  }, [nameEn]);

  if (status === "ready" && gifUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={gifUrl}
        alt={nameEn}
        className="h-24 w-24 shrink-0 rounded-xl border border-border bg-surface2 object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-border bg-surface2 text-gray-600">
      {status === "loading" ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6 animate-spin text-gray-500"
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
        <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
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
