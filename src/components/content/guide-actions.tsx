"use client";

import { Printer, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function GuideActions({ title }: { title: string }) {
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Guide link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Could not share this guide from your browser.");
    }
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button type="button" variant="outline" onClick={() => window.print()}>
        <Printer aria-hidden="true" />Print guide
      </Button>
      <Button type="button" variant="outline" onClick={() => void share()}>
        <Share2 aria-hidden="true" />Share guide
      </Button>
    </div>
  );
}