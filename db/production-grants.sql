-- Run with psql as the database owner after migrations. Do not run via the app.
-- Create fa_runtime separately with LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
-- NOREPLICATION NOBYPASSRLS and set its password using psql \password.
GRANT CONNECT ON DATABASE :"DBNAME" TO fa_runtime;
GRANT USAGE ON SCHEMA public TO fa_runtime;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM fa_runtime;
GRANT SELECT ON fa_admins,fa_form_current,fa_form_versions,fa_audit_events TO fa_runtime;
GRANT SELECT,INSERT,UPDATE ON fa_leads,fa_blog_posts,fa_request_limits TO fa_runtime;
GRANT INSERT ON fa_form_versions,fa_audit_events TO fa_runtime;
GRANT UPDATE ON fa_form_current TO fa_runtime;
GRANT SELECT,INSERT,UPDATE,DELETE ON "user",account,session,verification,"rateLimit","twoFactor" TO fa_runtime;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO fa_runtime;
