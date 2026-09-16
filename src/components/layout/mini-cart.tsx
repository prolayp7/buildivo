"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/commerce/product-image";
import { QuantityInput } from "@/components/commerce/quantity-input";
import { formatPrice } from "@/lib/format";
import { lineProduct, lineUnitPrice, useCartStore, useCartTotals } from "@/lib/cart-store";

interface MiniCartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MiniCart({ open, onOpenChange }: MiniCartProps) {
  const { activeLines, subtotal } = useCartTotals();
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart ({activeLines.reduce((n, l) => n + l.qty, 0)})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {activeLines.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span aria-hidden className="material-symbols-outlined text-[40px] text-graphite-200">
                shopping_bag
              </span>
              <p className="text-body-md font-body-md text-text-secondary">Your cart is empty.</p>
              <Button asChild onClick={() => onOpenChange(false)}>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {activeLines.map((line) => {
                const product = lineProduct(line);
                if (!product) return null;
                return (
                  <li key={`${line.productId}-${line.variantId ?? "base"}`} className="flex gap-3 border-b border-border-default pb-4">
                    <ProductImage src={product.image} categorySlug={product.categorySlug} className="h-16 w-16 shrink-0 rounded-lg" />
                    <div className="flex flex-1 flex-col gap-1">
                      <Link href={`/p/${product.slug}`} onClick={() => onOpenChange(false)} className="line-clamp-2 text-body-sm font-body-sm font-semibold hover:underline">
                        {product.name}
                      </Link>
                      <p className="text-label-sm font-label-sm text-text-secondary">{formatPrice(lineUnitPrice(line))} each</p>
                      <div className="mt-1 flex items-center justify-between">
                        <QuantityInput
                          value={line.qty}
                          onChange={(qty) => setQty(line.productId, qty, line.variantId)}
                          label={product.name}
                          className="scale-90 origin-left"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(line.productId, line.variantId)}
                          className="text-label-sm font-label-sm text-error-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {activeLines.length > 0 && (
          <SheetFooter className="border-t border-border-default">
            <div className="mb-2 flex items-center justify-between text-body-md font-body-md">
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-headline-sm text-headline-sm font-bold text-orange-600">{formatPrice(subtotal)}</span>
            </div>
            <Button asChild className="w-full bg-orange-500 font-label-lg text-label-lg font-bold hover:bg-orange-600" onClick={() => onOpenChange(false)}>
              <Link href="/cart">View Cart & Checkout</Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
