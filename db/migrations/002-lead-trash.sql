ALTER TABLE fa_leads ADD COLUMN deleted_at timestamptz;
ALTER TABLE fa_leads ADD COLUMN deleted_by_email text;
CREATE INDEX fa_leads_trash_page ON fa_leads (created_at DESC, id DESC) WHERE deleted_at IS NOT NULL;
CREATE INDEX fa_leads_live_page ON fa_leads (created_at DESC, id DESC) WHERE deleted_at IS NULL AND archived_at IS NULL;
CREATE INDEX fa_leads_live_status ON fa_leads (status, created_at DESC, id DESC) WHERE deleted_at IS NULL AND archived_at IS NULL;
ALTER TABLE fa_audit_events ADD COLUMN actor_email text;
