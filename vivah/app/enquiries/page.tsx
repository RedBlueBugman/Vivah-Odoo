"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { EnquiryForm } from "@/components/EnquiryForm";
import { SkeletonTable } from "@/components/Skeleton";

const STATUS_STYLE: Record<string, string> = {
  LEAD:      "bg-gray-100 text-gray-600",
  QUALIFIED: "bg-blue-100 text-blue-700",
  BOOKED:    "bg-green-100 text-green-700",
  LOST:      "bg-red-100 text-red-500",
};

const ALL_STATUSES = ["ALL", "LEAD", "QUALIFIED", "BOOKED", "LOST"];

export default function EnquiriesPage() {
  const [filter, setFilter]   = useState("ALL");
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["enquiries"],
    queryFn: () => axios.get("/api/enquiries").then((r) => r.data),
  });

  const all       = data?.enquiries ?? [];
  const enquiries = filter === "ALL" ? all : all.filter((e: any) => e.status === filter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enquiries</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {all.length} total · {all.filter((e: any) => e.status === "LEAD").length} open leads
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          + New Enquiry
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filter === s
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {isLoading && <SkeletonTable rows={4} />}
      {isError   && <p className="text-red-500 text-sm">Failed to load enquiries.</p>}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Client","Contact","Event Date","Budget","Pax","Status","Received"].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i >= 2 ? "text-right" : "text-left"} ${i === 5 || i === 6 ? "text-left" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enquiries.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{e.clientName}</td>
                  <td className="px-5 py-3 text-gray-500">
                    <p>{e.phone}</p>
                    <p className="text-xs text-gray-400">{e.email}</p>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">
                    {e.eventDate
                      ? new Date(e.eventDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-800">
                    {e.budget ? `₹${(Number(e.budget)/100000).toFixed(1)}L` : "—"}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">{e.estimatedPax ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[e.status]}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {new Date(e.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {enquiries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No enquiries found.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-primary text-sm font-medium hover:underline"
              >
                Capture your first enquiry →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Enquiry form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Capture New Enquiry">
        <EnquiryForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}