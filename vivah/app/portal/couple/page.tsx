"use client";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const PAYMENT_STYLE: Record<string, string> = {
  PAID:    "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-600",
};

export default function CouplePortal() {
  const { data: session } = useSession();
  const weddingId = (session?.user as any)?.weddingId;

  const { data, isLoading } = useQuery({
    queryKey: ["wedding", weddingId],
    queryFn: () => axios.get(`/api/weddings/${weddingId}`).then(r => r.data),
    enabled: !!weddingId,
  });

  const w = data?.wedding;

  const completedTasks = w?.tasks.filter((t: any) => t.status === "COMPLETED").length ?? 0;
  const totalTasks     = w?.tasks.length ?? 0;
  const taskPct        = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalPaid = w?.hiredVendors?.reduce((s: number, wv: any) =>
    s + wv.payments.filter((p: any) => p.status === "PAID")
      .reduce((ps: number, p: any) => ps + Number(p.amount), 0), 0) ?? 0;

  const totalCommitted = w?.hiredVendors?.reduce((s: number, wv: any) =>
    s + Number(wv.contractValue), 0) ?? 0;

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm animate-pulse">Loading your wedding...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs tracking-widest text-secondary font-semibold uppercase">The Royal Knot</p>
          <p className="text-xs text-gray-400 mt-0.5">Your personal wedding portal</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-gray-400 hover:text-primary transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Hero */}
      <div className="bg-primary rounded-2xl p-8 text-white mb-6">
        <p className="text-sm text-red-200 mb-1">Welcome back</p>
        <h1 className="text-3xl font-bold">{w?.coupleName ?? "Your Wedding"}</h1>
        <p className="text-red-200 mt-1 text-sm">
          {w?.venueCity} · {w ? new Date(w.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : ""}
          {" "}→{" "}
          {w ? new Date(w.endDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : ""}
        </p>

        {/* Task progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-red-200 mb-2">
            <span>Planning Progress</span>
            <span>{completedTasks} of {totalTasks} tasks complete</span>
          </div>
          <div className="w-full bg-primary-dark rounded-full h-2">
            <div
              className="bg-secondary rounded-full h-2 transition-all duration-500"
              style={{ width: `${taskPct}%` }}
            />
          </div>
          <p className="text-xs text-red-200 mt-1">{taskPct}% complete</p>
        </div>
      </div>

      {/* Functions */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Functions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(w?.functions ?? []).map((f: any) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="font-semibold text-gray-900">{f.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(f.date).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
              </p>
              <p className="text-xs text-gray-500 mt-1">{f.venue}</p>
              <p className="text-2xl font-bold text-primary mt-3">
                {f.pax}<span className="text-xs font-normal text-gray-400"> guests</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmed vendors */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Confirmed Vendors</h2>
        {(w?.hiredVendors ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">Vendors being finalised — check back soon.</p>
        ) : (
          <div className="space-y-3">
            {(w?.hiredVendors ?? []).map((wv: any) => (
              <div key={wv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{wv.vendor.name}</p>
                  <p className="text-xs text-gray-400">{wv.vendor.category?.name}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  ✓ Confirmed
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment timeline */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Payment Timeline</h2>
          <div className="text-right">
            <p className="text-xs text-gray-400">Total committed</p>
            <p className="font-bold text-primary">₹{(totalCommitted/100000).toFixed(1)}L</p>
          </div>
        </div>
        {(w?.hiredVendors ?? []).flatMap((wv: any) =>
          wv.payments.map((p: any) => ({ ...p, vendorName: wv.vendor.name }))
        ).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .map((p: any) => (
          <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm text-gray-700 font-medium">₹{Number(p.amount).toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-400">
                {p.vendorName} · Due {new Date(p.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
              </p>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PAYMENT_STYLE[p.status]}`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>

      {/* Budget summary */}
      <div className="bg-muted rounded-xl p-5 text-center">
        <p className="text-xs text-gray-400 mb-1">Total Wedding Budget</p>
        <p className="text-3xl font-bold text-gray-900">₹{w ? (Number(w.totalBudget)/100000).toFixed(1) : 0}L</p>
        <p className="text-xs text-gray-400 mt-1">₹{(totalPaid/100000).toFixed(1)}L paid · ₹{((totalCommitted - totalPaid)/100000).toFixed(1)}L remaining</p>
      </div>

    </div>
  );
}