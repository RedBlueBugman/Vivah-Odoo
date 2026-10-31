"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { WeddingForm } from "@/components/WeddingForm";
import { SkeletonCard } from "@/components/Skeleton";

const STATUS_STYLE: Record<string, string> = {
  PLANNING:  "bg-blue-100 text-blue-700",
  ONGOING:   "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

export default function WeddingsPage() {
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["weddings"],
    queryFn: () => axios.get("/api/weddings").then((r) => r.data),
  });

  const weddings = data?.weddings ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weddings</h2>
          <p className="text-sm text-gray-500 mt-0.5">{weddings.length} active this season</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          + New Wedding
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}
      {isError && <p className="text-red-500 text-sm">Failed to load weddings.</p>}

      <div className="space-y-3">
        {weddings.map((w: any) => (
          <Link
            key={w.id}
            href={`/weddings/${w.id}`}
            className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-primary transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-lg">
                  {w.coupleName}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {w.venueCity} · {new Date(w.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  {" "}→{" "}
                  {new Date(w.endDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[w.status]}`}>
                {w.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
              {[
                { label: "Budget",        value: `₹${(Number(w.totalBudget)/100000).toFixed(1)}L` },
                { label: "Functions",     value: w.functions.length },
                { label: "Tasks",         value: w._count?.tasks ?? 0 },
                { label: "Vendors Hired", value: w.hiredVendors.length },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>

            {w.functions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {w.functions.map((f: any) => (
                  <span key={f.id} className="text-xs px-2 py-0.5 bg-muted rounded-full text-gray-600">
                    {f.name} · {f.pax} pax
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create New Wedding">
        <WeddingForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}