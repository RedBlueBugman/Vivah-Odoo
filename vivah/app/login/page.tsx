"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push("/auth-redirect");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--bg)",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Left: Hero Panel */}
      <div style={{
        flex: "1",
        background: "linear-gradient(160deg, #2c1a0e 0%, #5a2d1a 60%, #b8832a 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "48px",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
      }}>
        <img
          src="/design/images/floral mandap.jpg"
          alt="Royal Wedding"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", opacity: 0.35,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-block",
            background: "var(--rose)",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "3px",
            textTransform: "uppercase",
            padding: "6px 14px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}>
            Jaipur · Udaipur · Rajasthan
          </div>
          <h1 style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}>
            VIVAH<br/>
            <span style={{ color: "var(--gold2)", fontStyle: "italic" }}>विवाह</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", maxWidth: "340px", lineHeight: 1.6 }}>
            The Royal Knot's luxury wedding operations platform. Every detail, perfectly orchestrated.
          </p>
          <div style={{
            marginTop: "40px",
            display: "flex",
            gap: "32px",
          }}>
            {[["25", "Weddings / Season"], ["18+", "Vendors / Event"], ["₹2Cr+", "Avg. Budget"]].map(([val, label]) => (
              <div key={label}>
                <div style={{ color: "var(--gold2)", fontSize: "1.4rem", fontWeight: 700, fontFamily: "Playfair Display, serif" }}>{val}</div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.7rem", letterSpacing: "1px", textTransform: "uppercase" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div style={{
        width: "460px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "56px 48px",
        background: "var(--surface)",
      }}>
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "1.875rem",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "8px",
          }}>
            Welcome Back
          </h2>
          <p style={{ color: "var(--text)", opacity: 0.55, fontSize: "0.9rem" }}>
            Sign in to your operations portal
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--text)",
              opacity: 0.6,
              marginBottom: "8px",
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@royalknot.com"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1.5px solid #e8d5b7",
                borderRadius: "10px",
                fontSize: "0.95rem",
                background: "var(--bg)",
                color: "var(--text)",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--gold)"}
              onBlur={e => e.target.style.borderColor = "#e8d5b7"}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--text)",
              opacity: 0.6,
              marginBottom: "8px",
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1.5px solid #e8d5b7",
                borderRadius: "10px",
                fontSize: "0.95rem",
                background: "var(--bg)",
                color: "var(--text)",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--gold)"}
              onBlur={e => e.target.style.borderColor = "#e8d5b7"}
            />
          </div>

          {error && (
            <div style={{
              background: "#fff0f0",
              border: "1px solid var(--bad)",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "var(--bad)",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#ccc" : "var(--rose)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "14px",
              fontSize: "0.95rem",
              fontWeight: 700,
              letterSpacing: "0.5px",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <div style={{
          marginTop: "40px",
          padding: "20px",
          background: "var(--bg)",
          borderRadius: "12px",
          border: "1px dashed #d4a853",
        }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "10px" }}>
            Demo Accounts
          </p>
          {[
            { role: "Staff", email: "ashish@royalknot.com", pass: "royal@123" },
            { role: "Couple", email: "priya@sharma.com", pass: "couple@123" },
            { role: "Vendor", email: "ravish@djravish.in", pass: "vendor@123" },
          ].map(u => (
            <div
              key={u.role}
              onClick={() => { setEmail(u.email); setPassword(u.pass); }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "4px",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f0e6d3")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>{u.role}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text)", opacity: 0.5 }}>{u.email}</span>
            </div>
          ))}
          <p style={{ fontSize: "0.68rem", color: "var(--text)", opacity: 0.4, marginTop: "8px", textAlign: "center" }}>
            Click any row to auto-fill credentials
          </p>
        </div>
      </div>
    </div>
  );
}