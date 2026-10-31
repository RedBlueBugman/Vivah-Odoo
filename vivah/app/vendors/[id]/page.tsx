"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => axios.get(`/api/vendors/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const v = data?.vendor;

  if (isLoading) return <p className="text-gray-400 text-sm">Loading vendor...</p>;
  if (isError || !v) return <p className="text-red-500 text-sm">Vendor not found.</p>;

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <Link href="/vendors" className="text-xs text-primary hover:underline mb-4 inline-block">
        ← Back to Vendors
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-primary mb-3">
          {v.category.name}
        </span>
        <h2 className="text-2xl font-bold text-gray-900">{v.name}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{v.contactPerson}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
          <div><span className="text-gray-400 text-xs block">Phone</span>{v.phone}</div>
          <div><span className="text-gray-400 text-xs block">Email</span>{v.email}</div>
          <div>
            <span className="text-gray-400 text-xs block">Rating</span>
            {v.rating !== null
              ? <span className="text-secondary font-semibold">{"★".repeat(v.rating)}{"☆".repeat(5 - v.rating)} ({v.rating}/5)</span>
              : <span className="text-gray-400">Unrated</span>
            }
          </div>
          <div>
            <span className="text-gray-400 text-xs block">Payment Preference</span>
            {v.paymentPreference ?? "—"}
          </div>
        </div>
      </div>

      {/* Quote history */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quote History</h3>
        {v.quotes.length === 0 ? (
          <p className="text-sm text-gray-400">No quotes submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {v.quotes.map((q: any) => (
              <div key={q.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{q.rfq.category}</p>
                  <p className="text-xs text-gray-400">{new Date(q.submittedAt).toLocaleDateString("en-IN")}</p>
                  {q.notes && <p className="text-xs text-gray-500 mt-0.5">{q.notes}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{Number(q.totalAmount).toLocaleString("en-IN")}
                  </p>
                  {q.effectiveCostPax && (
                    <p className="text-xs text-gray-400">₹{Number(q.effectiveCostPax).toLocaleString("en-IN")}/pax</p>
                  )}
                  {q.isWinner && (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      ✓ Winner
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RFQ invites */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">RFQ Invitations</h3>
        {v.rfqInvites.length === 0 ? (
          <p className="text-sm text-gray-400">No RFQ invitations yet.</p>
        ) : (
          <div className="space-y-2">
            {v.rfqInvites.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-700">{inv.rfq.category}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  inv.status === "SELECTED"     ? "bg-green-100 text-green-700" :
                  inv.status === "NOT_SELECTED" ? "bg-gray-100 text-gray-500"  :
                  inv.status === "QUOTE_RECEIVED"? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>{inv.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}