"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

export default function DashboardPage() {
  const { data: wData } = useQuery({ queryKey: ["weddings"], queryFn: () => axios.get("/api/weddings").then(r=>r.data) });
  const { data: eData } = useQuery({ queryKey: ["enquiries"], queryFn: () => axios.get("/api/enquiries").then(r=>r.data) });
  const { data: vData } = useQuery({ queryKey: ["vendors",""], queryFn: () => axios.get("/api/vendors").then(r=>r.data) });

  const weddings  = wData?.weddings  ?? [];
  const enquiries = eData?.enquiries ?? [];
  const vendors   = vData?.vendors   ?? [];

  const openLeads   = enquiries.filter((e:any) => e.status === "LEAD").length;
  const totalBudget = weddings.reduce((s:number,w:any) => s + Number(w.totalBudget), 0);

  // payments are NOT in the list endpoint — guard with ?? []
  const totalPaid = weddings.reduce((s:number,w:any) =>
    s + (w.hiredVendors ?? []).reduce((hs:number,wv:any) =>
      hs + (wv.payments ?? []).filter((p:any)=>p.status==="PAID").reduce((ps:number,p:any) => ps+Number(p.amount), 0), 0), 0);

  const totalContracts = weddings.reduce((s:number,w:any) => s + (w.hiredVendors ?? []).length, 0);

  const STATS = [
    { label: "Active Weddings",  value: weddings.length,                           href: "/weddings",  color: "text-primary" },
    { label: "Open Leads",       value: openLeads,                                  href: "/enquiries", color: "text-secondary" },
    { label: "Vendor Directory", value: vendors.length,                             href: "/vendors",   color: "text-gray-700" },
    { label: "Season Budget",    value: `₹${(totalBudget/10000000).toFixed(1)}Cr`,  href: "/weddings",  color: "text-green-700" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Good morning, Ashish</h2>
        <p className="text-sm text-gray-500 mt-0.5">The Royal Knot · Jaipur/Udaipur operations</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-primary transition-all"
          >
            <p className="text-xs text-gray-400 mb-2">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </Link>
        ))}
      </div>

      {/* Upcoming weddings */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Active Weddings</h3>
        <div className="space-y-3">
          {weddings.slice(0, 5).map((w: any) => (
            <Link
              key={w.id}
              href={`/weddings/${w.id}`}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:text-primary transition-colors group"
            >
              <div>
                <p className="font-medium text-gray-900 group-hover:text-primary">{w.coupleName}</p>
                <p className="text-xs text-gray-400">
                  {w.venueCity} · {new Date(w.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">₹{(Number(w.totalBudget)/100000).toFixed(1)}L</p>
                <p className="text-xs text-gray-400">{w._count?.tasks ?? 0} tasks</p>
              </div>
            </Link>
          ))}
          {weddings.length === 0 && <p className="text-sm text-gray-400">No weddings yet.</p>}
        </div>
      </div>

      {/* Paid out summary — shows 0 from list endpoint, accurate on detail page */}
      <div className="bg-primary rounded-xl p-6 text-white">
        <p className="text-sm text-red-200 mb-1">Season Vendor Contracts</p>
        <p className="text-4xl font-bold">{totalContracts}</p>
        <p className="text-sm text-red-200 mt-1">
          across {weddings.length} wedding{weddings.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}