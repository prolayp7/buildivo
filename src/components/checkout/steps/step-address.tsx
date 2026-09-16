"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Address } from "@/types";
import { cn } from "@/lib/utils";

const SAVED_ADDRESSES: (Address & { id: string; label: string; company: string; isDefault?: boolean })[] = [
  {
    id: "default",
    label: "Default Dispatch",
    isDefault: true,
    company: "Apex Mechanical & Electrical Ltd",
    fullName: "Alex Turner",
    line1: "Unit 4B, Battersea Commercial Park",
    line2: "Silverthorne Road",
    city: "London",
    postcode: "SW8 3HE",
    phone: "020 7946 0912",
  },
  {
    id: "secondary",
    label: "Secondary Site",
    company: "Westminster Residential Site #12",
    fullName: "Alex Turner (Field Supervisor)",
    line1: "Flat 3, 14 Victoria Street",
    line2: "",
    city: "Westminster",
    postcode: "SW1E 5NX",
    phone: "020 7946 0912",
  },
];

const addressSchema = z.object({
  fullName: z.string().min(2, "Enter the recipient's full name"),
  line1: z.string().min(3, "Enter the delivery address"),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter a town or city"),
  postcode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/, "Enter a valid UK postcode"),
  phone: z.string().min(7, "Enter a contact phone number"),
});

interface StepAddressProps {
  onContinue: (address: Address) => void;
  onBack: () => void;
}

export function StepAddress({ onContinue, onBack }: StepAddressProps) {
  const [selectedId, setSelectedId] = useState<string>("default");
  const [billing, setBilling] = useState<"same" | "different">("same");
  const [smsUpdates, setSmsUpdates] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: { fullName: "", line1: "", line2: "", city: "", postcode: "", phone: "" },
  });

  function handleContinue() {
    if (selectedId !== "new") {
      const saved = SAVED_ADDRESSES.find((a) => a.id === selectedId)!;
      onContinue(saved);
      return;
    }
    handleSubmit(onContinue)();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-600">Dispatch Precision Stage</p>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
          Contact &amp; Delivery Address
        </h1>
        <p className="mt-1 text-body-md font-body-md text-text-secondary">Provide verified drop-off coordinates and site contact details.</p>
      </div>

      <div className="rounded-xl border border-border-default bg-surface-white p-5">
        <h2 className="mb-3 text-body-lg font-body-lg font-bold text-graphite-900">Site Contact Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contact-email" className="mb-1">Account &amp; Invoicing Email</Label>
            <Input id="contact-email" type="email" defaultValue="alex.turner@apexmechanical.co.uk" autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="contact-phone" className="mb-1">Mobile Number for Site Dispatch</Label>
            <Input id="contact-phone" type="tel" defaultValue="+44 7911 123456" autoComplete="tel" />
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-body-sm font-body-sm text-text-primary">
          <Checkbox checked={smsUpdates} onCheckedChange={(c) => setSmsUpdates(Boolean(c))} />
          Receive SMS delivery slot notifications from courier fleet
        </label>
      </div>

      <div className="rounded-xl border border-border-default bg-surface-white p-5">
        <h2 className="mb-3 text-body-lg font-body-lg font-bold text-graphite-900">Saved Delivery Addresses</h2>
        <RadioGroup value={selectedId} onValueChange={setSelectedId} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SAVED_ADDRESSES.map((addr) => (
            <label
              key={addr.id}
              htmlFor={`addr-${addr.id}`}
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-xl border p-4",
                selectedId === addr.id ? "border-orange-500 bg-orange-50" : "border-border-default",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="rounded bg-graphite-100 px-2 py-0.5 text-label-sm font-label-sm font-semibold uppercase text-graphite-700">
                  {addr.isDefault ? "Default Dispatch" : "Secondary Site"}
                </span>
                <RadioGroupItem value={addr.id} id={`addr-${addr.id}`} />
              </div>
              <p className="text-body-sm font-body-sm font-bold text-graphite-900">{addr.company}</p>
              <p className="text-label-sm font-label-sm text-text-secondary">
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city} {addr.postcode}
              </p>
              <p className="text-label-sm font-label-sm text-text-secondary">{addr.phone}</p>
            </label>
          ))}
          <label
            htmlFor="addr-new"
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-xl border border-dashed p-4 text-body-sm font-body-sm font-semibold text-text-primary sm:col-span-2",
              selectedId === "new" ? "border-orange-500 bg-orange-50" : "border-border-default",
            )}
          >
            <RadioGroupItem value="new" id="addr-new" />
            <span aria-hidden className="material-symbols-outlined text-[18px] text-orange-600">add_location_alt</span>
            Add a new jobsite or workshop address
          </label>
        </RadioGroup>
      </div>

      {selectedId === "new" && (
        <form className="rounded-xl border border-border-default bg-surface-white p-5" onSubmit={(e) => e.preventDefault()}>
          <h2 className="mb-3 text-body-lg font-body-lg font-bold text-graphite-900">New Address Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="new-fullName" className="mb-1">Full Name</Label>
              <Input id="new-fullName" aria-invalid={Boolean(errors.fullName)} {...register("fullName")} />
              {errors.fullName && <p role="alert" className="mt-1 text-label-sm font-label-sm text-error-500">{errors.fullName.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="new-line1" className="mb-1">Address Line 1</Label>
              <Input id="new-line1" placeholder="Building name or number and street" aria-invalid={Boolean(errors.line1)} {...register("line1")} />
              {errors.line1 && <p role="alert" className="mt-1 text-label-sm font-label-sm text-error-500">{errors.line1.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="new-line2" className="mb-1">Address Line 2 (optional)</Label>
              <Input id="new-line2" placeholder="Suite, unit, industrial bay" {...register("line2")} />
            </div>
            <div>
              <Label htmlFor="new-city" className="mb-1">City / Town</Label>
              <Input id="new-city" aria-invalid={Boolean(errors.city)} {...register("city")} />
              {errors.city && <p role="alert" className="mt-1 text-label-sm font-label-sm text-error-500">{errors.city.message}</p>}
            </div>
            <div>
              <Label htmlFor="new-postcode" className="mb-1">Postcode</Label>
              <Input id="new-postcode" aria-invalid={Boolean(errors.postcode)} {...register("postcode")} />
              {errors.postcode && <p role="alert" className="mt-1 text-label-sm font-label-sm text-error-500">{errors.postcode.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="new-phone" className="mb-1">Site Phone Number</Label>
              <Input id="new-phone" type="tel" aria-invalid={Boolean(errors.phone)} {...register("phone")} />
              {errors.phone && <p role="alert" className="mt-1 text-label-sm font-label-sm text-error-500">{errors.phone.message}</p>}
            </div>
          </div>
          {isSubmitted && Object.keys(errors).length > 0 && (
            <p role="alert" className="mt-3 text-label-sm font-label-sm text-error-500">
              Please fix the highlighted fields above before continuing.
            </p>
          )}
        </form>
      )}

      <div className="rounded-xl border border-border-default bg-surface-white p-5">
        <h2 className="mb-3 text-body-lg font-body-lg font-bold text-graphite-900">Billing Address</h2>
        <RadioGroup value={billing} onValueChange={(v) => setBilling(v as typeof billing)} className="flex flex-col gap-2">
          <label htmlFor="billing-same" className="flex items-center gap-2 rounded-lg border border-border-default p-3 text-body-sm font-body-sm">
            <RadioGroupItem value="same" id="billing-same" />
            Billing address is the same as delivery address
          </label>
          <label htmlFor="billing-different" className="flex items-center gap-2 rounded-lg border border-border-default p-3 text-body-sm font-body-sm">
            <RadioGroupItem value="different" id="billing-different" />
            Use a different billing address
          </label>
        </RadioGroup>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_back</span>
          Return to Identity
        </Button>
        <Button className="bg-orange-500 font-label-lg text-label-lg font-bold hover:bg-orange-600" onClick={handleContinue}>
          Continue to Delivery &amp; Fulfilment
          <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}
