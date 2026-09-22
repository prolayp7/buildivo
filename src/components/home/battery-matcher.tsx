"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { powerToolsSubcategories } from "@/data/categories";
import { ECOSYSTEM_MATCHER_DEFAULTS, type EcosystemMatcherContent } from "@/components/home/ecosystem-matcher-content";

const brands = [
  { value: "DeWalt 18V XR", label: "DeWalt (18V / 54V FlexVolt)" },
  { value: "Milwaukee M18", label: "Milwaukee M18 (18V)" },
  { value: "Makita LXT 18V", label: "Makita LXT (18V)" },
  { value: "Bosch Professional 18V", label: "Bosch Professional (18V)" },
];
const popularPlatforms = [
  { value: "DeWalt 18V XR", label: "DeWalt 18V XR (840 tools)" },
  { value: "Makita LXT 18V", label: "Makita 18V LXT (910 tools)" },
  { value: "Milwaukee M18", label: "Milwaukee M18 (720 tools)" },
];

export function BatteryMatcher({ content = ECOSYSTEM_MATCHER_DEFAULTS }: { content?: EcosystemMatcherContent }) {
  const [brand, setBrand] = useState(brands[0].value);
  const [category, setCategory] = useState("power-tools");
  const router = useRouter();

  return (
    <section aria-labelledby="battery-matcher-heading" className="rounded-3xl bg-[linear-gradient(110deg,#ffffff_55%,#fff8f2_100%)] p-6 shadow-[0_2px_4px_rgb(0_0_0/0.12)] sm:p-10 lg:p-12">
      <div className="grid items-center gap-8 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:gap-12">
      <div className="min-w-0">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-graphite-900 px-3 py-1 text-[11px] leading-4 font-bold text-white uppercase">
        <span aria-hidden className="material-symbols-outlined text-[14px] text-orange-500">battery_charging_full</span>
        {content.badgeLabel}
      </span>
      <h2 id="battery-matcher-heading" className="mb-3 text-[28px] leading-tight font-bold tracking-tight text-graphite-900 sm:text-[36px]">{content.heading}</h2>
      <p className="mb-8 max-w-[780px] text-body-md font-body-md text-text-secondary">
        {content.description}
      </p>
      <form onSubmit={(event) => { event.preventDefault(); router.push(`/c/${category}?platform=${encodeURIComponent(brand)}`); }} className="grid max-w-[768px] grid-cols-1 items-end gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="battery-brand" className="mb-1 text-label-sm font-label-sm font-semibold text-graphite-900">1. Select Brand</Label>
          <select id="battery-brand" value={brand} onChange={(event) => setBrand(event.target.value)} className="h-12 w-full rounded-xl border-0 bg-surface-container-low px-3 text-[12px] font-semibold text-graphite-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500">
            {brands.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="battery-category" className="mb-1 text-label-sm font-label-sm font-semibold text-graphite-900">2. Target Tool Category</Label>
          <select id="battery-category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full rounded-xl border-0 bg-surface-container-low px-3 text-[12px] font-semibold text-graphite-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500">
            <option value="power-tools">All Compatible Bare Tools</option>
            {powerToolsSubcategories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </div>
        <Button type="submit" className="h-12 rounded-xl bg-orange-500 text-[14px] font-semibold text-white hover:bg-orange-600">
          <span aria-hidden className="material-symbols-outlined text-[20px]">tune</span>
          {brand === brands[0].value && category === "power-tools" ? "Filter 1,420 Tools" : "Filter Compatible Tools"}
        </Button>
      </form>
      <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] leading-4">
        <span className="mr-1 text-text-secondary">Popular platforms:</span>
        {popularPlatforms.map((platform) => (
          <button key={platform.value} type="button" onClick={() => setBrand(platform.value)} aria-pressed={brand === platform.value} className="min-h-7 rounded-full bg-surface-container-low px-3 py-1 text-graphite-900 transition-colors hover:bg-orange-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500">
            {platform.label}
          </button>
        ))}
      </div>
      </div>
      <aside aria-labelledby="bare-tools-cta" className="relative overflow-hidden rounded-2xl bg-graphite-900 p-7 text-white shadow-[0_12px_28px_rgb(8_13_18/0.12)]">
        <span aria-hidden className="material-symbols-outlined pointer-events-none absolute -right-5 -top-4 rotate-12 text-[150px] text-white/[0.04]">battery_charging_full</span>
        <div className="relative">
          <div className="mb-6 flex items-center gap-3">
            <span aria-hidden className="material-symbols-outlined flex size-11 items-center justify-center rounded-xl bg-orange-500 text-[26px] text-white">battery_charging_full</span>
            <p className="text-xs font-semibold text-orange-500">{brand}</p>
          </div>
          <h3 id="bare-tools-cta" className="max-w-[240px] text-[28px] leading-8 font-bold tracking-tight">{content.previewHeading}</h3>
          <p className="mt-3 text-sm leading-6 text-text-inverse-muted">{content.previewDescription}</p>
          <Link href={`/c/${category}?platform=${encodeURIComponent(brand)}`} className="mt-6 flex min-h-12 items-center justify-between gap-3 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500">
            {content.previewCtaLabel}
            <span aria-hidden className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
          <p className="mt-3 text-[11px] leading-4 text-text-inverse-muted">{content.previewCaption}</p>
        </div>
      </aside>
      </div>
    </section>
  );
}
