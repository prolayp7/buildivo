"use client";

import Link from "next/link";
import styles from "./category-mobile.module.css";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { ProductImage } from "@/components/commerce/product-image";
import { Rating } from "@/components/commerce/rating";
import { Price } from "@/components/commerce/price";
import { StockBadge } from "@/components/commerce/stock-badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice, CURRENCY_SYMBOL } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
  featured?: boolean;
  mobileCategory?: boolean;
  className?: string;
}

export function ProductCard({ product, layout = "grid", className, mobileCategory = false }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const wishlist = useCartStore((s) => s.wishlist);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const compare = useCartStore((s) => s.compare);
  const toggleCompare = useCartStore((s) => s.toggleCompare);
  const isWished = wishlist.includes(product.id);
  const isCompared = compare.includes(product.id);
  const cardSpecs = [
    ...product.highlights.map((highlight) => ({ label: highlight.value, value: highlight.label })),
    ...product.specs.filter((spec) => !product.highlights.some((highlight) => highlight.label === spec.value)),
  ].slice(0, 3);
  const onSale = Boolean(product.compareAtIncVat && product.compareAtIncVat > product.priceIncVat);
  const href = `/p/${product.slug}`;

  function handleAddToCart() {
    if (!product.defaultVariantId) return;
    void addItem(product.defaultVariantId, 1);
    toast.success(`Added ${product.name} to cart`);
  }

  function handleToggleWishlist() {
    toggleWishlist(product.id);
    toast.success(isWished ? `Removed ${product.name} from saved items` : `Saved ${product.name}`);
  }

  function handleToggleCompare() {
    if (!isCompared && compare.length >= 4) {
      toast.error("You can compare up to 4 products. Remove one to add another.");
      return;
    }
    toggleCompare(product.id);
    if (!isCompared) toast.success(`Added ${product.name} to compare`);
  }

  const addToCartButton = (
    <Button
      type="button"
      className="bg-orange-500 font-label-lg text-label-lg font-bold text-text-inverse hover:bg-orange-600"
      disabled={product.stock === "out-of-stock"}
      onClick={handleAddToCart}
    >
      <span aria-hidden className="material-symbols-outlined text-[18px]">
        shopping_bag
      </span>
      {product.stock === "out-of-stock" ? "Out of Stock" : "Add to Cart"}
    </Button>
  );

  const wishlistButton = (
    <button
      type="button"
      onClick={handleToggleWishlist}
      aria-pressed={isWished}
      aria-label={isWished ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-white/90 text-graphite-600 shadow-sm transition-colors hover:text-orange-600"
    >
      <Heart aria-hidden="true" className="block size-[18px] shrink-0" strokeWidth={2} fill={isWished ? "currentColor" : "none"} />
    </button>
  );

  if (layout === "list") {
    return (
      <article
        className={cn(
          "flex flex-col gap-4 rounded-xl border border-border-default bg-surface-white p-3 transition-shadow hover:shadow-md sm:flex-row sm:items-center",
          className,
        )}
      >
        <div className="relative h-28 w-28 shrink-0 self-center overflow-hidden rounded-lg bg-surface-container-low sm:self-auto">
          {product.badges?.[0] && (
            <span className="absolute left-1 top-1 z-10 rounded bg-graphite-900 px-1.5 py-0.5 text-label-sm font-label-sm font-semibold text-text-inverse">
              {product.badges[0]}
            </span>
          )}
          <Link href={href} className="block h-full w-full">
            <ProductImage src={product.image} categorySlug={product.categorySlug} className="h-full w-full object-cover object-center" />
          </Link>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-label-sm font-label-sm font-semibold uppercase tracking-wide text-text-secondary">{product.brand}</p>
          <h3 className="mb-1 text-body-sm font-body-sm font-semibold text-text-primary">
            <Link href={href} className="hover:underline focus-visible:underline">
              {product.name}
            </Link>
          </h3>
          <Rating value={product.rating} count={product.reviewCount} className="mb-1" />
          {product.specs.length > 0 && (
            <dl className="flex flex-wrap gap-x-3 gap-y-0.5 text-label-sm font-label-sm text-text-secondary">
              {product.specs.slice(0, 3).map((spec) => (
                <div key={spec.label} className="flex gap-1">
                  <dt className="text-text-disabled">{spec.label}:</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="flex shrink-0 flex-row items-center gap-4 sm:flex-col sm:items-end">
          <div className="flex flex-col sm:items-end">
            <StockBadge status={product.stock} className="mb-1" />
            <Price priceIncVat={product.priceIncVat} compareAtIncVat={product.compareAtIncVat} vatRate={product.vatRate} size="sm" />
            {product.tradePriceIncVat && (
              <p className="text-label-sm font-label-sm text-graphite-600">
                Trade: <span className="font-semibold">{CURRENCY_SYMBOL}{product.tradePriceIncVat.toFixed(2)}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {wishlistButton}
            {addToCartButton}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-border-default bg-surface-white p-3 transition-shadow hover:shadow-md",
        mobileCategory && styles.card,
        className,
      )}
    >
      {mobileCategory && <div className={styles.cardActions}>
        {product.badges?.[0] && <span>{product.badges[0]}</span>}
        <div>{wishlistButton}<button type="button" onClick={handleToggleCompare} aria-pressed={isCompared} aria-label={`${isCompared ? "Remove" : "Add"} ${product.name} ${isCompared ? "from" : "to"} comparison`}><span aria-hidden className="material-symbols-outlined">{isCompared ? "check" : "compare_arrows"}</span></button></div>
      </div>}
      <div data-card-image className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-surface-container-low">
        {product.badges?.[0] && (
          <span className="absolute left-2 top-2 z-10 rounded bg-graphite-900 px-2 py-1 text-label-sm font-label-sm font-semibold text-text-inverse">
            {product.badges[0]}
          </span>
        )}
        <div className="absolute right-2 top-2 z-10">{wishlistButton}</div>
        <Link href={href} className="block h-full w-full" tabIndex={-1}>
          <ProductImage src={product.image} categorySlug={product.categorySlug} className="flex h-full w-full items-center justify-center object-cover object-center" />
        </Link>
        {mobileCategory && <div className={styles.imageStock}><StockBadge status={product.stock} count={product.stockCount} /></div>}
      </div>

      {(
        <div className="flex flex-1 flex-col">
          {mobileCategory && <p className={styles.brandSku}>{[product.brand, product.sku].filter(Boolean).join(" · ")}</p>}
          <Rating value={product.rating} count={product.reviewCount} className={cn("mb-1", mobileCategory && styles.cardRating)} />
          <h3 className="mb-4 line-clamp-2 min-h-10 text-[14px] leading-5 font-bold text-graphite-900">
            <Link href={href} className="hover:text-orange-600 focus-visible:underline" title={product.name}>{product.name}</Link>
          </h3>
          {cardSpecs.length > 0 && (
            <dl data-card-specs className="mb-3 grid min-h-[72px] grid-cols-3 items-stretch rounded-lg bg-surface-container-low px-1 py-3">
              {cardSpecs.map((spec, index) => (
                <div key={`${spec.label}-${index}`} className={cn("min-w-0 px-1.5 text-center", index > 0 && "border-l border-border-default")}>
                  <dt className="mb-1 truncate text-[10px] leading-3 text-text-secondary" title={spec.label}>{spec.label}</dt>
                  <dd className="text-[11px] leading-4 font-bold text-graphite-900 [overflow-wrap:anywhere]">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <div data-card-purchase className="mt-auto">
            <p className={cn("mb-2 flex items-center gap-1.5 text-[10px] leading-4 font-medium", product.stock === "low-stock" ? "text-warning-500" : product.stock === "out-of-stock" ? "text-error-500" : "text-success-500")}>
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
              {product.stock === "out-of-stock" ? "Out of Stock" : product.stock === "backorder" ? "Available on Backorder" : product.stock === "low-stock" ? `Low Stock${product.stockCount !== undefined ? ` — ${product.stockCount} left` : ""}` : `In Stock${product.stockCount !== undefined ? ` (${product.stockCount} available)` : ""}`}
            </p>
            <p className="mb-2 flex items-start gap-1.5 text-[10px] leading-4 text-text-secondary">
              <span aria-hidden className="material-symbols-outlined text-[14px] text-orange-500">{product.deliveryEta.toLowerCase().includes("collect") ? "storefront" : "local_shipping"}</span>
              {product.deliveryEta}
            </p>
            <div className="mb-1 flex flex-wrap items-baseline gap-2 border-t border-border-default pt-2">
              <span className={cn("text-[26px] leading-8 font-bold tracking-tight", onSale ? "text-orange-600" : "text-graphite-900")}>{formatPrice(product.priceIncVat)}</span>
              {onSale && <span className="text-[11px] text-text-secondary line-through">{formatPrice(product.compareAtIncVat!)}</span>}
            </div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-1 text-[10px] leading-4">
              <span className="text-text-secondary">Inc. {Math.round(product.vatRate * 100)}% VAT</span>
              <span className="font-semibold text-graphite-900">{product.tradePriceIncVat !== undefined ? "Trade: " : ""}{formatPrice((product.tradePriceIncVat ?? product.priceIncVat) / (1 + product.vatRate))} <span data-vat-suffix>ex. VAT</span></span>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_40px] gap-2">
              <Button type="button" onClick={handleAddToCart} disabled={product.stock === "out-of-stock"} className="h-10 cursor-pointer rounded-xl bg-orange-500 px-2 text-[12px] font-semibold text-white hover:bg-orange-600">
                <span aria-hidden className="material-symbols-outlined text-[18px]">shopping_cart</span>
                {product.stock === "out-of-stock" ? "Out of Stock" : "Quick Add"}
              </Button>
              <Link href={href} aria-label={`View ${product.name}`} className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-surface-container-low text-graphite-600 transition-colors hover:bg-orange-100 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-orange-500">
                <span aria-hidden className="material-symbols-outlined text-[18px]">visibility</span>
              </Link>
            </div>
            <button type="button" onClick={handleToggleCompare} aria-pressed={isCompared} aria-label={`${isCompared ? "Remove" : "Add"} ${product.name} ${isCompared ? "from" : "to"} comparison`} className={cn("mt-2 flex min-h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500", isCompared ? "border-orange-500 bg-orange-50 text-orange-700" : "border-border-default bg-white text-graphite-400 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700")}>
              <span aria-hidden className="material-symbols-outlined text-[16px]">{isCompared ? "check" : "compare_arrows"}</span>
              {isCompared ? "Added to compare" : "Compare"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
