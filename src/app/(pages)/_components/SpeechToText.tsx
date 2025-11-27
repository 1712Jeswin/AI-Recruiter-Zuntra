"use client";

import { useEffect, useRef, useState } from "react";

export default function SpeechToText() {
  const [text, setText] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setText(finalTranscript);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">🎤 Speech to Text Test</h2>

      <div className="flex gap-3 my-4">
        <button
          onClick={startListening}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Listening
        </button>

        <button
          onClick={stopListening}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Stop Listening
        </button>
      </div>

      <div className="border p-3 rounded bg-gray-100 min-h-[100px] whitespace-pre-wrap">
        {text || "Say something..."}
      </div>
    </div>
  );
}
