"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type QItem = { id: string; question: string; type: string };

const MAIN_TIMER = 30;
const SILENCE_TIMER = 8;

export default function InterviewPage({
  interviewId,
  candidateId,
}: {
  interviewId: string;
  candidateId: string;
}) {
  const [questions, setQuestions] = useState<QItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  const [started, setStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const [timeLeft, setTimeLeft] = useState(MAIN_TIMER);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mainTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const answeredRef = useRef<Record<number, boolean>>({});
  const allAnswersRef = useRef<{ question: string; answer: string }[]>([]);

  const lastTranscriptRef = useRef<string>("");

  // AUDIO AUTOPLAY FIX
  useEffect(() => {
    const unlock = () => {
      const a = new Audio();
      a.play().catch(() => {});
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("click", unlock);
  }, []);

  // LOAD QUESTIONS
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/interview/${interviewId}/questions`);
        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : data.questions || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [interviewId]);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!started || loading || callEnded || !currentQuestion) return;
    runQuestion();
  }, [currentIndex, started, loading, callEnded]);

  // STOP AUDIO
  const stopAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
      audioRef.current.src = "";
    }
    audioRef.current = null;
  };

  // TTS
  const speakAndWait = async (text: string) => {
    return new Promise<void>(async (resolve) => {
      try {
        stopAudio();

        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) return resolve();

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);
        audio.volume = 1.0;
        audioRef.current = audio;

        audio.onended = () => {
          resolve();
          URL.revokeObjectURL(url);
        };

        audio.play().catch(resolve);
      } catch {
        resolve();
      }
    });
  };

  // ---------------------------
  // STT SYSTEM
  // ---------------------------
  const startSTT = async () => {
    try {
      stopSTT();
      stopAudio();

      const socket = new WebSocket(`ws://${window.location.hostname}:3001`);
      wsRef.current = socket;

      socket.onopen = async () => {
        console.log("🟢 STT CONNECTED");

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm; codecs=opus",
        });

        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          console.log("🎤 AUDIO CHUNK:", e.data.size);

          if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(e.data);
          }

          resetSilenceTimer();
        };

        recorder.start(150);
      };

      socket.onmessage = (event) => {
        console.log("🟦 RAW STT:", event.data);

        try {
          const msg = JSON.parse(event.data);
          console.log("🟩 PARSED STT:", msg);

          if (!msg.text) return;

          const incoming = msg.text.trim();
          console.log("🎤 FINAL TEXT:", incoming);

          // ALWAYS update UI (no strict dedupe)
          lastTranscriptRef.current = incoming;
          setAnswer((prev) => (prev + " " + incoming).trim());
        } catch (err) {
          console.error("🔥 STT JSON ERROR:", err);
        }
      };

      socket.onerror = (e) => console.error("❌ STT WebSocket error:", e);
    } catch (err) {
      console.error("🔥 STT start error:", err);
    }
  };

  const stopSTT = () => {
    try {
      recorderRef.current?.stop();
    } catch {}

    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}

    try {
      wsRef.current?.close();
    } catch {}

    recorderRef.current = null;
    streamRef.current = null;
    wsRef.current = null;
    lastTranscriptRef.current = "";
  };

  // ---------------------------
  // TIMERS
  // ---------------------------
  const startMainTimer = () => {
    clearMainTimer();
    mainTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearMainTimer();
          autoSubmit("Time limit reached");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearMainTimer = () => {
    if (mainTimerRef.current) clearInterval(mainTimerRef.current);
    mainTimerRef.current = null;
  };

  const startSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      autoSubmit("Silence timeout");
    }, SILENCE_TIMER * 1000);
  };

  const resetSilenceTimer = () => {
    clearSilenceTimer();
    startSilenceTimer();
  };

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
  };

  const clearTimers = () => {
    clearMainTimer();
    clearSilenceTimer();
  };

  // ---------------------------
  // RUN QUESTION
  // ---------------------------
  const runQuestion = async () => {
    stopAudio();
    stopSTT();
    clearTimers();

    setAnswer("");
    setTimeLeft(MAIN_TIMER);

    await speakAndWait(currentQuestion.question);

    startSTT();
    startMainTimer();
    startSilenceTimer();
  };

  // ---------------------------
  // AUTO SUBMIT
  // ---------------------------
  const autoSubmit = async (reason: string) => {
    if (answeredRef.current[currentIndex]) return;

    answeredRef.current[currentIndex] = true;

    const final = answer || `(No response - ${reason})`;

    await storeAnswer(final);
  };

  // ---------------------------
  // STORE ANSWER
  // ---------------------------
  const storeAnswer = async (finalAnswer: string) => {
    stopAudio();
    stopSTT();
    clearTimers();

    allAnswersRef.current.push({
      question: currentQuestion.question,
      answer: finalAnswer,
    });

    if (currentIndex + 1 >= questions.length) {
      await finalSubmitAll();
      return;
    }

    setCurrentIndex((p) => p + 1);
    setAnswer("");
    setTimeLeft(MAIN_TIMER);
  };

  const skipToNext = async () => {
    stopAudio();
    stopSTT();
    clearTimers();

    if (!answeredRef.current[currentIndex]) {
      answeredRef.current[currentIndex] = true;

      const final = answer || "(Skipped by user)";
      allAnswersRef.current.push({
        question: currentQuestion.question,
        answer: final,
      });
    }

    if (currentIndex + 1 >= questions.length) {
      await finalSubmitAll();
      return;
    }

    setCurrentIndex((p) => p + 1);
    setAnswer("");
    setTimeLeft(MAIN_TIMER);
  };

  const finalSubmitAll = async () => {
    stopAudio();
    stopSTT();
    clearTimers();

    try {
      await fetch(`/api/interview/${interviewId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          candidateId,
          answers: allAnswersRef.current,
        }),
      });

      await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          answers: allAnswersRef.current,
        }),
      });

      setCallEnded(true);
    } catch (err) {
      console.error("final submit error:", err);
    }
  };

  const endCallNow = async () => {
    stopAudio();
    stopSTT();
    clearTimers();
    setCallEnded(true);

    try {
      await fetch(`/api/interview/${interviewId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          candidateId,
          answers: allAnswersRef.current,
        }),
      });
    } catch {}
  };

  // UI RENDERING

  if (loading) return <div className="p-6 text-center text-lg">Loading…</div>;

  if (callEnded)
    return (
      <div className="p-10 text-center">
        <Card className="max-w-md mx-auto p-6">
          <CardHeader>
            <CardTitle>Interview Completed 🎉</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your responses have been saved & evaluated.</p>
          </CardContent>
        </Card>
      </div>
    );

  if (!started)
    return (
      <div className="p-10 flex justify-center">
        <Card className="max-w-md mx-auto p-10">
          <CardHeader>
            <CardTitle className="text-xl">
              Ready to Begin Your Interview?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Ensure microphone permissions are enabled.</p>
            <Button
              className="w-full bg-blue-600 text-white"
              onClick={() => setStarted(true)}
            >
              Start Interview 🎙️
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  if (!currentQuestion)
    return <div className="p-6">No questions available.</div>;

  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-2xl p-6">
        <CardHeader>
          <CardTitle>
            Question {currentIndex + 1} / {questions.length}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-lg">{currentQuestion.question}</p>

          <div>
            <p className="font-semibold mb-2">Time Remaining</p>
            <Progress value={(timeLeft / MAIN_TIMER) * 100} />
            <p className="text-red-600 font-bold mt-1">{timeLeft}s</p>
          </div>

          <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
            <p className="text-gray-600 text-sm">Answer (live):</p>
            <p className="font-semibold">{answer || "Listening…"}</p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="destructive"
              onClick={endCallNow}
              className="flex-1"
            >
              End Call
            </Button>

            <Button
              onClick={skipToNext}
              className="flex-1 bg-blue-600 text-white"
            >
              Next ➜
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
