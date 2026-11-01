"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface Wedding {
  id: string;
  coupleName: string;
  eventDate: string;
  status: string;
  budget: number;
  venue?: string;
  _count?: { tasks: number; weddingVendors: number };
}

const S = {
  page: { padding: "0" } as React.CSSProperties,
  pageTitle: {
    fontFamily: "Playfair Display, serif",
    fontSize: "2rem",
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: "4px",
  } as React.CSSProperties,
  pageSubtitle: {
    color: "var(--text)",
    opacity: 0.5,
    fontSize: "0.875rem",
    marginBottom: "36px",
  } as React.CSSProperties,
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  } as React.CSSProperties,
  kpiCard: {
    background: "var(--surface)",
    border: "1px solid #e8d5b7",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 12px #b8832a0d",
  } as React.CSSProperties,
  kpiValue: {
    fontFamily: "Playfair Display, serif",
    fontSize: "2.25rem",
    fontWeight: 700,
    color: "var(--text)",
    lineHeight: 1,
    marginBottom: "6px",
  } as React.CSSProperties,
  kpiLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "1.5px",
    textTransform: "uppercase" as const,
    color: "var(--gold)",
  },
  kpiSub: {
    fontSize: "0.75rem",
    color: "var(--text)",
    opacity: 0.45,
    marginTop: "4px",
  } as React.CSSProperties,
  sectionHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: "20px",
  } as React.CSSProperties,
  sectionTitle: {
    fontFamily: "Playfair Display, serif",
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "var(--text)",
  } as React.CSSProperties,
  weddingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  } as React.CSSProperties,
  weddingCard: {
    background: "var(--surface)",
    border: "1px solid #e8d5b7",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 12px #b8832a0d",
    textDecoration: "none",
    display: "block",
    transition: "box-shadow 0.2s, transform 0.2s",
    cursor: "pointer",
  } as React.CSSProperties,
  couple: {
    fontFamily: "Playfair Display, serif",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: "6px",
  } as React.CSSProperties,
  venue: {
    fontSize: "0.8rem",
    color: "var(--text)",
    opacity: 0.5,
    marginBottom: "16px",
  } as React.CSSProperties,
  metaRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap" as const,
    marginBottom: "16px",
  },
  pill: (color: string) => ({
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.8px",
    textTransform: "uppercase" as const,
    padding: "3px 10px",
    borderRadius: "20px",
    background: color + "18",
    color: color,
  }),
  budget: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "var(--gold)",
    fontFamily: "Playfair Display, serif",
  } as React.CSSProperties,
  divider: {
    borderTop: "1px solid #f0e6d3",
    margin: "16px 0",
  } as React.CSSProperties,
  statBar: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "var(--text)",
    opacity: 0.6,
  } as React.CSSProperties,
};

function statusColor(s: string) {
  if (s === "ACTIVE") return "var(--ok)";
  if (s === "COMPLETED") return "var(--gold)";
  if (s === "CANCELLED") return "var(--bad)";
  return "var(--text)";
}

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function DashboardPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/weddings").then(r => {
      const raw = Array.isArray(r.data) ? r.data : Array.isArray(r.data.weddings) ? r.data.weddings : [];
      setWeddings(raw.map((w: any) => ({
        ...w,
        budget: w.totalBudget ?? w.budget ?? 0,
        venue: w.venueCity ?? w.venue ?? "",
        status: w.status ?? "ACTIVE",
      })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const active = weddings.filter(w => w.status === "ACTIVE").length;
  const totalBudget = weddings.reduce((s, w) => s + (w.budget ?? 0), 0);
  const now = new Date();
  const thisMonth = weddings.filter(w => {
    const d = new Date(w.eventDate);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  return (
    <div style={S.page}>
      <h1 style={S.pageTitle}>Operations Dashboard</h1>
      <p style={S.pageSubtitle}>The Royal Knot · Jaipur &amp; Udaipur</p>

      {/* KPI Cards */}
      <div style={S.kpiGrid}>
        {[
          { label: "Active Weddings", value: loading ? "—" : active, sub: `${weddings.length} total this season` },
          { label: "This Month", value: loading ? "—" : thisMonth, sub: "Events in " + now.toLocaleString("en-IN", { month: "long" }) },
          { label: "Season Budget", value: loading ? "—" : fmt(totalBudget), sub: "Across all weddings" },
          { label: "Avg. Budget", value: loading || !weddings.length ? "—" : fmt(totalBudget / weddings.length), sub: "Per wedding" },
        ].map(k => (
          <div key={k.label} style={S.kpiCard}>
            <div style={S.kpiLabel}>{k.label}</div>
            <div style={S.kpiValue}>{k.value}</div>
            <div style={S.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Wedding Cards */}
      <div style={S.sectionHeader}>
        <h2 style={S.sectionTitle}>All Weddings</h2>
        <Link href="/weddings/new" style={{
          fontSize: "0.8rem", fontWeight: 700, color: "var(--rose)",
          textDecoration: "none", letterSpacing: "0.5px",
        }}>
          + New Wedding
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--gold)", fontFamily: "Playfair Display, serif" }}>
          Loading weddings…
        </div>
      ) : weddings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", opacity: 0.4 }}>No weddings found.</div>
      ) : (
        <div style={S.weddingGrid}>
          {weddings.map(w => (
            <Link
              key={w.id}
              href={`/weddings/${w.id}`}
              style={S.weddingCard}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px #b8832a22";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px #b8832a0d";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div style={S.couple}>{w.coupleName}</div>
              <div style={S.venue}>{w.venue ?? "Venue TBD"}</div>
              <div style={S.metaRow}>
                <span style={S.pill(statusColor(w.status))}>{w.status}</span>
                <span style={S.pill("var(--gold)")}>
                  {new Date(w.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div style={S.budget}>{fmt(w.budget ?? 0)}</div>
              <div style={S.divider} />
              <div style={S.statBar}>
                <span>{w._count?.tasks ?? 0} tasks</span>
                <span>{w._count?.weddingVendors ?? 0} vendors</span>
                <span style={{ color: "var(--rose)", fontWeight: 600 }}>View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}