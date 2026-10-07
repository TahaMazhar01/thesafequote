# Family photo enhancement — October 7, 2026

Tool: built-in image generation, image-edit mode (`referenced_image_paths`, opaque background). The two user-supplied low-resolution originals remain unchanged. These are AI-enhanced derivatives, not newly recovered original-camera detail. The existing meadow photo already has a 1800 × 2700 source and was retained.

Outputs used by the plan cards, mission collage, and care section:

- `public/images/family-generations-hd.png` — 1145 × 1374 (original: 667 × 800)
- `public/images/family-sky-hd.png` — 1254 × 1254 (original: 626 × 626)

The tool returned these dimensions despite the requested 2048-pixel target. Next.js serves responsive optimized images at quality 90. No artificial post-generation enlargement was applied.

## Generations — final prompt

Use case: identity-preserve. Asset type: high-resolution family photograph for an insurance website. Input image is the edit target, not a loose reference. Primary request: faithfully restore and enhance this existing low-resolution photograph to crisp natural HD quality, target at least 2048 pixels on the long edge. The grandfather, father and small boy laughing together outdoors; preserve portrait framing and the exact three people, faces, clothing, hands and poses. Preserve composition, background, lighting, colors, relative positions, expression, age, identity, and camera angle. Reduce compression artifacts and soft pixelation; recover realistic fine hair, eyes, fabric and skin texture conservatively. Do not beautify, reshape faces, invent accessories, change smiles, add people, or alter anatomy. No plastic skin, oversharpening halos, artificial HDR, text, borders, UI, gradient overlays, or watermark. Return only the enhanced photograph.

## Family sky — final prompt

Use case: identity-preserve. Asset type: high-resolution family photograph for an insurance website. Input image is the edit target, not a loose reference. Primary request: faithfully restore and enhance this existing low-resolution photograph to crisp natural HD quality, target at least 2048 pixels on the long edge. The mother, father, daughter and small boy together against a blue sky; preserve square framing and the exact four people, faces, clothing, hands and poses. Preserve composition, background, lighting, colors, relative positions, expression, age, identity, and camera angle. Reduce compression artifacts and soft pixelation; recover realistic fine hair, eyes, fabric and skin texture conservatively. Do not beautify, reshape faces, invent accessories, change smiles, add people, or alter anatomy. No plastic skin, oversharpening halos, artificial HDR, text, borders, UI, gradient overlays, or watermark. Return only the enhanced photograph.
