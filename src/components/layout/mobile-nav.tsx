"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { BuildivoLogo } from "@/components/layout/buildivo-logo";
import type { Category } from "@/types";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Category[];
}

const utilityLinks = [
  { href: "/trade", label: "Trade Portal Net 30", icon: "engineering" },
  { href: "/help", label: "Help Center", icon: "help" },
  { href: "/track-order", label: "Track Order", icon: "local_shipping" },
  { href: "/branches", label: "Branch Finder", icon: "store" },
];

export function MobileNav({ open, onOpenChange, departments }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle asChild>
            <Link href="/" onClick={() => onOpenChange(false)} className="flex items-center">
              <BuildivoLogo height={48} />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav aria-label="Departments" className="flex-1 overflow-y-auto px-4">
          <p className="mb-2 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-text-disabled">Departments</p>
          <ul className="flex flex-col">
            {departments.map((dept) => (
              <li key={dept.slug}>
                <Link
                  href={`/c/${dept.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 border-b border-border-default py-3 text-body-sm font-body-sm text-text-primary"
                >
                  <span aria-hidden className="material-symbols-outlined text-[20px] text-orange-600">
                    {dept.icon}
                  </span>
                  {dept.name}
                </Link>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <ul className="flex flex-col gap-1 pb-6">
            {utilityLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => onOpenChange(false)} className="flex items-center gap-3 py-2 text-body-sm font-body-sm text-text-secondary">
                  <span aria-hidden className="material-symbols-outlined text-[18px]">
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
