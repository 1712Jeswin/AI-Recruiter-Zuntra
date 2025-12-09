require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { SpeechClient } = require("@google-cloud/speech");

// ------------------------
// EXPRESS + HTTP SERVER
// ------------------------
const app = express();
const server = createServer(app);

// Health check for Render
app.get("/healthz", (req, res) => {
  res.send("OK");
});

// ------------------------
// GOOGLE STT CLIENT
// ------------------------
const client = new SpeechClient({
  keyFilename: "/etc/secrets/stt-key.json", // Render secret file
});

// ------------------------
// WEBSOCKET SERVER
// ------------------------
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("🔌 Client connected to STT server");

  // Create streaming recognition session
  let recognizeStream = client
    .streamingRecognize({
      config: {
        encoding: "WEBM_OPUS",
        sampleRateHertz: 48000,
        languageCode: "en-US",
      },
      interimResults: true, // Google returns interim + final results
    })
    .on("data", (data) => {
      const result = data.results?.[0];
      if (!result) return;

      const transcript = result.alternatives?.[0]?.transcript?.trim() || "";

      // Send only FINAL transcript (you can switch this if needed)
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

  // When audio chunks come in from browser
  ws.on("message", (msg) => {
    if (recognizeStream) {
      try {
        recognizeStream.write(msg);
      } catch (err) {
        console.error("🔥 STREAM WRITE ERROR:", err);
      }
    }
  });

  // Cleanup on disconnect
  ws.on("close", () => {
    console.log("❌ STT connection closed");
    if (recognizeStream) {
      try {
        recognizeStream.end();
      } catch {}
    }
    recognizeStream = null;
  });

  ws.on("error", (err) => {
    console.error("⚠️ WS ERROR:", err);
  });
});

// ------------------------
// RENDER PORT HANDLING
// ------------------------
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 STT server running at ws://localhost:${PORT}`);
});
