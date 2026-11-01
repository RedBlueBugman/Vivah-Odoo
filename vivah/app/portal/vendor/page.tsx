"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface RFQ {
  id: string;
  wedding: { coupleName: string; eventDate: string; venue?: string; };
  status: string;
  notes?: string;
  createdAt: string;
}
interface Quote {
  id: string;
  rfq: { wedding: { coupleName: string; eventDate: string; }; };
  amount: number;
  perPax?: number;
  notes?: string;
  status: string;
  createdAt: string;
}

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const S = {
  hero: {
    background: "linear-gradient(135deg, #2c1a0e 0%, #5a2d1a 55%, #b8832a 100%)",
    borderRadius: "20px", padding: "40px 48px", marginBottom: "32px",
  } as React.CSSProperties,
  heroLabel: {
    fontSize: "0.68rem", fontWeight: 700, letterSpacing: "2.5px",
    textTransform: "uppercase" as const, color: "var(--gold2)", marginBottom: "10px",
  },
  heroTitle: {
    fontFamily: "Playfair Display, serif", fontSize: "clamp(1.6rem,3vw,2.4rem)",
    fontWeight: 700, color: "#fff", marginBottom: "8px",
  } as React.CSSProperties,
  heroSub: { color: "rgba(255,255,255,0.55)", fontSize: "0.875rem" } as React.CSSProperties,
  readonlyBadge: {
    display: "inline-block", background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.7)",
    fontSize: "0.62rem", fontWeight: 700, letterSpacing: "1.5px",
    textTransform: "uppercase" as const, padding: "4px 12px",
    borderRadius: "20px", marginTop: "16px",
  } as React.CSSProperties,
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start",
  } as React.CSSProperties,
  sectionTitle: {
    fontFamily: "Playfair Display, serif", fontSize: "1.1rem",
    fontWeight: 700, color: "var(--text)", marginBottom: "16px",
  } as React.CSSProperties,
  card: {
    background: "var(--surface)", border: "1px solid #e8d5b7",
    borderRadius: "14px", padding: "20px", marginBottom: "14px",
    boxShadow: "0 2px 8px #b8832a08",
  } as React.CSSProperties,
  cardTop: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "8px",
  } as React.CSSProperties,
  coupleName: {
    fontFamily: "Playfair Display, serif", fontSize: "1rem",
    fontWeight: 700, color: "var(--text)",
  } as React.CSSProperties,
  meta: {
    fontSize: "0.75rem", color: "var(--text)",
    opacity: 0.5, marginBottom: "4px",
  } as React.CSSProperties,
  pill: (c: string) => ({
    fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.6px",
    textTransform: "uppercase" as const, padding: "3px 10px",
    borderRadius: "20px", background: c + "18", color: c,
    border: `1px solid ${c}33`, display: "inline-block",
  }),
  amount: {
    fontFamily: "Playfair Display, serif", fontSize: "1.2rem",
    fontWeight: 700, color: "var(--gold)",
  } as React.CSSProperties,
  divider: { borderTop: "1px solid #f0e6d3", margin: "12px 0" } as React.CSSProperties,
  notes: {
    fontSize: "0.75rem", color: "var(--text)", opacity: 0.5,
    fontStyle: "italic",
  } as React.CSSProperties,
  emptyState: {
    textAlign: "center" as const, padding: "40px",
    opacity: 0.35, fontSize: "0.875rem",
  } as React.CSSProperties,
  welcome: {
    fontFamily: "Playfair Display, serif", fontSize: "1.5rem",
    fontWeight: 700, color: "var(--text)", marginBottom: "4px",
  } as React.CSSProperties,
  welcomeSub: {
    color: "var(--text)", opacity: 0.45,
    fontSize: "0.85rem", marginBottom: "28px",
  } as React.CSSProperties,
  kpiRow: {
    display: "flex", gap: "16px", marginBottom: "28px",
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  kpi: {
    background: "var(--surface)", border: "1px solid #e8d5b7",
    borderRadius: "14px", padding: "18px 24px", flex: "1",
    minWidth: "140px", boxShadow: "0 2px 8px #b8832a08",
  } as React.CSSProperties,
  kpiVal: {
    fontFamily: "Playfair Display, serif", fontSize: "1.8rem",
    fontWeight: 700, color: "var(--text)", lineHeight: 1, marginBottom: "4px",
  } as React.CSSProperties,
  kpiLabel: {
    fontSize: "0.62rem", fontWeight: 700, letterSpacing: "1.2px",
    textTransform: "uppercase" as const, color: "var(--gold)",
  },
};

function statusColor(s: string) {
  const m: Record<string, string> = {
    OPEN: "var(--rose)", QUOTED: "var(--gold)", ACCEPTED: "var(--ok)",
    REJECTED: "var(--bad)", CLOSED: "var(--text)", PENDING: "var(--gold)",
    SELECTED: "var(--ok)",
  };
  return m[s] ?? "var(--text)";
}

export default function VendorPortalPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/portal/vendor/rfqs"),
      axios.get("/api/portal/vendor/quotes"),
    ]).then(([r, q]) => {
      setRfqs(r.data ?? []);
      setQuotes(q.data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px", fontFamily: "Playfair Display, serif", color: "var(--gold)", fontSize: "1.2rem" }}>
      Loading your vendor portal…
    </div>
  );

  const openRfqs = rfqs.filter(r => r.status === "OPEN").length;
  const wonQuotes = quotes.filter(q => q.status === "SELECTED").length;
  const totalQuoteValue = quotes.reduce((s, q) => s + (q.amount ?? 0), 0);

  return (
    <div>
      <div style={S.welcome}>Vendor Portal</div>
      <div style={S.welcomeSub}>Read-only view of your RFQs and submitted quotes — The Royal Knot.</div>

      {/* Hero */}
      <div style={S.hero}>
        <div style={S.heroLabel}>Vendor Dashboard</div>
        <div style={S.heroTitle}>Your Active Pipeline</div>
        <div style={S.heroSub}>
          {rfqs.length} RFQ{rfqs.length !== 1 ? "s" : ""} received · {quotes.length} quote{quotes.length !== 1 ? "s" : ""} submitted
        </div>
        <div style={S.readonlyBadge}>🔒 Read-Only View</div>
      </div>

      {/* KPIs */}
      <div style={S.kpiRow}>
        {[
          { label: "Open RFQs", val: openRfqs, color: "var(--rose)" },
          { label: "Quotes Sent", val: quotes.length, color: "var(--gold)" },
          { label: "Contracts Won", val: wonQuotes, color: "var(--ok)" },
          { label: "Quote Value", val: totalQuoteValue ? fmt(totalQuoteValue) : "—", color: "var(--text)" },
        ].map(k => (
          <div key={k.label} style={S.kpi}>
            <div style={{ ...S.kpiLabel, color: k.color }}>{k.label}</div>
            <div style={{ ...S.kpiVal, color: k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      <div style={S.grid}>
        {/* RFQs */}
        <div>
          <div style={S.sectionTitle}>Requests for Quote ({rfqs.length})</div>
          {rfqs.length === 0 && <div style={S.emptyState}>No RFQs received yet.</div>}
          {rfqs.map(r => (
            <div key={r.id} style={S.card}>
              <div style={S.cardTop}>
                <div style={S.coupleName}>{r.wedding.coupleName}</div>
                <span style={S.pill(statusColor(r.status))}>{r.status}</span>
              </div>
              <div style={S.meta}>
                📅 {new Date(r.wedding.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
              {r.wedding.venue && <div style={S.meta}>📍 {r.wedding.venue}</div>}
              {r.notes && (
                <>
                  <div style={S.divider} />
                  <div style={S.notes}>{r.notes}</div>
                </>
              )}
              <div style={{ fontSize: "0.65rem", color: "var(--text)", opacity: 0.35, marginTop: "10px" }}>
                Received {new Date(r.createdAt).toLocaleDateString("en-IN")}
              </div>
            </div>
          ))}
        </div>

        {/* Quotes */}
        <div>
          <div style={S.sectionTitle}>Your Quotes ({quotes.length})</div>
          {quotes.length === 0 && <div style={S.emptyState}>No quotes submitted yet.</div>}
          {quotes.map(q => (
            <div key={q.id} style={S.card}>
              <div style={S.cardTop}>
                <div style={S.coupleName}>{q.rfq.wedding.coupleName}</div>
                <span style={S.pill(statusColor(q.status))}>{q.status}</span>
              </div>
              <div style={S.meta}>
                📅 {new Date(q.rfq.wedding.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div style={S.divider} />
              <div style={S.amount}>{fmt(q.amount)}</div>
              {q.perPax && (
                <div style={{ fontSize: "0.72rem", color: "var(--gold)", opacity: 0.8, marginTop: "2px" }}>
                  {fmt(q.perPax)} / pax
                </div>
              )}
              {q.notes && <div style={{ ...S.notes, marginTop: "8px" }}>{q.notes}</div>}
              <div style={{ fontSize: "0.65rem", color: "var(--text)", opacity: 0.35, marginTop: "10px" }}>
                Submitted {new Date(q.createdAt).toLocaleDateString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}