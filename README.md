# TheSafeQuote

A Next.js website with a PostgreSQL backend, protected admin dashboard, and configurable quote/callback forms for TheSafeQuote. The homepage adapts the supplied School Hub composition to TheSafeQuote's teal, blue, and gold palette. The hero uses matching laptop and compact-window proportions: oversized THE SAFE lettering, a family portrait positioned from the title, and contrasting gold QUOTE beneath the right edge. A striped 03 counter at the top right links to the three coverage options. Both former hero cards have been removed; a simple text link leads to the quote form.

## Run locally

Requires Node.js 24.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000.

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

## Scope

Forms now validate on the server and save to PostgreSQL. The admin workspace at /admin supports paginated leads, record edits, archives, and a versioned form builder. See [backend setup and operations](docs/BACKEND.md) for the local database, admin credentials, and deployment instructions.

## Pages

| Path | Content |
| --- | --- |
| `/` | Family hero, insurer logo marquee, plans, coverage uses, process, quote form, FAQs |
| `/plans` | Medicare, supplemental coverage, Medicaid guidance, three final expense plan types, comparison, planning checklist |
| `/why-choose-us` | Brand story, six benefits, consultation process |
| `/faq` | Searchable questions, category filters, accessible accordions |
| `/contact` | Callback form, availability, preparation guidance |
| `/quote` | Dedicated quote form; optional `?coverage=Burial%20Insurance` preselection |
| `/legal` | Terms, Privacy Policy, TCPA disclosure with anchor navigation |

The old `/index.php` and `/pages/*.php` page URLs redirect to their matching new routes. A custom 404 page is included.

## Editing

- `src/lib/content.ts`: plans, coverage options, navigation, benefits, and FAQs.
- `src/app/globals.css`: design tokens, responsive layouts, and motion.
- `src/app/editorial.css`: revised homepage and glass photo cards.
- `src/components/home-hero.tsx`: School Hub-inspired hero composition.
- `src/components/health-plan-options.tsx` and its CSS module: Medicare, supplemental coverage, and Medicaid content with category navigation.
- `src/components/carrier-marquee.tsx` and `src/app/carriers.css`: six insurer logos with continuous scrolling, hover/focus pause, and a static reduced-motion layout. Brand names are accessible image alternatives; separate visible captions and motion buttons are omitted. Logo provenance is in `docs/ASSETS.md`.
- `src/components/family-mission.tsx` and `src/app/mission.css`: vision, mission, and promise copy alongside three rounded diamond photographs on Why choose us.
- `src/components/plan-cards.tsx`: photo/detail slide transitions, manual photo/detail toggles and keyboard focus.
- `src/components/quote-form.tsx`: shared dynamic quote/callback form and live submission handler.
- `src/components/header.tsx` and `footer.tsx`: shared navigation and branding.
- `src/app/*/page.tsx`: page content and metadata.
- `public/images`: locally stored source photography.

The project uses Next.js App Router, TypeScript, Lucide icons, and locally served Manrope, Space Grotesk, and DM Serif Display fonts. Image optimization uses Next.js Image. Motion respects `prefers-reduced-motion`; keyboard focus, semantic labels, and a skip link are provided.

Plan cards reveal their details when activated, with keyboard focus transfer and reduced-motion support.

## Backend and admin

See [docs/BACKEND.md](docs/BACKEND.md) for local setup, technology choices, database migrations, performance limits, tests, and production deployment. The /admin login is separate from the public website. No public signup is available.

See docs/ASSETS.md for photo sources and license information.


## Production release and exports

Read [production deployment and export guide](docs/PRODUCTION.html) before connecting this backend release to live traffic. Git does not transfer local PostgreSQL data or secrets. Configure the production database, restricted role, persistent media, HTTPS and administrator MFA first. The production startup check intentionally rejects local development settings.

Leads support CSV and styled Excel downloads using the applied search, status, view and date/time filters. Exports include all matching pages up to the documented safety limit. Run `npm run test:export` for spreadsheet output tests.
