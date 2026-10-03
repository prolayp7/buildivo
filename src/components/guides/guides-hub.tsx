"use client";

import { useState } from "react";
import Link from "next/link";
import type { BlogPost, ProjectKit } from "@/lib/api";
import { API_ORIGIN } from "@/lib/api";
import { ProductImage } from "@/components/commerce/product-image";

type GuideCalculator = { label: string; icon: string };

function kitCategory(kit: ProjectKit) {
  const text = `${kit.name} ${kit.description}`.toLowerCase();
  if (/deck|garden|fenc|outdoor/.test(text)) return "Outdoor & Garden";
  if (/bath|plumb|heating/.test(text)) return "Plumbing & Heating";
  if (/electric|wiring|lighting/.test(text)) return "Electrical & Lighting";
  if (/workshop|storage|timber|frame|carpentry/.test(text)) return "Carpentry & Framing";
  return "Other Projects";
}

function kitImageCategory(kit: ProjectKit) {
  const category = kitCategory(kit);
  if (category === "Outdoor & Garden") return "garden-outdoor";
  if (category === "Plumbing & Heating") return "plumbing-heating";
  if (category === "Electrical & Lighting") return "electrical-lighting";
  if (category === "Carpentry & Framing") return "building-materials";
  return "building-materials";
}

function estimateValue(value: string) {
  const amount = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? amount : Number.MAX_SAFE_INTEGER;
}

function itemCount(kit: ProjectKit) {
  const count = Number.parseInt(kit.itemCount, 10);
  return Number.isFinite(count) ? count : 0;
}

function projectUrl(kit: ProjectKit) {
  return kit.bundleSlug ? `/bundles/${encodeURIComponent(kit.bundleSlug)}` : "/bundles";
}

function guideImage(post: BlogPost) {
  if (post.socialShareImage) return post.socialShareImage.startsWith("/uploads/") ? `${API_ORIGIN}${post.socialShareImage}` : post.socialShareImage;
  const topic = `${post.title} ${Array.isArray(post.tags) ? post.tags.join(" ") : ""} ${post.blogCategory?.title ?? ""}`.toLowerCase();
  if (/bath|plumb|tile|heating/.test(topic)) return "/images/projects/bathroom.jpg";
  if (/electric|wiring|lighting/.test(topic)) return "/images/projects/electrical.jpg";
  if (/deck|timber|fenc|garden|outdoor/.test(topic)) return "/images/projects/decking.jpg";
  return "/images/projects/workshop.jpg";
}

function durationLabel(minutes?: number | null) {
  if (!minutes) return "";
  if (minutes >= 60) return `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ""}`;
  return `${minutes} min`;
}

function GuidePhoto({ post, className }: { post: BlogPost; className: string }) {
  return (
    <div className={`relative overflow-hidden bg-surface-container-low ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- CMS images can be hosted on arbitrary approved media hosts. */}
      <img src={guideImage(post)} alt={post.socialShareImage ? post.socialShareImageAlt || post.title : ""} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}

function GuideMeta({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  const steps = Array.isArray(post.steps) ? post.steps.filter((step) => step.title?.trim()) : [];
  const materials = Array.isArray(post.materials) ? post.materials.filter((item) => item.label?.trim()) : [];
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? "text-[10px]" : "text-[11px]"}`}>
      {post.difficulty && <span className="rounded-full bg-orange-50 px-2 py-1 font-semibold text-orange-700">{post.difficulty}</span>}
      {post.estimatedTimeMinutes && <span className="rounded-full bg-surface-container-low px-2 py-1 text-text-secondary">{durationLabel(post.estimatedTimeMinutes)}</span>}
      {steps.length > 0 && <span className="rounded-full bg-surface-container-low px-2 py-1 text-text-secondary">{steps.length} {steps.length === 1 ? "step" : "steps"}</span>}
      {materials.length > 0 && <span className="rounded-full bg-orange-100 px-2 py-1 font-semibold text-orange-700">{materials.length} {materials.length === 1 ? "material" : "materials"}</span>}
    </div>
  );
}

export function GuidesHub({ guides, projectKits, totalPages, page, initialSearch, initialCategory, initialSort, calculators, supportEmail, supportPhone }: {
  guides: BlogPost[];
  projectKits: ProjectKit[];
  totalPages: number;
  page: number;
  initialSearch: string;
  initialCategory: string;
  initialSort: string;
  calculators: GuideCalculator[];
  supportEmail: string;
  supportPhone: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort || "relevant");
  const topics = Array.from(new Set(projectKits.map(kitCategory)));
  const filteredProjects = [...projectKits]
    .filter((kit) => !category || kitCategory(kit) === category)
    .filter((kit) => !search.trim() || `${kit.name} ${kit.description} ${kit.specLabel} ${kit.specValue}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => sort === "cost-low" ? estimateValue(a.est) - estimateValue(b.est) : sort === "materials-high" ? Number.parseInt(b.itemCount, 10) - Number.parseInt(a.itemCount, 10) : 0);
  const featuredProject = filteredProjects[0] ?? null;
  const projectCards = filteredProjects.slice(1);
  const stepGuides = guides.filter((post) => {
    const text = `${post.title} ${post.excerpt ?? ""} ${post.blogCategory?.title ?? ""} ${(Array.isArray(post.tags) ? post.tags : []).join(" ")}`.toLowerCase();
    return !search.trim() || text.includes(search.trim().toLowerCase());
  });
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams({ page: String(nextPage) });
    if (search.trim()) query.set("search", search.trim());
    if (category) query.set("category", category);
    if (sort !== "relevant") query.set("sort", sort);
    return `/guides?${query}`;
  };
  const phoneHref = supportPhone.replace(/[^\d+]/g, "");

  return (
    <main className="min-h-screen bg-surface-container-low">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-margin-desktop sm:py-8">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-label-sm font-label-sm text-text-secondary">
          <Link href="/" className="hover:text-orange-700">Home</Link><span aria-hidden>/</span><span aria-current="page" className="font-semibold text-graphite-900">DIY &amp; Guides</span>
        </nav>

        <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="mb-1 text-[10px] font-bold uppercase text-orange-700">Trade &amp; DIY project guides</p>
            <h1 className="text-[30px] leading-9 font-bold text-graphite-900 sm:text-[38px] sm:leading-10">DIY Guides</h1>
            <p className="mt-2 text-sm leading-5 text-text-secondary sm:text-base">Step-by-step project guides, tool requirements, and materials lists to help you plan and build accurately.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="rounded-lg border border-border-default bg-white px-3 py-2 text-graphite-700">{filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"} shown</span>
            <span className="rounded-lg border border-border-default bg-white px-3 py-2 text-graphite-700">{filteredProjects.filter((kit) => itemCount(kit) > 0).length} with item lists</span>
          </div>
        </header>

        <div className="rounded-xl border border-border-default bg-white p-3 sm:p-4">
          <form action="/guides" method="get" role="search" className="flex min-w-0 gap-2">
            <label htmlFor="guide-search" className="sr-only">Search DIY guides</label>
            <input id="guide-search" name="search" type="search" maxLength={120} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search guide title, materials, or tools" className="h-10 min-w-0 flex-1 rounded-lg border border-border-default bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
            <input type="hidden" name="category" value={category} />
            <input type="hidden" name="sort" value={sort} />
            <button type="submit" className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-orange-500 px-3 text-xs font-bold text-white hover:bg-orange-600 sm:px-4">Search guides <span aria-hidden className="material-symbols-outlined text-[16px]">arrow_forward</span></button>
          </form>

          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter by topic">
              <button type="button" onClick={() => setCategory("")} aria-pressed={!category} className={`min-h-8 shrink-0 rounded-full px-3 text-[11px] font-semibold ${!category ? "bg-orange-500 text-white" : "bg-surface-container-low text-graphite-700 hover:bg-orange-100"}`}>All projects <span className="ml-1.5 opacity-75">{projectKits.length}</span></button>
              {topics.map((topic) => <button key={topic} type="button" onClick={() => setCategory(topic)} aria-pressed={category === topic} className={`min-h-8 shrink-0 rounded-full px-3 text-[11px] font-semibold ${category === topic ? "bg-orange-500 text-white" : "bg-surface-container-low text-graphite-700 hover:bg-orange-100"}`}>{topic}<span className="ml-1.5 opacity-75">{projectKits.filter((kit) => kitCategory(kit) === topic).length}</span></button>)}
            </div>
            <label className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border-default bg-white px-2 text-[10px] text-text-secondary">Sort by<select aria-label="Sort projects" value={sort} onChange={(event) => setSort(event.target.value)} className="min-w-0 bg-transparent text-[11px] font-semibold text-graphite-900 outline-none"><option value="relevant">Most relevant</option><option value="cost-low">Estimated cost, low to high</option><option value="materials-high">Most items</option></select></label>
          </div>
        </div>

        {featuredProject ? (
          <section aria-labelledby="featured-project-title" className="mt-5 overflow-hidden rounded-xl border border-border-default bg-white">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Link href={projectUrl(featuredProject)} aria-label={`Open project pack: ${featuredProject.name}`} className="block min-h-56 focus-visible:outline-2 focus-visible:outline-orange-500 lg:min-h-[350px]">
                <ProjectPhoto kit={featuredProject} className="h-full min-h-56 w-full lg:min-h-[350px]" />
              </Link>
              <div className="flex min-w-0 flex-col p-5 sm:p-7 lg:p-8">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase">
                  <span className="rounded-full bg-orange-100 px-2.5 py-1 text-orange-700">Featured project</span>
                  <span className="rounded-full bg-surface-container-low px-2.5 py-1 text-graphite-700">{kitCategory(featuredProject)}</span>
                  {itemCount(featuredProject) > 0 && <span className="text-text-secondary">{itemCount(featuredProject)} items in pack</span>}
                </div>
                <h2 id="featured-project-title" className="text-[24px] leading-7 font-bold text-graphite-900 sm:text-[30px] sm:leading-9">{featuredProject.name}</h2>
                <p className="mt-3 text-sm leading-5 text-text-secondary">{featuredProject.description}</p>
                <div className="mt-4 grid grid-cols-1 gap-2 rounded-lg bg-surface-container-low p-3 min-[420px]:grid-cols-2">
                  {featuredProject.specLabel && <div><p className="text-[9px] font-bold uppercase text-text-secondary">{featuredProject.specLabel}</p><p className="mt-1 text-sm font-bold text-graphite-900">{featuredProject.specValue}</p></div>}
                  {featuredProject.est && <div className="min-[420px]:text-right"><p className="text-[9px] font-bold uppercase text-text-secondary">Estimated materials total</p><p className="mt-1 text-sm font-bold text-orange-700">{featuredProject.est}</p></div>}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
                  <Link href={projectUrl(featuredProject)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-xs font-bold text-white hover:bg-orange-600">{featuredProject.bundleSlug ? "View material list" : "Browse project packs"}<span aria-hidden className="material-symbols-outlined text-[16px]">arrow_forward</span></Link>
                  <Link href="/calculators" className="text-xs font-semibold text-graphite-700 hover:text-orange-700">Estimate quantities</Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-5 rounded-xl border border-border-default bg-white p-6 text-sm text-text-secondary">{search ? "No projects match your search. Try another term or topic." : "No active project packs are available right now."}</section>
        )}

        <section id="project-library" aria-labelledby="all-projects-heading" className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div><h2 id="all-projects-heading" className="text-xl font-bold text-graphite-900 sm:text-2xl">All Trade &amp; DIY Projects</h2><p className="mt-1 text-xs text-text-secondary">{filteredProjects.length} matching {filteredProjects.length === 1 ? "project pack" : "project packs"}</p></div>
            <Link href="/bundles" className="text-xs font-semibold text-orange-700 hover:underline">Browse project packs <span aria-hidden>→</span></Link>
          </div>
          {projectCards.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{projectCards.map((kit) => <ProjectKitCard key={kit.id} kit={kit} />)}</div> : <p className="rounded-xl border border-border-default bg-white p-5 text-sm text-text-secondary">{featuredProject ? "This is the only project pack matching the current filters." : "Active project packs will appear here when available."}</p>}
        </section>

        {stepGuides.length > 0 && <section aria-labelledby="step-guides-heading" className="mt-9">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-1 text-[10px] font-bold uppercase text-orange-700">Step-by-step library</p><h2 id="step-guides-heading" className="text-xl font-bold text-graphite-900 sm:text-2xl">Detailed project guides</h2></div><Link href="/blog" className="text-xs font-semibold text-orange-700 hover:underline">Trade knowledge hub <span aria-hidden>→</span></Link></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stepGuides.map((post) => <GuideCard key={post.slug} post={post} />)}</div>
          {totalPages > 1 && <nav aria-label="Guide pages" className="mt-5 flex items-center justify-between rounded-xl border border-border-default bg-white p-4 text-xs"><span>Page {page} of {totalPages}</span><span className="flex gap-4">{page > 1 && <Link href={pageHref(page - 1)} className="font-semibold text-orange-700 hover:underline">← Previous</Link>}{page < totalPages && <Link href={pageHref(page + 1)} className="font-semibold text-orange-700 hover:underline">Next →</Link>}</span></nav>}
        </section>}

        <section className="mt-9 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <div className="rounded-xl border border-border-default bg-white p-5 sm:p-6">
            <p className="mb-1 text-[10px] font-bold uppercase text-orange-700">Plan the work</p>
            <h2 className="text-lg leading-6 font-bold text-graphite-900">Turn a guide into a project plan</h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-text-secondary">Use each guide’s steps and material list when provided, then check the product pages for current specifications and availability.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[{label:"Choose a guide",detail:"Start with a project that matches your job."},{label:"Review the materials",detail:"Check the items and quantities listed in the guide."},{label:"Estimate what you need",detail:"Use a calculator for common material quantities."}].map((step,index)=><div key={step.label} className="rounded-lg bg-surface-container-low p-3"><span className="text-[9px] font-bold text-orange-700">{String(index+1).padStart(2,"0")}</span><h3 className="mt-1 text-xs font-bold text-graphite-900">{step.label}</h3><p className="mt-1 text-[10px] leading-4 text-text-secondary">{step.detail}</p></div>)}
            </div>
          </div>
          <aside className="rounded-xl bg-graphite-900 p-5 text-white sm:p-6">
            <p className="mb-1 text-[10px] font-bold uppercase text-orange-400">Estimating tools</p>
            <h2 className="text-lg leading-6 font-bold">Need to estimate quantities?</h2>
            <p className="mt-2 text-xs leading-5 text-graphite-200">Use the available calculators to plan common material quantities before you shop.</p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">{calculators.map((calculator) => <Link key={calculator.label} href="/calculators" className="flex min-h-10 items-center gap-2 rounded-lg bg-white/5 px-3 text-xs font-semibold hover:bg-white/10"><span aria-hidden className="material-symbols-outlined text-[16px] text-orange-400">{calculator.icon}</span><span className="min-w-0 truncate">{calculator.label}</span></Link>)}</div>
            <Link href="/calculators" className="mt-3 flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-4 text-xs font-bold text-white hover:bg-orange-600">Open material calculators <span aria-hidden className="material-symbols-outlined ml-1 text-[16px]">arrow_forward</span></Link>
          </aside>
        </section>

        <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-default bg-white p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3"><span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700"><span className="material-symbols-outlined">support_agent</span></span><div><h2 className="text-sm font-bold text-graphite-900">Need help with a project?</h2><p className="mt-1 text-xs text-text-secondary">Visit Help &amp; Support for order, product, and delivery questions.</p></div></div>
          <div className="flex flex-wrap items-center gap-2">{supportPhone && <a href={`tel:${phoneHref}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border-default px-3 text-xs font-semibold text-graphite-900 hover:bg-surface-container-low"><span aria-hidden className="material-symbols-outlined text-[15px]">call</span>{supportPhone}</a>}{supportEmail && <a href={`mailto:${supportEmail}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border-default px-3 text-xs font-semibold text-graphite-900 hover:bg-surface-container-low"><span aria-hidden className="material-symbols-outlined text-[15px]">mail</span> Email support</a>}<Link href="/help" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-graphite-900 px-4 text-xs font-bold text-white hover:bg-graphite-700">Help &amp; Support <span aria-hidden className="material-symbols-outlined text-[15px]">arrow_forward</span></Link></div>
        </section>
      </div>
    </main>
  );
}

function GuideCard({ post }: { post: BlogPost }) {
  const steps = Array.isArray(post.steps) ? post.steps.filter((step) => step.title?.trim()) : [];
  const materials = Array.isArray(post.materials) ? post.materials.filter((item) => item.label?.trim()) : [];
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border-default bg-white">
      <Link href={`/blog/${post.slug}`} aria-label={`Open guide: ${post.title}`} className="block focus-visible:outline-2 focus-visible:outline-orange-500"><GuidePhoto post={post} className="aspect-[16/9] w-full" /></Link>
      <div className="flex flex-1 flex-col p-4">
        {post.blogCategory && <p className="mb-2 text-[10px] font-bold uppercase text-orange-700">{post.blogCategory.title}</p>}
        <GuideMeta post={post} compact />
        <h3 className="mt-2 line-clamp-2 text-base leading-5 font-bold text-graphite-900"><Link href={`/blog/${post.slug}`} className="hover:text-orange-700">{post.title}</Link></h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-xs leading-5 text-text-secondary">{post.excerpt}</p>}
        {materials.length > 0 && <p className="mt-3 text-[10px] text-text-secondary">Materials listed: <span className="font-semibold text-graphite-900">{materials.length}</span></p>}
        <Link href={`/blog/${post.slug}`} className="mt-auto inline-flex min-h-10 items-center justify-between gap-2 pt-4 text-xs font-bold text-orange-700 hover:underline">View guide <span aria-hidden className="material-symbols-outlined text-[15px]">arrow_forward</span></Link>
        {steps.length === 0 && <span className="sr-only">Step details are available in the guide</span>}
      </div>
    </article>
  );
}

function ProjectPhoto({ kit, className }: { kit: ProjectKit; className: string }) {
  return <ProductImage src={kit.image || undefined} alt={kit.imageAlt || kit.name} categorySlug={kitImageCategory(kit)} className={`h-full w-full object-cover ${className}`} />;
}

function ProjectKitCard({ kit }: { kit: ProjectKit }) {
  const href = projectUrl(kit);
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border-default bg-white">
      <Link href={href} aria-label={`Open project pack: ${kit.name}`} className="block focus-visible:outline-2 focus-visible:outline-orange-500">
        <ProjectPhoto kit={kit} className="aspect-[16/9]" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase text-orange-700">{kitCategory(kit)}</span>
          {itemCount(kit) > 0 && <span className="rounded bg-surface-container-low px-2 py-1 text-[9px] font-semibold text-graphite-700">{itemCount(kit)} items</span>}
        </div>
        <h3 className="line-clamp-2 text-base leading-5 font-bold text-graphite-900"><Link href={href} className="hover:text-orange-700">{kit.name}</Link></h3>
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-text-secondary">{kit.description}</p>
        {(kit.specLabel || kit.est) && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-[10px]">
          {kit.specLabel && <span className="text-text-secondary">{kit.specLabel}: <strong className="text-graphite-900">{kit.specValue}</strong></span>}
          {kit.est && <span className="font-bold text-orange-700">Est. {kit.est}</span>}
        </div>}
        <Link href={href} className="mt-auto inline-flex min-h-10 items-center justify-between gap-2 pt-4 text-xs font-bold text-orange-700 hover:underline">{kit.bundleSlug ? "View material list" : "Browse project packs"}<span aria-hidden className="material-symbols-outlined text-[15px]">arrow_forward</span></Link>
      </div>
    </article>
  );
}
