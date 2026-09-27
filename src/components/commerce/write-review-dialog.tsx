"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const RATING_WORDS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

/** Sends a real review (held for moderation by the shop). Signed-out visitors are asked to sign in first. */
export function WriteReviewDialog({ productId, productName, productSlug }: { productId: number; productName: string; productSlug: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    setRating(0); setTitle(""); setComment(""); setError(""); setNeedsSignIn(false); setDone(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!rating) return setError("Choose a star rating.");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/customer-session/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, rating, title, comment }) });
      const body = await response.json().catch(() => ({}));
      if (response.status === 401) return setNeedsSignIn(true);
      if (!response.ok) return setError(body.message ?? "Your review could not be submitted.");
      setDone(true);
    } catch {
      setError("Could not reach the shop. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">Write a Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {productName}</DialogTitle>
        </DialogHeader>
        {done ? (
          <p role="status" className="py-4 text-body-sm font-body-sm text-success-500">Thanks - your review has been submitted and will appear once our team has approved it.</p>
        ) : needsSignIn ? (
          <div className="py-2 text-body-sm font-body-sm">
            <p>Please sign in to review this product - it helps us keep reviews genuine.</p>
            <Button asChild className="mt-3 bg-orange-500 hover:bg-orange-600"><Link href={`/login?next=${encodeURIComponent(`/p/${productSlug}`)}`}>Sign in</Link></Button>
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <fieldset>
              <legend className="mb-1 text-label-md font-label-md font-semibold">Your rating</legend>
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? "s" : ""}`} onClick={() => setRating(value)} className="rounded p-0.5 focus-visible:outline-2 focus-visible:outline-orange-500">
                    <Star aria-hidden className={cn("size-7", value <= rating ? "fill-orange-500 text-orange-500" : "text-graphite-200")} />
                  </button>
                ))}
                {rating > 0 && <span className="ml-2 text-label-md font-label-md text-text-secondary">{RATING_WORDS[rating - 1]}</span>}
              </div>
            </fieldset>
            <div>
              <Label htmlFor="review-title" className="mb-1">Title (optional)</Label>
              <input id="review-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} className="h-10 w-full rounded-md border border-border-default px-3 text-body-sm" />
            </div>
            <div>
              <Label htmlFor="review-body" className="mb-1">Your review (optional)</Label>
              <Textarea id="review-body" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} rows={4} />
            </div>
            {error && <p role="alert" className="text-body-sm font-body-sm text-error-500">{error}</p>}
            <Button type="submit" disabled={busy} className="bg-orange-500 hover:bg-orange-600">{busy ? "Submitting…" : "Submit Review"}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
