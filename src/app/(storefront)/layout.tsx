import { ComparisonBar } from "@/components/commerce/comparison-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BackToTop } from "@/components/layout/back-to-top";
import { fetchDepartments, fetchFooterMenu, fetchMainMenu } from "@/lib/api";

export default async function StorefrontLayout({ children }: LayoutProps<"/">) {
  const [departments, mainMenu, footerColumns] = await Promise.all([fetchDepartments(), fetchMainMenu(), fetchFooterMenu()]);
  return (
    <>
      <SiteHeader departments={departments} mainMenu={mainMenu} />
      <main id="main-content" className="min-h-[calc(100vh-156px)] flex-1 pt-[68px] sm:pt-[112px] lg:pt-[156px]">
        {children}
      </main>
      <SiteFooter columns={footerColumns} />
      <ComparisonBar />
      <BackToTop />
    </>
  );
}
