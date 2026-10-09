# Backend and admin workspace

The site now uses its own PostgreSQL database for submissions, form configuration,
admin sessions and audit events. Public registration is disabled. Only users with
an active row in `fa_admins` can access lead or form-management endpoints.

## Technology

- Next.js Route Handlers and TypeScript for the backend.
- PostgreSQL with `pg` parameterized queries and a bounded connection pool.
- Better Auth for password hashing, database sessions, cookies, origin checks and
  login throttling. No custom password or session cryptography.
- Zod and a shared field validator for configuration and submitted values.
- React and CSS for the dashboard; the form builder loads only in the admin UI.
- Project-local PostgreSQL through `embedded-postgres` for development. This is
  actual PostgreSQL; production uses the operator's normal PostgreSQL server.

## Run locally

Use Node.js 24. The first command creates a database at `.local/postgres` and a
private `.env.local` with random credentials. The database listens only on
`127.0.0.1:55432`; it is not installed as a system service.

```sh
npm ci
npm run db:local
```

Keep that terminal running. In a second terminal:

```sh
npm run db:migrate
npm run admin:create
npm run dev
```

Open `http://127.0.0.1:3000/admin/login`. Generated local login details are saved
in `.local/admin-login.txt`, which is ignored by Git. `admin:create` refuses to
overwrite an existing user or silently grant an existing user admin access.
To create a production admin, supply `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD`
through the server environment when running the script; do not reuse the local
account. Secrets must not appear in shell command history or Git.

Stop the local DB with Ctrl+C in its terminal. Data persists across restarts.
Never delete `.local/postgres` to resolve a startup issue; it contains the data.
If npm blocks lifecycle scripts, inspect and approve the installed
`@embedded-postgres/<platform>` script as directed by npm before starting it.

## Admin workflow

**Leads:** 25 rows per page, status filters, an archive view, exact email/phone
lookup, manual refresh and cursor-based pagination. Table columns follow the
published form labels and order. Cells are truncated to 120 characters for a
small response; Open shows all saved fields and the full values. The lead editor
supports corrections, status, internal notes, archive and restore. Archiving is
recoverable. Public and admin APIs do not expose a permanent-delete operation.

**Form builder:** edit labels, placeholders, types, choices, required status and
width; add, remove and reorder fields; preview and publish. Stable field IDs are
not renamed when labels change. Published schemas are immutable versions. A lead
always references the version used for its submission, preserving historical
labels and values even when a field is removed. Contact consent is separate from
the configurable fields, required on submission, and saved with its text,
version and timestamp. It is not editable through the lead editor.

The same form configuration is used on Home, Quote and Contact. Other processes
refresh public configuration within 30 seconds. An already-open stale form is
rejected with a refresh message rather than silently dropping or misinterpreting
values. Concurrent admin changes return 409 instead of overwriting newer edits.

## Performance and failure behavior

- Public marketing pages remain prerendered. The Quote page remains dynamic
  because it reads its coverage query parameter, but does not query the DB while
  rendering. The public form requests a small schema separately.
- One pool per Node.js process; default five connections, 3-second connection
  timeout, 5-second SQL timeout, and 30-second idle connection timeout.
- Total connections are approximately application-process count × pool size,
  plus migration, maintenance and other services. Keep headroom in PostgreSQL.
- Public schema caching holds one object for 30 seconds and shares concurrent
  cache misses. It contains no lead data. Admin/lead responses use `no-store`.
- Leads use indexed keyset pagination, not deep OFFSET scans or whole-table
  downloads. Exact email/phone search uses expression indexes. No automatic
  polling or repeated full-table counts.
- Request body and field-size limits, login/submission throttling, an anti-bot
  honeypot and idempotent request IDs bound work and prevent duplicate retries.
- No synchronous email/CRM calls on the submission path. Later notifications
  should use a transactional outbox and bounded background worker.
- Database errors are generic to clients. SQL parameters, passwords and lead
  values are not logged. A failed insert never reports success. Public marketing
  content remains available when the DB is unavailable; forms show an error.

Without a configured trusted client-IP header, submission limiting uses a shared
60-request/minute bucket. With a trusted header, it allows 10 per IP/minute.
Configure the reverse proxy correctly before public deployment. These defaults
must be adjusted against measured traffic, not treated as production capacity.

## Database changes and operations

`db:migrate` takes a PostgreSQL advisory lock, creates Better Auth's tables, then
applies versioned SQL migrations transactionally. Checksums reject modified
already-applied migrations. Add a new migration instead. Runtime requests never
run schema migrations. Production migrations should use a separate privileged
connection; the normal app account should only have necessary data permissions.

Schedule maintenance outside request handling: remove expired sessions and
expired `fa_request_limits` rows; apply a retention policy to auth rate-limit
entries and audit logs; monitor query duration, pool saturation, disk space and
errors. Back up PostgreSQL off the application machine and test restoration.
Form-field removal is not a customer-data deletion policy.

## Deploy later

1. Provision a production PostgreSQL database and restricted application user.
2. Set `DATABASE_URL`, a new `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and
   `NEXT_PUBLIC_SITE_URL` for the HTTPS production domain. Use verified TLS for
   remote DB connections. Never copy the local DB password or admin account.
3. Back up existing data, run migrations once, and create the intended admin.
4. Build and run a persistent Next.js Node process behind your reverse proxy.
   If scaling to many processes or serverless instances, budget connections and
   use PgBouncer where appropriate instead of raising every pool limit.
5. Configure the trusted IP header, proxy body/rate limits, backups, monitoring
   and cleanup jobs. Verify the privacy copy against actual business practices.
6. Run production-like load and recovery tests on the actual hardware before
   accepting traffic. No architecture alone guarantees zero downtime or 100/100
   Lighthouse scores under arbitrary load.

## Verification

The leads table supports direct status changes without loading the full record.
Delete opens a confirmation naming the lead and signed-in admin, then moves the
record to Trash. Trash displays the deleting admin's email and timestamp and
offers Restore. Deletion is recoverable, not permanent erasure. The server reads
the actor identity from the authenticated session and retains their email in
the audit event even after a restore. All actions use revision checks to reject
stale updates. Apply migration `002-lead-trash.sql` before deploying this UI.

Run `npm run test:lead-actions` for isolated status, delete/restore, access,
conflict and actor-attribution checks; this test does not publish form changes.

```sh
npm run lint
npm run typecheck
npm run test:backend
npm run build
```

Integration tests require the local DB and app running. They refuse non-local
databases, create synthetic accounts/leads, restore their form changes and remove
their synthetic customer records. They cover access control, validation,
idempotency, pagination, edit conflicts, archives, dynamic columns and historical
field preservation. Do not run while a person is editing the form.
