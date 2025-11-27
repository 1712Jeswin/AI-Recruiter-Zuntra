// src/lib/cheat-detection/audioMonitor.ts

export type AudioMonitor = {
  start: () => Promise<void>;
  stop: () => void;
  isOtherVoicePresent: () => boolean;
  onOtherVoice?: (active: boolean, score?: number) => void;
};

export function createAudioMonitor(opts?: {
  smoothing?: number;
  differenceThreshold?: number; // threshold for detecting other voices
}): AudioMonitor {
  let ac: AudioContext | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  let raf = 0;
  let stream: MediaStream | null = null;

  // baseline voice vector (candidate's voice signature)
  let baseline: number[] | null = null;
  let collectingBaseline = true;
  let baselineFrames: number[][] = [];

  let otherVoice = false;

  const smoothing = opts?.smoothing ?? 0.8;

  // Lower = more sensitive. Higher = more lenient.
  const differenceThreshold = opts?.differenceThreshold ?? 0.35;

  /** Convert frequency data into normalized vector 0..1 */
  function getVector(buf: Uint8Array) {
    return Array.from(buf).map((v) => v / 255);
  }

  /** Euclidean distance between two vectors */
  function vectorDistance(a: number[], b: number[]) {
    if (!a || !b || a.length !== b.length) return 1;
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      sum += d * d;
    }
    return Math.sqrt(sum / a.length);
  }

  async function start() {
    if (ac) return; // already running

    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    ac = new (window.AudioContext || (window as any).webkitAudioContext)();

    source = ac.createMediaStreamSource(stream);
    analyser = ac.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = smoothing;

    source.connect(analyser);

    const buf = new Uint8Array(analyser.frequencyBinCount);

    const loop = () => {
      if (!analyser) return;

      analyser.getByteFrequencyData(buf);
      const vec = getVector(buf);

      /** 1️⃣ Build the candidate's voice baseline (first ~3 seconds) */
      if (collectingBaseline) {
        baselineFrames.push(vec);

        if (baselineFrames.length > 60) {
          // Average the frames to get stable baseline
          baseline = baselineFrames[0].map((_, i) =>
            baselineFrames.reduce((s, frame) => s + frame[i], 0) / baselineFrames.length
          );
          collectingBaseline = false;
          console.log("🎤 Baseline voiceprint set.");
        }
      }

      /** 2️⃣ Compare incoming voice to baseline */
      if (!collectingBaseline && baseline) {
        const dist = vectorDistance(baseline, vec);

        // Different voice?
        const isOther = dist > differenceThreshold;

        if (isOther !== otherVoice) {
          otherVoice = isOther;
          audioMonitor.onOtherVoice?.(otherVoice, dist);
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;

    if (source) source.disconnect();
    if (analyser) analyser.disconnect();
    if (ac) ac.close();

    source = null;
    analyser = null;
    ac = null;

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  function isOtherVoicePresent() {
    return otherVoice;
  }

  const audioMonitor: AudioMonitor = {
    start,
    stop,
    isOtherVoicePresent,
    onOtherVoice: undefined,
  };

  return audioMonitor;
}
