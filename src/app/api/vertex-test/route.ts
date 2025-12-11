export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";
import { GoogleAuth } from "google-auth-library";

export async function GET() {
  try {
    console.log("=== Vertex Test Route Started ===");

    // 1. Check ENV Vars
    const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
    const projectId = process.env.GCP_PROJECT_ID;

    if (!base64) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_BASE64");
    if (!projectId) throw new Error("Missing GCP_PROJECT_ID");

    console.log("Env vars loaded OK");

    // 2. Decode JSON
    const jsonStr = Buffer.from(base64, "base64").toString("utf8");
    const credentials = JSON.parse(jsonStr);

    console.log("Decoded credentials:", {
      client_email: credentials.client_email,
      project_id: credentials.project_id,
      private_key_exists: !!credentials.private_key,
    });

    // 3. Initialize GoogleAuth
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    console.log("GoogleAuth initialized");

    // 4. Initialize VertexAI Client
    const vertex = new VertexAI({
      project: projectId,
      location: "us-central1",
      googleAuthOptions: { credentials },
    });

    console.log("Vertex client initialized");

    // 5. Load a safe model for testing
    const model = vertex.getGenerativeModel({
      model: "models/gemini-1.5-flash",
    });

    console.log("Model resolved");

    // 6. Send a tiny test prompt
    const prompt = "Say 'hello from Vertex' as JSON: {\"msg\": \"hello\"}";
    console.log("Sending prompt:", prompt);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    console.log("Vertex responded:", JSON.stringify(result, null, 2));

    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("Parsed output:", text);

    return NextResponse.json({
      success: true,
      message: "Vertex test completed",
      output: text,
    });
  } catch (err: any) {
    console.error("=== Vertex Test Error ===", err);

    return NextResponse.json(
      {
        success: false,
        error: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}
