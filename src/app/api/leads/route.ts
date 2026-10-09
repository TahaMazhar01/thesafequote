import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { fieldsSchema, consentText, consentVersion, validateAnswers } from "@/lib/forms";
import { transaction } from "@/lib/server/db";
import { checkOrigin, failure, HttpError, json, readJson } from "@/lib/server/http";
import { limitSubmission } from "@/lib/server/rate-limit";
export const runtime = "nodejs";
const submission = z.object({
  requestId: z.uuid(), version: z.number().int().positive(), source: z.enum(["quote", "callback"]),
  answers: z.unknown(), consent: z.literal(true), website: z.string().max(200).default(""),
}).strict();
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const body = submission.parse(await readJson(request));
    if (body.website) throw new HttpError(400, "Unable to submit this request.");
    await limitSubmission(request);
    const hash = createHash("sha256").update(JSON.stringify({ ...body, requestId: undefined })).digest("hex");
    await transaction(async client => {
      const existing = await client.query("SELECT request_hash FROM fa_leads WHERE request_id = $1", [body.requestId]);
      if (existing.rowCount) {
        if (existing.rows[0].request_hash !== hash) throw new HttpError(409, "This request has already been submitted. Refresh the form to start again.");
        return;
      }
      const current = await client.query("SELECT v.id, v.fields FROM fa_form_current c JOIN fa_form_versions v ON v.id = c.version_id WHERE c.id = 1 FOR SHARE OF c");
      if (!current.rows[0] || current.rows[0].id !== body.version) throw new HttpError(409, "This form has been updated. Refresh the page and review your entries before submitting.");
      const { answers, errors } = validateAnswers(fieldsSchema.parse(current.rows[0].fields), body.answers);
      if (Object.keys(errors).length) throw new HttpError(422, "Please check the highlighted fields.", errors);
      const inserted = await client.query(`INSERT INTO fa_leads
        (id, request_id, request_hash, form_version, source, answers, consent_version, consent_text)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (request_id) DO NOTHING RETURNING id`,
      [randomUUID(), body.requestId, hash, body.version, body.source, JSON.stringify(answers), consentVersion, consentText("Submit request")]);
      if (!inserted.rowCount) {
        const duplicate = await client.query("SELECT request_hash FROM fa_leads WHERE request_id = $1", [body.requestId]);
        if (duplicate.rows[0]?.request_hash !== hash) throw new HttpError(409, "This request has already been submitted.");
      }
    });
    return json({ message: "Your form has been submitted and saved. Our team will be in touch." }, 201);
  } catch (error) { return failure(error); }
}
