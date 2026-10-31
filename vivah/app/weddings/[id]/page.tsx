"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

const TABS = ["Overview", "Tasks", "Vendors", "RFQs"] as const;
type Tab = typeof TABS[number];

const TASK_STATUS_STYLE: Record<string, string> = {
  TODO:        "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-green-100 text-green-700",
  DELAYED:     "bg-red-100 text-red-600",
};

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID:    "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-600",
};

function MarkPaidInline({ trancheId, onDone }: { trancheId: string; onDone: () => void }) {
  const [ref, setRef] = useState("");
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: () => axios.patch(`/api/payments/${trancheId}`, { referenceNumber: ref }),
    onSuccess: () => { toast("Payment marked as paid"); onDone(); },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Failed to mark payment";
      toast(msg, "error");
    },
  });
  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        placeholder="Reference / UTR number"
        className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-primary"
      />
      <button
        onClick={() => ref.trim() && mutation.mutate()}
        disabled={!ref.trim() || mutation.isPending}
        className="px-3 py-1 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {mutation.isPending ? "..." : "Mark Paid"}
      </button>
    </div>
  );
}

export default function WeddingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("Overview");
  const [payingId, setPayingId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wedding", id],
    queryFn: () => axios.get(`/api/weddings/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const w = data?.wedding;

  if (isLoading) return (
    <div className="space-y-4">
      <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
      <div className="h-40 bg-gray-100 animate-pulse rounded-xl" />
    </div>
  );
  if (isError || !w) return <p className="text-red-500 text-sm">Wedding not found.</p>;

  const totalCommitted = w.hiredVendors.reduce((s: number, wv: any) => s + Number(wv.contractValue), 0);
  const totalPaid      = w.hiredVendors.reduce((s: number, wv: any) =>
    s + wv.payments.filter((p: any) => p.status === "PAID").reduce((ps: number, p: any) => ps + Number(p.amount), 0), 0);
  const remaining = Number(w.totalBudget) - totalCommitted;

  return (
    <div>
      <Link href="/weddings" className="text-xs text-primary hover:underline mb-4 inline-block">
        ← Back to Weddings
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{w.coupleName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {w.venueCity} · {new Date(w.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
              {" "}→{" "}
              {new Date(w.endDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">{w.status}</span>
            <Link
              href={`/dayof/${w.id}`}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              ⚡ Day-of
            </Link>
          </div>
        </div>

        {/* Financial summary */}
        <div className="mt-5 grid grid-cols-4 gap-4">
          {[
            { label: "Total Budget",  value: `₹${(Number(w.totalBudget)/100000).toFixed(1)}L`,  color: "text-gray-900" },
            { label: "Committed",     value: `₹${(totalCommitted/100000).toFixed(1)}L`,          color: "text-primary" },
            { label: "Paid Out",      value: `₹${(totalPaid/100000).toFixed(1)}L`,               color: "text-green-600" },
            { label: "Unallocated",   value: `₹${(remaining/100000).toFixed(1)}L`,               color: remaining < 0 ? "text-red-600" : "text-gray-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-muted rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "Overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {w.functions.map((f: any) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="font-semibold text-gray-900">{f.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(f.date).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
              </p>
              <p className="text-xs text-gray-500 mt-2">{f.venue}</p>
              <p className="text-2xl font-bold text-primary mt-3">
                {f.pax}<span className="text-sm font-normal text-gray-400"> pax</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">{f.timeline.length} timeline events</p>
            </div>
          ))}
        </div>
      )}

      {/* Tasks */}
      {tab === "Tasks" && (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-50">
            <p className="font-semibold text-gray-900">{w.tasks.length} Tasks</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {w.tasks.filter((t: any) => t.status === "COMPLETED").length} completed ·{" "}
              {w.tasks.filter((t: any) => t.status === "DELAYED").length} delayed
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {w.tasks.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-400">Due {new Date(t.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TASK_STATUS_STYLE[t.status]}`}>
                  {t.status.replace("_"," ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendors — with mark-as-paid */}
      {tab === "Vendors" && (
        <div className="space-y-4">
          {w.hiredVendors.length === 0 ? (
            <p className="text-sm text-gray-400">No vendors hired yet.</p>
          ) : (
            w.hiredVendors.map((wv: any) => (
              <div key={wv.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{wv.vendor.name}</p>
                    <p className="text-xs text-gray-400">{wv.vendor.category.name}</p>
                  </div>
                  <p className="font-bold text-primary text-lg">
                    ₹{(Number(wv.contractValue)/100000).toFixed(2)}L
                  </p>
                </div>

                <div className="space-y-3">
                  {wv.payments.map((p: any) => (
                    <div key={p.id} className="border-t border-gray-50 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-700 font-medium">
                            ₹{Number(p.amount).toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            Due {new Date(p.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.referenceNumber && (
                            <span className="text-xs text-gray-400">{p.referenceNumber}</span>
                          )}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PAYMENT_STATUS_STYLE[p.status]}`}>
                            {p.status}
                          </span>
                          {p.status === "PENDING" && (
                            <button
                              onClick={() => setPayingId(payingId === p.id ? null : p.id)}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              {payingId === p.id ? "Cancel" : "Mark Paid"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline reference input */}
                      {payingId === p.id && (
                        <MarkPaidInline
                          trancheId={p.id}
                          onDone={() => {
                            setPayingId(null);
                            qc.invalidateQueries({ queryKey: ["wedding", id] });
                          }}
                        />
                      )}

                      {p.status === "PAID" && p.paidAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Paid {new Date(p.paidAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* RFQs */}
      {tab === "RFQs" && (
        <div className="space-y-3">
          {w.rfqs.length === 0 ? (
            <p className="text-sm text-gray-400">No RFQs created yet.</p>
          ) : (
            w.rfqs.map((rfq: any) => (
              <Link
                key={rfq.id}
                href={`/weddings/${w.id}/rfqs/${rfq.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-primary transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {rfq.category}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {rfq.quotes.length} quotes · {rfq.vendors.length} vendors invited
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      rfq.status === "CLOSED" ? "bg-green-100 text-green-700" :
                      rfq.status === "OPEN"   ? "bg-blue-100 text-blue-700"  :
                      "bg-gray-100 text-gray-500"
                    }`}>{rfq.status}</span>
                    <span className="text-primary text-sm">→</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}