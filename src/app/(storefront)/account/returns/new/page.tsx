import type { Metadata } from "next";
import { Suspense } from "react";
import { ReturnFlow } from "@/components/account/return-flow";
export const metadata: Metadata = { title: "Return products", robots: { index: false } };
export default function Page() { return <Suspense><ReturnFlow /></Suspense>; }
