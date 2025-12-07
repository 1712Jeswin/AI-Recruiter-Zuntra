"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Users,
  Info,
  ArrowLeft,
  ChevronDown,
  Plus,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface CreateSlotsProps {
  interviewId: string;
  duration: string;
  onDone: (from: string, to: string) => void;
  onBack: () => void;
}

const WEEK_DAYS = [
  { key: "Mon", val: 1 },
  { key: "Tue", val: 2 },
  { key: "Wed", val: 3 },
  { key: "Thu", val: 4 },
  { key: "Fri", val: 5 },
  { key: "Sat", val: 6 },
  { key: "Sun", val: 0 },
];

export default function CreateSlots({
  interviewId,
  duration,
  onDone,
  onBack,
}: CreateSlotsProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [capacity, setCapacity] = useState("5");

  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState("AM");

  const [endHour, setEndHour] = useState("10");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState("AM");

  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const [previewSlots, setPreviewSlots] = useState<
    { start: Date; end: Date }[]
  >([]);

  const [saving, setSaving] = useState(false);

  // ALWAYS warn unless saved
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  // ----------------------------------------------------
  // ⭐ FIX — Prevent RESET running on mount
  // ----------------------------------------------------
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ----------------------------------------------------
  // ⭐ RESET preview slots when ANY form input changes
  //    BUT DO NOT RESET ON FIRST RENDER
  // ----------------------------------------------------
  useEffect(() => {
    if (!isMounted) return;
    setPreviewSlots([]);
  }, [
    dateFrom,
    dateTo,
    startHour,
    startMinute,
    startPeriod,
    endHour,
    endMinute,
    endPeriod,
    capacity,
    workingDays,
    isMounted,
  ]);

  // ----------------------------------------------------
  // ⭐ Before unload
  // ----------------------------------------------------
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      if (!confirm("You have unsaved changes. Leave anyway?")) return;
    }
    onBack();
  };

  // Slot duration
  const baseDuration = Number(duration.replace(" Min", "")) || 30;
  const slotDuration = baseDuration + 5;

  const convertTo24 = (hour: string, minute: string, period: string) => {
    let h = parseInt(hour, 10);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${minute}`;
  };

  const toISODate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;

  const toggleWorkingDay = (dayNum: number) => {
    setWorkingDays((prev) =>
      prev.includes(dayNum)
        ? prev.filter((d) => d !== dayNum)
        : [...prev, dayNum]
    );
  };

  const isFormValid = useMemo(() => {
    if (!dateFrom || !dateTo) return false;

    const from = new Date(`${dateFrom}T00:00`);
    const to = new Date(`${dateTo}T00:00`);
    if (from > to) return false;

    if (!workingDays.length) return false;

    const start24 = convertTo24(startHour, startMinute, startPeriod);
    const end24 = convertTo24(endHour, endMinute, endPeriod);

    return (
      new Date(`${dateFrom}T${start24}`) < new Date(`${dateFrom}T${end24}`)
    );
  }, [
    dateFrom,
    dateTo,
    startHour,
    startMinute,
    startPeriod,
    endHour,
    endMinute,
    endPeriod,
    workingDays,
  ]);

  const handleGenerate = () => {
    if (!isFormValid) return;

    const start24 = convertTo24(startHour, startMinute, startPeriod);
    const end24 = convertTo24(endHour, endMinute, endPeriod);

    const startDate = new Date(`${dateFrom}T00:00`);
    const endDate = new Date(`${dateTo}T00:00`);

    const slots: { start: Date; end: Date }[] = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (!workingDays.includes(d.getDay())) continue;

      const day = toISODate(d);
      const dayStart = new Date(`${day}T${start24}`);
      const dayEnd = new Date(`${day}T${end24}`);

      let cursor = new Date(dayStart);

      while (cursor < dayEnd) {
        const slotEnd = new Date(cursor.getTime() + slotDuration * 60000);
        if (slotEnd > dayEnd) break;

        slots.push({ start: new Date(cursor), end: slotEnd });
        cursor = slotEnd;
      }
    }

    setPreviewSlots(slots);
  };

  const saveSlots = async () => {
    if (!previewSlots.length) return alert("Generate slots first.");

    setSaving(true);

    try {
      const res = await fetch(`/api/interview/${interviewId}/slots/create`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slots: previewSlots.map((s) => ({
            start: s.start.toISOString(),
            end: s.end.toISOString(),
            capacity: Number(capacity),
          })),
        }),
      });

      if (res.ok) {
        await fetch(`/api/interview/${interviewId}/mark-complete`, {
          method: "POST",
        });

        setHasUnsavedChanges(false);
        onDone(dateFrom, dateTo);
      } else {
        alert("Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center font-sans text-slate-800">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="px-10 pt-10 pb-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Create Interview Slots
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Configure the timing, working days and capacity for your interview sessions.
          </p>
        </div>

        {/* Content */}
        <div className="px-10 py-6 space-y-8">

          {/* Info Box */}
          <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-sm leading-relaxed">
              <p className="font-semibold text-blue-900">Slot Configuration Summary</p>
              <p className="text-blue-700 mt-1">
                Each interview slot includes a{" "}
                <span className="font-semibold">{slotDuration}-minute duration</span>,
                covering interview time plus processing buffer.
              </p>
            </div>
          </div>

          {/* Date + Time + Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Start Date</label>
              <input
                type="date"
                min={today}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="block w-full pl-3 pr-3 py-3 border rounded-lg"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">End Date</label>
              <input
                type="date"
                min={dateFrom || today}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="block w-full pl-3 pr-3 py-3 border rounded-lg"
              />
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Slot Capacity</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-lg shadow-sm appearance-none cursor-pointer"
                >
                  <option value="5">5 Candidates</option>
                  <option value="10">10 Candidates</option>
                  <option value="15">15 Candidates</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Start Time</label>
              <div className="flex items-center gap-2">
                <select
                  className="p-3 border rounded-lg"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) =>
                    String(i + 1).padStart(2, "0")
                  ).map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
                :
                <select
                  className="p-3 border rounded-lg"
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                >
                  {["00", "15", "30", "45"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <select
                  className="p-3 border rounded-lg"
                  value={startPeriod}
                  onChange={(e) => setStartPeriod(e.target.value)}
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">End Time</label>
              <div className="flex items-center gap-2">
                <select
                  className="p-3 border rounded-lg"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) =>
                    String(i + 1).padStart(2, "0")
                  ).map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
                :
                <select
                  className="p-3 border rounded-lg"
                  value={endMinute}
                  onChange={(e) => setEndMinute(e.target.value)}
                >
                  {["00", "15", "30", "45"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <select
                  className="p-3 border rounded-lg"
                  value={endPeriod}
                  onChange={(e) => setEndPeriod(e.target.value)}
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Working Days */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Working Days
            </label>
            <div className="flex gap-2 flex-wrap">
              {WEEK_DAYS.map(({ key, val }) => {
                const active = workingDays.includes(val);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleWorkingDay(val)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                      active
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          {previewSlots.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Preview Slots ({previewSlots.length})
              </h3>

              <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50">
                {previewSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between"
                  >
                    <div className="text-sm font-medium">
                      {slot.start.toLocaleDateString()} •{" "}
                      {slot.start.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      →{" "}
                      {slot.end.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      Capacity: {capacity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-6 flex items-center justify-between border-t">
            <button onClick={handleBackClick} className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={!isFormValid}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg"
              >
                <Plus className="w-4 h-4 inline mr-2" /> Generate
              </button>

             <button
  onClick={saveSlots}
  disabled={saving || !previewSlots.length}
  className={`px-6 py-3 rounded-lg text-white transition ${
    saving || !previewSlots.length
      ? "bg-green-400 opacity-50 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700 cursor-pointer"
  }`}
>
  {saving ? (
    <Loader2 className="w-4 h-4 animate-spin inline" />
  ) : (
    <CheckCircle2 className="w-4 h-4 inline mr-2" />
  )}
  Save Slots
</button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
