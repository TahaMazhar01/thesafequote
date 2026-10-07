# Frontend handoff

Verified October 7, 2026.

## Completed checks

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed (Next.js 16.4).
- `npm audit --omit=dev`: zero production dependency vulnerabilities reported.
- All seven page routes rendered with one main heading.
- Mobile layouts inspected at 320 and 390 pixels; no horizontal document overflow detected.
- Desktop layouts inspected at approximately 1265 and 1440 pixels.
- Mobile navigation opens, closes, and follows the selected route.
- FAQ search, no-results state, clear action, category filter, and accordion expansion verified.
- Empty required fields block form submission and focus the first invalid field.
- Invalid phone numbers rejected; valid formatted US numbers accepted.
- Valid quote form submission displays the preview notice and focuses the status region.
- Home quote CTA navigates directly to the form below the sticky header.
- Reduced-motion CSS disables entry animations and smooth scrolling.

## Delivery boundaries

This is a frontend-only project. Form submissions do not send or store information. Backend, CRM, third-party consent tracking, production legal review, and deployment belong to the receiving team's integration work. The source form fields and legal wording have been carried forward.

The full dependency audit currently flags five transitive development-tool findings in the `eslint-config-next` → `fast-glob` → `micromatch` → `braces` chain. These are outside the production dependency tree. The audit's suggested automatic fix would downgrade the Next.js ESLint configuration to an incompatible major version, so that downgrade was not applied. Recheck the development dependencies when upstream patches are available.

Photos are illustrative stock imagery, not customer endorsements. Source pages and dates are recorded in `ASSETS.md`.

## Homepage and card revision

The homepage now follows the user's School Hub composition: cream navigation and background, a large gold wordmark behind a transparent family cutout, a striped option count, a compact story photo, and a quote card. Space Grotesk carries the reference typography into the homepage sections. Supplied first and third photographs are integrated locally.

Shared plan cards on Home and Plans now use photo covers with frosted bottom captions. Full content lives on a separate panel: the cover slides left or right after two seconds at 65% visibility, or on activation. Automatic reveal happens once, is disabled with the Auto reveal switch, stops on interaction, and does not run for reduced-motion users. Keyboard activation and focus transfer in both directions were checked. No description or feature list is layered over faces.

Revision verification: desktop 1440px, tablet 820px, and mobile 390px/320px had no horizontal document overflow. Card content remained within its panels. Automatic opening, manual photo restoration, Enter activation, mobile menu routing, the real computed backdrop blur, and plan-to-quote coverage preselection were checked in the browser. Required form fields remain first name, last name, email, phone, ZIP, coverage, and consent. The hero quote links lead to the quote section; form fields and submission behavior were not changed.

## Hero spacing and mission showcase correction

The final hero uses normal document flow and three grid columns instead of independently positioned elements. Its wordmark, portrait, information card, and quote card have separate bounds. The old photo/story tile, striped count, and photo-overlaid caption were replaced with a guidance card and a caption below the portrait. The homepage uses white and pale blue surfaces, teal-to-blue gradients, and restrained gold accents from the original brand.

The Why choose us story section is now a mission layout with left-side vision, mission, and promise content and three distinct family photographs in rounded diamond masks on the right. Photos remain unmodified; the framing and diamond shapes are CSS. The mobile gallery follows the text in normal flow.

Verification for this correction: lint, TypeScript, and production build passed. Hero bounding rectangles showed no collisions at desktop, laptop, and mobile sizes. Homepage and mission page were checked for horizontal overflow at narrow, tablet, and desktop widths. All three mission images loaded, their faces were visually inspected, and the new hero quote link landed below the sticky header.

## Final card-free hero revision

The latest hero follows the supplied reference with oversized THE SAFE lettering behind the raised family portrait and gold QUOTE lettering beneath the right edge. Both hero cards are removed. The family cutout is larger on desktop; the mobile composition reserves clear space for QUOTE. The remaining plain-text quote link, navigation, forms, mission gallery, and plan cards retain their existing behavior.

Verified this revision: lint, TypeScript, and production build pass. No horizontal document overflow at 320, 390, 820, 1265, and 1440 pixels. Desktop and narrow-phone screenshots confirm that QUOTE remains visible and neither former hero card is rendered. Updated previews: preview-desktop.jpg and preview-mobile.jpg.

## Matching laptop and compact-window composition

The portrait is now anchored below the top of the wordmark instead of to a fixed-height stage bottom. Container-relative sizing keeps THE SAFE readable at laptop and wide desktop widths, matching the preferred compact-window composition. The top-right striped 03 links to the three coverage options; it describes plan choices, not business age. Both removed hero cards remain absent.

Lint, TypeScript, and production build passed. Responsive overflow checks passed at 320, 390, 1265, 1440, and 1920 pixels. The updated desktop and mobile screenshots include the restored counter.

## Insurance company logo marquee

Added below the homepage hero: Americo, Transamerica, Aetna, Mutual of Omaha, Liberty Bankers, and American Amicable. Each logo has a visible company-name caption. Original downloaded artwork is stored locally, and all source URLs are recorded in ASSETS.md. The two-copy CSS track scrolls continuously with pause/play, hover/focus pause, and a static grid for reduced-motion preferences. The duplicate list is hidden from assistive technology.

Verification: all six local logos loaded through Next.js image optimization; animation advances and pause/play changes the computed animation state. No horizontal document overflow at 320, 390, or 1440 pixels. Lint, TypeScript, and production build pass. New screenshots: preview-carriers-desktop.jpg and preview-carriers-mobile.jpg.

## Simplified motion UI and logo strip

Removed the Auto reveal toolbar from the shared Home/Plans cards, the marquee pause/play button, separate brand-name captions, and the three-point homepage trust strip. Automatic one-time card reveals and marquee movement remain active, with reduced-motion support and marquee hover/focus pause. Logos now carry company-name alt text; the duplicate loop stays hidden from assistive technology. The marquee no longer requires a client component.

Verified: no removed controls, captions, or trust-strip elements remain in the homepage DOM; all six logos load. Desktop and 390px mobile show no horizontal overflow. Lint, TypeScript, and production build pass. Updated desktop screenshot: preview-carriers-desktop.jpg.

## Seamless photo card overlays and enhanced family images

Replaced the rectangular caption background with a continuous full-card photo, a masked blurred duplicate that gradually appears toward the bottom, and a transparent-to-deep-green shade. The caption itself has no background or top border. Removed the third card's image translation so it no longer exposes a cut edge. The blur layer is decorative and hidden from assistive technology; card reveal interactions remain unchanged.

Two low-resolution supplied photos now use AI-enhanced versions at 1145 x 1374 and 1254 x 1254, on the cards, mission collage, and care section. Original files remain intact. The existing 1800 x 2700 meadow image is retained. Responsive images use quality 90, with Next.js qualities configured accordingly. Exact tool mode, prompts, dimensions, and paths are in IMAGE-ENHANCEMENT.md.

Verified: desktop and 390px mobile have no horizontal overflow; manual reveal/return works; enhanced images load; final lint and production build pass (including TypeScript). Preview: preview-cards-glass.jpg.

## Compact quote forms and lighter plan cards

Added quote.css with a unified teal information panel and wider white form. Home, quote, and callback forms retain every field, validation rule, and the complete consent disclosure. Reduced spacing and control heights on desktop, shortened the homepage introduction, and removed the utility strip on the dedicated quote route. Anchor spacing accounts for the root scroll padding so the homepage form lands directly below the sticky navigation. Mobile retains readable 16px inputs and natural page scrolling rather than clipping content.

Verified homepage form panel at 1280 x 720: top 106px, bottom 689px, including consent, submit, and preview note. At 1024 x 768 its panel is 617px tall with no horizontal overflow. The dedicated quote form also fits a laptop screen. Mobile 390px: all seven visible fields stay within the panel, with no horizontal overflow.

Plan card grid is capped at 1140px; desktop cards are approximately 365 x 471px instead of the previous 530px minimum height. Reduced image blur from 13px to 4px and moved its fade toward the bottom; preserved the smooth shade and photo detail. Compact section headings on short desktop screens keep all three cards visible together. Details remain fully contained and manually reveal/return correctly.

Lint and production build (including TypeScript) pass. Screenshots: preview-quote-compact.jpg and preview-cards-compact.jpg.

## Blue dimensional benefit cards and contact hero photograph

Replaced the plain benefit cards on Why Choose Us with blue gradient cards, native SVG ribbon/gear/orbit sculptures, soft depth shadows, white pill links, and circular arrow controls. All six benefit descriptions remain intact. The actions link to the relevant contact, quote, or plans page. Hover effects respect reduced-motion preferences; the decorative art is hidden from assistive technology.

Added a dedicated contact hero with the existing generations.jpg photo in a separate right column, a rounded white frame, and a caption below the image. On mobile it stacks after the introduction. The conversation link targets the existing compact callback form without changing any fields.

Verified desktop appearance and mobile 390px widths, with no horizontal overflow. Card-to-contact navigation and the contact-form anchor work. Lint and production build (including TypeScript) pass. Screenshots: preview-benefit-cards-blue.jpg and preview-contact-photo.jpg.

## Circular contact imagery and brand palette correction

Replaced the contact hero frame with two circular photographs: a large senior-couple photo and a smaller overlapping holding-hands image, each with a white rim and subtle outline. Overlap stays inside the image column, with the caption below and text separate. New local stock sources are contact-senior-couple.jpg (2000 x 1333) and contact-holding-hands.jpg (1800 x 1200). Credits, source dates, download URLs, and free-use license links are in ASSETS.md; these are not CC0 photos.

Recolored all dimensional benefit cards and their SVG sculptures from saturated blue to the existing teal/muted-blue palette, with cream pills and gold arrow buttons. Geometry and interactions are retained.

Verified at desktop 1440px and mobile 390px: both circular images loaded; circle width equals height; mobile stacks below text; no horizontal overflow. Lint and production build pass. Updated screenshots: preview-contact-circles.jpg and preview-benefit-cards-theme.jpg.

## Hero viewport sizing

Retained the approved hero composition, wordmark, striped 03, and colors. Reduced the intro/stage spacing and capped the desktop family portrait at 78svh so its size follows both viewport width and height. Mobile keeps its existing portrait proportions.

Visually verified both parents' faces in the initial 1366 x 768 and 1280 x 630 laptop viewports. Mobile 390 x 844 remains fully readable without horizontal overflow. ESLint passes. Screenshot: preview-hero-viewport.jpg.

## Expanded Plans content (2026-10-08)

Added Medicare Parts A & B, Medicare Advantage, Medicare Supplement (Medigap), Hospital Indemnity Insurance, Dental & Vision Coverage, Cancer Insurance, and Medicaid guidance. The user confirmed that the supplied spellings referred to Medicaid and Dental & Vision coverage. New responsive cards use the existing teal/cream/gold theme; category anchors connect these sections with existing final expense coverage. Updated the Plans hero and metadata to reflect the wider content.

New insurance cards link to the existing Contact page; Medicaid directs users to their official state program. Existing forms, final expense cards, and comparison content are preserved. No rates, carrier-specific availability, or eligibility guarantees added.

Editorial sources checked October 8, 2026:
- https://www.medicare.gov/basics/get-started-with-medicare/medicare-basics/parts-of-medicare
- https://www.medicare.gov/health-drug-plans/medigap/basics
- https://www.medicaid.gov/medicaid
- https://www.medicaid.gov/about-us/where-can-people-get-help-medicaid-chip
- https://content.naic.org/consumer/health-insurance.htm

Lint and TypeScript checks passed; production build compiled and generated all routes. Preview: preview-plans-medicare.jpg.

## Relevant benefit artwork and polished footer (2026-10-08)

Replaced the repeated abstract ribbon, gear, and rings with six original SVG illustrations: conversation bubbles, a budget wallet, a decision checklist, policy comparison cards, a protected family, and a calendar/clock. Artwork now occupies normal layout space beneath the copy, preventing overlap at desktop and mobile widths. Teal, cream, and gold colors remain consistent. Artwork is decorative and hidden from assistive technology; reduced motion is respected.

Rebuilt the shared footer with a compact quote invitation, grouped coverage and company navigation, a conversation prompt, a separate disclosure panel, and wrapping legal links. Coverage links target the new Plans sections. No unverified contact details or social profiles were introduced.

Verified desktop 1440px and mobile 390px layouts with no horizontal overflow or copy/art overlap. ESLint, TypeScript, and production build passed. Screenshots: preview-benefit-illustrations.jpg and preview-footer-polished.jpg.

## Closing quote section redesign (2026-10-08)

Replaced the gradient flower banner with a warm cream split layout: an arch-shaped family photograph on the left, teal headline and copy on the right, a rounded teal/gold quote button, secondary contact link, and a compact reassurance line. Reuses the existing enhanced generations image. The shared ClosingCta export applies the new design across pages. Mobile stacks the photo above the copy.

Verified desktop 1440px and mobile 390px rendering without horizontal overflow. ESLint, TypeScript, and production build pass. Preview: preview-closing-cta-redesign.jpg.

## Unique closing-section photo (2026-10-08)

Replaced the reused generations photo with closing-family-moment.jpg, a newly sourced 1800 x 1200 Pexels photograph by Gustavo Fring showing grandparents with their granddaughter outdoors. The approved section design remains intact. Updated alternative text and focal positioning for the landscape image; license and source details are in ASSETS.md. Desktop/mobile image loading and layout checked. Preview: preview-closing-new-photo.jpg.

## Shared 01-02-03 badges (2026-10-08)

Introduced a reusable NumberBadge with teal dimensional background, warm gold label/accent, high-contrast tabular numerals, and Step/Option accessibility labels. Process sections use larger badges and a dotted connector to their icons. Medicare and supplemental cards use a compact version; final expense cards retain the number on both photo and revealed detail views. The hero counter is unchanged.

Desktop process, health plan cards, and both final expense card states verified. Final expense details still fit their 470px panel. Mobile 390px has no horizontal overflow. ESLint, TypeScript, and production build pass. Previews: preview-step-numbering.jpg, preview-plan-numbering.jpg, preview-photo-plan-numbering.jpg.

### 2026-10-08 — Shared homepage colour palette
- Centralized the approved pale teal/blue hero gradient, dark teal-to-blue panels, button colours, borders and text tones in globals.css.
- Applied the palette to page heroes, health and final-expense cards, contact/form panels, mission, closing CTA and footer; preserved gold accents, approved layouts, imagery and all form behavior.
- Photo-card shade retains its existing opacity, gradient stops and blur, with its green tint shifted to deep teal-blue.
- Verified desktop plans/contact/closing sections and mobile contact; shared hero/footer gradient confirmed in browser. ESLint and production build passed.
- Preview: docs/preview-unified-theme.jpg and docs/preview-theme-contact.jpg.

### 2026-10-08 — Medicare premium cards
- Removed standalone Medicare Parts A & B card and its plans-page metadata mention. Kept Parts A/B context where needed to explain remaining coverage.
- Balanced Medicare Advantage and Supplement in a two-column desktop layout (01/02), stacking on mobile. Supplemental cards remain a three-column grid.
- Added prominent $0/month plan-premium panel qualified as some plans, with availability, continuing Part B premium and other-cost clarification. Added Monthly premium tag and variable-rate information to Supplement.
- Cost wording checked against https://www.medicare.gov/basics/costs/medicare-costs and https://www.medicare.gov/basics/get-started-with-medicare/medicare-basics/how-does-medicare-work . No carrier-specific rate or availability is claimed.
- Desktop and 390px mobile verified; lint and production build passed. Preview: docs/preview-medicare-premiums.jpg.

### 2026-10-08 — Compact Medicare card redesign
- Replaced oversized Medicare layout with a dedicated compact card: one-row title/icon/number header, slim dark teal-blue pricing strip, concise spacing and small circular-arrow CTA.
- Centered the two-card grid at 1040px maximum; measured 509 x 489px per card at a 1440px desktop viewport. Preserved premium qualifications, coverage details and all supplemental-card layouts.
- Checked desktop and 390px mobile previews. Lint and TypeScript passed. Preview: docs/preview-compact-medicare-cards.jpg.

### 2026-10-08 — Remove Option labels and sun icons
- Removed default visible Option text from number badges while keeping numbers centered and explicit Step labels. Removed inaccurate fixed of-3 accessibility text.
- Removed sun artwork and its empty icon containers from Dental & Vision, Our vision, Guaranteed Issue photo badge and comparison header; removed Sun from icon registry.
- Verified no sun references remain in src, zero sun SVGs/Option labels on plans, and preserved number placement. Lint and TypeScript passed. Preview: docs/preview-no-option-sun.jpg.

### 2026-10-08 — FAQ hero image and layout
- Added dedicated FAQ hero with left-hand text/actions and a new 2026 free-use consultation photo in a rounded frame on the right. Caption sits below the image without obscuring faces.
- Uses the shared pale teal/blue theme; responsive single-column layout at mobile sizes. Added Browse questions anchor; existing FAQ search/filter/accordion unchanged.
- Verified 1440px desktop and 390px mobile, image loading and FAQ jump link. TypeScript, lint and production build passed. Preview: docs/preview-faq-image-hero.jpg. Photo license recorded in ASSETS.md.
