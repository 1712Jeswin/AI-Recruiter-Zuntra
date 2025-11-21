import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs"; // prevents running on Edge (which breaks pdf-parse)

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert uploaded file into Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Use pdf-parse correctly
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy(); // release resources

    return NextResponse.json({
      text: result.text,
      questions: [
        // You can replace this with actual logic
        "What does this PDF discuss?",
        "Summarize key points.",
      ],
    });
  } catch (error: any) {
    console.error("PDF parsing failed:", error);
    return NextResponse.json(
      { error: error.message || "Error parsing PDF" },
      { status: 500 }
    );
  }
}
