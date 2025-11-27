// src/lib/cheat-detection/types.ts
export type CheatReason =
  | "face-missing"
  | "multiple-faces"
  | "looking-away"
  | "phone-detected"
  | "other-voice-detected"
  | "tab-switched";

export type CheatEvent = {
  reason: CheatReason;
  score?: number; // optional confidence / metric
  timestamp: number;
  meta?: Record<string, any>;
};
