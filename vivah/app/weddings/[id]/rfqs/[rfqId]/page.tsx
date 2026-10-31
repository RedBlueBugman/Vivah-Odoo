"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RFQComparePage() {
  const { id, rfqId } = useParams<{ id: string; rfqId: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["rfq-compare", rfqId],
    queryFn: () => axios.get(`/api/rfqs/${rfqId}/compare`).then((r) => r.data),
    enabled: !!rfqId,
  });

  if (isLoading) return <p className="text-gray-400 text-sm">Loading comparison...</p>;
  if (isError || !data) return <p className="text-red-500 text-sm">Failed to load comparison.</p>;

  const { category, status, rows, pending } = data;
  const winner = rows.find((r: any) => r.isWinner);
  const lowestPax = rows.length > 0 ? (rows[0].effectiveCostPax ?? rows[0].totalAmount) : 0;

  return (
    <div className="max-w-5xl">
      {/* Back */}
      <Link href={`/weddings/${id}`} className="text-xs text-primary hover:underline mb-4 inline-block">
        ← Back to Wedding
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{category} — Quote Comparison</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {rows.length} quotes received · sorted by effective cost per pax (server-computed)
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          status === "CLOSED" ? "bg-green-100 text-green-700" :
          status === "OPEN"   ? "bg-blue-100 text-blue-700"  :
          "bg-gray-100 text-gray-500"
        }`}>{status}</span>
      </div>

      {/* Winner callout */}
      {winner && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">✓</span>
          <div>
            <p className="font-semibold text-green-800">{winner.vendorName} selected</p>
            <p className="text-sm text-green-600">
              Contract value: ₹{Number(winner.totalAmount).toLocaleString("en-IN")}
              {winner.effectiveCostPax && ` · ₹${Number(winner.effectiveCostPax).toLocaleString("en-IN")}/pax`}
            </p>
          </div>
        </div>
      )}

      {/* Comparison table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Quote</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost / Pax</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">vs. Lowest</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row: any) => {
              const rowVal = row.effectiveCostPax ?? row.totalAmount;
              const premium = lowestPax > 0 ? ((rowVal - lowestPax) / lowestPax * 100).toFixed(1) : "0.0";
              return (
                <tr key={row.quoteId} className={row.isWinner ? "bg-green-50" : "hover:bg-gray-50"}>
                  <td className="px-5 py-4">
                    <p className={`font-semibold ${row.isWinner ? "text-green-800" : "text-gray-900"}`}>
                      {row.vendorName}
                    </p>
                    {row.notes && <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{row.notes}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-secondary">
                      {row.rating !== null ? "★".repeat(row.rating) : <span className="text-gray-300">—</span>}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-gray-900">
                    ₹{Number(row.totalAmount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4 text-right text-gray-700">
                    {row.effectiveCostPax
                      ? `₹${Number(row.effectiveCostPax).toLocaleString("en-IN")}`
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-right">
                    {Number(premium) === 0
                      ? <span className="text-green-600 font-semibold text-xs">Lowest</span>
                      : <span className="text-gray-500 text-xs">+{premium}%</span>
                    }
                  </td>
                  <td className="px-5 py-4">
                    {row.isWinner
                      ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Selected</span>
                      : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Not Selected</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pending vendors */}
      {pending.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">Awaiting Response</p>
          <div className="flex flex-wrap gap-2">
            {pending.map((p: any) => (
              <span key={p.vendorId} className="text-xs px-2 py-1 bg-white border border-yellow-200 rounded-full text-yellow-700">
                {p.vendorName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}