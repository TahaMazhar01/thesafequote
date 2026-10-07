# Asset sources

All photos are stored locally; there is no stock-image hotlinking at runtime. The Unsplash pages were reviewed on October 7, 2026. Publication dates below are the dates shown on the source pages, not independently verified capture dates.

| Local file | Photographer | Source | Published | License |
| --- | --- | --- | --- | --- |
| `public/images/family-together.jpg` | Jennifer Kalenberg | https://unsplash.com/photos/a-family-poses-for-a-picture-in-a-field-Tw54PtYgHFc | September 9, 2023 | Unsplash License |
| `public/images/generations.jpg` | Marco J Haenssgen | https://unsplash.com/photos/a-person-sitting-on-a-bench-holding-their-hands-together-upzvTKNliRM | September 16, 2024 | Unsplash License |

License: https://unsplash.com/license

These are free-use stock images under the Unsplash License, not CC0 images. They illustrate family and care and are not presented as customers, testimonials, or endorsements. The original downloaded files are unchanged; responsive crops use CSS and Next.js Image.

The user-supplied family photos now also have AI-enhanced derivatives used on plan cards, the mission collage, and the care section. See [image enhancement details and exact prompts](IMAGE-ENHANCEMENT.md). Originals are retained.

Typography: Manrope and DM Serif Display, distributed through Fontsource under the SIL Open Font License. Their package license files are included in `node_modules/@fontsource/` after installation.

Icons: Lucide React (ISC license). The small brand shield and favicon are code-based artwork created for this frontend.

Design references: https://www.selectquote.com/ and https://www.outliant.com/case-studies/selectquote . No SelectQuote logos, proprietary photographs, customer testimonials, carrier relationships, rate claims, or savings statistics were reused.

## October 7 homepage revision

- Reference: https://github.com/TahaMazhar01/School-Hub-Website, inspected at commit `7ea855bccb5600ec32ae5e08ce5f60125f0d5c46`. The user's own reference provided the hero composition and Space Grotesk typography; school-specific content and backend features were not reused. A read-only reference checkout is retained under ignored `.local/reference-school-hub`.
- `public/images/family-sky.jpg`: the first user-supplied family photo, copied unchanged.
- `public/images/family-generations.jpg`: the third user-supplied photo, copied unchanged; used on plan cards, the hero story card, and the care section.
- `public/images/hero-family-cutout.png`: transparent cutout derived from the first supplied photo with the built-in image generation tool. The original source photo remains intact.
- The second supplied photo was not selected because its 300-by-239 resolution is too small for the main photo surfaces. The fourth and fifth attachments were visual design references, not website assets.
- Rights and publication dates for user-supplied photography were not independently verified. These files are not described as Unsplash or CC0 assets.
- Space Grotesk is served locally through Fontsource under the SIL Open Font License.

### Cutout editing prompt

Built-in image generation tool; use case: background-extraction.

> Use case: background-extraction. Asset type: transparent website hero cutout. Input image is the edit target: the supplied photo of a mother, father, daughter and son. Remove ONLY the blue sky background, creating a genuinely transparent alpha background, including spaces around their bodies and hair. Preserve all four people, exact identities, facial features, smiles, pose, skin, hair, clothing, hands, lighting, camera framing and relative sizes. Do not restyle or replace the people. Keep the bottom crop as supplied and do not add anything. Crisp natural hair edges without blue halos. No text, no scenery, no ground, no shadow.

## Insurance company marquee — October 7, 2026

The six company names were supplied by the user. Logo artwork is stored locally under `public/images/carriers/`, displayed in its original colors and proportions, with company names provided as accessible image alternatives. Separate visible name captions have been removed as requested. These are brand trademarks, not open-source stock imagery. The section uses the neutral heading “Insurance companies” without adding endorsement or partnership claims.

| File | Source page | Original image |
| --- | --- | --- |
| `americo.png` | https://www.americo.com/ | https://www.americo.com/wp-content/uploads/2020/10/cropped-Americologo_red_289-2.png |
| `transamerica.jpg` | https://www.prnewswire.com/news-releases/transamerica-launches-vibrant-new-look-for-its-brand-reinforcing-a-pledge-to-help-middle-income-americans-302349907.html | https://mma.prnewswire.com/media/240884/Transamerica_NEW_2025.jpg |
| `aetna.png` | https://direct.aetna.com/brokers/ | https://direct.aetna.com/brokers/assets/images/Aetna_Heart_Logo.png |
| `mutual-of-omaha.png` | https://www.employeenavigator.com/marketplace/partner/mutual-of-omaha | https://www.employeenavigator.com/assets/static/logo-64a54103-f0db-4638-9813-0862ed14cd53.531a59e.5f860e4b4804f94379f4ca5af7e22e38.png |
| `liberty-bankers.png` | https://lbig.com/ | https://lbig.com/user/themes/libertybankers/images/logo/LBIG_Logo_tag.png |
| `american-amicable.png` | https://www.americanamicable.com/v4/index.php | https://www.americanamicable.com/v4/images/americanamicable-logo-secondary-navy-p-500.png |

Transamerica artwork is the refreshed 2025 brand shown with its company-issued press release. Mutual of Omaha uses the current lion mark; its official design guide was reviewed at https://design.mutualofomaha.com/digital/assets/ and the matching blue artwork came from its Employee Navigator partner listing. All original files are unchanged; Next.js handles delivery sizes.


## Dimensional benefit card artwork

The ribbon, gear, and orbit decorations are locally authored inline SVG in src/components/benefit-cards.tsx. They use native vector gradients and CSS shadows, inspired by the user's supplied blue card design reference. No additional raster images or remote dependencies were added. The contact hero reuses the unchanged generations.jpg stock photograph credited above.

## Circular contact photographs — October 7, 2026

Two distinct, newly sourced photos now appear in the contact hero. Both are stored locally and served through Next.js Image at quality 90. They are free-use stock under the listed licenses, not CC0/open-source assets. Original downloaded pixels are retained; circular framing is CSS only. The people are illustrative, not customers or endorsements.

| Local file | Photographer | Source | Published | Local dimensions | License |
| --- | --- | --- | --- | --- | --- |
| `public/images/contact-senior-couple.jpg` | Land O'Lakes, Inc. | https://unsplash.com/photos/elderly-couple-sitting-together-outdoors--NwK3jWezuI | October 30, 2025 | 2000 x 1333 | https://unsplash.com/license |
| `public/images/contact-holding-hands.jpg` | SHVETS production | https://www.pexels.com/photo/elderly-couple-holding-hands-7544922/ | April 17, 2021 | 1800 x 1200 | https://www.pexels.com/license/ |

Downloaded from https://images.unsplash.com/photo-1761839257647-df30867afd54?auto=format&fit=max&fm=jpg&q=90&w=2000 and https://images.pexels.com/photos/7544922/pexels-photo-7544922.jpeg?auto=compress&cs=tinysrgb&w=1800 . Publication dates are source-page dates, not independently verified capture dates.

## Benefit illustrations

The six benefit illustrations in src/components/benefit-illustration.tsx are original code-native SVG artwork created for this project. They depict guidance, budgeting, making a decision, comparing policies, family protection, and scheduling. No external stock files are used for these cards.

## New closing-section photograph — October 8, 2026

- File: public/images/closing-family-moment.jpg (1800 x 1200).
- Photographer: Gustavo Fring.
- Source: https://www.pexels.com/photo/grandparents-having-fun-with-their-granddaughter-5163600/
- Source publication: August 21, 2020; source reports capture date August 9, 2020.
- License: https://www.pexels.com/license/ (free-use stock, not CC0 or an open-source license).
- Download: https://images.pexels.com/photos/5163600/pexels-photo-5163600.jpeg?auto=compress&cs=tinysrgb&w=1800
- Original source resolution: 5760 x 3840. The local 1800px version is served with Next.js image optimization at quality 90; framing uses CSS only.
- Used only in the shared closing quote section. People are illustrative, not customers or endorsements.

## FAQ hero photograph — October 8, 2026
- Local: public/images/faq-guidance.jpg (1800 x 1013).
- Photographer: Vitaly Gariev. Published March 25, 2026.
- Source: https://www.pexels.com/photo/young-couple-meeting-financial-advisor-for-consultation-36729962/
- Free-use Pexels license: https://www.pexels.com/license/ (not CC0 or open-source).
- Download: https://images.pexels.com/photos/36729962/pexels-photo-36729962.jpeg?auto=compress&cs=tinysrgb&w=1800
- Unmodified photo, cropped only in CSS and optimized by Next Image. Illustrative consultation, not a claim about actual staff or clients.
