import { z } from "zod";
import {normalizeText} from "@/lib/plain-text";
import {leadStatuses} from "@/lib/forms";
import {HttpError} from "./http";
export function leadFilter(params:URLSearchParams){
    const status = z.enum(leadStatuses).optional().parse(params.get("status") || undefined);
    const search = normalizeText(z.string().max(254).parse(params.get("search") || ""));
    const values: unknown[] = [];
    const where = params.get("deleted") === "true" ? ["deleted_at IS NOT NULL"] : ["deleted_at IS NULL", params.get("archived") === "true" ? "archived_at IS NOT NULL" : "archived_at IS NULL"];
    if (status) { values.push(status); where.push(`status = $${values.length}`); }
    if (search) {
      values.push(search, "%" + search.replace(/[\\%_]/g, character => "\\" + character) + "%");
      where.push(`(lower(answers->>'email') = lower($${values.length-1}) OR answers->>'phone' = $${values.length-1} OR (coalesce(answers->>'first_name','') || ' ' || coalesce(answers->>'last_name','')) ILIKE $${values.length} ESCAPE E'\\\\')`);
    }
    const timezone = process.env.ADMIN_TIMEZONE || "Asia/Karachi";
    const day = z.iso.date().refine(value => value >= "1900-01-01" && value <= "2100-12-31");
    const range = z.enum(["all","today","yesterday","custom","time"]).parse(params.get("range") || "all");
    if (range === "today" || range === "yesterday") {
      values.push(timezone, range === "yesterday" ? 1 : 0);
      where.push(`created_at >= (((now() AT TIME ZONE $${values.length-1})::date - $${values.length}::int)::timestamp AT TIME ZONE $${values.length-1}) AND created_at < (((now() AT TIME ZONE $${values.length-1})::date - $${values.length}::int + 1)::timestamp AT TIME ZONE $${values.length-1})`);
    } else if (range === "custom") {
      const from=day.parse(params.get("from")), to=day.parse(params.get("to"));
      if(from>to) throw new HttpError(400,"End date must be on or after start date.");
      values.push(from,to,timezone);
      where.push(`created_at >= ($${values.length-2}::date::timestamp AT TIME ZONE $${values.length}) AND created_at < (($${values.length-1}::date+1)::timestamp AT TIME ZONE $${values.length})`);
    }
    if (range === "time") {
      const instant=z.iso.datetime({offset:true});
      const from=instant.parse(params.get("from")), to=instant.parse(params.get("to"));
      if(new Date(from)>=new Date(to))throw new HttpError(400,"End time must be after start time.");
      values.push(from,to);
      where.push(`created_at >= $${values.length-1}::timestamptz AND created_at < $${values.length}::timestamptz`);
    }
    return {where,values,timezone};
}
