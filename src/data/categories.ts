import type { Category } from "@/types";

export const departments: Category[] = [
  { slug: "power-tools", name: "Power Tools", icon: "bolt", productCount: 5230 },
  { slug: "hand-tools", name: "Hand Tools", icon: "construction", productCount: 4180 },
  { slug: "hardware-fixings", name: "Hardware & Fixings", icon: "hardware", productCount: 12000 },
  { slug: "electrical-lighting", name: "Electrical & Lighting", icon: "electrical_services", productCount: 6720 },
  { slug: "plumbing-heating", name: "Plumbing & Heating", icon: "plumbing", productCount: 4750 },
  { slug: "garden-outdoor", name: "Garden & Outdoor", icon: "yard", productCount: 3120 },
  { slug: "building-materials", name: "Building Materials", icon: "foundation", productCount: 2480 },
  { slug: "painting-decorating", name: "Painting & Decorating", icon: "format_paint", productCount: 1980 },
  { slug: "safety-ppe", name: "Safety & PPE", icon: "shield_person", productCount: 1310 },
  { slug: "storage", name: "Storage", icon: "inventory_2", productCount: 890 },
];

export const powerToolsSubcategories: Category[] = [
  { slug: "combi-drills-hammer", name: "Combi Drills & Hammer Drivers", icon: "handyman", productCount: 148, parentSlug: "power-tools" },
  { slug: "drill-drivers-non-hammer", name: "Drill Drivers (Non-Hammer)", icon: "handyman", productCount: 62, parentSlug: "power-tools" },
  { slug: "impact-drivers", name: "Impact Drivers", icon: "handyman", productCount: 89, parentSlug: "power-tools" },
  { slug: "sds-rotary-hammers", name: "SDS / Rotary Hammers", icon: "handyman", productCount: 45, parentSlug: "power-tools" },
  { slug: "angle-grinders", name: "Angle Grinders", icon: "handyman", productCount: 14, parentSlug: "power-tools" },
];

export function findDepartment(slug: string): Category | undefined {
  return departments.find((d) => d.slug === slug);
}

export function findCategory(slug: string): Category | undefined {
  return powerToolsSubcategories.find((c) => c.slug === slug) ?? departments.find((d) => d.slug === slug);
}

const SUBCATEGORY_TO_DEPARTMENT: Record<string, string> = Object.fromEntries(
  powerToolsSubcategories.map((c) => [c.slug, c.parentSlug as string]),
);

export function departmentOf(categorySlug: string): string {
  return SUBCATEGORY_TO_DEPARTMENT[categorySlug] ?? categorySlug;
}
