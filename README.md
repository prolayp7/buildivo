# Buildivo Storefront (Prototype)

A Next.js implementation of the approved Buildivo "Modern Industrial Commerce" design, built from the Google Stitch design export in
[`designs/template-01/`](designs/template-01/buildivo_hardware_ecommerce_platform_ui_ux_01) and the token/component spec in
[`DESIGN.md`](DESIGN.md).

**Scope of this pass:** the application shell (header, mega-menu, mobile nav, footer, cart) plus every screen that has a real
Stitch design file — Homepage, Product Listing, Product Detail, Cart, and the full Checkout flow (Identity, Contact & Address,
Delivery & Fulfilment, Payment, Review & Confirm, 3DS processing, payment declined, and order confirmation) — built to close
visual fidelity. Checkout uses its own dedicated header/footer (`src/app/(checkout)/`), separate from the main storefront shell
(`src/app/(storefront)/`), matching the design's distinct minimal-chrome checkout layout. Areas with no supplied design
(account, trade/RFQ, guides, calculators beyond the one homepage widget, compatibility finder, AI assistant) are out of scope
for this pass; every link to them resolves to a real, honestly-labelled placeholder page rather than a dead `href="#"`. See
"Known limitations" below.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (Radix primitives) · Zustand (cart/wishlist/compare,
persisted to `localStorage`) · React Hook Form + Zod (address/payment forms) · Sonner (toasts) · Material Symbols Outlined (icon font,
matches the design source — not Lucide, see below) · `next/font` (Inter + Sora).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build && npm run start
```

No environment variables are required — there is no backend. All data is typed mock data (`src/data/`).

## Architecture

- `src/app/(storefront)/` — the main site route group (home, category, PDP, cart, wishlist, compare, stub pages), wrapped by
  `SiteHeader`/`SiteFooter` in its own `layout.tsx`.
- `src/app/(checkout)/` — `checkout/` and `order-confirmation/[orderNumber]/` share a dedicated `layout.tsx` with
  `CheckoutHeader`/`CheckoutFooter` instead of the main site chrome, matching the Stitch checkout screens. Route groups don't
  affect the URL, so `/checkout` and `/order-confirmation/...` are unchanged.
- `src/app/layout.tsx` — the true root: html/body, fonts, `TooltipProvider`, `Toaster`, cart hydration. No header/footer here —
  each route group supplies its own.
- `src/components/ui/` — shadcn primitives (Button, Sheet, Dialog, Tabs, Popover, Form inputs, etc.), customized via the token
  theme rather than left as generic shadcn defaults.
- `src/components/layout/` — storefront header (utility bar, mega-menu, category nav), mobile nav drawer, mini-cart, footer,
  the cropped `BuildivoLogo`.
- `src/components/commerce/` — product card, gallery/PDP, listing + filters, price/rating/stock display, order summary.
- `src/components/checkout/` — `checkout-header.tsx` / `checkout-footer.tsx` (dedicated checkout chrome), `steps/` (one
  component per screen: identity, address, delivery, payment, review, processing/3DS, failed), delivery method selector,
  order summary, step indicator.
- `src/lib/` — `cart-store.ts` (Zustand cart/wishlist/compare/last-completed-order), `format.ts`, `checkout.ts` (delivery
  options, coupon table, discount math shared between the order summary and every checkout step), `utils.ts`.
- `src/data/` — typed mock catalog (`products.ts`) and category tree (`categories.ts`). Swap these for real API calls without
  touching UI components — every page reads through `getProductBySlug` / `getProductsByCategory` rather than the array directly.
- `src/types/` — domain types (`Product`, `CartLine`, `Address`, etc.).

## Brand tokens

Colors, spacing and typography scale are lifted directly from the Stitch export's inline Tailwind config (verified byte-for-byte
against all 7 design files) and defined as CSS custom properties in `src/app/globals.css` under `@theme`, then mapped onto
shadcn's semantic slots (`--primary`, `--background`, etc.) so every primitive picks up the brand automatically. Only tokens
actually used by a design screen were ported — see the file for the full list.

**Icon font deviation from the default stack:** the Stitch design uses Google's Material Symbols Outlined ligature font
throughout, not Lucide. Per the fidelity-first priority order, this build keeps Material Symbols (loaded via a Google Fonts
`<link>` in the root layout) rather than reskinning every icon to Lucide; Lucide is still installed since shadcn's own
primitives (Select, Dialog chevrons, etc.) depend on it internally.

## Known limitations / next steps

- **Product photography**: the design source ships zero real product images (only screenshots of the mockups themselves).
  Rather than substitute misleading stock photos, `<ProductImage>` renders a clearly labelled "Sample image" placeholder with a
  category icon. Swap in real photography by populating `Product.image`/`images` in `src/data/products.ts`.
- **Checkout is simplified to a single shipment/depot.** The Stitch delivery-step design models a two-depot split-shipment
  scenario ("Central Hub" + "Regional Specialty Depot"); this build always renders one shipment group containing the full
  cart, since the mock catalog has no depot-assignment data to split on honestly.
- **Payment/3DS is fully simulated.** The card form validates with Zod but never contacts a processor. The "3DS OTP" screen
  auto-fills a demo code; clicking Submit always succeeds. A "Simulate decline (demo)" link on that screen is the only way to
  reach the payment-failed screen — there's no real random failure — so both design states stay reachable and testable.
- **Stub pages**: `/trade`, `/guides`, `/calculators` (beyond the working tile calculator), `/help`, `/track-order`, `/branches`,
  `/account`, `/search`, `/deals`, `/brands` render an honest "not built in this pass" placeholder rather than a dead link.
  `/wishlist` and `/compare` are fully functional (backed by the cart store) despite having no dedicated Stitch screen.
- **No backend/auth**: cart, wishlist and compare persist to `localStorage` only. Checkout payment is a validated mock form —
  no real payment processor is called, and no card data leaves the browser.
- Wallet checkout buttons (Apple Pay / Google Pay / PayPal) on the cart page are intentionally inert with an explanatory toast,
  since no payment provider is integrated in this prototype.

## Verification performed

- `tsc --noEmit`, `eslint`, and `next build` all pass clean (no errors, no warnings, no `any`/lint-disable except one documented
  case for the Material Symbols `<link>`, which is correct for App Router's `app/layout.tsx`).
- Manually walked the full flow in a real browser (Chrome DevTools MCP): home → category filter/sort → PDP variant + add to
  cart → mini-cart → cart (qty/remove/save-for-later/coupon `BUILD10`) → all 5 checkout steps (with real Zod form validation,
  card and Trade Net 30 paths) → 3DS processing → both the success (order confirmation, itemized receipt) and payment-declined
  outcomes, at both 1440px and 390px widths, with no horizontal overflow.
- Did not run an automated Lighthouse/axe pass or Playwright suite in this session — see "Known limitations."
