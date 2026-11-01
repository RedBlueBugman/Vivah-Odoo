"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import DesignStudio from "@/components/design/DesignStudio";

interface Task { id: string; title: string; dueDate?: string; status: string; assignedTo?: string; }
interface Vendor { id: string; name: string; category: string; phone?: string; email?: string; }
interface WeddingVendor { id: string; vendor: Vendor; status: string; contractValue?: number; notes?: string; }
interface Payment { id: string; amount: number; paidAt: string; method: string; reference?: string; note?: string; }
interface WeddingFunction { id: string; name: string; date: string; headcount: number; venue?: string; }
interface Wedding {
  id: string; coupleName: string; eventDate: string; status: string;
  budget: number; venue?: string; cuisine?: string; notes?: string;
  tasks: Task[]; weddingVendors: WeddingVendor[]; payments: Payment[];
  weddingFunctions: WeddingFunction[];
}

const TABS = ["Overview", "Tasks", "Vendors", "Payments", "Functions", "Design"];

const S = {
  hero: {
    background: "linear-gradient(135deg, #2c1a0e 0%, #5a2d1a 55%, #b8832a 100%)",
    borderRadius: "20px",
    padding: "40px 48px",
    marginBottom: "32px",
    position: "relative" as const,
    overflow: "hidden",
  } as React.CSSProperties,
  heroLabel: {
    fontSize: "0.68rem", fontWeight: 700, letterSpacing: "2.5px",
    textTransform: "uppercase" as const, color: "var(--gold2)",
    marginBottom: "12px",
  } as React.CSSProperties,
  heroCouple: {
    fontFamily: "Playfair Display, serif",
    fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
    fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: "12px",
  } as React.CSSProperties,
  heroMeta: { display: "flex", gap: "24px", flexWrap: "wrap" as const, alignItems: "center", marginTop: "20px" },
  heroPill: (color: string) => ({
    fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.8px",
    textTransform: "uppercase" as const, padding: "5px 14px",
    borderRadius: "20px", background: color + "25", color: color,
    border: `1px solid ${color}55`,
  }),
  heroStat: {
    textAlign: "right" as const,
    position: "absolute" as const, top: "40px", right: "48px",
  } as React.CSSProperties,
  heroStatVal: {
    fontFamily: "Playfair Display, serif", fontSize: "2rem",
    fontWeight: 700, color: "var(--gold2)", lineHeight: 1,
  } as React.CSSProperties,
  heroStatLabel: { fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase" as const },
  tabBar: {
    display: "flex", gap: "0", marginBottom: "28px",
    borderBottom: "2px solid #e8d5b7",
  } as React.CSSProperties,
  tab: (active: boolean) => ({
    padding: "10px 20px", fontSize: "0.78rem", fontWeight: 700,
    letterSpacing: "0.8px", textTransform: "uppercase" as const,
    cursor: "pointer", border: "none", background: "transparent",
    color: active ? "var(--rose)" : "var(--text)",
    opacity: active ? 1 : 0.45,
    borderBottom: active ? "2px solid var(--rose)" : "2px solid transparent",
    marginBottom: "-2px", transition: "all 0.15s",
  } as React.CSSProperties),
  card: {
    background: "var(--surface)", border: "1px solid #e8d5b7",
    borderRadius: "14px", padding: "20px", marginBottom: "14px",
    boxShadow: "0 2px 8px #b8832a08",
  } as React.CSSProperties,
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" } as React.CSSProperties,
  label: {
    fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1.2px",
    textTransform: "uppercase" as const, color: "var(--gold)", marginBottom: "4px",
  },
  value: { fontSize: "0.95rem", color: "var(--text)", fontWeight: 500 } as React.CSSProperties,
  sectionTitle: {
    fontFamily: "Playfair Display, serif", fontSize: "1.1rem",
    fontWeight: 700, color: "var(--text)", marginBottom: "16px",
  } as React.CSSProperties,
  pill: (color: string) => ({
    fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.6px",
    textTransform: "uppercase" as const, padding: "3px 10px",
    borderRadius: "20px", background: color + "18", color: color,
    display: "inline-block",
  }),
  input: {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e8d5b7",
    borderRadius: "10px", fontSize: "0.875rem", background: "var(--bg)",
    color: "var(--text)", outline: "none", boxSizing: "border-box" as const,
    fontFamily: "Inter, sans-serif",
  } as React.CSSProperties,
  btn: (variant: "primary" | "ghost") => ({
    padding: "10px 20px", borderRadius: "10px", fontSize: "0.82rem",
    fontWeight: 700, cursor: "pointer", border: "none", letterSpacing: "0.4px",
    background: variant === "primary" ? "var(--rose)" : "transparent",
    color: variant === "primary" ? "#fff" : "var(--rose)",
    border_: variant === "ghost" ? "1.5px solid var(--rose)" : "none",
  } as React.CSSProperties),
};

function fmt(n: number | undefined | null) {
  if (!n || isNaN(n)) return "₹0";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}
function statusColor(s: string) {
  const m: Record<string, string> = {
    ACTIVE: "var(--ok)", COMPLETED: "var(--gold)", CANCELLED: "var(--bad)",
    PENDING: "var(--gold)", DONE: "var(--ok)", CONFIRMED: "var(--ok)",
    NEW: "var(--rose)", PAID: "var(--ok)", PARTIAL: "var(--gold)",
  };
  return m[s] ?? "var(--text)";
}
export default function WeddingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: "", dueDate: "", assignedTo: "" });
  const [newPayment, setNewPayment] = useState({ amount: "", method: "CASH", reference: "", note: "" });
  const [newFunction, setNewFunction] = useState({ name: "", date: "", headcount: "", venue: "" });
  const [saving, setSaving] = useState(false);

  function load() {
    axios.get(`/api/weddings/${id}`).then(r => {
      const raw = r.data.wedding ?? r.data;
      setWedding({
        ...raw,
        budget:           raw.totalBudget ?? raw.budget ?? 0,
        venue:            raw.venueCity ?? raw.venue ?? "",
        tasks:            raw.tasks ?? [],
        weddingFunctions: raw.functions ?? raw.weddingFunctions ?? [],
        weddingVendors:   (raw.hiredVendors ?? raw.weddingVendors ?? []).map((hv: any) => ({
          ...hv,
          vendor: { ...hv.vendor, category: hv.vendor?.category?.name ?? hv.vendor?.category ?? "" },
          contractValue: hv.agreedAmount ?? hv.contractValue ?? 0,
        })),
        payments: raw.payments ?? [],
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }
  useEffect(() => { if (id) load(); }, [id]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await axios.post(`/api/weddings/${id}/tasks`, { ...newTask });
    setNewTask({ title: "", dueDate: "", assignedTo: "" }); load(); setSaving(false);
  }
  async function toggleTask(tid: string, status: string) {
    await axios.patch(`/api/weddings/${id}/tasks/${tid}`, { status: status === "DONE" ? "PENDING" : "DONE" }); load();
  }
  async function addPayment(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await axios.post(`/api/weddings/${id}/payments`, { ...newPayment, amount: Number(newPayment.amount) });
    setNewPayment({ amount: "", method: "CASH", reference: "", note: "" }); load(); setSaving(false);
  }
  async function addFunction(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await axios.post(`/api/weddings/${id}/functions`, { ...newFunction, headcount: Number(newFunction.headcount) });
    setNewFunction({ name: "", date: "", headcount: "", venue: "" }); load(); setSaving(false);
  }

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px", fontFamily: "Playfair Display, serif", color: "var(--gold)", fontSize: "1.2rem" }}>
      Loading wedding details…
    </div>
  );
  if (!wedding) return <div style={{ textAlign: "center", padding: "80px", opacity: 0.4 }}>Wedding not found.</div>;

  const totalPaid = (wedding.payments ?? []).reduce((s, p) => s + p.amount, 0);
  const pax = wedding.weddingFunctions?.reduce((s, f) => s + f.headcount, 0) ?? 0;

  return (
    <div>
      {/* Hero Banner */}
      <div style={S.hero}>
        <div style={S.heroLabel}>Wedding File · {(id ?? "").slice(-6).toUpperCase()}</div>
        <div style={S.heroCouple}>{wedding.coupleName}</div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
          {wedding.venue ?? "Venue TBD"} {wedding.cuisine ? `· ${wedding.cuisine}` : ""}
        </div>
        <div style={S.heroMeta}>
          <span style={S.heroPill(statusColor(wedding.status))}>{wedding.status}</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem" }}>
            📅 {new Date(wedding.eventDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
          {pax > 0 && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem" }}>👥 {pax} pax</span>}
        </div>
        <div style={S.heroStat}>
          <div style={S.heroStatVal}>{fmt(wedding.budget)}</div>
          <div style={S.heroStatLabel}>Total Budget</div>
          <div style={{ ...S.heroStatVal, fontSize: "1.2rem", marginTop: "8px", color: totalPaid >= wedding.budget ? "var(--ok)" : "var(--gold2)" }}>
            {fmt(totalPaid)}
          </div>
          <div style={S.heroStatLabel}>Collected</div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={S.tabBar}>
        {TABS.map(t => (
          <button key={t} style={S.tab(activeTab === t)} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "Overview" && (
        <div>
          <div style={S.grid2}>
            {[
              ["Couple", wedding.coupleName], ["Status", wedding.status],
              ["Event Date", new Date(wedding.eventDate).toLocaleDateString("en-IN")],
              ["Venue", wedding.venue ?? "TBD"], ["Cuisine", wedding.cuisine ?? "TBD"],
              ["Budget", fmt(wedding.budget)], ["Collected", fmt(totalPaid)],
              ["Balance", fmt(wedding.budget - totalPaid)],
            ].map(([l, v]) => (
              <div key={l} style={S.card}>
                <div style={S.label}>{l}</div>
                <div style={S.value}>{v}</div>
              </div>
            ))}
          </div>
          {wedding.notes && (
            <div style={{ ...S.card, marginTop: "8px", fontStyle: "italic", opacity: 0.7, fontSize: "0.875rem" }}>
              📝 {wedding.notes}
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "Tasks" && (
        <div>
          <div style={S.card}>
            <div style={S.sectionTitle}>Add Task</div>
            <form onSubmit={addTask} style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const }}>
              <input style={{ ...S.input, flex: "2", minWidth: "200px" }} placeholder="Task title" required
                value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} />
              <input style={{ ...S.input, flex: "1", minWidth: "140px" }} type="date"
                value={newTask.dueDate} onChange={e => setNewTask(t => ({ ...t, dueDate: e.target.value }))} />
              <input style={{ ...S.input, flex: "1", minWidth: "140px" }} placeholder="Assigned to"
                value={newTask.assignedTo} onChange={e => setNewTask(t => ({ ...t, assignedTo: e.target.value }))} />
              <button type="submit" style={S.btn("primary")} disabled={saving}>Add</button>
            </form>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={S.sectionTitle}>{wedding.tasks.length} Tasks</div>
            <span style={{ fontSize: "0.8rem", color: "var(--ok)", fontWeight: 700 }}>
              {wedding.tasks.filter(t => t.status === "DONE").length} done
            </span>
          </div>
          {wedding.tasks.map(t => (
            <div key={t.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px" }}
              onClick={() => toggleTask(t.id, t.status)}>
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                background: t.status === "DONE" ? "var(--ok)" : "transparent",
                border: `2px solid ${t.status === "DONE" ? "var(--ok)" : "#d4a853"}`,
                cursor: "pointer",
              }} />
              <div style={{ flex: 1, textDecoration: t.status === "DONE" ? "line-through" : "none", opacity: t.status === "DONE" ? 0.5 : 1 }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>{t.title}</div>
                {(t.dueDate || t.assignedTo) && (
                  <div style={{ fontSize: "0.72rem", color: "var(--text)", opacity: 0.45, marginTop: "3px" }}>
                    {t.dueDate && `Due: ${new Date(t.dueDate).toLocaleDateString("en-IN")}`}
                    {t.assignedTo && ` · ${t.assignedTo}`}
                  </div>
                )}
              </div>
              <span style={S.pill(statusColor(t.status))}>{t.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === "Vendors" && (
        <div>
          <div style={S.sectionTitle}>{wedding.weddingVendors.length} Vendors Assigned</div>
          {wedding.weddingVendors.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", opacity: 0.35 }}>No vendors assigned yet.</div>
          )}
          {wedding.weddingVendors.map(wv => (
            <div key={wv.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.95rem", marginBottom: "4px" }}>{wv.vendor.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text)", opacity: 0.5 }}>{wv.vendor.category}</div>
                {wv.notes && <div style={{ fontSize: "0.72rem", fontStyle: "italic", opacity: 0.4, marginTop: "4px" }}>{wv.notes}</div>}
              </div>
              <div style={{ textAlign: "right" as const }}>
                <span style={S.pill(statusColor(wv.status))}>{wv.status}</span>
                {wv.contractValue && <div style={{ fontFamily: "Playfair Display, serif", color: "var(--gold)", fontWeight: 700, marginTop: "6px" }}>{fmt(wv.contractValue)}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "Payments" && (
        <div>
          <div style={S.card}>
            <div style={S.sectionTitle}>Record Payment</div>
            <form onSubmit={addPayment} style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const }}>
              <input style={{ ...S.input, flex: "1", minWidth: "120px" }} type="number" placeholder="Amount (₹)" required
                value={newPayment.amount} onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))} />
              <select style={{ ...S.input, flex: "1", minWidth: "100px" }}
                value={newPayment.method} onChange={e => setNewPayment(p => ({ ...p, method: e.target.value }))}>
                {["CASH", "BANK_TRANSFER", "CHEQUE", "UPI"].map(m => <option key={m}>{m}</option>)}
              </select>
              <input style={{ ...S.input, flex: "1", minWidth: "120px" }} placeholder="Reference #"
                value={newPayment.reference} onChange={e => setNewPayment(p => ({ ...p, reference: e.target.value }))} />
              <input style={{ ...S.input, flex: "2", minWidth: "160px" }} placeholder="Note"
                value={newPayment.note} onChange={e => setNewPayment(p => ({ ...p, note: e.target.value }))} />
              <button type="submit" style={S.btn("primary")} disabled={saving}>Record</button>
            </form>
          </div>
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
            {[["Total Budget", fmt(wedding.budget), "var(--text)"], ["Collected", fmt(totalPaid), "var(--ok)"], ["Balance", fmt(wedding.budget - totalPaid), totalPaid >= wedding.budget ? "var(--ok)" : "var(--bad)"]].map(([l, v, c]) => (
              <div key={l} style={{ ...S.card, flex: 1, textAlign: "center" as const }}>
                <div style={S.label}>{l}</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", fontWeight: 700, color: c as string }}>{v}</div>
              </div>
            ))}
          </div>
          {(wedding.payments ?? []).map((p, i) => (
            <div key={p.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text)", opacity: 0.45, marginBottom: "2px" }}>
                  {["Advance (30%)", "2nd Payment (40%)", "Final Payment (20%)", "Security Deposit (10%)"][i] ?? `Tranche ${i + 1}`}
                </div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--ok)" }}>{fmt(p.amount)}</div>
                {p.reference && <div style={{ fontSize: "0.72rem", opacity: 0.45 }}>Ref: {p.reference}</div>}
              </div>
              <div style={{ textAlign: "right" as const }}>
                <span style={S.pill("var(--gold)")}>{p.method}</span>
                <div style={{ fontSize: "0.72rem", opacity: 0.4, marginTop: "6px" }}>{new Date(p.paidAt).toLocaleDateString("en-IN")}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Functions Tab */}
      {activeTab === "Functions" && (
        <div>
          <div style={S.card}>
            <div style={S.sectionTitle}>Add Function</div>
            <form onSubmit={addFunction} style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const }}>
              <input style={{ ...S.input, flex: "2", minWidth: "150px" }} placeholder="Function name (e.g. Mehendi)" required
                value={newFunction.name} onChange={e => setNewFunction(f => ({ ...f, name: e.target.value }))} />
              <input style={{ ...S.input, flex: "1", minWidth: "130px" }} type="date" required
                value={newFunction.date} onChange={e => setNewFunction(f => ({ ...f, date: e.target.value }))} />
              <input style={{ ...S.input, flex: "1", minWidth: "100px" }} type="number" placeholder="Headcount" required
                value={newFunction.headcount} onChange={e => setNewFunction(f => ({ ...f, headcount: e.target.value }))} />
              <input style={{ ...S.input, flex: "2", minWidth: "150px" }} placeholder="Venue"
                value={newFunction.venue} onChange={e => setNewFunction(f => ({ ...f, venue: e.target.value }))} />
              <button type="submit" style={S.btn("primary")} disabled={saving}>Add</button>
            </form>
          </div>
          {(wedding.weddingFunctions ?? []).map(fn => (
            <div key={fn.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{fn.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text)", opacity: 0.5, marginTop: "4px" }}>
                  {new Date(fn.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  {fn.venue && ` · ${fn.venue}`}
                </div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--gold)" }}>{fn.headcount}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text)", opacity: 0.4, letterSpacing: "1px", textTransform: "uppercase" }}>pax</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Design Tab */}
      {activeTab === "Design" && (
        <DesignStudio weddingId={wedding.id} pax={pax} />
      )}
    </div>
  );
}