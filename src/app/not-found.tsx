import { NotFoundPage } from "@/components/not-found/not-found-page";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { fetchDepartments, fetchFooterMenu, fetchMainMenu } from "@/lib/api";

export default async function NotFound() {
  const [departments, mainMenu, footerColumns] = await Promise.all([
    fetchDepartments().catch(() => []),
    fetchMainMenu().catch(() => []),
    fetchFooterMenu().catch(() => []),
  ]);

  return (
    <>
      <SiteHeader departments={departments} mainMenu={mainMenu} />
      <main id="main-content" className="min-h-[calc(100vh-156px)] flex-1 pt-[68px] sm:pt-[112px] lg:pt-[156px]">
        <NotFoundPage />
      </main>
      <SiteFooter columns={footerColumns} />
    </>
  );
}
