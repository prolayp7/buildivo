import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  icon: string;
  title: string;
  description: string;
}

/**
 * Honest placeholder for areas outside this pass's scope (only the 7 screens
 * with real Stitch design files were built pixel-faithfully — see README).
 * Renders real content rather than a dead `href="#"` link.
 */
export function ComingSoon({ icon, title, description }: ComingSoonProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-margin-desktop">
      <span aria-hidden className="material-symbols-outlined text-[56px] text-orange-500">
        {icon}
      </span>
      <h1 className="text-headline-md font-headline-md font-bold text-graphite-900">{title}</h1>
      <p className="text-body-md font-body-md text-text-secondary">{description}</p>
      <Button asChild className="bg-orange-500 hover:bg-orange-600">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
