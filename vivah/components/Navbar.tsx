"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const links = [
    { name: "Dashboard", href: "/" },
    { name: "Enquiries", href: "/enquiries" },
    { name: "Weddings", href: "/weddings" },
    { name: "Vendors", href: "/vendors" },
  ];
  return (
    <header style={{
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 2px 12px #b8832a0d",
    }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 20px" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 10px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--rose)", letterSpacing: "-0.01em" }}>
              VIVAH
            </span>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--gold)", opacity: 0.8 }}>
              The Royal Knot
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{ background: "none", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600, color: "var(--sub)", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
          >
            Logout →
          </button>
        </div>
        {/* Nav tabs */}
        <nav style={{ display: "flex", gap: "0" }}>
          {links.map(l => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} style={{
                padding: "10px 18px",
                fontSize: "0.78rem", fontWeight: 700,
                letterSpacing: "1px", textTransform: "uppercase",
                color: active ? "var(--gold)" : "var(--sub)",
                borderBottom: active ? "2px solid var(--gold)" : "2px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s",
                marginBottom: "-1px",
              }}>
                {l.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}