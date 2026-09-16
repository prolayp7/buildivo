"use client";
import Link from "next/link";
import { toast } from "sonner";
import { products } from "@/data/products";
import { useCartStore } from "@/lib/cart-store";
import { ProductImage } from "@/components/commerce/product-image";
import { formatPrice } from "@/lib/format";
const accessories = products.filter((product) => product.categorySlug === "hardware-fixings");
export function CategoryExtras() {
 const addItem = useCartStore((state) => state.addItem);
 return <>
 <section className="mt-6 border-t border-border-default bg-white py-8">
 <div className="mx-auto max-w-[1600px] px-4 sm:px-margin-desktop">
 <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div>
 <h2 className="text-[20px] font-bold text-graphite-900">Frequently Paired Site Consumables &amp; Fixings</h2>
 <p className="text-sm text-text-secondary">Keep crews operational with high-cycle masonry bits, impact bits, and diamond blades</p>
 </div><Link href="/c/hardware-fixings" className="text-xs font-semibold text-orange-600 hover:underline">Explore All Accessories →</Link></div>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {accessories.map((product) => <article key={product.id} className="flex items-center gap-3 rounded-lg border border-border-default bg-surface-warm p-3">
 <ProductImage src={product.image} categorySlug={product.categorySlug} className="size-16 shrink-0 rounded border border-border-default bg-white object-contain p-1" />
 <div className="min-w-0 flex-1"><p className="text-[10px] text-text-secondary">{product.sku}</p><h3 className="truncate text-xs font-bold" title={product.name}><Link href={`/p/${product.slug}`} className="hover:underline">{product.name}</Link></h3>
 <div className="mt-1 flex flex-wrap items-baseline gap-2"><span className="text-xs font-bold">{formatPrice(product.priceIncVat)}</span><span className="text-[10px] text-orange-700">Trade: {formatPrice(product.tradePriceIncVat! / 1.2)}</span></div></div>
 <button type="button" aria-label={`Add ${product.name} to basket`} onClick={() => { if (product.defaultVariantId) void addItem(product.defaultVariantId, 1); toast.success(`Added ${product.name} to basket`); }} className="flex size-9 shrink-0 items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"><span aria-hidden className="material-symbols-outlined text-[18px]">add</span></button>
 </article>)}
 </div></div></section>

<section className="w-full bg-surface-sunken border-t border-border-default py-10">
<div className="max-w-[1600px] mx-auto px-4 sm:px-margin-desktop">
<div className="max-w-3xl mb-8">
<span className="font-label-md text-label-md uppercase tracking-wider text-orange-600 font-bold">Contractor Intelligence</span>
<h2 className="font-headline-lg text-headline-md text-graphite-900 font-bold mt-1">
          How to Select the Right Industrial Cordless System for 2025
        </h2>
<p className="font-body-md text-body-md text-text-secondary mt-2">
          Selecting a battery infrastructure impacts tooling investment for up to a decade. Here is Buildivo&apos;s authoritative technical breakdown across motors, ampere-hours, and continuous load factors.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
<div className="bg-surface-white border border-border-default rounded-xl p-4">
<div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-mono font-bold text-label-md mb-3">01</div>
<h3 className="font-headline-sm text-[16px] font-bold text-graphite-900 mb-1.5">Platform &amp; System Lock-In</h3>
<p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
            18V XR, LXT, and M18 offer the broadest tool catalogs (over 250 tools per brand). For heavy framing and civil trenching, compare dual 18V or 54V FlexVolt systems for corded mains equivalence.
          </p>
</div>
<div className="bg-surface-white border border-border-default rounded-xl p-4">
<div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-mono font-bold text-label-md mb-3">02</div>
<h3 className="font-headline-sm text-[16px] font-bold text-graphite-900 mb-1.5">Brushless Motor Physics</h3>
<p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
            Brushless units eliminate frictional commutator drag. They generate up to 57% longer runtimes, run 20°C cooler under prolonged site stress, and require zero carbon replacement upkeep.
          </p>
</div>
<div className="bg-surface-white border border-border-default rounded-xl p-4">
<div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-mono font-bold text-label-md mb-3">03</div>
<h3 className="font-headline-sm text-[16px] font-bold text-graphite-900 mb-1.5">Ampere-Hours (Ah) Sizing</h3>
<p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
            Use 2.0Ah–3.0Ah compact packs for overhead electrical drilling to reduce wrist torque strain. Shift to 5.0Ah–8.0Ah high-output tabular cells for continuous heavy grinding and circular rip cuts.
          </p>
</div>
<div className="bg-surface-white border border-border-default rounded-xl p-4">
<div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-mono font-bold text-label-md mb-3">04</div>
<h3 className="font-headline-sm text-[16px] font-bold text-graphite-900 mb-1.5">Trade Credit &amp; Fleet Logistics</h3>
<p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
            Consolidate your firm&apos;s power tools under a single Net-30 Trade Account. Benefit from tiered 15% trade discounts, centralized serial warranty tracking, and rapid job-site van deliveries.
          </p>
</div>
</div>
<div className="mt-6 flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-border-default">
<div className="flex items-center gap-2 text-label-sm font-label-sm text-graphite-600">
<span className="material-symbols-outlined text-orange-500 text-[18px]">verified</span>
<span>Technical guide reviewed by Master Electrician &amp; Site Engineer C. Vance, March 2025</span>
</div>
<a className="font-label-sm text-label-sm text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1" href="/guides">
          Read Complete 2025 Power Tools Technical Specification Whitepaper
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>
</section>

 </>;
}
