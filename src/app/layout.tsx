import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { CartHydration } from "@/components/cart-hydration";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Buildivo — Tools, Hardware & DIY Supplies",
    template: "%s | Buildivo",
  },
  description:
    "Buildivo is a large-scale DIY, tools and hardware ecommerce platform for retail, DIY and trade customers — 45,000+ technical SKUs with next-day delivery.",
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* Material Symbols is an icon font with variation axes next/font/google
            doesn't model; app/layout.tsx is the app-router equivalent of
            _document.js, so loading it here (not per-page) is correct. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col bg-surface-warm font-body-md text-body-md text-text-primary">
        <TooltipProvider>
          <CartHydration />
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
