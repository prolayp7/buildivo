import type { Metadata } from "next";
import { Suspense } from "react";
import { ReturnDetail } from "@/components/account/return-detail";
export const metadata: Metadata = { title: "Your return", robots: { index: false } };
export default function Page() { return <Suspense><ReturnDetail /></Suspense>; }
