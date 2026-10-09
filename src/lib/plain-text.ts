import { z } from "zod";
// Plain-text fields never accept HTML. Rendering must still use React text/attributes.
export function normalizeText(value: string) {
  return value.normalize("NFC").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
}
export const plainText = (max: number) => z.string().max(max).transform(normalizeText).refine(value => !/[<>]/.test(value), "Use plain text without HTML or angle brackets.");
