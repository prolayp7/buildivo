"use client";

import { Printer, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function GuideActions({ title, kind = "guide" }: { title: string; kind?: "guide" | "article" }) {
  const label = kind === "guide" ? "guide" : "article";

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(`${label === "guide" ? "Guide" : "Article"} link copied`);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(`Could not share this ${label} from your browser.`);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button type="button" variant="outline" onClick={() => window.print()}>
        <Printer aria-hidden="true" />Print {label}
      </Button>
      <Button type="button" variant="outline" onClick={() => void share()}>
        <Share2 aria-hidden="true" />Share {label}
      </Button>
    </div>
  );
}