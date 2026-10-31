"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const WEDDING_ID = "cmvwwz1lt00167v4nw32bj3a8"; // Sharma-Gupta — used for back link

function AlertBadge({ status, minutesLate }: { status: string; minutesLate: number }) {
  if (status === "CHECKED_IN") return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
      ✓ Checked In
    </span>
  );
  if (status === "LATE") return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 animate-pulse">
      ⚠ LATE {minutesLate}m
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
      ○ Upcoming
    </span>
  );
}

export default function DayOfPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  // Poll every 5 seconds — demo=true fixes clock to 09:35 IST Dec 17
  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ["dayof", id],
    queryFn: () => axios.get(`/api/weddings/${id}/dayof?demo=true`).then((r) => r.data),
    refetchInterval: 5000,
    enabled: !!id,
  });

  const checkInMutation = useMutation({
    mutationFn: ({ timelineEventId, vendorName }: { timelineEventId: string; vendorName: string }) =>
      axios.post("/api/checkins", { timelineEventId, vendorName, status: "CHECKED_IN" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dayof", id] });
      setCheckingIn(null);
    },
  });

  if (isLoading) return (
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <span className="animate-spin">⟳</span> Loading command center...
    </div>
  );
  if (isError || !data) return <p className="text-red-500 text-sm">Failed to load day-of data.</p>;

  const { summary, functions, asOf } = data;

  return (
    <div>
      {/* Back */}
      <Link href={`/weddings/${id}`} className="text-xs text-primary hover:underline mb-4 inline-block">
        ← Back to Wedding
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Day-of Command Center</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            DEMO MODE · Clock fixed to {new Date(asOf).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })} IST · Polling every 5s
          </p>
        </div>
        <p className="text-xs text-gray-400">
          Last updated: {new Date(dataUpdatedAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Events",  value: summary.total,      color: "text-gray-700",  bg: "bg-white" },
          { label: "Checked In",    value: summary.checkedIn,  color: "text-green-700", bg: "bg-green-50" },
          { label: "LATE ⚠",        value: summary.lateCount,  color: "text-red-700",   bg: summary.lateCount > 0 ? "bg-red-50 border-red-200" : "bg-white" },
          { label: "Upcoming",      value: summary.upcoming,   color: "text-gray-500",  bg: "bg-white" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl border border-gray-100 p-4`}>
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Functions + Timeline */}
      <div className="space-y-8">
        {functions.map((fn: any) => (
          <div key={fn.id}>
            {/* Function header */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-gray-900">{fn.name}</h3>
              <span className="text-xs text-gray-400">
                {new Date(fn.date).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})} · {fn.pax} pax · {fn.venue}
              </span>
            </div>

            {fn.timeline.length === 0 ? (
              <p className="text-sm text-gray-400 pl-2">No timeline events scheduled.</p>
            ) : (
              <div className="space-y-3">
                {fn.timeline.map((event: any) => (
                  <div
                    key={event.id}
                    className={`bg-white rounded-xl border p-5 transition-all ${
                      event.alertStatus === "LATE"
                        ? "border-red-300 shadow-md shadow-red-50"
                        : event.alertStatus === "CHECKED_IN"
                        ? "border-green-200"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Time */}
                        <p className="text-xs text-gray-400 mb-1">
                          {new Date(event.startTime).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Kolkata"})}
                          {" "}→{" "}
                          {new Date(event.endTime).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Kolkata"})}
                        </p>
                        {/* Activity */}
                        <p className={`font-semibold ${
                          event.alertStatus === "LATE" ? "text-red-800" : "text-gray-900"
                        }`}>
                          {event.activity}
                        </p>

                        {/* Late warning message */}
                        {event.alertStatus === "LATE" && (
                          <div className="mt-2 text-sm text-red-600 font-medium">
                            ⚠ No check-in received. Vendor is {event.minutesLate} minutes past scheduled arrival.
                            <span className="block text-xs text-red-400 font-normal mt-0.5">
                              Call vendor immediately. Escalate if no response in 5 minutes.
                            </span>
                          </div>
                        )}

                        {/* Check-in records */}
                        {event.checkIns.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {event.checkIns.map((c: any) => (
                              <p key={c.id} className="text-xs text-green-600">
                                ✓ {c.vendorName} checked in at{" "}
                                {new Date(c.timestamp).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Kolkata"})}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Problem flags */}
                        {event.problems.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {event.problems.map((p: any) => (
                              <p key={p.id} className="text-xs text-orange-600">
                                🚩 {p.issue} [{p.severity}]{p.isSolved ? " — Resolved" : ""}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: badge + check-in button */}
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <AlertBadge status={event.alertStatus} minutesLate={event.minutesLate} />

                        {event.alertStatus !== "CHECKED_IN" && (
                          checkingIn === event.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  // Extract vendor name from activity string
                                  const vendorName = event.activity.split("—")[0].trim();
                                  checkInMutation.mutate({ timelineEventId: event.id, vendorName });
                                }}
                                className="text-xs px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                disabled={checkInMutation.isPending}
                              >
                                {checkInMutation.isPending ? "Saving..." : "Confirm ✓"}
                              </button>
                              <button
                                onClick={() => setCheckingIn(null)}
                                className="text-xs px-2 py-1 text-gray-400 hover:text-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setCheckingIn(event.id)}
                              className="text-xs px-3 py-1 border border-gray-200 text-gray-600 rounded-lg hover:border-primary hover:text-primary transition-colors"
                            >
                              Mark Checked In
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}