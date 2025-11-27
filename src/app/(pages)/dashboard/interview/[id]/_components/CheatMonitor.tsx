"use client";
import React, { useEffect, useRef, useState } from "react";
import { loadFaceModels, detectFaces, estimateYaw } from "@/lib/cheat-detection/faceDetection";
import { createAudioMonitor } from "@/lib/cheat-detection/audioMonitor";
import { loadPhoneModelIfAvailable, detectPhoneFromImageData } from "@/lib/cheat-detection/phoneDetection";
import type { CheatEvent } from "@/lib/cheat-detection/types";

type Props = {
  onCheat?: (event: CheatEvent) => void;
  // thresholds
  faceMissingSeconds?: number;
  multiFaceThreshold?: number;
  lookAwayYawThreshold?: number;
  lookAwaySeconds?: number;
};

export default function CheatMonitor({
  onCheat,
  faceMissingSeconds = 4,
  multiFaceThreshold = 1,
  lookAwayYawThreshold = 20,
  lookAwaySeconds = 4,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const missingSinceRef = useRef<number | null>(null);
  const lookAwaySinceRef = useRef<number | null>(null);
  const [running, setRunning] = useState(false);
  const audioMonitorRef = useRef<any>(null);
  const phoneModelLoadedRef = useRef(false);

  useEffect(() => {
  console.log("CheatMonitor mounted");
}, []);


  useEffect(() => {
    let mounted = true;
    let raf = 0;

    async function startAll() {
      await loadFaceModels();
      // try load phone model if present (optional)
      phoneModelLoadedRef.current = await loadPhoneModelIfAvailable().catch(() => false);

      // start camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true });
      if (!mounted) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // start audio monitor
      const audioMon = createAudioMonitor();
      audioMonitorRef.current = audioMon;
      audioMon.onOtherVoice = (active: boolean, score?: number) => {
        if (active) {
          emitCheat("other-voice-detected", { score });
        }
      };
      audioMon.start().catch(() => {});

      setRunning(true);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      const loop = async () => {
        if (!videoRef.current) return;
        try {
          const res = await detectFaces(videoRef.current);
          const faces = res.faces || [];
          // draw debug boxes (optional)
          if (ctx && canvas && videoRef.current) {
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "rgba(0,255,0,0.8)";
            ctx.lineWidth = 2;
            faces.forEach((f: any) => {
              const top = f.topLeft ? f.topLeft[1] : f.boundingBox?.top;
              const left = f.topLeft ? f.topLeft[0] : f.boundingBox?.left;
              const right = f.bottomRight ? f.bottomRight[0] : f.boundingBox?.right;
              const bottom = f.bottomRight ? f.bottomRight[1] : f.boundingBox?.bottom;
              const w = right - left;
              const h = bottom - top;
              ctx.strokeRect(left, top, w, h);
            });
          }

          // multiple faces
          if (faces.length > multiFaceThreshold) {
            emitCheat("multiple-faces", { count: faces.length });
          }

          // face missing check
          if (faces.length === 0) {
            if (!missingSinceRef.current) missingSinceRef.current = Date.now();
            else {
              const elapsed = (Date.now() - missingSinceRef.current) / 1000;
              if (elapsed >= faceMissingSeconds) {
                emitCheat("face-missing", { seconds: elapsed });
                missingSinceRef.current = Date.now(); // throttle repeated emissions
              }
            }
          } else {
            missingSinceRef.current = null;
          }

          // gaze / yaw
          if (res.landmarks) {
            const yaw = estimateYaw(res.landmarks);
            if (yaw !== null && Math.abs(yaw) > lookAwayYawThreshold) {
              if (!lookAwaySinceRef.current) lookAwaySinceRef.current = Date.now();
              else {
                const elapsed = (Date.now() - lookAwaySinceRef.current) / 1000;
                if (elapsed >= lookAwaySeconds) {
                  emitCheat("looking-away", { yaw, seconds: elapsed });
                  lookAwaySinceRef.current = Date.now();
                }
              }
            } else {
              lookAwaySinceRef.current = null;
            }
          }

          // phone detection (optional, uses canvas image)
          if (phoneModelLoadedRef.current && canvas) {
            try {
              const imageData = (ctx && canvas) ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
              if (imageData) {
                const p = await detectPhoneFromImageData(imageData);
                if (p.phone && p.score > 0.4) {
                  emitCheat("phone-detected", { score: p.score });
                }
              }
            } catch (e) {
              // ignore phone errors
            }
          }
        } catch (e) {
          // model errors — keep running
          console.warn("CheatMonitor loop error:", e);
        }
        raf = requestAnimationFrame(loop);
      };

      raf = requestAnimationFrame(loop);
    }

    startAll().catch((e) => {
      console.error("CheatMonitor failed to start:", e);
    });

    // handle tab switching / blur
    const handleVisibility = () => {
      if (document.hidden) {
        emitCheat("tab-switched");
      }
    };
    const handleBlur = () => emitCheat("tab-switched");
    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    function cleanup() {
      mounted = false;
      setRunning(false);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      if (raf) cancelAnimationFrame(raf);
      // stop media tracks
      const vid = videoRef.current;
      if (vid && vid.srcObject) {
        const st = vid.srcObject as MediaStream;
        st.getTracks().forEach((t) => t.stop());
        vid.srcObject = null;
      }
      if (audioMonitorRef.current) {
        audioMonitorRef.current.stop?.();
      }
    }

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emitCheat(reason: CheatEvent["reason"], meta?: Record<string, any>) {
    const event: CheatEvent = { reason, timestamp: Date.now(), meta, score: meta?.score };
    try {
      onCheat?.(event);
    } catch (e) {
      console.warn("onCheat handler error:", e);
    }
    // local UI / console for debugging
    console.warn("Cheat detected:", event);
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="rounded-md w-80 h-auto bg-black"
        autoPlay
        playsInline
        muted
        style={{ transform: "scaleX(-1)" }} // mirror
      />
      {/* overlay canvas used for detection draw/debug */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-80 h-auto pointer-events-none" />
      <div className="mt-2 text-xs text-muted-foreground">
        {running ? "Monitoring — privacy: processing locally in browser" : "Starting monitor..."}
      </div>
    </div>
  );
}
