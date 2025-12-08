require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { SpeechClient } = require("@google-cloud/speech");

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Google STT client
const client = new SpeechClient({
  keyFilename: process.env.SPEECH_TO_TEXT_KEY,
});

wss.on("connection", (ws) => {
  console.log("🔌 Client connected to STT server");

  let recognizeStream = client
    .streamingRecognize({
      config: {
        encoding: "WEBM_OPUS",
        sampleRateHertz: 48000,
        languageCode: "en-US",
      },
      interimResults: true, // Google returns interim + final
    })
    .on("data", (data) => {
      const result = data.results?.[0];
      if (!result) return;

      const transcript = result.alternatives?.[0]?.transcript?.trim() || "";

      // 🔥 ONLY send FINAL RESULTS — never interim
      if (result.isFinal && transcript.length > 0) {
        console.log("🎤 FINAL:", transcript);
        ws.send(JSON.stringify({ text: transcript }));
      }
    })
    .on("error", (err) => {
      console.error("🔥 STT ERROR:", err);
      ws.send(JSON.stringify({ error: "stt_error" }));
    });

  ws.on("message", (msg) => {
    // Forward raw audio chunks to Google
    if (recognizeStream) recognizeStream.write(msg);
  });

  ws.on("close", () => {
    console.log("❌ STT connection closed");
    if (recognizeStream) recognizeStream.end();
  });
});

server.listen(3001, () => {
  console.log("🚀 STT server running at ws://localhost:3001");
});
