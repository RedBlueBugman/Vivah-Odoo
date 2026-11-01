"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

interface WeddingFunction { id: string; name: string; date: string; headcount: number; venue?: string; }
interface Payment { id: string; amount: number; paidAt: string; method: string; reference?: string; }
interface WeddingVendor { id: string; vendor: { name: string; category: string; }; status: string; contractValue?: number; }
interface Wedding {
  id: string; coupleName: string; eventDate: string; status: string;
  budget: number; venue?: string; cuisine?: string; notes?: string;
  weddingFunctions: WeddingFunction[]; payments: Payment[]; weddingVendors: WeddingVendor[];
}

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const S = {
  hero: {
    background: "linear-gradient(135deg, #2c1a0e 0%, #5a2d1a 55%, #b8832a 100%)",
    borderRadius: "20px", padding: "48px", marginBottom: "32px", position: "relative" as const, overflow: "hidden",
  } as React.CSSProperties,
  heroLabel: { fontSize: "0.68rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "var(--gold2)", marginBottom: "10px" },
  heroCouple: { fontFamily: "Playfair Display, serif", fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 700, color: "#fff", marginBottom: "10px" } as React.CSSProperties,
  heroSub: { color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" } as React.CSSProperties,
  statRow: { display: "flex", gap: "36px", marginTop: "28px", flexWrap: "wrap" as const },
  stat: { } as React.CSSProperties,
  statVal: { fontFamily: "Playfair Display, serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--gold2)", lineHeight: 1 } as React.CSSProperties,
  statLabel: { fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", letterSpacing: "1px", textTransform: "uppercase" as const, marginTop: "4px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "28px" } as React.CSSProperties,
  card: { background: "var(--surface)", border: "1px solid #e8d5b7", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px #b8832a0d" } as React.CSSProperties,
  cardTitle: { fontFamily: "Playfair Display, serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "16px" } as React.CSSProperties,
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0e6d3" } as React.CSSProperties,
  rowLabel: { fontSize: "0.75rem", color: "var(--text)", opacity: 0.5 } as React.CSSProperties,
  rowVal: { fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" } as React.CSSProperties,
  pill: (c: string) => ({ fontSize: "0.62rem", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: c + "18", color: c, letterSpacing: "0.6px", textTransform: "uppercase" as const }),
  welcome: { fontFamily: "Playfair Display, serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: "4px" } as React.CSSProperties,
  welcomeSub: { color: "var(--text)", opacity: 0.45, fontSize: "0.85rem", marginBottom: "28px" } as React.CSSProperties,
};

export default function CouplePortalPage() {
  const { data: session } = useSession();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/portal/couple/wedding").then(r => { setWedding(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px", fontFamily: "Playfair Display, serif", color: "var(--gold)", fontSize: "1.2rem" }}>
      Loading your wedding details…
    </div>
  );
  if (!wedding) return (
    <div style={{ textAlign: "center", padding: "80px", opacity: 0.4 }}>No wedding found for your account. Please contact The Royal Knot team.</div>
  );

  const totalPaid = (wedding.payments ?? []).reduce((s, p) => s + p.amount, 0);
  const pax = (wedding.weddingFunctions ?? []).reduce((s, f) => s + f.headcount, 0);
  const daysLeft = Math.ceil((new Date(wedding.eventDate).getTime() - Date.now()) / 86400000);

  return (
    <div>
      <div style={S.welcome}>Welcome, {wedding.coupleName.split("&")[0].trim()} 💍</div>
      <div style={S.welcomeSub}>Your Royal Knot wedding portal — read-only view of your big day.</div>

      {/* Hero */}
      <div style={S.hero}>
        <div style={S.heroLabel}>Your Wedding File</div>
        <div style={S.heroCouple}>{wedding.coupleName}</div>
        <div style={S.heroSub}>
          {wedding.venue ?? "Venue TBD"}
          {wedding.cuisine ? ` · ${wedding.cuisine}` : ""}
        </div>
        <div style={S.statRow}>
          {[
            [new Date(wedding.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), "Event Date"],
            [daysLeft > 0 ? `${daysLeft}` : "Today!", daysLeft > 0 ? "Days to Go" : ""],
            [fmt(wedding.budget), "Total Budget"],
            [fmt(totalPaid), "Amount Paid"],
            [pax > 0 ? `${pax}` : "TBD", "Total Guests"],
          ].map(([v, l]) => (
            <div key={l} style={S.stat}>
              <div style={S.statVal}>{v}</div>
              {l && <div style={S.statLabel}>{l}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Info Grid */}
      <div style={S.grid}>
        {/* Functions */}
        <div style={S.card}>
          <div style={S.cardTitle}>Your Functions</div>
          {(wedding.weddingFunctions ?? []).length === 0 && <div style={{ opacity: 0.35, fontSize: "0.82rem" }}>No functions added yet.</div>}
          {(wedding.weddingFunctions ?? []).map(fn => (
            <div key={fn.id} style={S.row}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text)" }}>{fn.name}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text)", opacity: 0.45 }}>
                  {new Date(fn.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  {fn.venue ? ` · ${fn.venue}` : ""}
                </div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, color: "var(--gold)" }}>{fn.headcount}</div>
                <div style={{ fontSize: "0.62rem", opacity: 0.4 }}>guests</div>
              </div>
            </div>
          ))}
        </div>

        {/* Vendors */}
        <div style={S.card}>
          <div style={S.cardTitle}>Your Vendors</div>
          {(wedding.weddingVendors ?? []).length === 0 && <div style={{ opacity: 0.35, fontSize: "0.82rem" }}>No vendors assigned yet.</div>}
          {(wedding.weddingVendors ?? []).map(wv => (
            <div key={wv.id} style={S.row}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text)" }}>{wv.vendor.name}</div>
                <div style={{ fontSize: "0.72rem", opacity: 0.45 }}>{wv.vendor.category}</div>
              </div>
              <span style={S.pill(wv.status === "CONFIRMED" ? "var(--ok)" : "var(--gold)")}>{wv.status}</span>
            </div>
          ))}
        </div>

        {/* Payments */}
        <div style={S.card}>
          <div style={S.cardTitle}>Payment Summary</div>
          <div style={S.row}>
            <span style={S.rowLabel}>Total Budget</span>
            <span style={{ ...S.rowVal, fontFamily: "Playfair Display, serif", color: "var(--text)" }}>{fmt(wedding.budget)}</span>
          </div>
          <div style={S.row}>
            <span style={S.rowLabel}>Amount Paid</span>
            <span style={{ ...S.rowVal, color: "var(--ok)", fontFamily: "Playfair Display, serif" }}>{fmt(totalPaid)}</span>
          </div>
          <div style={{ ...S.row, borderBottom: "none" }}>
            <span style={S.rowLabel}>Balance Due</span>
            <span style={{ ...S.rowVal, color: totalPaid >= wedding.budget ? "var(--ok)" : "var(--bad)", fontFamily: "Playfair Display, serif" }}>
              {fmt(Math.max(0, wedding.budget - totalPaid))}
            </span>
          </div>
          <div style={{ marginTop: "12px" }}>
            {(wedding.payments ?? []).map((p, i) => (
              <div key={p.id} style={{ fontSize: "0.75rem", color: "var(--text)", opacity: 0.6, padding: "6px 0", borderBottom: "1px solid #f5ede0", display: "flex", justifyContent: "space-between" }}>
                <span>{["Advance", "2nd Payment", "Final", "Security"][i] ?? `Payment ${i + 1}`}</span>
                <span style={{ fontWeight: 700, color: "var(--ok)" }}>{fmt(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {wedding.notes && (
        <div style={{ ...S.card, fontStyle: "italic", opacity: 0.65, fontSize: "0.875rem", color: "var(--text)" }}>
          📝 Notes from your planner: {wedding.notes}
        </div>
      )}
    </div>
  );
}