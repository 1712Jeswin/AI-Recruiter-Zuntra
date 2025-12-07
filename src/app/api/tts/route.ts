import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    const apiKey = process.env.GOOGLE_TTS_API_KEY;

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: "en-US",
            name: "en-US-Neural2-D",
          },
          audioConfig: { audioEncoding: "MP3" },
        }),
      }
    );

    const data = await response.json();

    // ⭐ DEBUG: Catch Google errors
    if (!response.ok) {
      console.error("Google TTS Error Response:", data);
      return NextResponse.json(
        { error: data.error?.message || "Google TTS failed" },
        { status: 500 }
      );
    }

    // ⭐ Safety check
    if (!data.audioContent) {
      console.error("❌ No audioContent in response:", data);
      return NextResponse.json(
        { error: "No audioContent returned" },
        { status: 500 }
      );
    }

    const audioBuffer = Buffer.from(data.audioContent, "base64");

    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" }
    });

  } catch (e) {
    console.error("TTS ERROR:", e);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
