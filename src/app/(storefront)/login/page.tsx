import type { Metadata } from "next";
import { Login } from "@/components/account/login";
import { fetchProducts } from "@/lib/api";
export const metadata: Metadata = { title: "Sign In" };
export default async function LoginPage() {
  const result = await fetchProducts({ category: "power-tools", inStock: true, perPage: 100 }).catch(() => null);
  const products = [...(result?.items ?? [])].sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image))).slice(0, 4);
  return <Login products={products} />;
}
