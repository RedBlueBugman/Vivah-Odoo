"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "./Toast";

interface FormState {
  clientName: string;
  email: string;
  phone: string;
  eventDate: string;
  estimatedPax: string;
  budget: string;
}

const EMPTY: FormState = {
  clientName: "", email: "", phone: "",
  eventDate: "", estimatedPax: "", budget: "",
};

export function EnquiryForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const qc = useQueryClient();
  const { toast } = useToast();

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.clientName.trim()) errs.clientName = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.phone.trim() || form.phone.length < 10) errs.phone = "Valid 10-digit phone required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: FormState) =>
      axios.post("/api/enquiries", {
        clientName:   data.clientName,
        email:        data.email,
        phone:        data.phone,
        eventDate:    data.eventDate   || undefined,
        estimatedPax: data.estimatedPax ? Number(data.estimatedPax) : undefined,
        budget:       data.budget       ? Number(data.budget) * 100000 : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enquiries"] });
      toast("Enquiry captured successfully");
      onClose();
    },
    onError: () => toast("Failed to save enquiry", "error"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Client Name */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Client Name *</label>
        <input
          value={form.clientName} onChange={set("clientName")}
          placeholder="e.g. Ananya Kapoor"
          className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.clientName ? "border-red-400" : "border-gray-200"}`}
        />
        {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName}</p>}
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
          <input
            type="email" value={form.email} onChange={set("email")}
            placeholder="ananya@gmail.com"
            className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.email ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
          <input
            type="tel" value={form.phone} onChange={set("phone")}
            placeholder="9876543210"
            className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.phone ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* Event Date + Pax */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Event Date</label>
          <input
            type="date" value={form.eventDate} onChange={set("eventDate")}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Guests</label>
          <input
            type="number" value={form.estimatedPax} onChange={set("estimatedPax")}
            placeholder="500"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Budget (₹ Lakhs)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
          <input
            type="number" value={form.budget} onChange={set("budget")}
            placeholder="50"
            className="w-full pl-7 pr-12 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">L</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Enter in lakhs — e.g. 50 = ₹50,00,000</p>
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
          {mutation.isPending ? "Saving..." : "Capture Enquiry"}
        </button>
      </div>
    </form>
  );
}