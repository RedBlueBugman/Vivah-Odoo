"use client";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const STATUS_STYLE: Record<string, string> = {
  INVITED:        "bg-yellow-100 text-yellow-700",
  QUOTE_RECEIVED: "bg-blue-100 text-blue-700",
  SELECTED:       "bg-green-100 text-green-700",
  NOT_SELECTED:   "bg-gray-100 text-gray-500",
  DECLINED:       "bg-red-100 text-red-500",
};

export default function VendorPortal() {
  const { data: session } = useSession();
  const vendorId = (session?.user as any)?.vendorId;

  const { data, isLoading } = useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => axios.get(`/api/vendors/${vendorId}`).then(r => r.data),
    enabled: !!vendorId,
  });

  const v = data?.vendor;

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm animate-pulse">Loading your dashboard...</p>
    </div>
  );

  const wonQuotes = (v?.quotes ?? []).filter((q: any) => q.isWinner);
  const activeRFQs = (v?.rfqInvites ?? []).filter((r: any) =>
    r.status === "INVITED" || r.status === "QUOTE_RECEIVED"
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs tracking-widest text-secondary font-semibold uppercase">The Royal Knot</p>
          <p className="text-xs text-gray-400 mt-0.5">Vendor portal</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-gray-400 hover:text-primary transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Profile hero */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-5">
          {/* Avatar initials */}
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-white text-xl font-bold">
              {v?.name?.split(" ").map((w: string) => w[0]).slice(0,2).join("") ?? "V"}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{v?.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{v?.category?.name}</p>
            <p className="text-xs text-gray-400 mt-1">{v?.contactPerson} · {v?.phone}</p>
            {v?.rating && (
              <p className="text-secondary font-semibold mt-2 text-sm">
                {"★".repeat(v.rating)}{"☆".repeat(5 - v.rating)} ({v.rating}/5)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "RFQ Invitations", value: v?.rfqInvites?.length ?? 0,  color: "text-gray-900" },
          { label: "Active RFQs",     value: activeRFQs.length,            color: "text-blue-600" },
          { label: "Contracts Won",   value: wonQuotes.length,             color: "text-green-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* RFQ Invitations */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          RFQ Invitations
        </h2>
        {(v?.rfqInvites ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">No invitations yet.</p>
        ) : (
          <div className="space-y-3">
            {(v?.rfqInvites ?? []).map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.rfq.category}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Invited {new Date(inv.invitedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                    {inv.respondedAt && ` · Responded ${new Date(inv.respondedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}`}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[inv.status]}`}>
                  {inv.status.replace("_"," ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quotes submitted */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Quotes Submitted
        </h2>
        {(v?.quotes ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">No quotes submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {(v?.quotes ?? []).map((q: any) => (
              <div key={q.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{q.rfq.category}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(q.submittedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  </p>
                  {q.notes && <p className="text-xs text-gray-500 mt-0.5">{q.notes}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    ₹{Number(q.totalAmount).toLocaleString("en-IN")}
                  </p>
                  {q.effectiveCostPax && (
                    <p className="text-xs text-gray-400">₹{Number(q.effectiveCostPax).toLocaleString("en-IN")}/pax</p>
                  )}
                  {q.isWinner
                    ? <span className="text-xs font-bold text-green-600">✓ Won</span>
                    : <span className="text-xs text-gray-400">Not selected</span>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Won contracts */}
      {wonQuotes.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-3">
            ✓ Active Contracts
          </h2>
          {wonQuotes.map((q: any) => (
            <div key={q.id} className="flex items-center justify-between">
              <p className="text-sm text-green-800 font-medium">{q.rfq.category}</p>
              <p className="font-bold text-green-700">₹{Number(q.totalAmount).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}