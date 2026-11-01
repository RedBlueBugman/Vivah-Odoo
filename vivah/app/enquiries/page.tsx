"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface Enquiry {
  id: string;
  coupleName: string;
  email: string;
  phone: string;
  eventDate: string;
  budget: number;
  status: string;
  notes?: string;
  createdAt: string;
}

const S = {
  root: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: "28px",
    alignItems: "start",
  } as React.CSSProperties,
  panel: {
    background: "var(--surface)",
    border: "1px solid #e8d5b7",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 2px 12px #b8832a0d",
  } as React.CSSProperties,
  panelTitle: {
    fontFamily: "Playfair Display, serif",
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: "4px",
  } as React.CSSProperties,
  panelSub: {
    fontSize: "0.75rem",
    color: "var(--text)",
    opacity: 0.45,
    marginBottom: "24px",
  } as React.CSSProperties,
  fieldGroup: { marginBottom: "16px" } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "1.2px",
    textTransform: "uppercase" as const,
    color: "var(--text)",
    opacity: 0.55,
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #e8d5b7",
    borderRadius: "10px",
    fontSize: "0.875rem",
    background: "var(--bg)",
    color: "var(--text)",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #e8d5b7",
    borderRadius: "10px",
    fontSize: "0.875rem",
    background: "var(--bg)",
    color: "var(--text)",
    outline: "none",
    boxSizing: "border-box" as const,
    minHeight: "80px",
    resize: "vertical" as const,
    fontFamily: "Inter, sans-serif",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    background: "var(--rose)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "8px",
    letterSpacing: "0.4px",
  } as React.CSSProperties,
  successBanner: {
    background: "#e6f4ed",
    border: "1px solid var(--ok)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "var(--ok)",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "16px",
    textAlign: "center" as const,
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "16px",
  } as React.CSSProperties,
  listTitle: {
    fontFamily: "Playfair Display, serif",
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "var(--text)",
  } as React.CSSProperties,
  count: {
    fontSize: "0.75rem",
    color: "var(--gold)",
    fontWeight: 700,
  } as React.CSSProperties,
  card: {
    background: "var(--surface)",
    border: "1px solid #e8d5b7",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "14px",
    boxShadow: "0 2px 8px #b8832a08",
  } as React.CSSProperties,
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  } as React.CSSProperties,
  coupleName: {
    fontFamily: "Playfair Display, serif",
    fontSize: "1rem",
    fontWeight: 700,
    color: "var(--text)",
  } as React.CSSProperties,
  pill: (color: string) => ({
    fontSize: "0.65rem",
    fontWeight: 700,
    letterSpacing: "0.8px",
    textTransform: "uppercase" as const,
    padding: "3px 10px",
    borderRadius: "20px",
    background: color + "18",
    color: color,
  }),
  meta: {
    fontSize: "0.78rem",
    color: "var(--text)",
    opacity: 0.55,
    marginBottom: "4px",
  } as React.CSSProperties,
  budget: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "var(--gold)",
    fontFamily: "Playfair Display, serif",
  } as React.CSSProperties,
  notes: {
    fontSize: "0.78rem",
    color: "var(--text)",
    opacity: 0.5,
    marginTop: "8px",
    borderTop: "1px solid #f0e6d3",
    paddingTop: "8px",
    fontStyle: "italic",
  } as React.CSSProperties,
};

function statusColor(s: string) {
  if (s === "NEW") return "var(--rose)";
  if (s === "CONTACTED") return "var(--gold)";
  if (s === "CONVERTED") return "var(--ok)";
  if (s === "LOST") return "var(--bad)";
  return "var(--text)";
}

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const EMPTY = { coupleName: "", email: "", phone: "", eventDate: "", budget: "", notes: "" };

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  function load() {
    axios.get("/api/enquiries").then(r => {
      const raw = r.data.enquiries ?? r.data ?? [];
      setEnquiries(raw.map((e: any) => ({
        ...e,
        coupleName: e.clientName ?? e.coupleName ?? "",
        status: e.status ?? "LEAD",
        budget: e.budget ?? 0,
      })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post("/api/enquiries", {
        clientName: form.coupleName,
        email: form.email,
        phone: form.phone,
        eventDate: form.eventDate || null,
        budget: form.budget ? Number(form.budget) : null,
        cuisine: null,
      });
      setForm(EMPTY);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      load();
    } catch {
      alert("Failed to save enquiry.");
    } finally {
      setSaving(false);
    }
  }

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));
  }

  return (
    <div>
      <h1 style={{
        fontFamily: "Playfair Display, serif",
        fontSize: "2rem", fontWeight: 700,
        color: "var(--text)", marginBottom: "4px",
      }}>Enquiries</h1>
      <p style={{ color: "var(--text)", opacity: 0.45, fontSize: "0.875rem", marginBottom: "28px" }}>
        Capture every lead. Never lose an enquiry.
      </p>

      <div style={S.root}>
        {/* Left: Form */}
        <div style={S.panel}>
          <div style={S.panelTitle}>New Enquiry</div>
          <div style={S.panelSub}>Fill in couple details to log a fresh lead</div>

          {success && <div style={S.successBanner}>✓ Enquiry saved successfully!</div>}

          <form onSubmit={handleSubmit}>
            {[
              { key: "coupleName", label: "Couple Name", placeholder: "Priya & Rahul", type: "text" },
              { key: "email", label: "Email", placeholder: "couple@email.com", type: "email" },
              { key: "phone", label: "Phone", placeholder: "+91 98765 43210", type: "tel" },
              { key: "eventDate", label: "Event Date", placeholder: "", type: "date" },
              { key: "budget", label: "Budget (₹)", placeholder: "5000000", type: "number" },
            ].map(f => (
              <div key={f.key} style={S.fieldGroup}>
                <label style={S.label}>{f.label}</label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={set(f.key)}
                  placeholder={f.placeholder}
                  required={["coupleName", "email", "phone"].includes(f.key)}
                  style={S.input}
                  onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={e => (e.target.style.borderColor = "#e8d5b7")}
                />
              </div>
            ))}
            <div style={S.fieldGroup}>
              <label style={S.label}>Notes</label>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                placeholder="Any special requirements, referral source, etc."
                style={S.textarea}
                onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                onBlur={e => (e.target.style.borderColor = "#e8d5b7")}
              />
            </div>
            <button type="submit" disabled={saving} style={{
              ...S.submitBtn,
              background: saving ? "#ccc" : "var(--rose)",
              cursor: saving ? "not-allowed" : "pointer",
            }}>
              {saving ? "Saving…" : "Log Enquiry →"}
            </button>
          </form>
        </div>

        {/* Right: Pipeline */}
        <div>
          <div style={S.listHeader}>
            <div style={S.listTitle}>Enquiry Pipeline</div>
            <div style={S.count}>{enquiries.length} total</div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "48px", color: "var(--gold)", fontFamily: "Playfair Display, serif" }}>
              Loading…
            </div>
          ) : enquiries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", opacity: 0.35 }}>No enquiries yet. Log your first lead.</div>
          ) : (
            enquiries.map(eq => (
              <div key={eq.id} style={S.card}>
                <div style={S.cardTop}>
                  <div style={S.coupleName}>{eq.coupleName}</div>
                  <span style={S.pill(statusColor(eq.status))}>{eq.status}</span>
                </div>
                <div style={S.meta}>{eq.email} · {eq.phone}</div>
                {eq.eventDate && (
                  <div style={S.meta}>
                    📅 {new Date(eq.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}
                <div style={S.budget}>{eq.budget ? fmt(eq.budget) : "Budget TBD"}</div>
                {eq.notes && <div style={S.notes}>"{eq.notes}"</div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}