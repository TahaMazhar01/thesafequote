# TheSafeQuote

A complete Next.js frontend for final expense insurance. The homepage adapts the supplied School Hub composition to TheSafeQuote's teal, blue, and gold palette. The hero uses matching laptop and compact-window proportions: oversized THE SAFE lettering, a family portrait positioned from the title, and contrasting gold QUOTE beneath the right edge. A striped 03 counter at the top right links to the three coverage options. Both former hero cards have been removed; a simple text link leads to the quote form.

## Run locally

Requires Node.js 20.9 or newer. Developed with Node 24.

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

This delivery is **frontend only**, as requested. There is no database, CRM, email service, analytics, or lead submission API. Quote and callback forms validate locally, then display a clearly labeled preview confirmation. No entered details are sent, stored, or logged. The existing legal text is preserved and the preview behavior is disclosed.

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
- `src/components/plan-cards.tsx`: photo/detail slide transitions, two-second automatic reveal, manual toggle, and keyboard focus.
- `src/components/quote-form.tsx`: shared quote/callback form and preview submission handler.
- `src/components/header.tsx` and `footer.tsx`: shared navigation and branding.
- `src/app/*/page.tsx`: page content and metadata.
- `public/images`: locally stored source photography.

The project uses Next.js App Router, TypeScript, Lucide icons, and locally served Manrope, Space Grotesk, and DM Serif Display fonts. Image optimization uses Next.js Image. Motion respects `prefers-reduced-motion`; keyboard focus, semantic labels, and a skip link are provided.

Plan cards reveal their details once after being at least 65% in view for two seconds. Clicking or using the keyboard gives the visitor control; the cards never cycle while someone is reading. Reduced-motion preferences disable the automatic reveal and transitions, leaving the manual controls available. The complete description, features, policy note, and quote link are on a separate surface from the photo.

## Future backend integration

Replace the local `onSubmit` handler in `quote-form.tsx` with the team's approved request flow. Preserve these original field names:

`first_name`, `last_name`, `email`, `phone`, `zipcode`, `interest_product`, `message`, `consent`, `leadid_token`, `trustedform_url`.

Coverage values remain `Final Expense`, `Burial Insurance`, `Cremation Plan`, and `Other`. The final expense display label is `Final Expense Coverage`. The consent checkbox is required and initially unchecked. Hidden tracking fields are intentionally empty; no third-party tracking scripts are installed.

The original live form posted to `https://thesafequote.com/api/submit.php`. This project does **not** call that endpoint. Once the backend is connected, replace the preview notice and confirmation with real pending, failure, and success states based on the actual response.

For deployment, run the Next.js production server or use a compatible Next.js host. This is not a PHP project and does not include the original server-side implementation. Nothing has been published externally.

See `docs/ASSETS.md` for photo sources, publication dates, and license information.




