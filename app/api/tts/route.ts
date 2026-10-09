import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const lang = searchParams.get("lang") || "ta";

    if (!text || !text.trim()) {
      return new NextResponse("Text parameter required", { status: 400 });
    }

    // Clean text: strip markdown, asterisks, brackets, quotes
    const cleaned = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^[\*\-•]\s+/gm, '')
      .replace(/[\*\_#`~\[\]\(\)]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) {
      return new NextResponse("Empty text after cleaning", { status: 400 });
    }

    // Split into sentences / segments under 180 chars for Google TTS
    const sentences = cleaned.match(/[^.!?\n]+[.!?\n]*/g) || [cleaned];
    const chunks: string[] = [];
    let current = "";

    for (const s of sentences) {
      const trimmed = s.trim();
      if (!trimmed) continue;
      if ((current + " " + trimmed).trim().length <= 180) {
        current = (current + " " + trimmed).trim();
      } else {
        if (current) chunks.push(current);
        if (trimmed.length > 180) {
          const words = trimmed.split(" ");
          let sub = "";
          for (const w of words) {
            if ((sub + " " + w).trim().length <= 180) {
              sub = (sub + " " + w).trim();
            } else {
              if (sub) chunks.push(sub);
              sub = w;
            }
          }
          if (sub) chunks.push(sub);
          current = "";
        } else {
          current = trimmed;
        }
      }
    }
    if (current) chunks.push(current);

    // Fetch TTS audio chunks
    const buffers: Buffer[] = [];
    for (const chunk of chunks) {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(chunk)}`;
      const res = await fetch(ttsUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });
      if (res.ok) {
        const ab = await res.arrayBuffer();
        buffers.push(Buffer.from(ab));
      }
    }

    if (buffers.length === 0) {
      return new NextResponse("Failed to generate audio", { status: 500 });
    }

    const combined = Buffer.concat(buffers);

    return new NextResponse(combined, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: any) {
    console.error("TTS API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
