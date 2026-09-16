"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { Product, Review } from "@/types";
import { ProductImage } from "@/components/commerce/product-image";
import { Rating } from "@/components/commerce/rating";
import { StockBadge } from "@/components/commerce/stock-badge";
import { QuantityInput } from "@/components/commerce/quantity-input";
import { ProductCard } from "@/components/commerce/product-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProductDetailProps {
  product: Product;
  related: Product[];
  productReviews: Review[];
}

export function ProductDetail({ product, related, productReviews }: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id);
  const [qty, setQty] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const wishlist = useCartStore((s) => s.wishlist);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const router = useRouter();

  const activeVariant = product.variants?.find((v) => v.id === variantId);
  const price = activeVariant?.priceIncVat ?? product.priceIncVat;
  const compareAt = activeVariant?.compareAtIncVat ?? product.compareAtIncVat;

  const galleryImages = Array.from(new Set([product.image, ...product.images].filter(Boolean)));
  const imageCount = Math.max(galleryImages.length, 1);
  const selectedImage = galleryImages[activeImage] ?? galleryImages[0];
  const isWished = wishlist.includes(product.id);

  function handleAddToCart() {
    const targetVariantId = variantId ?? product.defaultVariantId;
    if (!targetVariantId) return;
    void addItem(targetVariantId, qty);
    toast.success(`Added ${qty} x ${product.name} to cart`);
  }

  function handleFastCheckout() {
    const targetVariantId = variantId ?? product.defaultVariantId;
    if (!targetVariantId) return;
    void addItem(targetVariantId, qty).then(() => router.push("/checkout"));
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-margin-desktop">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-label-sm font-label-sm text-text-secondary">
        <Link href="/" className="hover:underline">Home</Link>
        <span aria-hidden>/</span>
        <Link href={`/c/power-tools`} className="hover:underline">Power Tools</Link>
        <span aria-hidden>/</span>
        <span className="font-semibold text-text-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[100px_minmax(0,480px)_1fr]">
        <div className="order-2 flex gap-2 lg:order-1 lg:flex-col">
          {Array.from({ length: imageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveImage(i)}
              aria-label={`View image ${i + 1} of ${product.name}`}
              aria-current={activeImage === i}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                activeImage === i ? "border-orange-500" : "border-border-default",
              )}
            >
              <ProductImage src={galleryImages[i]} categorySlug={product.categorySlug} className="flex h-full w-full items-center justify-center bg-white object-contain p-1" />
            </button>
          ))}
        </div>

        <div className="order-1 lg:order-2">
          <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
            <DialogTrigger asChild>
              <button type="button" className="block w-full" aria-label="Open image zoom">
                <ProductImage src={selectedImage} categorySlug={product.categorySlug} className="flex aspect-square w-full items-center justify-center rounded-xl bg-white object-contain p-4" iconClassName="text-[72px]" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{product.name}</DialogTitle>
              </DialogHeader>
              <ProductImage src={selectedImage} categorySlug={product.categorySlug} className="flex aspect-square w-full items-center justify-center rounded-xl bg-white object-contain p-4" iconClassName="text-[96px]" />
            </DialogContent>
          </Dialog>
        </div>

        <div className="order-3 flex flex-col gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-600">
              {product.brand}
              {product.badges?.map((b) => (
                <span key={b} className="rounded bg-graphite-900 px-2 py-0.5 text-text-inverse">{b}</span>
              ))}
            </div>
            <h1 className="mb-2 text-headline-md font-headline-md font-bold text-graphite-900">{product.name}</h1>
            <div className="flex items-center gap-3">
              <Rating value={product.rating} count={product.reviewCount} />
              <span className="text-label-sm font-label-sm text-text-secondary">SKU: {product.sku}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-headline-lg font-headline-lg font-bold text-orange-600">{formatPrice(price)}</span>
            {compareAt && compareAt > price && (
              <>
                <span className="text-body-md font-body-md text-text-disabled line-through">{formatPrice(compareAt)}</span>
                <span className="rounded bg-error-100 px-2 py-0.5 text-label-sm font-label-sm font-semibold text-error-500">
                  Save {formatPrice(compareAt - price)}
                </span>
              </>
            )}
          </div>
          <p className="-mt-3 text-label-sm font-label-sm text-text-secondary">{formatPrice(price / (1 + product.vatRate))} ex. VAT</p>

          {product.tradePriceIncVat && (
            <div className="rounded-lg border border-graphite-700 bg-graphite-800 p-3 text-text-inverse">
              <p className="text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-500">Trade Account Tier 2 Pricing</p>
              <p className="text-headline-sm font-headline-sm font-bold">{formatPrice(product.tradePriceIncVat)}</p>
              <Link href="/trade" className="text-label-sm font-label-sm text-orange-400 hover:underline">
                Sign in to Trade Account
              </Link>
            </div>
          )}

          {product.quantityTiers && product.quantityTiers.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-border-default">
              <table className="w-full text-label-sm font-label-sm">
                <thead className="bg-surface-container-low text-text-secondary">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Quantity</th>
                    <th className="px-3 py-2 text-left font-semibold">Price (ex. VAT)</th>
                    <th className="px-3 py-2 text-left font-semibold">Saving</th>
                  </tr>
                </thead>
                <tbody>
                  {product.quantityTiers.map((tier) => (
                    <tr key={tier.minQty} className="border-t border-border-default">
                      <td className="px-3 py-2">{tier.minQty}+ Units</td>
                      <td className="px-3 py-2">{formatPrice(tier.unitPriceExVat)}</td>
                      <td className="px-3 py-2 text-success-500">{tier.savePct > 0 ? `Save ${tier.savePct}%` : "Base Price"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {product.variants && product.variants.length > 0 && (
            <div>
              <Label htmlFor="variant-select" className="mb-1 text-label-md font-label-md font-semibold text-graphite-900">
                Select Kit Configuration
              </Label>
              <select
                id="variant-select"
                value={variantId}
                onChange={(e) => setVariantId(Number(e.target.value))}
                className="h-11 w-full rounded-lg border border-border-default bg-surface-white px-3 text-body-sm font-body-sm"
              >
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label} — {formatPrice(v.priceIncVat)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <StockBadge status={product.stock} count={product.stockCount} />
          </div>
          <p className="-mt-2 text-label-sm font-label-sm text-text-secondary">{product.deliveryEta}</p>

          <div className="flex items-center gap-3">
            <QuantityInput value={qty} onChange={setQty} label={product.name} />
            <Button
              type="button"
              className="h-11 flex-1 bg-orange-500 font-label-lg text-label-lg font-bold text-text-inverse hover:bg-orange-600"
              disabled={product.stock === "out-of-stock"}
              onClick={handleAddToCart}
            >
              Add to Cart — {formatPrice(price * qty)}
            </Button>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="h-11 bg-graphite-900 font-label-lg text-label-lg font-bold text-text-inverse hover:bg-graphite-800"
            disabled={product.stock === "out-of-stock"}
            onClick={handleFastCheckout}
          >
            <span aria-hidden className="material-symbols-outlined text-[18px]">bolt</span>
            Fast Checkout with 1-Click
          </Button>

          <div className="flex items-center justify-between text-label-sm font-label-sm text-text-secondary">
            <button
              type="button"
              onClick={() => {
                toggleWishlist(product.id);
                toast.success(isWished ? "Removed from wishlist" : "Added to wishlist");
              }}
              className="flex items-center gap-1 hover:text-text-primary"
              aria-pressed={isWished}
            >
              <span aria-hidden className="material-symbols-outlined text-[18px]" style={isWished ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                favorite
              </span>
              Wishlist
            </button>
            <Link href="/compare" className="flex items-center gap-1 hover:text-text-primary">
              <span aria-hidden className="material-symbols-outlined text-[18px]">compare_arrows</span>
              Compare
            </Link>
            <Link href="#reviews" className="flex items-center gap-1 hover:text-text-primary">
              <span aria-hidden className="material-symbols-outlined text-[18px]">reviews</span>
              Trade FAQs
            </Link>
          </div>
        </div>
      </div>

      {product.highlights.length > 0 && (
        <section className="mt-12 grid grid-cols-2 gap-4 border-t border-border-default pt-8 lg:grid-cols-4">
          {product.highlights.map((h) => (
            <div key={h.label} className="flex flex-col items-start gap-1 rounded-xl border border-border-default p-4">
              <span aria-hidden className="material-symbols-outlined text-[24px] text-orange-600">{h.icon}</span>
              <p className="text-headline-sm font-headline-sm font-bold text-graphite-900">{h.label}</p>
              <p className="text-label-sm font-label-sm font-semibold text-text-secondary">{h.value}</p>
              <p className="text-label-sm font-label-sm text-text-disabled">{h.caption}</p>
            </div>
          ))}
        </section>
      )}

      <section className="mt-12 border-t border-border-default pt-8">
        <Tabs defaultValue="specs">
          <TabsList>
            <TabsTrigger value="specs">Technical Specifications</TabsTrigger>
            <TabsTrigger value="box">What&apos;s in the Box</TabsTrigger>
            <TabsTrigger value="manuals">Manuals &amp; Downloads</TabsTrigger>
            <TabsTrigger value="compat">System Compatibility</TabsTrigger>
          </TabsList>
          <TabsContent value="specs">
            {product.specs.length === 0 ? (
              <p className="py-6 text-body-sm font-body-sm text-text-secondary">No technical specifications recorded for this product yet.</p>
            ) : (
              <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between border-b border-border-default py-2 text-body-sm font-body-sm">
                    <dt className="text-text-secondary">{spec.label}</dt>
                    <dd className="font-semibold text-text-primary">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </TabsContent>
          <TabsContent value="box">
            <ul className="list-inside list-disc py-4 text-body-sm font-body-sm text-text-primary">
              {product.whatsInTheBox.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="manuals">
            <p className="py-6 text-body-sm font-body-sm text-text-secondary">
              No manual has been attached to this prototype listing yet. In production this tab lists downloadable PDF manuals and safety data sheets.
            </p>
          </TabsContent>
          <TabsContent value="compat">
            <p className="py-6 text-body-sm font-body-sm text-text-secondary">
              Compatibility data (battery platform, accessory fit) has not been modelled for this prototype listing yet.
            </p>
          </TabsContent>
        </Tabs>
      </section>

      {related.length > 0 && (
        <section className="mt-12 border-t border-border-default pt-8">
          <h2 className="mb-4 text-headline-sm font-headline-sm font-bold text-graphite-900">Frequently Bought Together</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section id="reviews" className="mt-12 border-t border-border-default pt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-headline-sm font-headline-sm font-bold text-graphite-900">Customer Reviews &amp; Ratings</h2>
          <WriteReviewDialog productName={product.name} />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <div>
            <p className="text-display-lg-mobile font-display-lg-mobile font-bold text-graphite-900">{product.rating.toFixed(1)}</p>
            <Rating value={product.rating} />
            <p className="mt-1 text-label-sm font-label-sm text-text-secondary">out of 5 · {product.reviewCount} trade reviews</p>
          </div>
          <ul className="flex flex-col gap-6">
            {productReviews.length === 0 ? (
              <li className="text-body-sm font-body-sm text-text-secondary">No written reviews yet — be the first to review this product.</li>
            ) : (
              productReviews.map((review) => (
                <li key={review.id} className="border-b border-border-default pb-6">
                  <div className="mb-1 flex items-center gap-2">
                    <Rating value={review.rating} />
                    {review.verified && (
                      <span className="rounded bg-success-100 px-2 py-0.5 text-label-sm font-label-sm font-semibold text-success-500">Verified Buyer</span>
                    )}
                  </div>
                  <p className="mb-1 text-body-sm font-body-sm font-bold text-text-primary">{review.title}</p>
                  <p className="mb-2 text-body-sm font-body-sm text-text-secondary">{review.body}</p>
                  <p className="text-label-sm font-label-sm text-text-disabled">
                    {review.author} · {review.date} · {review.helpfulCount} found this helpful
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

function WriteReviewDialog({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSubmitted(false);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Write a Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {productName}</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <p className="py-4 text-body-sm font-body-sm text-success-500">Thanks — your review has been submitted for moderation.</p>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              toast.success("Review submitted");
            }}
          >
            <div>
              <Label htmlFor="review-title" className="mb-1">Title</Label>
              <input id="review-title" required className="h-10 w-full rounded-md border border-border-default px-3 text-body-sm" />
            </div>
            <div>
              <Label htmlFor="review-body" className="mb-1">Your review</Label>
              <Textarea id="review-body" required rows={4} />
            </div>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              Submit Review
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
