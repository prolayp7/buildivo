"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Category } from "@/types";

export function DepartmentsMenu({ departments }: { departments: Category[] }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedByHover = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }

  function scheduleClose() {
    cancelClose();
    // Allow the pointer to cross the small gap between trigger and popover.
    closeTimer.current = setTimeout(() => {
      if (!contentRef.current?.contains(document.activeElement)) setOpen(false);
    }, 180);
  }

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  return (
    <Popover open={open} onOpenChange={(nextOpen) => {
      cancelClose();
      openedByHover.current = false;
      setOpen(nextOpen);
    }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onPointerEnter={(event) => {
            if (event.pointerType !== "mouse") return;
            cancelClose();
            if (!open) {
              openedByHover.current = true;
              setOpen(true);
            }
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") scheduleClose();
          }}
          className="hidden items-center gap-2 rounded-lg bg-graphite-800 px-space-md py-2.5 text-text-inverse transition-colors hover:bg-graphite-700 lg:flex"
        >
          <span aria-hidden className="material-symbols-outlined text-[20px]">
            roofing
          </span>
          <span className="text-label-lg font-label-lg font-semibold">Departments</span>
          <span aria-hidden className="material-symbols-outlined text-[18px]">
            expand_more
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        align="start"
        className="w-[min(90vw,640px)] p-4"
        onPointerEnter={cancelClose}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") scheduleClose();
        }}
        onOpenAutoFocus={(event) => {
          if (openedByHover.current) event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          if (openedByHover.current) event.preventDefault();
        }}
      >
        <p className="mb-3 px-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-text-disabled">Shop by Department</p>
        <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          {departments.map((dept) => (
            <li key={dept.slug}>
              <Link
                href={`/c/${dept.slug}`}
                onClick={() => {
                  cancelClose();
                  setOpen(false);
                }}
                className="flex items-center gap-2.5 rounded-lg p-2.5 text-body-sm font-body-sm text-text-primary transition-colors hover:bg-surface-container-low"
              >
                <span aria-hidden className="material-symbols-outlined text-[20px] text-orange-600">
                  {dept.icon}
                </span>
                <span className="flex flex-col">
                  {dept.name}
                  <span className="text-label-sm font-label-sm text-text-disabled">{dept.productCount.toLocaleString()}+ lines</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
