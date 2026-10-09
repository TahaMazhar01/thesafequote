CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX fa_leads_name_search ON fa_leads USING gin
  ((coalesce(answers->>'first_name','') || ' ' || coalesce(answers->>'last_name','')) gin_trgm_ops);
