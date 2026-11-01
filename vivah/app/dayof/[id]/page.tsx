"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";

interface CheckIn { id: string; checkedInAt: string; }
interface TimelineEvent {
  id: string; title: string; startTime: string; vendor?: { name: string; category: string; };
  checkIn?: CheckIn; status: string; notes?: string;
}
interface ProblemFlag { id: string; description: string; severity: string; resolvedAt?: string; createdAt: string; }
interface Wedding { id: string; coupleName: string; eventDate: string; venue?: string; }

const DEMO_NOW = "2026-12-17T04:05:00.000Z";

const S = {
  page: { fontFamily: "Inter, sans-serif" } as React.CSSProperties,
  heroBar: {
    background: "linear-gradient(135deg, #2c1a0e 0%, #5a2d1a 60%, #b8832a 100%)",
    borderRadius: "16px", padding: "28px 36px", marginBottom: "28px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  } as React.CSSProperties,
  heroLeft: {} as React.CSSProperties,
  heroLabel: {
    fontSize: "0.65rem", fontWeight: 700, letterSpacing: "2px",
    textTransform: "uppercase" as const, color: "var(--gold2)", marginBottom: "6px",
  },
  heroCouple: {
    fontFamily: "Playfair Display, serif", fontSize: "1.6rem",
    fontWeight: 700, color: "#fff", marginBottom: "4px",
  } as React.CSSProperties,
  heroVenue: { fontSize: "0.82rem", color: "rgba(255,255,255,0.55)" } as React.CSSProperties,
  clock: {
    fontFamily: "Playfair Display, serif", fontSize: "2.8rem",
    fontWeight: 700, color: "var(--gold2)", lineHeight: 1,
    textAlign: "right" as const,
  } as React.CSSProperties,
  clockLabel: {
    fontSize: "0.65rem", color: "rgba(255,255,255,0.45)",
    letterSpacing: "1.5px", textTransform: "uppercase" as const,
    textAlign: "right" as const, marginTop: "4px",
  } as React.CSSProperties,
  demoBadge: {
    display: "inline-block", background: "var(--rose)", color: "#fff",
    fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1.5px",
    textTransform: "uppercase" as const, padding: "4px 12px",
    borderRadius: "20px", marginBottom: "20px",
  } as React.CSSProperties,
  grid: {
    display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start",
  } as React.CSSProperties,
  sectionTitle: {
    fontFamily: "Playfair Display, serif", fontSize: "1.1rem",
    fontWeight: 700, color: "var(--text)", marginBottom: "14px",
  } as React.CSSProperties,
  eventCard: (late: boolean, done: boolean) => ({
    background: late ? "#fff0f0" : done ? "#f0faf5" : "var(--surface)",
    border: `1.5px solid ${late ? "var(--bad)" : done ? "var(--ok)" : "#e8d5b7"}`,
    borderRadius: "14px", padding: "18px 20px", marginBottom: "12px",
    boxShadow: late ? "0 4px 16px #b82a2a18" : "0 2px 8px #b8832a08",
    transition: "all 0.2s",
  } as React.CSSProperties),
  eventTop: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "8px",
  } as React.CSSProperties,
  eventTitle: {
    fontWeight: 700, fontSize: "0.95rem", color: "var(--text)",
  } as React.CSSProperties,
  pill: (color: string) => ({
    fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.8px",
    textTransform: "uppercase" as const, padding: "3px 10px",
    borderRadius: "20px", background: color + "18", color: color, border: `1px solid ${color}33`,
  }),
  eventMeta: {
    fontSize: "0.75rem", color: "var(--text)", opacity: 0.5, marginBottom: "10px",
  } as React.CSSProperties,
  lateAlert: {
    background: "var(--bad)", color: "#fff", borderRadius: "8px",
    padding: "8px 12px", fontSize: "0.78rem", fontWeight: 700,
    marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px",
  } as React.CSSProperties,
  checkInBtn: (done: boolean) => ({
    padding: "8px 18px", borderRadius: "8px", fontSize: "0.75rem",
    fontWeight: 700, cursor: done ? "default" : "pointer",
    border: "none", letterSpacing: "0.4px",
    background: done ? "var(--ok)" : "var(--gold)",
    color: "#fff", opacity: done ? 0.8 : 1,
  } as React.CSSProperties),
  sidePanel: {
    background: "var(--surface)", border: "1px solid #e8d5b7",
    borderRadius: "16px", padding: "22px",
    boxShadow: "0 2px 12px #b8832a0d",
  } as React.CSSProperties,
  flagCard: (severity: string, resolved: boolean) => ({
    background: resolved ? "#f0faf5" : severity === "HIGH" ? "#fff0f0" : "#fffbf0",
    border: `1px solid ${resolved ? "var(--ok)" : severity === "HIGH" ? "var(--bad)" : "var(--gold)"}`,
    borderRadius: "10px", padding: "14px", marginBottom: "10px",
  } as React.CSSProperties),
  flagText: { fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", marginBottom: "6px" } as React.CSSProperties,
  resolveBtn: {
    padding: "5px 12px", borderRadius: "6px", fontSize: "0.7rem",
    fontWeight: 700, cursor: "pointer", border: "none",
    background: "var(--ok)", color: "#fff",
  } as React.CSSProperties,
  addFlagForm: { marginTop: "16px", borderTop: "1px solid #e8d5b7", paddingTop: "16px" } as React.CSSProperties,
  input: {
    width: "100%", padding: "9px 12px", border: "1.5px solid #e8d5b7",
    borderRadius: "8px", fontSize: "0.82rem", background: "var(--bg)",
    color: "var(--text)", outline: "none", boxSizing: "border-box" as const,
    marginBottom: "8px", fontFamily: "Inter, sans-serif",
  } as React.CSSProperties,
};

function toIST(utc: string) {
  return new Date(new Date(utc).getTime() + 5.5 * 3600000);
}
function fmtTime(utc: string) {
  return toIST(utc).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function lateMinutes(startUtc: string, nowUtc: string) {
  return Math.floor((new Date(nowUtc).getTime() - new Date(startUtc).getTime()) / 60000);
}

export default function DayOfPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [flags, setFlags] = useState<ProblemFlag[]>([]);
  const [now, setNow] = useState(isDemo ? DEMO_NOW : new Date().toISOString());
  const [flagDesc, setFlagDesc] = useState("");
  const [flagSev, setFlagSev] = useState("HIGH");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!id) return;
    Promise.all([
      axios.get(`/api/weddings/${id}`),
      axios.get(`/api/weddings/${id}/timeline`),
      axios.get(`/api/weddings/${id}/flags`),
    ]).then(([w, t, f]) => {
      setWedding(w.data);
      setEvents(t.data ?? []);
      setFlags(f.data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDemo) setNow(new Date().toISOString());
      load();
    }, 5000);
    return () => clearInterval(interval);
  }, [isDemo, load]);

  async function checkIn(eventId: string) {
    await axios.post(`/api/weddings/${id}/timeline/${eventId}/checkin`, { checkedInAt: now });
    load();
  }
  async function addFlag(e: React.FormEvent) {
    e.preventDefault();
    await axios.post(`/api/weddings/${id}/flags`, { description: flagDesc, severity: flagSev });
    setFlagDesc(""); load();
  }
  async function resolveFlag(fid: string) {
    await axios.patch(`/api/weddings/${id}/flags/${fid}`, { resolvedAt: new Date().toISOString() });
    load();
  }

  const nowIST = toIST(now);
  const clockStr = nowIST.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px", fontFamily: "Playfair Display, serif", color: "var(--gold)", fontSize: "1.2rem" }}>
      Initialising command center…
    </div>
  );

  const lateEvents = events.filter(ev => !ev.checkIn && new Date(ev.startTime) < new Date(now));

  return (
    <div style={S.page}>
      {isDemo && <div style={S.demoBadge}>⚡ DEMO MODE — {nowIST.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} 09:35 IST</div>}

      {/* Hero */}
      <div style={S.heroBar}>
        <div style={S.heroLeft}>
          <div style={S.heroLabel}>Day-of Command Center</div>
          <div style={S.heroCouple}>{wedding?.coupleName ?? "—"}</div>
          <div style={S.heroVenue}>{wedding?.venue ?? "Venue TBD"}</div>
        </div>
        <div>
          <div style={S.clock}>{clockStr}</div>
          <div style={S.clockLabel}>{isDemo ? "Demo Time · IST" : "Live · IST"}</div>
          {lateEvents.length > 0 && (
            <div style={{ ...S.pill("var(--bad)"), marginTop: "10px", display: "inline-block" }}>
              ⚠ {lateEvents.length} LATE
            </div>
          )}
        </div>
      </div>

      <div style={S.grid}>
        {/* Left: Timeline */}
        <div>
          <div style={S.sectionTitle}>Vendor Timeline · {events.length} Events</div>
          {events.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", opacity: 0.35 }}>No timeline events seeded.</div>
          )}
          {events.map(ev => {
            const isLate = !ev.checkIn && new Date(ev.startTime) < new Date(now);
            const isDone = !!ev.checkIn;
            const mins = isLate ? lateMinutes(ev.startTime, now) : 0;
            return (
              <div key={ev.id} style={S.eventCard(isLate, isDone)}>
                <div style={S.eventTop}>
                  <div>
                    <div style={S.eventTitle}>{ev.title}</div>
                    {ev.vendor && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text)", opacity: 0.5, marginTop: "2px" }}>
                        {ev.vendor.name} · {ev.vendor.category}
                      </div>
                    )}
                  </div>
                  <span style={S.pill(isLate ? "var(--bad)" : isDone ? "var(--ok)" : "var(--gold)")}>
                    {isLate ? "LATE" : isDone ? "CHECKED IN" : "PENDING"}
                  </span>
                </div>
                <div style={S.eventMeta}>
                  Scheduled: {fmtTime(ev.startTime)}
                  {isDone && ` · Arrived: ${fmtTime(ev.checkIn!.checkedInAt)}`}
                </div>
                {isLate && (
                  <div style={S.lateAlert}>
                    <span>🚨</span>
                    <span>{mins} min late — No check-in recorded</span>
                  </div>
                )}
                {!isDone && (
                  <button style={S.checkInBtn(false)} onClick={() => checkIn(ev.id)}>
                    ✓ Mark Arrived
                  </button>
                )}
                {isDone && (
                  <div style={{ fontSize: "0.72rem", color: "var(--ok)", fontWeight: 700 }}>
                    ✓ Checked in at {fmtTime(ev.checkIn!.checkedInAt)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Problem Flags */}
        <div style={S.sidePanel}>
          <div style={S.sectionTitle}>Problem Flags</div>
          {flags.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px", opacity: 0.35, fontSize: "0.82rem" }}>No issues flagged.</div>
          )}
          {flags.map(f => (
            <div key={f.id} style={S.flagCard(f.severity, !!f.resolvedAt)}>
              <div style={{ ...S.pill(f.resolvedAt ? "var(--ok)" : f.severity === "HIGH" ? "var(--bad)" : "var(--gold)"), marginBottom: "8px" }}>
                {f.resolvedAt ? "RESOLVED" : f.severity}
              </div>
              <div style={S.flagText}>{f.description}</div>
              <div style={{ fontSize: "0.68rem", opacity: 0.4 }}>
                {new Date(f.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </div>
              {!f.resolvedAt && (
                <button style={{ ...S.resolveBtn, marginTop: "8px" }} onClick={() => resolveFlag(f.id)}>
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
          <form onSubmit={addFlag} style={S.addFlagForm}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" as const, color: "var(--gold)", marginBottom: "10px" }}>
              Flag New Issue
            </div>
            <textarea
              value={flagDesc} onChange={e => setFlagDesc(e.target.value)} required
              placeholder="Describe the problem…"
              style={{ ...S.input, minHeight: "70px", resize: "vertical" as const }}
            />
            <select style={S.input} value={flagSev} onChange={e => setFlagSev(e.target.value)}>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <button type="submit" style={{ ...S.checkInBtn(false), width: "100%", padding: "10px" }}>
              🚩 Flag Issue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}