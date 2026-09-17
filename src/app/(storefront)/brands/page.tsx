import type { Metadata } from "next";
import { fetchBrands, fetchProducts } from "@/lib/api";
import { FullBrandRegistry } from "@/components/brands/full-brand-registry";
import { DewaltSpotlight } from "@/components/brands/dewalt-spotlight";
import { BrandDirectory } from "@/components/brands/brand-directory";

export const metadata: Metadata = { title: "Top Brands & Official Manufacturer Partners" };

export default async function Page() {
  const brands = await fetchBrands().catch(() => []);
  const dewalt = brands.find((brand) => brand.title.toLowerCase() === "dewalt");
  const products = await fetchProducts({ brand: dewalt?.slug ?? "dewalt", perPage: 100, inStock: true }).catch(() => null);
  const preferredModels = ["DCD996", "DCF887", "DCS570", "DCB184"];
  const spotlightProducts = [...(products?.items ?? [])].sort((a, b) => {
    const rank = (name: string, image: string) => {
      const index = preferredModels.findIndex((model) => name.toUpperCase().includes(model));
      return index >= 0 ? index : image ? 10 : 20;
    };
    return rank(a.name, a.image) - rank(b.name, b.image);
  }).slice(0, 4);
  return <><BrandDirectory brands={brands} /><DewaltSpotlight products={spotlightProducts} total={dewalt?.productCount ?? products?.meta.total ?? 0} /><FullBrandRegistry brands={brands} /></>;
}
