"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { SkeletonCard } from "@/components/Skeleton";

interface Category { id: string; name: string; }
interface Vendor {
  id: string; name: string; contactPerson: string;
  email: string; phone: string; rating: number | null;
  paymentPreference: string | null; category: Category;
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-xs text-gray-400">Unrated</span>;
  return (
    <span className="text-secondary font-semibold text-sm">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default function VendorsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["vendors", categoryFilter],
    queryFn: () =>
      axios.get(`/api/vendors${categoryFilter ? `?categoryId=${categoryFilter}` : ""}`).then((r) => r.data),
  });

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => axios.get("/api/categories").then((r) => r.data),
  });

  const vendors: Vendor[]    = data?.vendors       ?? [];
  const categories: Category[] = catData?.categories ?? [];

  const derivedCategories = Array.from(
    new Map(vendors.map((v) => [v.category.id, v.category])).values()
  );
  const catList = categories.length > 0 ? categories : derivedCategories;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Directory</h2>
          <p className="text-sm text-gray-500 mt-0.5">{vendors.length} vendors</p>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategoryFilter("")}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            categoryFilter === ""
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-600 border-gray-200 hover:border-primary"
          }`}
        >
          All
        </button>
        {catList.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              categoryFilter === c.id
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {isError && <p className="text-red-500 text-sm">Failed to load vendors.</p>}

      {/* Skeleton grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Vendor grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vendors.map((v) => (
            <Link
              key={v.id}
              href={`/vendors/${v.id}`}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-primary transition-all group"
            >
              <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-primary mb-3">
                {v.category.name}
              </span>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {v.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{v.contactPerson}</p>
              <div className="mt-3">
                <StarRating rating={v.rating} />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-1 text-xs text-gray-400">
                <span>📞 {v.phone}</span>
                {v.paymentPreference && <span>💳 {v.paymentPreference}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}