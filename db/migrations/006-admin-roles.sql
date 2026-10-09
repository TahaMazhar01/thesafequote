ALTER TABLE fa_admins ADD COLUMN role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','leads','editor'));
ALTER TABLE fa_leads ADD CONSTRAINT fa_leads_revision_positive CHECK (revision > 0);
ALTER TABLE fa_blog_posts ADD CONSTRAINT fa_blog_revision_positive CHECK (revision > 0);
