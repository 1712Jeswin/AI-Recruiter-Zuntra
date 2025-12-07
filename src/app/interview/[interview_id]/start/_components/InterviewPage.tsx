"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Headphones,
    Wifi,
    Mic,
    UserX,
    ArrowRight,
    ShieldCheck,
    Info,
    Briefcase,
    CheckCircle2,
} from "lucide-react";

type QItem = { id: string; question: string; type: string; timer: number };

const MAIN_TIMER = 30;

/* ⭐ NEW INDUSTRY STANDARD SILENCE LOGIC */
const SILENCE_WARNING = 12;       // Show warning after 12 seconds of silence
const SILENCE_HARD_TIMEOUT = 20;  // Auto-submit after 20 seconds of silence


const steps = [
    "Establishing secure connection...",
    "Verifying credentials...",
    "Loading user preferences...",
    "Preparing workspace...",
];

/* EXECUTIVE LOADER (unchanged) */
const ExecutiveLoader = ({ active }: { active: boolean }) => {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);


    useEffect(() => {
        if (!active) {
            setProgress(0);
            setStep(0);
            return;
        }

        const timer = setInterval(() => {
            setProgress((p) => {
                if (p >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return p + 2;
            });
        }, 60);

        const stepTimer = setInterval(() => {
            setStep((s) => (s < steps.length - 1 ? s + 1 : s));
        }, 600);

        return () => {
            clearInterval(timer);
            clearInterval(stepTimer);
        };
    }, [active]);

    /* ---------------------------------------------- */
    /* FINAL EVALUATION LOADER (NEW COMPONENT)         */
    /* ---------------------------------------------- */

    const FinalEvaluationLoader = () => {
        return (
            <div className="flex flex-col items-center justify-center gap-6 p-10 animate-fadeIn">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-blue-100 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">
                        Evaluating Your Responses
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        ⏳ Stay on this page — your interview is being evaluated.<br />
                        This may take around{" "}
                        <span className="font-semibold text-slate-900">10 seconds</span>.
                    </p>
                </div>
            </div>
        );
    };


    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-6 p-10">
            <div className="relative flex items-center justify-center w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                        strokeWidth="4"
                        stroke="currentColor"
                        className="text-slate-100"
                        fill="transparent"
                        r={radius}
                        cx="48"
                        cy="48"
                    />
                    <circle
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        className="text-indigo-600 transition-all duration-300 ease-out"
                        fill="transparent"
                        r={radius}
                        cy="48"
                        cx="48"
                    />
                </svg>

                <div className="absolute text-indigo-600">
                    {progress === 100 ? (
                        <CheckCircle2 size={28} />
                    ) : (
                        <Briefcase size={28} className="animate-pulse" />
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-2">
                <h3 className="text-slate-800 font-semibold text-lg tracking-tight">
                    {progress === 100 ? "Ready" : "Interview Room"}
                </h3>

                <p className="text-sm text-slate-500">
                    {progress === 100 ? "Initializing..." : steps[step]}
                </p>
            </div>
        </div>
    );
};

/* ---------------------------------------------- */
/* FINAL EVALUATION LOADER (NEW COMPONENT)         */
/* ---------------------------------------------- */

const FinalEvaluationLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-6 p-10 animate-fadeIn">
            <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-blue-100 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                </div>
            </div>

            <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900 mb-1">
                    Evaluating Your Responses
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                    ⏳ Stay on this page — your interview is being evaluated.<br />
                    This may take around{" "}
                    <span className="font-semibold text-slate-900">10 seconds</span>.
                </p>
            </div>
        </div>
    );
};


export default function InterviewPage({
    interviewId,
    candidateId,
}: {
    interviewId: string;
    candidateId: string;
}) {
    const [sessionStatus, setSessionStatus] = useState<"pending" | "completed" | null>(null);

    const [showCompleted, setShowCompleted] = useState(false);



    const [questions, setQuestions] = useState<QItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(true);

    const [started, setStarted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);

    const [timeLeft, setTimeLeft] = useState(MAIN_TIMER);

    /* ⭐ BLUR STATE */
    const [blurQuestion, setBlurQuestion] = useState(true);
    const [showUnblurButton, setShowUnblurButton] = useState(false);
    const [hasUnblurred, setHasUnblurred] = useState(false);
    const [unblurCount, setUnblurCount] = useState(0);

    /* ⭐ NEW: UI listening state */
    const [isListening, setIsListening] = useState(false);

    /* ⭐ NEW SILENCE WARNING FLAG */
    const [silenceWarning, setSilenceWarning] = useState(false);

    // Refs
    const wsRef = useRef<WebSocket | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const mainTimerRef = useRef<NodeJS.Timeout | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const answeredRef = useRef<Record<number, boolean>>({});
    const allAnswersRef = useRef<{ question: string; answer: string }[]>([]);
    const lastTranscriptRef = useRef("");


    /* NEW: Hard stop flag */
    const stoppingRef = useRef(false);


    const silenceSecondsRef = useRef(0);

    useEffect(() => {
        const loadStatus = async () => {
            const res = await fetch(`/api/interview/${interviewId}/session-status?candidateId=${candidateId}`);
            const data = await res.json();
            setSessionStatus(data.status); // "pending" or "completed"
        };

        loadStatus();
    }, [interviewId, candidateId]);

    /* ------------------ AUDIO AUTOPLAY FIX ------------------ */
    useEffect(() => {
        const unlock = () => {
            const a = new Audio();
            a.play().catch(() => { });
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, started, loading, callEnded]);

    // STOP AUDIO
    const stopAudio = () => {
        if (audioRef.current) {
            try {
                audioRef.current.pause();
            } catch { }
            audioRef.current.src = "";
        }
        audioRef.current = null;
    };

    // TTS
    const speakAndWait = async (text: string) =>
        new Promise<void>(async (resolve) => {
            if (stoppingRef.current) return resolve();
            try {
                setIsListening(false);
            } catch { }

            try {
                stopAudio();
                const res = await fetch("/api/tts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
                });

                if (!res.ok) return resolve();
                if (stoppingRef.current) return resolve();

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audioRef.current = audio;

                audio.onended = () => {
                    resolve();
                    URL.revokeObjectURL(url);
                };

                audio.play().catch(resolve);

                const killer = setInterval(() => {
                    if (stoppingRef.current && audioRef.current) {
                        try {
                            audioRef.current.pause();
                        } catch { }
                        clearInterval(killer);
                        resolve();
                    }
                }, 100);
            } catch {
                resolve();
            }
        });

    /* ------------------ RUN QUESTION ------------------ */
    const runQuestion = async () => {
        if (stoppingRef.current || callEnded) return;

        stopAudio();
        stopSTT();
        clearTimers();

        setAnswer("");
        setTimeLeft(currentQuestion.timer);

        setBlurQuestion(true);
        setShowUnblurButton(false);
        setHasUnblurred(false);

        setSilenceWarning(false); // Reset warning

        await speakAndWait(currentQuestion.question);

        if (stoppingRef.current || callEnded) return;

        setShowUnblurButton(true);
        startSTT();
        startMainTimer();
        startSilenceTimer();
    };

    /* ------------------ STT SYSTEM ------------------ */
    const startSTT = async () => {
        try {
            stopSTT();
            stopAudio();

            const socket = new WebSocket(`ws://${window.location.hostname}:3001`);
            wsRef.current = socket;

            socket.onopen = async () => {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                streamRef.current = stream;

                const recorder = new MediaRecorder(stream, {
                    mimeType: "audio/webm; codecs=opus",
                });
                recorderRef.current = recorder;

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                        socket.send(e.data);
                    }
                };

                recorder.start(150);

                setIsListening(true);
            };

            socket.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (!msg.text) return;
                    const incoming = msg.text.trim();
                    lastTranscriptRef.current = incoming;
                    setAnswer((prev) => (prev + " " + incoming).trim());

                    resetSilenceTimer();

                } catch { }
            };
        } catch { }
    };

    /* ------------------ UNBLUR ------------------ */
    const handleUnblur = async () => {
        setBlurQuestion(false);
        setHasUnblurred(true);
        setUnblurCount((c) => c + 1);
    };

    /* ------------------ STOP STT ------------------ */
    const stopSTT = () => {
        try {
            recorderRef.current?.stop();
        } catch { }
        try {
            streamRef.current?.getTracks().forEach((t) => t.stop());
        } catch { }
        try {
            wsRef.current?.close();
        } catch { }

        recorderRef.current = null;
        streamRef.current = null;
        wsRef.current = null;
        lastTranscriptRef.current = "";

        setIsListening(false);
    };

    /* ------------------ TIMERS ------------------ */

    const startMainTimer = () => {
        clearMainTimer();
        mainTimerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearMainTimer();

                    if (currentIndex === questions.length - 1) {
                        autoSubmit("Time limit reached")
                            .then(() => finalSubmitAll());
                    } else {
                        autoSubmit("Time limit reached");
                    }

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };


    const clearMainTimer = () =>
        mainTimerRef.current && clearInterval(mainTimerRef.current);

    /* ⭐ INDUSTRY STANDARD SILENCE LOGIC ⭐ */

    /* ⭐ INDUSTRY STANDARD SILENCE LOGIC — FIXED ⭐ */


    const startSilenceTimer = () => {
        clearSilenceTimer();
        silenceSecondsRef.current = 0;
        setSilenceWarning(false);

        silenceTimerRef.current = setInterval(() => {
            silenceSecondsRef.current += 1;

            // Show warning at 12 seconds
            if (silenceSecondsRef.current === SILENCE_WARNING) {
                setSilenceWarning(true);
            }

            // Auto-submit at 20 seconds
            if (silenceSecondsRef.current >= SILENCE_HARD_TIMEOUT) {
                clearSilenceTimer();
                autoSubmit("Extended silence (20s)");
            }
        }, 1000);
    };

    const resetSilenceTimer = () => {
        silenceSecondsRef.current = 0;
        setSilenceWarning(false);
    };


    const clearSilenceTimer = () => {
        if (silenceTimerRef.current) {
            clearInterval(silenceTimerRef.current);
        }
    };


    const clearTimers = () => {
        clearMainTimer();
        clearSilenceTimer();
    };

    /* ------------------ AUTO SUBMIT ------------------ */
    const autoSubmit = async (reason: string) => {
        if (answeredRef.current[currentIndex]) return;
        answeredRef.current[currentIndex] = true;

        const final = answer || `(No response - ${reason})`;

        await storeAnswer(final);
    };

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
        setTimeLeft(questions[currentIndex + 1]?.timer ?? 30);
    };

    /* ------------------ SKIP ------------------ */
    const skipToNext = async () => {
        stopAudio();
        stopSTT();
        clearTimers();

        if (!answeredRef.current[currentIndex]) {
            answeredRef.current[currentIndex] = true;
            allAnswersRef.current.push({
                question: currentQuestion.question,
                answer: answer || "(Skipped by user)",
            });
        }

        if (currentIndex + 1 >= questions.length) {
            await finalSubmitAll();
            return;
        }

        setCurrentIndex((p) => p + 1);
        setAnswer("");
        setTimeLeft(questions[currentIndex + 1]?.timer ?? 30);
    };

    /* ------------------ FINAL SUBMIT ------------------ */
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
                    unblurCount,
                }),
            });

            await fetch("/api/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    interviewId,
                    candidateId,
                    unblurCount,
                    answers: allAnswersRef.current,
                }),
            });

            setCallEnded(true);
            setShowCompleted(false);

            setTimeout(() => {
                setShowCompleted(true);
            }, 10000); // 10 seconds loader

        } catch (err) {
            console.error("FINAL SUBMIT ERROR:", err);
        }
    };

    /* ------------------ FULL STOP ------------------ */
    const endCallNow = async () => {
        stoppingRef.current = true;
        setCallEnded(true);
        setShowCompleted(false);

        setTimeout(() => {
            setShowCompleted(true);
        }, 10000);


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
                    unblurCount,
                }),
            });

            await fetch("/api/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    interviewId,
                    candidateId,
                    unblurCount,
                    answers: allAnswersRef.current,
                }),
            });
        } catch (err) {
            console.error("❌ END CALL ERROR:", err);
        }
    };

    /* ------------------ LOADING SCREEN ------------------ */
    if (loading || sessionStatus === null)
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <ExecutiveLoader active={true} />
            </div>
        );

    if (sessionStatus === "completed")
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 p-6">
                <Card className="
                max-w-lg w-full p-10 shadow-xl rounded-2xl 
                border border-slate-200 bg-white
            ">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-inner">
                            <ShieldCheck className="w-10 h-10 text-blue-600" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-center text-slate-900 mb-4">
                        Interview Already Completed
                    </h1>

                    <p className="text-center text-slate-600 leading-relaxed mb-4">
                        You have already completed this interview and cannot attempt it again.
                    </p>

                    <p className="text-center text-blue-700 font-medium text-sm mb-8">
                        We will contact you via email with further updates.
                    </p>

                    <Button
                        onClick={() => window.location.assign("https://google.com")}
                        className="
                        w-full bg-blue-600 hover:bg-blue-700 
                        text-white py-4 rounded-xl text-lg font-semibold
                        shadow-md hover:shadow-xl transition-all duration-200
                    "
                    >
                        Exit
                    </Button>
                </Card>
            </div>
        );



    /* ------------------ CALL ENDED ------------------ */
    if (callEnded) {
        if (!showCompleted) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <FinalEvaluationLoader />
                </div>
            );
        }

        // PHASE 2: Show completed screen
        return (
            <div className="min-h-screen flex justify-center items-center bg-slate-50 p-6 relative overflow-hidden">
                <Card
                    className="
          max-w-lg w-full mx-auto p-10
          shadow-xl rounded-2xl border border-slate-200
          backdrop-blur-xl bg-white/95 relative z-10
        "
                >
                    <div className="flex justify-center mb-7">
                        <div
                            className="
              w-20 h-20 bg-blue-100/70 
              rounded-xl flex items-center justify-center 
              shadow-inner border border-blue-200
            "
                        >
                            <ShieldCheck className="w-10 h-10 text-blue-600" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-center text-slate-900 mb-3 tracking-tight">
                        Interview Completed
                    </h1>

                    <div
                        className="
            w-full bg-blue-50 border border-blue-100 
            rounded-xl p-6 mb-8 text-center shadow-sm
          "
                    >
                        <p className="font-semibold text-blue-900 text-lg mb-1">Evaluation in Progress</p>
                        <p className="text-blue-700 text-sm leading-relaxed">
                            Our system is analyzing your responses.
                            <br />
                            You will receive an update shortly via email.
                        </p>
                    </div>

                    <Button
                        onClick={() => window.location.assign("https://google.com")}
                        className="
            w-full bg-blue-600 hover:bg-blue-700 
            text-white py-4 text-lg font-semibold
            rounded-xl shadow-md hover:shadow-xl 
            transition-all duration-200
          "
                    >
                        Exit Interview
                    </Button>

                    <p className="text-center text-xs text-slate-400 mt-5">
                        Thank you for your time and effort.
                    </p>
                </Card>
            </div>
        );
    }


    /* ------------------ START SCREEN ------------------ */
    if (!started && sessionStatus === "pending")

        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative z-10">

                    <div className="bg-white border-b border-slate-100 p-8 text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                            Ready for your Interview?
                        </h1>
                        <p className="text-slate-500 text-lg max-w-md mx-auto">
                            Please review the following pre-interview checks.
                        </p>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

                            <InstructionCard
                                icon={<Headphones className="w-5 h-5 text-indigo-600" />}
                                title="Use Headphones"
                                desc="Ensures clearer audio & reduces echo."
                            />
                            <InstructionCard
                                icon={<Wifi className="w-5 h-5 text-indigo-600" />}
                                title="Stable Internet"
                                desc="Reliable connection recommended."
                            />
                            <InstructionCard
                                icon={<UserX className="w-5 h-5 text-indigo-600" />}
                                title="Quiet Environment"
                                desc="Choose a noise-free room without interruptions."
                            />
                            <InstructionCard
                                icon={<Mic className="w-5 h-5 text-indigo-600" />}
                                title="Microphone Access"
                                desc="We'll request permission next."
                            />

                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800">
                                Your voice will be captured and evaluated during this assessment.
                            </p>
                        </div>

                        <Button
                            onClick={() => setStarted(true)}
                            className="w-full group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                                text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200"
                        >
                            Start Interview
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>

                    </div>
                </div>
            </div>
        );

    /* ------------------ MAIN INTERVIEW UI ------------------ */
    if (!currentQuestion) return <div className="p-6">No questions available.</div>;

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 p-6">

            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative p-6 sm:p-8">

                    {/* Header */}
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">
                                <div className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
                                    Question {currentIndex + 1} / {questions.length}
                                </div>

                                <div className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-md px-3 py-1">
                                    {currentQuestion.type || "General"}
                                </div>
                            </div>

                            {/* Timer */}
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-full px-2 py-1">
                                    ⏱ {timeLeft}s
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="px-6">
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${(timeLeft / currentQuestion.timer) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-6 py-6">

                        {/* Question */}
                        <div className="mb-4">
                            <h2 className={`text-lg font-semibold text-slate-900 leading-relaxed transition-all duration-300 ${blurQuestion ? "blur-sm select-none pointer-events-none" : ""
                                }`}
                            >
                                {currentQuestion.question}
                            </h2>

                            {showUnblurButton && blurQuestion && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUnblur}
                                    className="text-xs mt-2 py-1 px-3"
                                >
                                    Show Question (May Reduce Marks)
                                </Button>
                            )}

                            {hasUnblurred && (
                                <p className="text-xs text-red-600 font-semibold mt-2">
                                    ⚠ Reading the question reduces your listening skill score.
                                </p>
                            )}
                        </div>

                        {/* Transcript + Waveform */}
                        <div className="mb-6 flex gap-4">

                            <div className="flex-1 bg-white border border-slate-100 rounded-xl p-4">

                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                        <span className="text-xs text-slate-500 uppercase tracking-wide">Live transcript</span>
                                    </div>

                                    <div className={`text-xs font-medium transition-opacity duration-200 ${isListening ? "text-blue-500 animate-pulse opacity-100" : "text-slate-400 opacity-60"
                                        }`}
                                    >
                                        {isListening ? "AI Listening..." : "AI Speaking..."}
                                    </div>
                                </div>

                                <div className="min-h-[64px]">
                                    <p className="text-sm text-slate-900 font-medium whitespace-pre-wrap">
                                        {answer || "🎧 Listening…"}
                                    </p>

                                    {/* ⭐ SILENCE WARNING (A1) */}
                                    {silenceWarning && (
                                        <p className="text-xs text-red-600 mt-2">
                                            ⚠ You're silent for a while — please start speaking.
                                        </p>
                                    )}
                                </div>

                            </div>

                            {/* Waveform */}
                            <div className={`w-28 flex-shrink-0 flex items-center justify-center bg-gradient-to-b 
                                    from-white to-slate-50 border border-slate-100 rounded-xl p-3 transition-all duration-300 ${isListening ? "animate-pulse opacity-100" : "opacity-30"
                                }`}
                            >
                                <svg width="48" height="28" viewBox="0 0 48 28" fill="none">
                                    <rect x="2" y={isListening ? "6" : "10"} width="3" height={isListening ? "16" : "8"} rx="1.5" fill="#93C5FD" />
                                    <rect x="8" y={isListening ? "4" : "6"} width="3" height={isListening ? "20" : "16"} rx="1.5" fill="#60A5FA" />
                                    <rect x="14" y={isListening ? "2" : "2"} width="3" height={isListening ? "24" : "24"} rx="1.5" fill="#3B82F6" />
                                    <rect x="20" y={isListening ? "5" : "8"} width="3" height={isListening ? "18" : "12"} rx="1.5" fill="#60A5FA" />
                                    <rect x="26" y={isListening ? "10" : "12"} width="3" height={isListening ? "10" : "4"} rx="1.5" fill="#93C5FD" />
                                    <rect x="32" y={isListening ? "4" : "6"} width="3" height={isListening ? "20" : "16"} rx="1.5" fill="#60A5FA" />
                                    <rect x="38" y={isListening ? "6" : "10"} width="3" height={isListening ? "16" : "8"} rx="1.5" fill="#93C5FD" />
                                </svg>
                            </div>

                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between gap-4">

                            <button
                                onClick={endCallNow}
                                className="text-sm text-red-600 hover:text-red-700 inline-flex items-center gap-2"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M10 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                End Session
                            </button>

                            <div className="ml-auto w-40">
                                <Button
                                    onClick={skipToNext}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm rounded-full"
                                >
                                    Next Question ➜
                                </Button>
                            </div>

                        </div>
                    </div>

                </div>

                <div className="text-center text-xs text-slate-400 mt-6">
                    Powered by HireMind AI ·
                </div>
            </div>

        </div>
    );
}

/* ---------------------------------------------- */
/* Instruction Card                               */
/* ---------------------------------------------- */

type InstructionCardProps = {
    icon: ReactNode;
    title: string;
    desc: string;
};

function InstructionCard({ icon, title, desc }: InstructionCardProps) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100
            bg-slate-50/50 hover:bg-slate-50 hover:border-blue-100 transition-colors"
        >
            <div className="bg-white p-2.5 rounded-lg shadow-sm border border-slate-100 shrink-0">
                {icon}
            </div>

            <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
