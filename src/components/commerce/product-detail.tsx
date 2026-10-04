"use client";

import styles from "./product-detail.module.css";
import { type UIEvent, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { Product, Review } from "@/types";
import type { ProductQuestion } from "@/lib/api";
import { ProductQuestions } from "@/components/commerce/product-questions";
import { ProductImage } from "@/components/commerce/product-image";
import { Rating } from "@/components/commerce/rating";
import { StockBadge } from "@/components/commerce/stock-badge";
import { QuantityInput } from "@/components/commerce/quantity-input";
import { QuoteRequestDialog } from "@/components/commerce/quote-request-dialog";
import { ProductCard } from "@/components/commerce/product-card";
import { RecentlyViewed } from "@/components/commerce/recently-viewed";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WriteReviewDialog } from "@/components/commerce/write-review-dialog";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const ZOOM_SCALE = 2.5;

// All values in px: the lens and photo are relative to the main image box, the pane to the buy box.
type HoverZoom = { lensX: number; lensY: number; lensW: number; lensH: number; imgX: number; imgY: number; imgW: number; imgH: number; paneW: number; paneH: number; paneTop: number };

interface ProductDetailProps {
  product: Product;
  related: Product[];
  productReviews: Review[];
  questions: ProductQuestion[];
  compatibleProducts: Product[];
}

export function ProductDetail({ product, related, productReviews, compatibleProducts, questions }: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeRelatedIndex, setActiveRelatedIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  // Product identifiers shown at the top of the specifications tab (barcode and manufacturer part number).
  const identifiers = [
    product.sku ? { label: "SKU", value: product.sku } : null,
    product.mpn ? { label: "Manufacturer part no. (MPN)", value: product.mpn } : null,
    product.gtin ? { label: "Barcode (GTIN)", value: product.gtin } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id);
  const [qty, setQty] = useState(1);
  const [hoverZoom, setHoverZoom] = useState<HoverZoom | null>(null);
  const purchaseRef = useRef<HTMLDivElement>(null);
  const relatedScrollerRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const wishlist = useCartStore((s) => s.wishlist);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const router = useRouter();

  const activeVariant = product.variants?.find((v) => v.id === variantId);
  const price = activeVariant?.priceIncVat ?? product.priceIncVat;
  const compareAt = activeVariant?.compareAtIncVat ?? product.compareAtIncVat;
  const quantityTiers = activeVariant?.quantityTiers ?? product.quantityTiers;
  const quoteVariantId = variantId ?? product.defaultVariantId;

  const galleryImages = Array.from(new Set([product.image, ...product.images].filter(Boolean)));
  const galleryItems = [
    ...galleryImages.map((url) => ({ kind: "image" as const, url, alt: product.imageAltTexts?.[url] || product.name })),
    ...(product.videos ?? []).map((url) => ({ kind: "video" as const, url, alt: "" })),
  ];
  const itemCount = Math.max(galleryItems.length, 1);
  const selectedItem = galleryItems[activeImage] ?? galleryItems[0];
  const isWished = wishlist.includes(product.id);

  // Hover zoom needs a real pointer and room beside the image for the pane.
  function trackHover(event: React.MouseEvent<HTMLDivElement>) {
    if (!window.matchMedia("(hover: hover) and (min-width: 1101px)").matches) return;
    const button = event.currentTarget;
    const img = button.querySelector("img");
    const panel = button.closest("[data-image-panel]");
    const purchase = purchaseRef.current;
    if (!img || !panel || !purchase || !img.naturalWidth) return;
    const box = button.getBoundingClientRect();
    const el = img.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const purchaseRect = purchase.getBoundingClientRect();
    // The photo as actually drawn inside the box (object-fit: contain).
    const fit = Math.min(el.width / img.naturalWidth, el.height / img.naturalHeight);
    const imgW = img.naturalWidth * fit;
    const imgH = img.naturalHeight * fit;
    const paneW = purchaseRect.width;
    const paneH = panelRect.height;
    const lensW = Math.min(paneW / ZOOM_SCALE, box.width);
    const lensH = Math.min(paneH / ZOOM_SCALE, box.height);
    setHoverZoom({
      lensX: Math.min(Math.max(event.clientX - box.left - lensW / 2, 0), box.width - lensW),
      lensY: Math.min(Math.max(event.clientY - box.top - lensH / 2, 0), box.height - lensH),
      lensW,
      lensH,
      imgX: el.left - box.left + (el.width - imgW) / 2,
      imgY: el.top - box.top + (el.height - imgH) / 2,
      imgW,
      imgH,
      paneW,
      paneH,
      paneTop: panelRect.top - purchaseRect.top,
    });
  }

  function changeGalleryBy(delta: number) {
    setActiveImage((current) => Math.min(Math.max(current + delta, 0), galleryItems.length - 1));
  }

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

  function updateRelatedIndex(event: UIEvent<HTMLDivElement>) {
    const scroller = event.currentTarget;
    const centerX = scroller.getBoundingClientRect().left + scroller.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    Array.from(scroller.children).forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - centerX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActiveRelatedIndex((current) => current === closestIndex ? current : closestIndex);
  }

  function scrollToRelated(index: number) {
    const scroller = relatedScrollerRef.current;
    const slide = scroller?.children.item(index);
    if (!scroller || !(slide instanceof HTMLElement)) return;
    const scrollerLeft = scroller.getBoundingClientRect().left;
    const slideLeft = slide.getBoundingClientRect().left;
    scroller.scrollTo({ left: scroller.scrollLeft + slideLeft - scrollerLeft });
  }

  return (
    <div className={cn(styles.page, "mx-auto max-w-[1600px] px-4 py-6 sm:px-margin-desktop")} >
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-label-sm font-label-sm text-text-secondary">
        <Link href="/" className="hover:underline">Home</Link>
        <span aria-hidden>/</span>
        <Link href={`/c/${product.categorySlug}`} className="capitalize hover:underline">{product.categorySlug.replaceAll("-", " ")}</Link>
        <span aria-hidden>/</span>
        <span className="font-semibold text-text-primary">{product.name}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.media}>
        <div className={styles.gallery}>
        <div className={styles.thumbnails}>
          {Array.from({ length: itemCount }).map((_, i) => {
            const item = galleryItems[i];
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                onMouseEnter={() => { if (item) setActiveImage(i); }}
                aria-label={item?.kind === "video" ? `View video of ${product.name}` : `View image ${i + 1} of ${product.name}`}
                aria-current={activeImage === i}
                className={cn(
                  "relative size-full cursor-pointer overflow-hidden rounded-lg border bg-white",
                  activeImage === i ? "border-orange-500" : "border-border-default",
                )}
              >
                {item?.kind === "video" ? (
                  <>
                    <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    <span aria-hidden className="material-symbols-outlined absolute inset-0 flex items-center justify-center bg-graphite-900/30 text-[20px] text-white">play_circle</span>
                  </>
                ) : (
                  <ProductImage src={item?.url} alt={item?.alt} categorySlug={product.categorySlug} className="flex h-full w-full items-center justify-center bg-white object-contain p-1" />
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.imagePanel} data-image-panel>
          <div className={styles.imageHeading}>
            <div><span className={styles.brandBadge}>{product.brand}</span><StockBadge status={product.stock} /></div>
            <span className={styles.model}>SKU: {product.sku}</span>
          </div>
          {selectedItem?.kind === "video" ? (
            <video key={selectedItem.url} src={selectedItem.url} controls className={styles.mainImage} />
          ) : (
            <div className={styles.zoomButton} onMouseMove={trackHover} onMouseLeave={() => setHoverZoom(null)} onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)} onTouchEnd={(event) => {
                  if (touchStartX === null) return;
                  const distance = event.changedTouches[0]?.clientX - touchStartX;
                  if (Math.abs(distance) > 40) changeGalleryBy(distance < 0 ? 1 : -1);
                  setTouchStartX(null);
                }}>
                  <ProductImage src={selectedItem?.url} alt={selectedItem?.kind === "image" ? selectedItem.alt : product.name} categorySlug={product.categorySlug} loading="eager" className={styles.mainImage} iconClassName="text-[72px]" />
                  {hoverZoom && <span aria-hidden className={styles.lens} style={{ width: hoverZoom.lensW, height: hoverZoom.lensH, left: hoverZoom.lensX, top: hoverZoom.lensY }} />}
            </div>
          )}
          <p className={styles.galleryCaption}>Model: {product.name} · {selectedItem?.kind === "video" ? "Product video" : "Hover to zoom"}</p>
        </div>
        </div>
        {product.specs.length > 0 && <dl className={styles.summarySpecs}>
          {product.specs.slice(0, 4).map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}
        </dl>}
        </div>

        <div className={styles.purchase} ref={purchaseRef}>
          {hoverZoom && selectedItem?.kind === "image" && (
            <div aria-hidden className={styles.zoomPane} style={{ top: hoverZoom.paneTop, width: hoverZoom.paneW, height: hoverZoom.paneH }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedItem.url}
                alt=""
                style={{
                  left: (hoverZoom.imgX - hoverZoom.lensX) * ZOOM_SCALE,
                  top: (hoverZoom.imgY - hoverZoom.lensY) * ZOOM_SCALE,
                  width: hoverZoom.imgW * ZOOM_SCALE,
                  height: hoverZoom.imgH * ZOOM_SCALE,
                }}
              />
            </div>
          )}
          <div>
            <div className="mb-1 flex items-center gap-2 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-600">
              {product.brand}
              {product.badges?.map((b) => (
                <span key={b} className="rounded bg-graphite-900 px-2 py-0.5 text-text-inverse">{b}</span>
              ))}
            </div>
            <h1 className={styles.title}>{product.name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Rating value={product.rating} count={product.reviewCount} />
              <span className="text-label-sm font-label-sm text-text-secondary">SKU: {product.sku}</span>
            </div>
          </div>

          <div className={styles.pricePanel}>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className={styles.price}>{formatPrice(price)}</span>
            {compareAt && compareAt > price && (
              <>
                <span className="text-body-md font-body-md text-text-disabled line-through">{formatPrice(compareAt)}</span>
                <span className="rounded bg-error-100 px-2 py-0.5 text-label-sm font-label-sm font-semibold text-error-500">
                  Save {formatPrice(compareAt - price)}
                </span>
              </>
            )}
          </div>
          <p className={styles.netPrice}><strong>{formatPrice(price / (1 + product.vatRate))} ex. VAT</strong><span>Price includes {Math.round(product.vatRate * 100)}% VAT</span></p>
          </div>

          {quantityTiers && quantityTiers.length > 0 && (
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
                  {quantityTiers.map((tier) => (
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
            <fieldset className={styles.configuration}>
              <legend>Select Kit Configuration</legend>
              <div className={styles.variants}>
                {product.variants.map((v) => (
                  <label key={v.id} className={cn(styles.variant, variantId === v.id && styles.selectedVariant)}>
                    <input type="radio" name={`variant-${product.id}`} value={v.id} checked={variantId === v.id} onChange={() => setVariantId(v.id)} />
                    <strong>{v.label}</strong><span>{formatPrice(v.priceIncVat)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="flex items-center gap-2">
            <StockBadge status={product.stock} count={product.stockCount} />
          </div>
          <p className="-mt-2 text-label-sm font-label-sm text-text-secondary">{product.deliveryEta}</p>

          <div className={styles.buyRow}>
            <QuantityInput value={qty} onChange={setQty} label={product.name} />
            <Button
              type="button"
              className="h-11 min-w-0 flex-1 cursor-pointer bg-orange-500 px-2 text-[12px] font-semibold text-text-inverse hover:bg-orange-600"
              disabled={product.stock === "out-of-stock"}
              onClick={handleAddToCart}
            >
              Add to Cart — {formatPrice(price * qty)}
            </Button>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="h-11 cursor-pointer bg-graphite-900 text-[12px] font-semibold text-text-inverse hover:bg-graphite-800"
            disabled={product.stock === "out-of-stock"}
            onClick={handleFastCheckout}
          >
            <span aria-hidden className="material-symbols-outlined text-[18px]">bolt</span>
            Fast Checkout with 1-Click
          </Button>

          <QuoteRequestDialog
            lines={quoteVariantId ? [{ variantId: quoteVariantId, label: activeVariant ? `${product.name} — ${activeVariant.label}` : product.name, quantity: Math.max(qty, 1) }] : []}
            className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-graphite-900/20 px-3 text-[12px] font-semibold text-graphite-900 transition-colors hover:border-orange-500 hover:text-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden className="material-symbols-outlined text-[18px]">request_quote</span>
            Ordering in bulk? Request a quote
          </QuoteRequestDialog>

          <div className={styles.secondaryActions}>
            <button
              type="button"
              onClick={() => {
                toggleWishlist(product.id);
                toast.success(isWished ? "Removed from wishlist" : "Added to wishlist");
              }}
              className="flex cursor-pointer items-center gap-1 hover:text-text-primary"
              aria-pressed={isWished}
            >
              <span aria-hidden className="material-symbols-outlined text-[18px]" style={isWished ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                favorite
              </span>
              Wishlist
            </button>
            <Link href="/compare" className="flex cursor-pointer items-center gap-1 hover:text-text-primary">
              <span aria-hidden className="material-symbols-outlined text-[18px]">compare_arrows</span>
              Compare
            </Link>
            <Link href="#reviews" className="flex cursor-pointer items-center gap-1 hover:text-text-primary">
              <span aria-hidden className="material-symbols-outlined text-[18px]">reviews</span>
              Trade FAQs
            </Link>
          </div>
        </div>
      </div>

      {product.highlights.length > 0 && (
        <section className={styles.highlights}>
          {product.highlights.map((h) => (
            <div key={h.label} className="flex flex-col items-start gap-1 rounded-xl border border-border-default bg-white p-4">
              <span aria-hidden className="material-symbols-outlined text-[24px] text-orange-600">{h.icon}</span>
              <p className="text-headline-sm font-headline-sm font-bold text-graphite-900">{h.label}</p>
              <p className="text-label-sm font-label-sm font-semibold text-text-secondary">{h.value}</p>
              <p className="text-label-sm font-label-sm text-text-disabled">{h.caption}</p>
            </div>
          ))}
        </section>
      )}

      <section className={styles.details}>
        <Tabs defaultValue="specs">
          <TabsList className={styles.tabList}>
            <TabsTrigger value="specs">Technical Specifications</TabsTrigger>
            <TabsTrigger value="box">What&apos;s in the Box</TabsTrigger>
            <TabsTrigger value="compat">System Compatibility</TabsTrigger>
            <TabsTrigger value="policy">Warranty &amp; Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="specs" className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>Technical Specifications</h2>
            {identifiers.length + product.specs.length === 0 ? (
              <p className="py-6 text-body-sm font-body-sm text-text-secondary">No technical specifications recorded for this product yet.</p>
            ) : (
              <dl className={styles.specifications}>
                {[...identifiers, ...product.specs].map((spec) => (
                  <div key={spec.label} className="flex justify-between border-b border-border-default py-2 text-body-sm font-body-sm">
                    <dt className="text-text-secondary">{spec.label}</dt>
                    <dd className="font-semibold text-text-primary">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </TabsContent>
          <TabsContent value="box" className={styles.tabContent}>
            <ul className="list-inside list-disc py-4 text-body-sm font-body-sm text-text-primary">
              {product.whatsInTheBox.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="compat" className={styles.tabContent}>
            {product.toolPlatform || compatibleProducts.length > 0 ? (
              <div className="py-6">
                {product.toolPlatform ? <p className="text-body-sm font-body-sm text-text-secondary">Part of the <span className="font-semibold text-graphite-900">{product.toolPlatform}</span> platform. Results include matching platform items and products explicitly linked as compatible.</p> : <p className="text-body-sm font-body-sm text-text-secondary">These products are explicitly linked as compatible or match the product&apos;s technical compatibility details.</p>}
                {compatibleProducts.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {compatibleProducts.map((match) => <ProductCard key={match.id} product={match} />)}
                  </div>
                ) : <p className="mt-4 rounded-lg bg-surface-warm p-4 text-body-sm font-body-sm text-text-secondary">No verified products match this platform yet. Try another category or contact support before substituting a battery or charger.</p>}
                {product.toolPlatform ? <Link href={`/c/${product.categorySlug}?platform=${encodeURIComponent(product.toolPlatform)}`} className="mt-4 inline-flex items-center gap-1 text-label-sm font-label-sm font-semibold text-orange-600 hover:underline">Shop all {product.toolPlatform} tools<span aria-hidden className="material-symbols-outlined text-[16px]">arrow_forward</span></Link> : null}
              </div>
            ) : (
              <p className="py-6 text-body-sm font-body-sm text-text-secondary">
                This product is not assigned to a manufacturer battery platform. Treat it as universal only when the product specification explicitly says so; otherwise contact support before purchasing a substitute.
              </p>
            )}
          </TabsContent>
          <TabsContent value="policy" className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>Warranty and returns</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border-default bg-surface-warm p-4">
                <h3 className="font-semibold text-graphite-900">Manufacturer warranty</h3>
                <p className="mt-2 text-body-sm font-body-sm text-text-secondary">Warranty coverage follows the manufacturer terms for this product. Keep your order number and proof of purchase for any claim.</p>
              </div>
              <div className="rounded-xl border border-border-default bg-surface-warm p-4">
                <h3 className="font-semibold text-graphite-900">Returns</h3>
                <p className="mt-2 text-body-sm font-body-sm text-text-secondary">Eligible items can be requested for return from your account after delivery. The order record determines the return window, eligibility and refund status.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {related.length > 0 && (
        <section className={styles.section}>
          <h2 className="mb-4 text-headline-sm font-headline-sm font-bold text-graphite-900">You May Also Need</h2>
          <div ref={relatedScrollerRef} className={styles.relatedProducts} onScroll={updateRelatedIndex} role="group" aria-roledescription="carousel" aria-label="You May Also Need">
            {related.map((p, index) => (
              <div key={p.id} className={styles.relatedSlide} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${related.length}: ${p.name}`}>
                <ProductCard product={p} mobileCategory className={styles.relatedCard} />
              </div>
            ))}
          </div>
          {related.length > 1 ? <div className={styles.relatedPagination} role="group" aria-label="Choose a recommended product">{related.map((item, index) => <button key={item.id} type="button" onClick={() => scrollToRelated(index)} aria-label={`Show recommended product ${index + 1}: ${item.name}`} aria-pressed={activeRelatedIndex === index}><span /></button>)}</div> : null}
        </section>
      )}

      <section id="reviews" className={styles.section}>
        <div className={`${styles.reviewHeader} mb-4`}>
          <h2 className={`${styles.reviewTitle} text-headline-sm font-headline-sm font-bold text-graphite-900`}>Customer Reviews &amp; Ratings</h2>
          <WriteReviewDialog productId={product.id} productName={product.name} productSlug={product.slug} />
        </div>
        <div className={styles.reviewLayout}>
          <div className={styles.reviewScore}>
            <p className="text-display-lg-mobile font-display-lg-mobile font-bold text-graphite-900">{product.rating.toFixed(1)}</p>
            <Rating value={product.rating} />
            <p className="mt-1 text-label-sm font-label-sm text-text-secondary">out of 5 · {product.reviewCount} trade reviews</p>
          </div>
          <ul className={styles.reviewCards}>
            {productReviews.length === 0 ? (
              <li className="text-body-sm font-body-sm text-text-secondary">No written reviews yet — be the first to review this product.</li>
            ) : (
              productReviews.map((review) => (
                <li key={review.id} className={styles.reviewCard}>
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

      <ProductQuestions productSlug={product.slug} questions={questions} className={styles.section} />
      <RecentlyViewed product={product} />
    </div>
  );
}
