"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DotPattern } from "@/components/ui/dot-pattern";
import { fetchTradeCtaContent, type TradeCtaContent } from "@/lib/api";

export default function TradeCTA() {
    const [tradeCta, setTradeCta] = useState<TradeCtaContent | null>(null);

    useEffect(() => {
        const getTradeCtaContent = async () => {
            const content = await fetchTradeCtaContent();
            setTradeCta(content);
        };
        getTradeCtaContent();
    }, []);

    if (!tradeCta) return null;

    return (
        <section className="relative isolate w-full overflow-hidden bg-[#080f18] text-[#9aabba]" style={{ backgroundImage: "radial-gradient(ellipse at 72% 0%, rgba(100, 139, 171, 0.08), transparent 58%), linear-gradient(115deg, #070e16 0%, #111f2c 48%, #0b1520 76%, #070e16 100%)" }}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,transparent_15%,rgba(213,234,250,0.025)_34%,transparent_52%)]" />
            <DotPattern width={32} height={32} cr={1.3} glow className="text-[#b5d7ed]/35 [mask-image:radial-gradient(ellipse_at_65%_40%,black,transparent_75%)]" />
            <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-12 sm:px-margin-desktop lg:py-16">
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)] lg:gap-7">
                <div>
                    <span className="mb-4 inline-flex items-center gap-2 rounded-sm bg-[#0c1722] px-3 py-1 text-label-sm font-label-sm font-bold uppercase tracking-wide text-orange-500">
                    <span aria-hidden className="material-symbols-outlined text-[14px]">badge</span>
                    {tradeCta.badgeLabel}
                    </span>
                    <h2 className="mb-4 text-[28px] leading-tight font-bold tracking-[-0.025em] text-text-inverse sm:text-[36px]">
                    {tradeCta.heading}
                    </h2>
                    <p className="mb-8 max-w-[650px] text-[18px] leading-7 text-[#91a3b5]">
                    {tradeCta.description}
                    </p>
                    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div className="min-h-[142px] rounded-[14px] bg-[#0e1a26] p-4">
                        <p className="text-[32px] leading-8 font-bold tracking-tight text-orange-500">{tradeCta.stat1Value}</p>
                        <p className="text-[16px] leading-6 font-semibold text-text-inverse">{tradeCta.stat1Label}</p>
                        <p className="mt-1 text-[11px] leading-6">{tradeCta.stat1Caption}</p>
                    </div>
                    <div className="min-h-[142px] rounded-[14px] bg-[#0e1a26] p-4">
                        <span aria-hidden className="material-symbols-outlined mb-2 block text-[28px] text-orange-500">
                        {tradeCta.stat2Icon}
                        </span>
                        <p className="text-[16px] leading-6 font-semibold text-text-inverse">{tradeCta.stat2Label}</p>
                        <p className="mt-1 text-[11px] leading-6">{tradeCta.stat2Caption}</p>
                    </div>
                    <div className="min-h-[142px] rounded-[14px] bg-[#0e1a26] p-4">
                        <span aria-hidden className="material-symbols-outlined mb-2 block text-[28px] text-orange-500">
                        {tradeCta.stat3Icon}
                        </span>
                        <p className="text-[16px] leading-6 font-semibold text-text-inverse">{tradeCta.stat3Label}</p>
                        <p className="mt-1 text-[11px] leading-6">{tradeCta.stat3Caption}</p>
                    </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                    <Link
                        href={tradeCta.ctaHref}
                        className="inline-flex items-center min-h-[52px] justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3 font-label-lg text-label-lg font-bold text-text-inverse transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
                    >
                        {tradeCta.ctaLabel}
                        <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                    <p className="flex items-center gap-1.5 text-label-sm font-label-sm">
                        <span aria-hidden className="material-symbols-outlined text-[16px] text-orange-500">bolt</span>
                        {tradeCta.microcopy}
                    </p>
                    </div>
                </div>
                <div className="flex min-h-[242px] flex-col rounded-2xl bg-[#0b1721] p-6">
                    <div className="mb-6 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                        <span aria-hidden className="material-symbols-outlined text-[26px] text-orange-500">
                        deployed_code
                        </span>
                        <span className="text-[20px] leading-7 font-bold text-text-inverse">{tradeCta.previewBrand}</span>
                    </span>
                    <span className="rounded-sm bg-success-500/20 px-2.5 py-0.5 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-success-500">
                        {tradeCta.previewStatus}
                    </span>
                    </div>
                    <p className="mb-1 text-label-sm font-label-sm uppercase text-[#8499ad]">Account Holder</p>
                    <p className="mb-3 text-[14px] leading-5 font-semibold text-text-inverse">{tradeCta.previewHolderName}</p>
                    <div className="mb-10 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-label-sm font-label-sm uppercase text-[#8499ad]">Credit Limit</p>
                        <p className="text-body-md font-body-md font-bold text-orange-500">{tradeCta.previewCreditLimit}</p>
                    </div>
                    <div>
                        <p className="text-label-sm font-label-sm uppercase text-[#8499ad]">Terms</p>
                        <p className="text-body-md font-body-md font-bold text-text-inverse">{tradeCta.previewTerms}</p>
                    </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-label-sm font-label-sm uppercase text-[#8499ad]">
                    <span>Card: {tradeCta.previewCardMask}</span>
                    <span>Exp: {tradeCta.previewExpiry}</span>
                    </div>
                </div>
                </div>
            </div>
        </section>
    );
}
