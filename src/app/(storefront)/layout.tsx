import { ComparisonBar } from "@/components/commerce/comparison-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { BackToTop } from "@/components/layout/back-to-top";
import { fetchDepartments, fetchFooterMenu, fetchFooterSettings, fetchMainMenu } from "@/lib/api";

export default async function StorefrontLayout({ children }: LayoutProps<"/">) {
  const [departments, mainMenu, footerColumns, footerSettings] = await Promise.all([fetchDepartments(), fetchMainMenu(), fetchFooterMenu(), fetchFooterSettings()]);
  return (
    <>
      <SiteHeader departments={departments} mainMenu={mainMenu} />
      <main id="main-content" className="min-h-[calc(100vh-156px)] flex-1 pt-[148px] sm:pt-[112px] lg:pt-[156px]">
        {children}
      </main>
      <SiteFooter columns={footerColumns} settings={footerSettings} />
      <ComparisonBar />
      <BackToTop />
      <MobileBottomNav departments={departments} />
    </>
  );
}
