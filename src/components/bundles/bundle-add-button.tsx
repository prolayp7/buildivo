"use client";

import { useState, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";

export function BundleAddButton({ slug, title, className, children }: { slug: string; title: string; className?: string; children: ReactNode }) {
  const addBundle = useCartStore((state) => state.addBundle);
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    try {
      await addBundle(slug);
      toast.success(`Added ${title} to your cart`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "This bundle couldn't be added. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={() => void add()} disabled={busy} className={className}>
      {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
