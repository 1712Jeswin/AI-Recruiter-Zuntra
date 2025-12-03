"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
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
  duration: string; // e.g. "30 Min"
  onDone: () => void;
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
  // form
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [capacity, setCapacity] = useState("5");

  // time (12-hour)
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

  // --------------------------------------------
  // Slot duration = base + 5 minutes buffer
  // --------------------------------------------
  const baseDuration = Number(duration.replace(" Min", "")) || 30;
  const slotDuration = baseDuration + 5;

  // Helpers
  const convertTo24 = (hour: string, minute: string, period: string) => {
    let h = parseInt(hour, 10);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  const toISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const toggleWorkingDay = (dayNum: number) => {
    setWorkingDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
    );
  };

  // --------------------------------------------
  // Validation
  // --------------------------------------------
  const isFormValid = useMemo(() => {
    if (
      !dateFrom ||
      !dateTo ||
      !startHour ||
      !startMinute ||
      !startPeriod ||
      !endHour ||
      !endMinute ||
      !endPeriod ||
      !capacity
    ) {
      return false;
    }

    const from = new Date(`${dateFrom}T00:00`);
    const to = new Date(`${dateTo}T00:00`);
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) return false;

    if (!workingDays || workingDays.length === 0) return false;

    const start24 = convertTo24(startHour, startMinute, startPeriod);
    const end24 = convertTo24(endHour, endMinute, endPeriod);
    const startTime = new Date(`${dateFrom}T${start24}`);
    const endTime = new Date(`${dateFrom}T${end24}`);
    if (startTime >= endTime) return false;

    return true;
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
  ]);

  // --------------------------------------------
  // Generate slots (sorted!)
  // --------------------------------------------
  const handleGenerate = () => {
    if (!isFormValid) return;

    const start24 = convertTo24(startHour, startMinute, startPeriod);
    const end24 = convertTo24(endHour, endMinute, endPeriod);

    const startDate = new Date(`${dateFrom}T00:00`);
    const endDate = new Date(`${dateTo}T00:00`);

    const allSlots: { start: Date; end: Date }[] = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dayNum = d.getDay();
      if (!workingDays.includes(dayNum)) continue;

      const isoDay = toISODate(d);
      const dayStart = new Date(`${isoDay}T${start24}`);
      const dayEnd = new Date(`${isoDay}T${end24}`);

      if (dayStart >= dayEnd) continue;

      let cursor = new Date(dayStart);
      while (cursor < dayEnd) {
        const slotEnd = new Date(cursor.getTime() + slotDuration * 60000);
        if (slotEnd > dayEnd) break;

        allSlots.push({ start: new Date(cursor), end: slotEnd });

        cursor = slotEnd;
      }
    }

    // ✅ Always sort chronologically (start ascending)
    const sorted = allSlots.sort((a, b) => a.start.getTime() - b.start.getTime());

    setPreviewSlots(sorted);
  };

  // --------------------------------------------
  // Save ALL slots as JSON array
  // --------------------------------------------
  const saveSlots = async () => {
    if (!previewSlots.length) {
      alert("No slots to save. Generate slots first.");
      return;
    }
    setSaving(true);

    try {
      const res = await fetch(`/api/interview/${interviewId}/slots/create`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slots: previewSlots
          .sort((a, b) => a.start.getTime() - b.start.getTime())
          .map((s) => ({
          start: new Date(s.start).toISOString(),
          end: new Date(s.end).toISOString(),
          capacity: Number(capacity),
        })),

        }),
      });

      setSaving(false);

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "Failed to save slots");
      }
    } catch (err) {
      setSaving(false);
      console.error(err);
      alert("Failed to save slots");
    }
  };

  // --------------------------------------------
  // UI
  // --------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50  flex justify-center font-sans text-slate-800">
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
        <div className="px-10 py-10 space-y-8">
          {/* Info */}
          <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-sm leading-relaxed">
              <p className="font-semibold text-blue-900">Configuration Context</p>
              <p className="text-blue-700 mt-1">
                Slot duration is locked at{" "}
                <span className="font-semibold">{slotDuration} minutes</span>{" "}
                (selected interview duration + 5 min buffer).
              </p>
            </div>
          </div>

          {/* Date Range + Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Slot Capacity</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-lg shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="p-3 rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  {Array.from({ length: 12 }, (_, i) =>
                    (i + 1).toString().padStart(2, "0")
                  ).map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
                :
                <select
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                  className="p-3 rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  {["00", "15", "30", "45"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={startPeriod}
                  onChange={(e) => setStartPeriod(e.target.value)}
                  className="p-3 rounded-lg border border-slate-200 bg-white shadow-sm"
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
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="p-3 rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  {Array.from({ length: 12 }, (_, i) =>
                    (i + 1).toString().padStart(2, "0")
                  ).map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
                :
                <select
                  value={endMinute}
                  onChange={(e) => setEndMinute(e.target.value)}
                  className="p-3 rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  {["00", "15", "30", "45"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={endPeriod}
                  onChange={(e) => setEndPeriod(e.target.value)}
                  className="p-3 rounded-lg border border-slate-200 bg-white shadow-sm"
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Preview Slots ({previewSlots.length})
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {previewSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between"
                  >
                    <div className="text-sm">
                      <div className="font-medium">
                        {slot.start.toLocaleDateString()}{" "}
                        <span className="text-slate-500 text-xs">•</span>{" "}
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
          <div className="pt-6 flex items-center justify-between border-t border-gray-100">
            <button
              onClick={onBack}
              className="flex items-center text-slate-500 hover:text-slate-800 font-medium text-sm group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Settings
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerate}
                disabled={!isFormValid}
                className={`flex items-center px-6 py-3 rounded-lg text-white font-semibold transition ${
                  isFormValid
                    ? "bg-blue-600 hover:bg-blue-700 shadow-md"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate Slots
              </button>

              <button
                onClick={saveSlots}
                disabled={saving || !previewSlots.length}
                className={`
                  group flex items-center px-6 py-3 rounded-lg font-semibold transition-all border 
                  ${
                    previewSlots.length && !saving
                      ? "bg-white text-slate-800 border-blue-500 hover:bg-green-600 hover:text-white hover:border-green-600 shadow-sm"
                      : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  }
                `}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-600" />
                ) : (
                  <CheckCircle2
                    className={`
                      w-4 h-4 mr-2 transition-colors
                      text-green-600
                      group-hover:text-white
                    `}
                  />
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
