"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Loader2,
  Users,
  XCircle,
} from "lucide-react";

type Slot = {
  slotRecordId: string;
  slotIndex: number;
  start: string;
  end: string;
  capacity: number;
  capacityLeft: number;
};

export default function SlotPicker({
  interviewId,
  candidateId,
}: {
  interviewId: string;
  candidateId?: string;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Slot | null>(null);

  const [hold, setHold] = useState<{
    holdId: string;
    expiresAt: string;
    slotRecordId: string;
    slotIndex: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [alreadyBooked, setAlreadyBooked] = useState(false);

  // --------------------------------------------------------
  // FILTER FUTURE SLOTS
  // --------------------------------------------------------
  const filterFutureSlots = (slots: Slot[]) => {
    const now = new Date();

    return slots.filter((slot) => {
      const startTime = new Date(slot.start);
      const cutoff = new Date(startTime.getTime() - 15 * 60 * 1000); // 15-minute before start

      // Only show slot if we are BEFORE the cutoff
      return now < cutoff;
    });
  };


  // Live auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSlots((prev) => filterFutureSlots(prev));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // --------------------------------------------------------
  // CHECK EXISTING BOOKING
  // --------------------------------------------------------


  const checkExistingBooking = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/bookings/status?interviewId=${interviewId}&candidateId=${candidateId}`
      );
      const json = await res.json();
      if (json.hasBooking) setAlreadyBooked(true);
    } catch { }
  }, [interviewId, candidateId]);

  useEffect(() => {
    if (!candidateId) return;
    checkExistingBooking();
  }, [candidateId, checkExistingBooking]);

  // --------------------------------------------------------
  // FETCH SLOTS
  // --------------------------------------------------------
  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/bookings/slots?interviewId=${encodeURIComponent(interviewId)}`
      );
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to load slots");

      setSlots(filterFutureSlots(json.slots ?? []));
    } catch (e: any) {
      setError(e.message);
    }

    setLoading(false);
  }, [interviewId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // --------------------------------------------------------
  // HOLD SLOT
  // --------------------------------------------------------
  async function createHold() {
    if (!selected) return;

    const res = await fetch(`/api/bookings/hold`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        interviewId,
        candidateId,
        slotRecordId: selected.slotRecordId,
        slotIndex: selected.slotIndex,
      }),
    });

    const json = await res.json();

    if (res.ok) {
      setHold({
        holdId: json.holdId,
        expiresAt: json.expiresAt,
        slotRecordId: selected.slotRecordId,
        slotIndex: selected.slotIndex,
      });
      setTimeLeft(300);
    } else {
      if (json.error === "already_booked") setAlreadyBooked(true);
      setError(json.error || "Cannot hold slot");
      fetchSlots();
    }
  }

  // --------------------------------------------------------
  // CONFIRM BOOKING
  // --------------------------------------------------------
  async function confirmHold() {
    if (!hold || !selected) return;

    const res = await fetch(`/api/bookings/confirm`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        holdId: hold.holdId,
        candidateId,
      }),
    });

    const json = await res.json();

    if (res.ok) {
      localStorage.setItem(
        "bookingId",
        JSON.stringify({
          id: json.bookingId,
          interviewId,
          slotRecordId: selected.slotRecordId,
          slotIndex: selected.slotIndex,
          start: selected.start,
          end: selected.end,
        })
      );

      window.location.href = `/interview/${interviewId}/scheduled`;
    } else {
      setError(json.error || "Confirm failed");
      fetchSlots();
    }
  }

  // --------------------------------------------------------
  // CANCEL HOLD
  // --------------------------------------------------------
  const cancelHold = useCallback(async (auto = false) => {
    if (!hold) return;

    const res = await fetch(`/api/bookings/cancel`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ holdId: hold.holdId, candidateId }),
    });

    const json = await res.json();

    if (res.ok) {
      setHold(null);
      setSelected(null);
      setTimeLeft(null);
      fetchSlots();
      if (auto) setError("Your held slot expired and was released.");
    } else {
      setError(json.error || "Cancel failed");
    }
  }, [hold, candidateId, fetchSlots]);

  // --------------------------------------------------------
  // AUTO TIMER
  // --------------------------------------------------------
  useEffect(() => {
    if (!hold || timeLeft === null) return;

    if (timeLeft <= 0) {
      cancelHold(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => (t !== null ? t - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [hold, timeLeft, cancelHold]);

  // Helpers
  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return "";
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    };
  };

  const formatTimeRange = (startStr: string, endStr: string) => {
    const s = new Date(startStr);
    const e = new Date(endStr);
    return `${s.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })} - ${e.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  };

  // --------------------------------------------------------
  // UI
  // --------------------------------------------------------

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* header */}
        <div className="bg-slate-50/50 px-6 py-8 border-b border-slate-100 sm:flex sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Select an Interview Slot
            </h2>

            {alreadyBooked && (
              <p className="text-red-600 text-sm mt-2 font-medium">
                You have already booked a slot for this interview.
              </p>
            )}

            {!alreadyBooked && (
              <p className="text-slate-500 mt-2 text-sm max-w-md">
                Choose a time that works best. Held slots expire in 5 minutes.
              </p>
            )}
          </div>

          <div className="hidden sm:block">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-100">
              <Calendar className="w-3 h-3" />
              {slots.length} Slots Available
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">

          {/* ERROR */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">Unable to proceed</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Already booked UI */}
          {alreadyBooked ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Booking Already Exists
              </h2>
              <p className="text-red-600 text-sm font-medium mb-4">
                You have already booked a slot.
              </p>

              <a
                href={`/interview/${interviewId}/scheduled`}
                className="text-blue-600 underline"
              >
                View scheduled time
              </a>
            </div>
          ) : (
            <>

              {/* Loading */}
              {loading && (
                <div className="py-20 flex flex-col items-center">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                  <p className="text-sm text-slate-500">
                    Checking availability...
                  </p>
                </div>
              )}

              {/* No slots */}
              {!loading && slots.length === 0 && (
                <div className="py-20 text-center text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No slots available at this time.</p>
                </div>
              )}

              {/* Slot grid */}
              {!loading && slots.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slots.map((slot) => {
                    const isSelected =
                      selected?.slotRecordId === slot.slotRecordId &&
                      selected?.slotIndex === slot.slotIndex;

                    const holdActive = !!hold && isSelected;

                    return (
                      <div
                        key={`${slot.slotRecordId}-${slot.slotIndex}`}
                        onClick={() => !hold && setSelected(slot)}
                        className={`group relative flex flex-col p-5 rounded-xl border-2 transition-all cursor-pointer
                          ${isSelected
                            ? "border-blue-600 bg-blue-50/40 ring-4 ring-blue-50 shadow-md"
                            : "border-slate-200 hover:border-blue-300 bg-white"
                          }
                          ${hold && !isSelected ? "opacity-40 grayscale cursor-not-allowed" : ""}
                        `}
                      >
                        {/* checkmark */}
                        <div
                          className={`absolute top-4 right-4 w-6 h-6 rounded-full border flex items-center justify-center
                            ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"}
                          `}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>

                        {/* DATE */}
                        <span
                          className={`text-xs font-bold uppercase tracking-wide mb-1 ${isSelected ? "text-blue-600" : "text-slate-400"
                            }`}
                        >
                          {formatDate(slot.start).day},{" "}
                          {formatDate(slot.start).date}
                        </span>

                        {/* TIME */}
                        <div
                          className={`text-xl font-semibold mb-3 ${isSelected ? "text-slate-900" : "text-slate-700"
                            }`}
                        >
                          {formatTimeRange(slot.start, slot.end)}
                        </div>

                        {/* CAPACITY */}
                        <div className="text-xs text-slate-500 border-t border-slate-200 pt-3 mt-3 flex justify-between">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {slot.capacityLeft} spots
                          </div>

                          {holdActive && (
                            <span className="text-amber-600 font-medium animate-pulse">
                              Reserved
                            </span>
                          )}
                        </div>

                        {/* ACTIONS */}
                        {isSelected && (
                          <div className="mt-5 flex flex-col gap-2">
                            {!hold && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  createHold();
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
                              >
                                <Clock className="w-4 h-4" />
                                Hold Slot
                              </button>
                            )}

                            {holdActive && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmHold();
                                  }}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
                                >
                                  Confirm Booking
                                  <ChevronRight className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelHold();
                                  }}
                                  className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Cancel Hold
                                </button>

                                <div className="text-xs text-amber-600 font-semibold text-center">
                                  Auto-cancelling in {formatTimer(timeLeft)}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* footer */}
        <div
          className={`p-6 border-t text-center text-sm ${alreadyBooked
            ? "bg-red-50 border-red-200 text-red-600"
            : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
        >
          {alreadyBooked
            ? "You already booked, you cannot book another slot."
            : "Select a slot above to continue"}
        </div>
      </div>
    </div>
  );
}
