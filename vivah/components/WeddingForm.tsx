"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "./Toast";

interface FormState {
  coupleName: string;
  venueCity: string;
  startDate: string;
  endDate: string;
  totalBudget: string;
}

const EMPTY: FormState = {
  coupleName: "", venueCity: "",
  startDate: "", endDate: "", totalBudget: "",
};

export function WeddingForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const qc = useQueryClient();
  const { toast } = useToast();

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.coupleName.trim())  errs.coupleName  = "Couple name is required";
    if (!form.venueCity.trim())   errs.venueCity   = "City is required";
    if (!form.startDate)          errs.startDate   = "Start date is required";
    if (!form.endDate)            errs.endDate     = "End date is required";
    if (!form.totalBudget || Number(form.totalBudget) <= 0)
                                  errs.totalBudget = "Budget is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
                                  errs.endDate     = "End date must be after start date";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: FormState) =>
      axios.post("/api/weddings", {
        coupleName:  data.coupleName,
        venueCity:   data.venueCity,
        startDate:   data.startDate,
        endDate:     data.endDate,
        totalBudget: Number(data.totalBudget) * 100000,
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

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Couple name */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Couple Name *</label>
        <input
          value={form.coupleName} onChange={set("coupleName")}
          placeholder="e.g. Sharma-Gupta"
          className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.coupleName ? "border-red-400" : "border-gray-200"}`}
        />
        {errors.coupleName && <p className="text-xs text-red-500 mt-1">{errors.coupleName}</p>}
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Venue City *</label>
        <input
          value={form.venueCity} onChange={set("venueCity")}
          placeholder="e.g. Jaipur"
          className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.venueCity ? "border-red-400" : "border-gray-200"}`}
        />
        {errors.venueCity && <p className="text-xs text-red-500 mt-1">{errors.venueCity}</p>}
      </div>

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
        <label className="block text-xs font-medium text-gray-600 mb-1">Total Budget (₹ Lakhs) *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
          <input
            type="number" value={form.totalBudget} onChange={set("totalBudget")}
            placeholder="50"
            className={`w-full pl-7 pr-12 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.totalBudget ? "border-red-400" : "border-gray-200"}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">L</span>
        </div>
        {errors.totalBudget && <p className="text-xs text-red-500 mt-1">{errors.totalBudget}</p>}
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
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {mutation.isPending ? "Creating..." : "Create Wedding"}
        </button>
      </div>
    </form>
  );
}