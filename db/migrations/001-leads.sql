CREATE TABLE fa_admins (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fa_form_versions (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fields jsonb NOT NULL CHECK (jsonb_typeof(fields) = 'array'),
  created_by text REFERENCES "user"(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE fa_form_current (
  id integer PRIMARY KEY CHECK (id = 1),
  version_id integer NOT NULL REFERENCES fa_form_versions(id)
);

CREATE TABLE fa_leads (
  id uuid PRIMARY KEY,
  request_id uuid NOT NULL UNIQUE,
  request_hash text NOT NULL,
  form_version integer NOT NULL REFERENCES fa_form_versions(id),
  source text NOT NULL CHECK (source IN ('quote', 'callback')),
  answers jsonb NOT NULL CHECK (jsonb_typeof(answers) = 'object'),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','closed')),
  notes text NOT NULL DEFAULT '',
  consent_version text NOT NULL,
  consent_text text NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  revision integer NOT NULL DEFAULT 1,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fa_leads_active_page ON fa_leads (created_at DESC, id DESC) WHERE archived_at IS NULL;
CREATE INDEX fa_leads_active_status ON fa_leads (status, created_at DESC, id DESC) WHERE archived_at IS NULL;
CREATE INDEX fa_leads_archive_page ON fa_leads (created_at DESC, id DESC) WHERE archived_at IS NOT NULL;
CREATE INDEX fa_leads_email ON fa_leads (lower(answers->>'email'));
CREATE INDEX fa_leads_phone ON fa_leads ((answers->>'phone'));

CREATE TABLE fa_audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id text REFERENCES "user"(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fa_audit_created ON fa_audit_events (created_at DESC);

CREATE TABLE fa_request_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX fa_request_limits_expiry ON fa_request_limits (expires_at);
