import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Simple in-memory cache to avoid re-hitting the API for repeated exercise names
// within the same server lifetime.
const cache = new Map<string, string | null>();

const RAPIDAPI_HOST = "exercisedb.p.rapidapi.com";

// ExerciseDB's bodyPart taxonomy, used as a last-resort fallback when name
// search finds nothing — matched against our (free-text, Arabic) targetMuscle
// field via keyword search.
const BODY_PARTS: { bodyPart: string; keywords: string[] }[] = [
  { bodyPart: "chest", keywords: ["صدر", "chest", "pec"] },
  { bodyPart: "back", keywords: ["ظهر", "back", "lat", "عريض"] },
  { bodyPart: "shoulders", keywords: ["كتف", "أكتاف", "shoulder", "delt"] },
  { bodyPart: "upper arms", keywords: ["باي", "ترايسبس", "bicep", "tricep"] },
  { bodyPart: "lower arms", keywords: ["ساعد", "forearm", "قبضة", "grip"] },
  {
    bodyPart: "upper legs",
    keywords: ["فخذ", "أرداف", "مؤخرة", "quad", "hamstring", "glute", "hip", "thigh"],
  },
  { bodyPart: "lower legs", keywords: ["سمانة", "calf", "shin"] },
  { bodyPart: "waist", keywords: ["بطن", "كرش", "abs", "core", "خاصرة", "oblique"] },
  { bodyPart: "cardio", keywords: ["كارديو", "cardio"] },
  { bodyPart: "neck", keywords: ["رقبة", "neck"] },
];

function guessBodyPart(targetMuscle: string): string | null {
  const t = targetMuscle.toLowerCase();
  const match = BODY_PARTS.find((z) =>
    z.keywords.some((k) => t.includes(k.toLowerCase()))
  );
  return match?.bodyPart ?? null;
}

interface ExerciseDbEntry {
  gifUrl?: string;
}

async function fetchExerciseDb(
  path: string,
  rapidApiKey: string
): Promise<ExerciseDbEntry[] | null> {
  const res = await fetch(`https://${RAPIDAPI_HOST}${path}`, {
    headers: {
      "X-RapidAPI-Key": rapidApiKey,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(
      `exercisedb request failed for "${path}": ${res.status} ${res.statusText}`,
      body.slice(0, 300)
    );
    return null;
  }

  const data = await res.json();
  return Array.isArray(data) ? data : null;
}

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  const targetMuscle = req.nextUrl.searchParams.get("targetMuscle") ?? "";
  if (!name) {
    return NextResponse.json({ error: "اسم التمرين مطلوب" }, { status: 400 });
  }

  const key = name.trim().toLowerCase();

  if (cache.has(key)) {
    return NextResponse.json({ gifUrl: cache.get(key) });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    console.error(
      "exercise lookup skipped: RAPIDAPI_KEY is not set in this environment"
    );
    return NextResponse.json({ gifUrl: null });
  }

  try {
    // 1. exact/contains name search
    let results = await fetchExerciseDb(
      `/exercises/name/${encodeURIComponent(key)}`,
      rapidApiKey
    );

    // 2. first word of the name, in case the full phrase didn't match
    if (!results || results.length === 0) {
      const firstWord = key.split(" ")[0];
      if (firstWord && firstWord !== key) {
        results = await fetchExerciseDb(
          `/exercises/name/${encodeURIComponent(firstWord)}`,
          rapidApiKey
        );
      }
    }

    // 3. body part fallback — a generic but relevant GIF for the muscle group
    if (!results || results.length === 0) {
      const bodyPart = guessBodyPart(targetMuscle);
      if (bodyPart) {
        results = await fetchExerciseDb(
          `/exercises/bodyPart/${encodeURIComponent(bodyPart)}`,
          rapidApiKey
        );
      }
    }

    const gifUrl =
      results && results.length > 0 ? results[0]?.gifUrl ?? null : null;

    if (!gifUrl) {
      console.error(`exercise lookup: no match found for "${key}"`);
    }

    cache.set(key, gifUrl);
    return NextResponse.json({ gifUrl });
  } catch (err) {
    console.error("exercise lookup error", err);
    return NextResponse.json({ gifUrl: null });
  }
}
