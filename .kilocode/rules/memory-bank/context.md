# Active Context: Mosaico Digital Acambaro

## Current State

**Project Status**: ✅ Full application built — ready for environment variable configuration and deployment

The project has been transformed from a Next.js starter template into a full-featured "Million Dollar Homepage" recreation called **Mosaico Digital Acambaro**.

## Recently Completed

- [x] Created `src/lib/mockData.ts` — Mock blocks (15 sold, 8 reserved) and stats for UI testing without Supabase/Stripe
- [x] Created `src/app/test/page.tsx` — Full test frontend at `/test` with 5 sections: Overview, Mosaico (mock), Modal de compra, Estadísticas, Datos de bloques
- [x] Installed dependencies: `@supabase/supabase-js`, `stripe`, `@stripe/stripe-js`, `react-zoom-pan-pinch`, `next-themes`
- [x] Created `src/lib/supabase.ts` — Supabase client, Block type, grid constants (102×80 = 8160 blocks)
- [x] Created `src/lib/stripe.ts` — Stripe client with correct API version
- [x] Created `src/lib/i18n.ts` — Full translations for ES (default), EN, PT, FR
- [x] Created `src/lib/LocaleContext.tsx` — React context for locale state
- [x] Built `src/components/Header.tsx` — Logo, language selector, dark mode toggle, admin link
- [x] Built `src/components/StatsBar.tsx` — Live blocks sold/available/revenue counter with progress bar
- [x] Built `src/components/PixelBlock.tsx` — Individual block with hover effects, image display, click handlers
- [x] Built `src/components/PixelGrid.tsx` — Full 102×80 grid with zoom/pan via react-zoom-pan-pinch
- [x] Built `src/components/PurchaseModal.tsx` — Form with validation, image upload, Stripe checkout redirect
- [x] Updated `src/app/page.tsx` — Hero section, mosaic section, how-it-works, footer
- [x] Created `src/app/success/page.tsx` — Post-payment success page with pixel art animation
- [x] Created `src/app/admin/page.tsx` — Admin dashboard with Supabase Auth login, block management
- [x] Created `src/app/api/blocks/route.ts` — GET sold/reserved blocks
- [x] Created `src/app/api/blocks/stats/route.ts` — GET stats (sold, available, revenue)
- [x] Created `src/app/api/create-checkout-session/route.ts` — POST Stripe checkout session
- [x] Created `src/app/api/webhook/route.ts` — Stripe webhook handler (marks blocks sold)
- [x] Created `src/app/api/upload/route.ts` — Image upload to Supabase Storage
- [x] Created `src/app/api/admin/blocks/route.ts` — Admin GET all blocks with search/filter
- [x] Created `src/app/api/admin/blocks/[id]/route.ts` — Admin PATCH/DELETE individual blocks
- [x] Updated `src/app/layout.tsx` — ThemeProvider, LocaleProvider, SEO metadata, OpenGraph, JSON-LD
- [x] Updated `src/app/globals.css` — Pixel-art aesthetic, dark mode, custom scrollbar, animations
- [x] Created `supabase/schema.sql` — Full DB schema with RLS policies and storage bucket setup
- [x] Created `.env.local.example` — Environment variable template with setup instructions

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page with hero + mosaic | ✅ Ready |
| `src/app/layout.tsx` | Root layout with providers + SEO | ✅ Ready |
| `src/app/success/page.tsx` | Post-payment success page | ✅ Ready |
| `src/app/admin/page.tsx` | Admin dashboard | ✅ Ready |
| `src/app/globals.css` | Pixel-art dark theme | ✅ Ready |
| `src/app/api/blocks/` | Public blocks API | ✅ Ready |
| `src/app/api/create-checkout-session/` | Stripe checkout | ✅ Ready |
| `src/app/api/webhook/` | Stripe webhook | ✅ Ready |
| `src/app/api/upload/` | Image upload | ✅ Ready |
| `src/app/api/admin/` | Admin API routes | ✅ Ready |
| `src/components/Header.tsx` | Navigation + controls | ✅ Ready |
| `src/components/StatsBar.tsx` | Live statistics | ✅ Ready |
| `src/components/PixelBlock.tsx` | Individual pixel block | ✅ Ready |
| `src/components/PixelGrid.tsx` | Full mosaic grid | ✅ Ready |
| `src/components/PurchaseModal.tsx` | Purchase form + checkout | ✅ Ready |
| `src/lib/supabase.ts` | Supabase client + types | ✅ Ready |
| `src/lib/stripe.ts` | Stripe client | ✅ Ready |
| `src/lib/i18n.ts` | Translations (ES/EN/PT/FR) | ✅ Ready |
| `src/lib/LocaleContext.tsx` | Locale React context | ✅ Ready |
| `supabase/schema.sql` | Database schema + RLS | ✅ Ready |
| `.env.local.example` | Environment template | ✅ Ready |

## Grid Specifications

- Canvas: 1024×800 px logical → 102×80 blocks
- Block size: 10×10 px logical → 20×20 px on screen
- Total blocks: 8,160
- Price per block: $100 USD
- Max revenue: $816,000 USD

## Required Environment Variables

```
NEXT_PUBLIC_BASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
```

## Deployment Steps

1. Create Supabase project → run `supabase/schema.sql`
2. Create Stripe account → configure webhook at `/api/webhook`
3. Set environment variables in Vercel
4. Deploy to Vercel

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-08 | Full Million Dollar Homepage app built (Mosaico Digital Acambaro) |
