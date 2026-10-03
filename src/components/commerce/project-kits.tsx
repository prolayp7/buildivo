import Link from "next/link";
import { ProductImage } from "@/components/commerce/product-image";
import type { ProjectKitsContent } from "@/lib/api";

export type ProjectKit = {
  slug: string;
  image: string;
  categorySlug: string;
  itemCount: string;
  imageAlt?: string;
  name: string;
  description: string;
  specLabel: string;
  specValue: string;
  est: string;
  bundleSlug?: string;
};


export default function ProjectKits({ content, kits }: { content: ProjectKitsContent; kits: ProjectKit[] }) {
  return (
    <section id="project-kits" className="w-full bg-white py-12 sm:py-16" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-[1600px] px-4 sm:px-margin-desktop">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-label-md font-label-md font-semibold uppercase tracking-wide text-orange-600">{content.badgeLabel}</p>
              <h2 className="mb-1 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
                {content.heading}
              </h2>
              <p className="max-w-2xl text-body-md font-body-md text-text-secondary">
                {content.description}
              </p>
            </div>
            <p className="text-label-sm font-label-sm text-text-secondary">{content.footnote}</p>
          </div>
          <div className="flex gap-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {kits.map((project) => (
              <div
                key={project.slug}
                className="flex w-[85%] min-w-[85%] snap-start flex-col overflow-hidden rounded-2xl bg-surface-warm sm:w-auto sm:min-w-0"
              >
                <div className="relative">
                  <ProductImage
                    src={project.image}
                    alt={project.imageAlt || project.name}
                    categorySlug={project.categorySlug}
                    className="aspect-[3/2] w-full object-cover"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-graphite-900/90 px-2.5 py-1 text-label-sm font-label-sm font-semibold text-text-inverse">
                    {project.itemCount} items bundled
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-1 min-h-14 text-[20px] leading-7 font-semibold text-graphite-900">
                    {project.name}
                  </h3>

                  <p className="mb-4 line-clamp-2 min-h-10 text-body-sm font-body-sm text-text-secondary">
                    {project.description}
                  </p>

                  <div className="mb-8 space-y-2 rounded-xl bg-surface-white p-3">
                    <div className="flex items-center justify-between gap-2 text-label-sm font-label-sm">
                      <span className="text-text-secondary">
                        {project.specLabel}:
                      </span>

                      <span className="font-bold text-graphite-900">
                        {project.specValue}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-label-sm font-label-sm">
                      <span className="text-text-secondary">
                        Est. Materials Total:
                      </span>

                      <span className="font-bold text-orange-600">
                        {project.est}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={project.bundleSlug ? `/bundles/${encodeURIComponent(project.bundleSlug)}` : "/guides"}
                    className="mt-auto flex min-h-10 items-center justify-center gap-2 rounded-xl bg-surface-white px-3 py-2.5 text-label-md font-label-md font-semibold text-text-primary transition-colors hover:bg-orange-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
                  >
                    View Material List
                    <span
                      aria-hidden
                      className="material-symbols-outlined text-[16px]"
                    >
                      list_alt
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
    </section>
  );
}