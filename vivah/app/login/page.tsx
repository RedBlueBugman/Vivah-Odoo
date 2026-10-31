"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const DEMO_USERS = [
  { label: "Staff", email: "ashish@royalknot.com", password: "royal@123" },
  { label: "Couple", email: "priya@sharma.com", password: "couple@123" },
  { label: "Vendor", email: "ravish@djravish.in", password: "vendor@123" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function doSignIn(em: string, pw: string) {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: em,
      password: pw,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/auth-redirect");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await doSignIn(email, password);
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-[#E8E0DC]">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#6B2737]">VIVAH</h1>
        <p className="text-sm text-[#B8860B] font-medium tracking-widest mt-1">
          THE ROYAL KNOT
        </p>
        <p className="text-xs text-gray-400 mt-3">Operations Platform</p>
      </div>

      <div className="mb-6">
        <p className="text-xs text-gray-400 text-center mb-2 uppercase tracking-widest">
          Demo Quick Login
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_USERS.map((u) => (
            <button
              key={u.label}
              type="button"
              disabled={loading}
              onClick={() => doSignIn(u.email, u.password)}
              className="border border-[#6B2737] text-[#6B2737] text-xs font-semibold py-2 rounded-lg hover:bg-[#6B2737] hover:text-white transition-colors disabled:opacity-50"
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or sign in manually</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
            placeholder="you@royalknot.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#6B2737] hover:bg-[#8B3A4A] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}