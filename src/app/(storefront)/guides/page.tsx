import type { Metadata } from "next";
import { GuidesHub } from "@/components/guides/guides-hub";
import { fetchBlogPosts, fetchCalculatorsContent, fetchGeneralSettings, fetchProjectKitsContent } from "@/lib/api";

export const metadata: Metadata = {
  title: "DIY Guides & Project Plans",
  description: "Step-by-step project guides, materials lists, and estimating tools for trade and DIY work.",
  alternates: { canonical: "/guides" },
};

export default async function GuidesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; category?: string; sort?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const search = typeof params.search === "string" ? params.search.trim().slice(0, 120) : "";
  const category = typeof params.category === "string" ? params.category : "";
  const sort = params.sort === "cost-low" || params.sort === "materials-high" ? params.sort : "relevant";
  const [result, projectContent, calculators, settings] = await Promise.all([
    fetchBlogPosts({ guides: true, page, perPage: 24, search }).catch(() => null),
    fetchProjectKitsContent(),
    fetchCalculatorsContent(),
    fetchGeneralSettings(),
  ]);

  return (
    <GuidesHub
      guides={result?.items ?? []}
      projectKits={projectContent.kits.filter((kit) => kit.active)}
      page={result?.meta.page ?? page}
      totalPages={result?.meta.totalPages ?? 0}
      initialSearch={search}
      initialCategory={category}
      initialSort={sort}
      calculators={[
        { label: calculators.calc1Label, icon: calculators.calc1Icon },
        { label: calculators.calc2Label, icon: calculators.calc2Icon },
        { label: calculators.calc3Label, icon: calculators.calc3Icon },
      ]}
      supportEmail={settings.supportEmail?.trim() ?? ""}
      supportPhone={settings.supportPhone1?.trim() ?? ""}
    />
  );
}