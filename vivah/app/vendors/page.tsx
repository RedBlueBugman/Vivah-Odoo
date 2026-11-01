"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface Vendor {
  id: string; name: string; contactPerson?: string;
  email?: string; phone?: string; rating?: number;
  category: { id: string; name: string; } | string;
}

const DEMO_VENDORS: Vendor[] = [
  { id: "v1",  name: "Shringaar by Sunita",      contactPerson: "Sunita Sharma",   phone: "+91 98100 11001", email: "sunita@shringaar.in",      rating: 5, category: { id: "c1", name: "Makeup & Hair" } },
  { id: "v2",  name: "Glam Studio Jaipur",        contactPerson: "Preethi Nair",    phone: "+91 98100 11002", email: "glam@jaipur.in",            rating: 4, category: { id: "c1", name: "Makeup & Hair" } },
  { id: "v3",  name: "Brides of Rajputana",       contactPerson: "Meena Rathore",   phone: "+91 98100 11003", email: "brides@rajputana.in",       rating: 5, category: { id: "c1", name: "Makeup & Hair" } },
  { id: "v4",  name: "Dulhan Diaries",            contactPerson: "Kavya Pillai",    phone: "+91 98100 11004", email: "dulhan@diaries.in",         rating: 4, category: { id: "c1", name: "Makeup & Hair" } },
  { id: "v5",  name: "Royal Look Studio",         contactPerson: "Asha Mehta",      phone: "+91 98100 11005", email: "royallook@studio.in",       rating: 3, category: { id: "c1", name: "Makeup & Hair" } },
  { id: "v6",  name: "Pink City Decor",           contactPerson: "Ramesh Gupta",    phone: "+91 98100 21001", email: "info@pinkcitydecor.in",     rating: 5, category: { id: "c2", name: "Decor & Floral" } },
  { id: "v7",  name: "Floral Dreams",             contactPerson: "Sundar Lal",      phone: "+91 98100 21002", email: "floral@dreams.in",          rating: 4, category: { id: "c2", name: "Decor & Floral" } },
  { id: "v8",  name: "Mandap Magic",              contactPerson: "Deepak Verma",    phone: "+91 98100 21003", email: "mandap@magic.in",           rating: 4, category: { id: "c2", name: "Decor & Floral" } },
  { id: "v9",  name: "Rajwada Decor Co.",         contactPerson: "Harish Singh",    phone: "+91 98100 21004", email: "rajwada@decor.in",          rating: 5, category: { id: "c2", name: "Decor & Floral" } },
  { id: "v10", name: "Blooms & Bliss",            contactPerson: "Nisha Joshi",     phone: "+91 98100 21005", email: "blooms@bliss.in",           rating: 3, category: { id: "c2", name: "Decor & Floral" } },
  { id: "v11", name: "DJ Ravish",                 contactPerson: "Ravish Kumar",    phone: "+91 98100 31001", email: "ravish@djravish.in",        rating: 4, category: { id: "c3", name: "Music & Entertainment" } },
  { id: "v12", name: "Beats by Bunty",            contactPerson: "Bunty Sharma",    phone: "+91 98100 31002", email: "bunty@beats.in",            rating: 4, category: { id: "c3", name: "Music & Entertainment" } },
  { id: "v13", name: "Shehnai Masters",           contactPerson: "Ustad Hamid",     phone: "+91 98100 31003", email: "shehnai@masters.in",        rating: 5, category: { id: "c3", name: "Music & Entertainment" } },
  { id: "v14", name: "Bollywood Beats Events",    contactPerson: "Rohit Anand",     phone: "+91 98100 31004", email: "bollywood@beats.in",        rating: 3, category: { id: "c3", name: "Music & Entertainment" } },
  { id: "v15", name: "Dhol Baaje",                contactPerson: "Mangu Lal",       phone: "+91 98100 31005", email: "dhol@baaje.in",             rating: 4, category: { id: "c3", name: "Music & Entertainment" } },
  { id: "v16", name: "Lens & Light Photography",  contactPerson: "Arjun Kapoor",    phone: "+91 98100 41001", email: "arjun@lenslight.in",        rating: 5, category: { id: "c4", name: "Photography & Video" } },
  { id: "v17", name: "Royal Frames Studio",       contactPerson: "Vikram Sinha",    phone: "+91 98100 41002", email: "royal@frames.in",           rating: 5, category: { id: "c4", name: "Photography & Video" } },
  { id: "v18", name: "Moment Makers",             contactPerson: "Priya Nanda",     phone: "+91 98100 41003", email: "moment@makers.in",          rating: 4, category: { id: "c4", name: "Photography & Video" } },
  { id: "v19", name: "Cinematic Shaadi",          contactPerson: "Zoya Khan",       phone: "+91 98100 41004", email: "cinematic@shaadi.in",       rating: 4, category: { id: "c4", name: "Photography & Video" } },
  { id: "v20", name: "Forever Films Jaipur",      contactPerson: "Karan Malhotra",  phone: "+91 98100 41005", email: "forever@films.in",          rating: 3, category: { id: "c4", name: "Photography & Video" } },
  { id: "v21", name: "Grand Mughal Caterers",     contactPerson: "Chef Salim",      phone: "+91 98100 51001", email: "grandmughal@caterers.in",   rating: 5, category: { id: "c5", name: "Catering" } },
  { id: "v22", name: "Rajputana Rasoi",           contactPerson: "Chef Bharat",     phone: "+91 98100 51002", email: "rasoi@rajputana.in",        rating: 4, category: { id: "c5", name: "Catering" } },
  { id: "v23", name: "Royal Feast Co.",           cultactPerson: "Chef Ananya",     phone: "+91 98100 51003", email: "royal@feast.in",            rating: 4, category: { id: "c5", name: "Catering" } },
  { id: "v24", name: "Zaika Caterers",            contactPerson: "Chef Imran",      phone: "+91 98100 51004", email: "zaika@caterers.in",         rating: 3, category: { id: "c5", name: "Catering" } },
  { id: "v25", name: "Desi Tadka Events",         contactPerson: "Chef Renu",       phone: "+91 98100 51005", email: "desi@tadka.in",             rating: 4, category: { id: "c5", name: "Catering" } },
  { id: "v26", name: "Jaipur Lights Co.",         contactPerson: "Suresh Electrical",phone: "+91 98100 61001", email: "jaipur@lights.in",         rating: 4, category: { id: "c6", name: "Lighting & AV" } },
  { id: "v27", name: "Stage & Sound Pros",        contactPerson: "Anil Tiwari",     phone: "+91 98100 61002", email: "stage@sound.in",            rating: 4, category: { id: "c6", name: "Lighting & AV" } },
  { id: "v28", name: "Luminary Events",           contactPerson: "Dev Rajan",       phone: "+91 98100 61003", email: "luminary@events.in",        rating: 5, category: { id: "c6", name: "Lighting & AV" } },
  { id: "v29", name: "Pixel & Prism AV",          contactPerson: "Tarun Shah",      phone: "+91 98100 61004", email: "pixel@prism.in",            rating: 3, category: { id: "c6", name: "Lighting & AV" } },
  { id: "v30", name: "Blaze Illuminations",       contactPerson: "Firoz Ansari",    phone: "+91 98100 61005", email: "blaze@illum.in",            rating: 4, category: { id: "c6", name: "Lighting & AV" } },
];

function getCatName(v: Vendor): string {
  if (typeof v.category === "string") return v.category;
  return v.category?.name ?? "Other";
}

function Stars({ r }: { r?: number }) {
  if (!r) return <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Unrated</span>;
  return (
    <span style={{ color: "var(--gold)", fontSize: "0.85rem", letterSpacing: "1px" }}>
      {"★".repeat(r)}{"☆".repeat(5 - r)}
    </span>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("/api/vendors").then(r => {
      const raw = Array.isArray(r.data) ? r.data : Array.isArray(r.data.vendors) ? r.data.vendors : [];
      const merged = raw.length > 0 ? raw : DEMO_VENDORS;
      setVendors(merged);
      setLoading(false);
    }).catch(() => {
      setVendors(DEMO_VENDORS);
      setLoading(false);
    });
  }, []);

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    getCatName(v).toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, v) => {
    const cat = getCatName(v);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(v);
    return acc;
  }, {} as Record<string, Vendor[]>);

  return (
    <div>
      <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
        Vendor Directory
      </h1>
      <p style={{ color: "var(--text)", opacity: 0.45, fontSize: "0.875rem", marginBottom: "24px" }}>
        {vendors.length} vendors across {Object.keys(grouped).length} categories
      </p>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search vendors or categories…"
        style={{
          width: "100%", maxWidth: "420px", padding: "11px 16px",
          border: "1.5px solid #e8d5b7", borderRadius: "10px",
          fontSize: "0.875rem", background: "var(--surface)",
          color: "var(--text)", outline: "none",
          marginBottom: "32px", fontFamily: "Inter, sans-serif",
          boxSizing: "border-box",
        }}
        onFocus={e => (e.target.style.borderColor = "var(--gold)")}
        onBlur={e => (e.target.style.borderColor = "#e8d5b7")}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--gold)", fontFamily: "Playfair Display, serif" }}>
          Loading vendors…
        </div>
      ) : (
        Object.entries(grouped).map(([cat, vlist]) => (
          <div key={cat} style={{ marginBottom: "36px" }}>
            {/* Category Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px",
            }}>
              <h2 style={{
                fontFamily: "Playfair Display, serif", fontSize: "1.15rem",
                fontWeight: 700, color: "var(--text)", margin: 0,
              }}>{cat}</h2>
              <span style={{
                fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1px",
                textTransform: "uppercase", padding: "3px 10px",
                borderRadius: "20px", background: "var(--gold)18", color: "var(--gold)",
              }}>{vlist.length} vendors</span>
            </div>

            {/* Vendor Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
            }}>
              {vlist.map(v => (
                <div key={v.id} style={{
                  background: "var(--surface)", border: "1px solid #e8d5b7",
                  borderRadius: "14px", padding: "20px",
                  boxShadow: "0 2px 8px #b8832a08",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px #b8832a18";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px #b8832a08";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Name + Rating */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", flex: 1, minWidth: 0, paddingRight: "8px" }}>
                      {v.name}
                    </div>
                    <Stars r={v.rating ?? undefined} />
                  </div>

                  {/* Contact */}
                  {v.contactPerson && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text)", opacity: 0.55, marginBottom: "4px" }}>
                      👤 {v.contactPerson}
                    </div>
                  )}
                  {v.phone && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text)", opacity: 0.55, marginBottom: "4px" }}>
                      📞 {v.phone}
                    </div>
                  )}
                  {v.email && (
                    <div style={{ fontSize: "0.72rem", color: "var(--gold)", opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      ✉ {v.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}