"use client";

import CheatMonitor from "./CheatMonitor";

export default function CheatMonitorWrapper() {
  return (
    <CheatMonitor
      onCheat={(event) => {
        console.log("CHEAT EVENT:", event);
      }}
    />
  );
}
