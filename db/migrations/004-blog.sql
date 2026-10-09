CREATE TABLE fa_blog_posts (
 id uuid PRIMARY KEY,
 slug text NOT NULL UNIQUE,
 document jsonb NOT NULL,
 status text NOT NULL CHECK (status IN ('draft','published')),
 revision integer NOT NULL DEFAULT 1,
 deleted_at timestamptz,
 published_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fa_blog_public ON fa_blog_posts (published_at DESC, id) WHERE status='published' AND deleted_at IS NULL;
