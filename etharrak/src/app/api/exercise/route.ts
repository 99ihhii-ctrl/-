import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Simple in-memory cache to avoid re-hitting the API for repeated exercise names
// within the same server lifetime.
const cache = new Map<string, string | null>();

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "اسم التمرين مطلوب" }, { status: 400 });
  }

  const key = name.trim().toLowerCase();

  if (cache.has(key)) {
    return NextResponse.json({ gifUrl: cache.get(key) });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    return NextResponse.json({ gifUrl: null });
  }

  try {
    const res = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(
        key
      )}`,
      {
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      cache.set(key, null);
      return NextResponse.json({ gifUrl: null });
    }

    const data = await res.json();
    const gifUrl: string | null = Array.isArray(data) && data[0]?.gifUrl
      ? data[0].gifUrl
      : null;

    cache.set(key, gifUrl);
    return NextResponse.json({ gifUrl });
  } catch (err) {
    console.error("exercise lookup error", err);
    return NextResponse.json({ gifUrl: null });
  }
}
