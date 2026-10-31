"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "./Toast";

const CITIES = ["Jaipur", "Udaipur", "Delhi NCR", "Mumbai", "Jodhpur", "Agra", "Other"];

const VENUES: Record<string, string[]> = {
  Jaipur:      ["Rambagh Palace", "Taj Jai Mahal Palace", "Samode Palace", "Chomu Palace", "ITC Rajputana", "Grand Mughal"],
  Udaipur:     ["Taj Lake Palace", "Udaivilas", "Devi Garh", "Shiv Niwas Palace", "Fateh Garh"],
  "Delhi NCR": ["The Leela Ambience", "ITC Maurya", "Taj Palace Delhi", "The Grand"],
  Mumbai:      ["Taj Mahal Palace", "ITC Grand Central", "The Leela Mumbai"],
  Jodhpur:     ["Umaid Bhawan Palace", "Taj Hari Mahal", "Raas Jodhpur"],
  Agra:        ["Oberoi Amarvilas", "ITC Mughal"],
  Other:       [],
};

const CUISINE_OPTIONS = [
  "Rajasthani", "Mughlai", "North Indian", "South Indian",
  "Continental", "Chinese", "Italian", "Mediterranean",
  "Live Counters", "Chaat Station", "BBQ & Grills",
  "Dessert Station", "Jain Options", "Vegan Options",
];

interface FormState {
  coupleName: string;
  venueCity:  string;
  venueName:  string;
  startDate:  string;
  endDate:    string;
  totalBudget: string;
}

const EMPTY: FormState = {
  coupleName: "", venueCity: "", venueName: "",
  startDate: "", endDate: "", totalBudget: "",
};

export function WeddingForm({ onClose }: { onClose: () => void }) {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [errors, setErrors]   = useState<Partial<FormState>>({});
  const qc    = useQueryClient();
  const { toast } = useToast();

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleCuisine = (c: string) =>
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.coupleName.trim()) errs.coupleName = "Couple name is required";
    if (!form.venueCity)         errs.venueCity  = "City is required";
    if (!form.startDate)         errs.startDate  = "Start date is required";
    if (!form.endDate)           errs.endDate    = "End date is required";
    if (!form.totalBudget || Number(form.totalBudget) <= 0)
                                 errs.totalBudget = "Budget is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
                                 errs.endDate    = "End date must be after start date";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: FormState) =>
      axios.post("/api/weddings", {
        coupleName:  data.coupleName,
        venueCity:   data.venueCity,
        venueName:   data.venueName || undefined,
        startDate:   data.startDate,
        endDate:     data.endDate,
        totalBudget: Number(data.totalBudget) * 100000,
        cuisine:     cuisines.length ? cuisines.join(",") : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weddings"] });
      toast("Wedding created successfully");
      onClose();
    },
    onError: () => toast("Failed to create wedding", "error"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate(form);
  };

  const venueOptions = VENUES[form.venueCity] ?? [];
  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Couple Name */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Couple Name *</label>
        <input
          value={form.coupleName} onChange={set("coupleName")}
          placeholder="e.g. Sharma-Gupta"
          className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.coupleName ? "border-red-400" : "border-gray-200"}`}
        />
        {errors.coupleName && <p className="text-xs text-red-500 mt-1">{errors.coupleName}</p>}
      </div>

      {/* Venue City */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Venue City *</label>
        <select
          value={form.venueCity}
          onChange={(e) => { setForm((f) => ({ ...f, venueCity: e.target.value, venueName: "" })); }}
          className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white ${errors.venueCity ? "border-red-400" : "border-gray-200"}`}
        >
          <option value="">Select city...</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.venueCity && <p className="text-xs text-red-500 mt-1">{errors.venueCity}</p>}
      </div>

      {/* Venue Name */}
      {form.venueCity && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Venue Name</label>
          {venueOptions.length > 0 ? (
            <select
              value={form.venueName} onChange={set("venueName")}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
            >
              <option value="">Select venue...</option>
              {venueOptions.map((v) => <option key={v} value={v}>{v}</option>)}
              <option value="Other">Other / Custom</option>
            </select>
          ) : (
            <input
              value={form.venueName} onChange={set("venueName")}
              placeholder="Enter venue name"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          )}
          {form.venueName === "Other" && (
            <input
              className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Type venue name..."
              onChange={(e) => setForm((f) => ({ ...f, venueName: e.target.value }))}
            />
          )}
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Start Date *</label>
          <input
            type="date" value={form.startDate} onChange={set("startDate")}
            className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.startDate ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">End Date *</label>
          <input
            type="date" value={form.endDate} onChange={set("endDate")}
            className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.endDate ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Total Budget (&#8377; Lakhs) *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">&#8377;</span>
          <input
            type="number" value={form.totalBudget} onChange={set("totalBudget")}
            placeholder="50"
            className={`w-full pl-7 pr-12 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.totalBudget ? "border-red-400" : "border-gray-200"}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">L</span>
        </div>
        {errors.totalBudget && <p className="text-xs text-red-500 mt-1">{errors.totalBudget}</p>}
      </div>

      {/* Cuisine Tags */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Cuisine Preferences</label>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map((c) => (
            <button
              key={c} type="button" onClick={() => toggleCuisine(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                cuisines.includes(c)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {cuisines.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">Selected: {cuisines.join(", ")}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button" onClick={onClose}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit" disabled={mutation.isPending}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {mutation.isPending ? "Creating..." : "Create Wedding"}
        </button>
      </div>
    </form>
  );
}