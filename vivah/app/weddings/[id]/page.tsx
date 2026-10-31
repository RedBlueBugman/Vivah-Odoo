"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";

const TABS = ["Overview", "Functions", "Tasks", "Vendors", "RFQs"] as const;
type Tab = typeof TABS[number];

const FUNCTION_NAMES = ["Mehendi", "Haldi", "Sangeet", "Baraat", "Wedding & Reception", "Baraat & Ceremony", "Cocktail Evening", "Custom"];

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

const EMPTY_FN = { name: "", customName: "", date: "", venue: "", pax: "" };

export default function WeddingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab]         = useState<Tab>("Overview");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [showAddFn, setShowAddFn] = useState(false);
  const [fnForm, setFnForm]   = useState(EMPTY_FN);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wedding", id],
    queryFn: () => axios.get(`/api/weddings/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const addFnMutation = useMutation({
    mutationFn: () => {
      const name = fnForm.name === "Custom" ? fnForm.customName : fnForm.name;
      return axios.post(`/api/weddings/${id}/functions`, {
        name,
        date:  fnForm.date,
        venue: fnForm.venue,
        pax:   Number(fnForm.pax),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wedding", id] });
      toast("Function added");
      setShowAddFn(false);
      setFnForm(EMPTY_FN);
    },
    onError: () => toast("Failed to add function", "error"),
  });

  const setFn = (k: keyof typeof EMPTY_FN) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFnForm((f) => ({ ...f, [k]: e.target.value }));

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

  const canSubmitFn = fnForm.name && fnForm.date && fnForm.venue && fnForm.pax &&
    (fnForm.name !== "Custom" || fnForm.customName.trim());
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
              {w.venueCity}{w.venueName ? ` · ${w.venueName}` : ""} ·{" "}
              {new Date(w.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
              {" "}→{" "}
              {new Date(w.endDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
            </p>
            {w.cuisine && (
              <div className="flex flex-wrap gap-1 mt-2">
                {w.cuisine.split(",").map((c: string) => (
                  <span key={c} className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary rounded-full font-medium">{c}</span>
                ))}
              </div>
            )}
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

        <div className="mt-5 grid grid-cols-4 gap-4">
          {[
            { label: "Total Budget", value: `₹${(Number(w.totalBudget)/100000).toFixed(1)}L`, color: "text-gray-900" },
            { label: "Committed",    value: `₹${(totalCommitted/100000).toFixed(1)}L`,         color: "text-primary" },
            { label: "Paid Out",     value: `₹${(totalPaid/100000).toFixed(1)}L`,              color: "text-green-600" },
            { label: "Unallocated",  value: `₹${(remaining/100000).toFixed(1)}L`,              color: remaining < 0 ? "text-red-600" : "text-gray-600" },
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
            key={t} onClick={() => setTab(t)}
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
          {w.functions.length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-400 text-sm">No functions yet.</p>
              <button onClick={() => setTab("Functions")} className="mt-2 text-xs text-primary hover:underline">
                Add the first function →
              </button>
            </div>
          ) : (
            w.functions.map((f: any) => (
              <div key={f.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="font-semibold text-gray-900">{f.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(f.date).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
                </p>
                <p className="text-xs text-gray-500 mt-2">{f.venue}</p>
                <p className="text-2xl font-bold text-primary mt-3">
                  {f.pax}<span className="text-sm font-normal text-gray-400"> pax</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">{f.timeline?.length ?? 0} timeline events</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Functions */}
      {tab === "Functions" && (
        <div className="space-y-4">
          {/* Existing functions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {w.functions.map((f: any) => (
              <div key={f.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="font-semibold text-gray-900">{f.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(f.date).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
                </p>
                <p className="text-xs text-gray-500 mt-1">{f.venue}</p>
                <p className="text-2xl font-bold text-primary mt-3">
                  {f.pax}<span className="text-sm font-normal text-gray-400"> pax</span>
                </p>
              </div>
            ))}
          </div>

          {/* Add function form */}
          {!showAddFn ? (
            <button
              onClick={() => setShowAddFn(true)}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-primary hover:text-primary transition-colors"
            >
              + Add Function
            </button>
          ) : (
            <div className="bg-white rounded-xl border border-primary/20 p-5 space-y-4">
              <p className="font-semibold text-gray-800 text-sm">New Function</p>

              {/* Function name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Function Name *</label>
                  <select
                    value={fnForm.name} onChange={setFn("name")}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="">Select...</option>
                    {FUNCTION_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                {fnForm.name === "Custom" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Custom Name *</label>
                    <input
                      value={fnForm.customName} onChange={setFn("customName")}
                      placeholder="e.g. Tilak Ceremony"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* Date + Pax */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
                  <input
                    type="date" value={fnForm.date} onChange={setFn("date")}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Guest Count (Pax) *</label>
                  <input
                    type="number" value={fnForm.pax} onChange={setFn("pax")}
                    placeholder="300"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Venue *</label>
                <input
                  value={fnForm.venue} onChange={setFn("venue")}
                  placeholder="e.g. Garden Lawn, Rambagh Palace"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button" onClick={() => { setShowAddFn(false); setFnForm(EMPTY_FN); }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => canSubmitFn && addFnMutation.mutate()}
                  disabled={!canSubmitFn || addFnMutation.isPending}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {addFnMutation.isPending ? "Adding..." : "Add Function"}
                </button>
              </div>
            </div>
          )}
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
            {w.tasks.length === 0 ? (
              <p className="text-sm text-gray-400 p-5">No tasks yet.</p>
            ) : (
              w.tasks.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm text-gray-800">{t.title}</p>
                    <p className="text-xs text-gray-400">Due {new Date(t.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TASK_STATUS_STYLE[t.status]}`}>
                    {t.status.replace("_"," ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Vendors */}
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
                    &#8377;{(Number(wv.contractValue)/100000).toFixed(2)}L
                  </p>
                </div>
                <div className="space-y-3">
                  {wv.payments.map((p: any) => (
                    <div key={p.id} className="border-t border-gray-50 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-700 font-medium">
                            &#8377;{Number(p.amount).toLocaleString("en-IN")}
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