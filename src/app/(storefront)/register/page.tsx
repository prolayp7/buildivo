import type { Metadata } from "next";
import { fetchProducts, fetchRegisterPageContent } from "@/lib/api";
import { Registration } from "@/components/account/registration";
export const metadata: Metadata = { title: "Create Your Account" };
export default async function RegisterPage() {
  const [result, content] = await Promise.all([fetchProducts({ category: "power-tools", inStock: true, perPage: 100 }).catch(() => null), fetchRegisterPageContent()]);
  return <Registration products={[...(result?.items ?? [])].sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image))).slice(0, 4)} content={content} />;
}
