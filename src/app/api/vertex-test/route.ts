import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

function loadCredentials() {
  const json = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64!, "base64").toString("utf8");
  return JSON.parse(json);
}



export async function GET() {
  try {
    const vertex = new VertexAI({
      project: process.env.GCP_PROJECT_ID!,
      location: "us-central1",
      googleAuthOptions: {
        credentials: loadCredentials(),
      },
    });

    const model = vertex.getGenerativeModel({
      model: "gemini-1.5-flash-001",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Say hello in JSON" }] }],
    });

    return NextResponse.json({
      ok: true,
      response: result?.response,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
