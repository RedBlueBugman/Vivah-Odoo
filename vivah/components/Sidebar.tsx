"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const WEDDING_ID = "cmvwwz1lt00167v4nw32bj3a8";

const NAV = [
  { href: "/",                    label: "Dashboard",  icon: "◈" },
  { href: "/enquiries",           label: "Enquiries",  icon: "✉" },
  { href: "/weddings",            label: "Weddings",   icon: "♡" },
  { href: "/vendors",             label: "Vendors",    icon: "⊞" },
  { href: `/dayof/${WEDDING_ID}`, label: "Day-of 🔴", icon: "⚡" },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary text-white flex flex-col z-50">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-primary-light">
        <p className="text-xs tracking-widest text-secondary font-semibold uppercase">The Royal Knot</p>
        <h1 className="text-2xl font-bold mt-1 tracking-tight">VIVAH</h1>
        <p className="text-xs text-primary-light mt-0.5">विवाह Operations</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-light text-white"
                  : "text-red-200 hover:bg-primary-light hover:text-white"
              }`}
            >
              <span className="text-secondary text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer + logout */}
      <div className="px-4 py-4 border-t border-primary-light">
        <p className="text-xs text-primary-light mb-1">Jaipur · Udaipur</p>
        <p className="text-xs text-primary-light mb-3">25 weddings / season</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-xs text-red-200 hover:text-white border border-primary-light hover:border-white rounded-lg py-1.5 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}