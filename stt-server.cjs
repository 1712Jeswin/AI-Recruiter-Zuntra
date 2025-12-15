require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { SpeechClient } = require("@google-cloud/speech");
const fs = require("fs");
const path = require("path");

// ======================================================
// GOOGLE CREDENTIALS (BASE64 → FILE)
// ======================================================
const CREDENTIALS_PATH = "/tmp/stt-key.json";

if (!process.env.GOOGLE_CREDENTIALS_BASE64) {
  throw new Error("❌ GOOGLE_CREDENTIALS_BASE64 is not set");
}

try {
  const decoded = Buffer.from(
    process.env.GOOGLE_CREDENTIALS_BASE64,
    "base64"
  ).toString("utf-8");

  fs.writeFileSync(CREDENTIALS_PATH, decoded);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = CREDENTIALS_PATH;

  console.log("✅ Google credentials written to /tmp");
} catch (err) {
  console.error("❌ Failed to write Google credentials:", err);
  process.exit(1);
}

// ======================================================
// EXPRESS + HTTP SERVER
// ======================================================
const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: "*",
    methods: ["GET"],
  })
);

// Health check (Render needs this)
app.get("/healthz", (_, res) => {
  res.status(200).send("OK");
});

// ======================================================
// GOOGLE STT CLIENT
// ======================================================
const client = new SpeechClient({
  keyFilename: CREDENTIALS_PATH, // ✅ CORRECT PATH
});

// ======================================================
// WEBSOCKET SERVER
// ======================================================
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("🔌 Client connected to STT server");

  let recognizeStream = client
    .streamingRecognize({
      config: {
        encoding: "WEBM_OPUS",
        sampleRateHertz: 48000,
        languageCode: "en-US",
      },
      interimResults: true,
    })
    .on("data", (data) => {
      const result = data.results?.[0];
      if (!result) return;

      const transcript =
        result.alternatives?.[0]?.transcript?.trim() || "";

      if (result.isFinal && transcript.length > 0) {
        console.log("🎤 FINAL:", transcript);
        ws.send(JSON.stringify({ text: transcript }));
      }
    })
    .on("error", (err) => {
      console.error("🔥 STT ERROR:", err);
      try {
        ws.send(JSON.stringify({ error: "stt_error" }));
      } catch {}
    });

  ws.on("message", (msg) => {
    try {
      recognizeStream.write(msg);
    } catch (err) {
      console.error("🔥 STREAM WRITE ERROR:", err);
    }
  });

  ws.on("close", () => {
    console.log("❌ STT connection closed");
    try {
      recognizeStream.end();
    } catch {}
    recognizeStream = null;
  });

  ws.on("error", (err) => {
    console.error("⚠ WS ERROR:", err);
  });
});

// ======================================================
// PORT (Render Compatible)
// ======================================================
const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log(`🚀 STT server running on port ${PORT}`);
});
