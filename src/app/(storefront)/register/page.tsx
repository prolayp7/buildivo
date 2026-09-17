import type { Metadata } from "next";
import { fetchProducts } from "@/lib/api";
import { Registration } from "@/components/account/registration";
export const metadata: Metadata = { title: "Create Your Account" };
export default async function RegisterPage() {
  const result = await fetchProducts({ category: "power-tools", inStock: true, perPage: 100 }).catch(() => null);
  return <Registration products={[...(result?.items ?? [])].sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image))).slice(0, 4)} />;
}
