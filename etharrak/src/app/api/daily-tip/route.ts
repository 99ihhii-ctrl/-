import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GOAL_LABELS, LEVEL_LABELS, type UserProfile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "claude-sonnet-4-6";
const THEMES = ["التغذية", "التمرين", "النوم والراحة"] as const;

export async function POST(req: NextRequest) {
  try {
    const profile = (await req.json()) as UserProfile;

    if (!profile?.name) {
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

    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];

    const anthropic = new Anthropic({ apiKey, timeout: 25_000, maxRetries: 0 });

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `اكتب نصيحة يومية واحدة قصيرة (جملة أو جملتين، بدون مقدمات) بخصوص "${theme}" لمستخدم اسمه ${
            profile.name
          }، هدفه ${GOAL_LABELS[profile.goal]} ومستواه ${
            LEVEL_LABELS[profile.level]
          }. اكتبها بالعربي بأسلوب تحفيزي مباشر. أرجع النص فقط بدون علامات اقتباس.`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const tip =
      textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";

    if (!tip) {
      return NextResponse.json(
        { error: "تعذر توليد النصيحة" },
        { status: 502 }
      );
    }

    return NextResponse.json({ tip });
  } catch (err) {
    console.error("daily-tip error", err);
    return NextResponse.json(
      { error: "تعذر توليد النصيحة، حاول لاحقاً" },
      { status: 500 }
    );
  }
}
