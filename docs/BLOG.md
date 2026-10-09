# Blog management

Open `/admin` and choose **Blog articles**. Use **New article** to create a draft. Edit the title and URL slug then add a summary and cover image. Image fields accept local `/images/` paths or HTTPS URLs. Keep the source credit when using third party images.

The article opens in one continuous Tiptap writing area. Select text and use the toolbar for headings and font sizes or colours. Bold and italic plus underline and strikethrough are available. Add links to selected text. Lists and quotes plus images and tables are supported. Table controls appear while the cursor is inside a table. Undo and redo use the editor history. Paste content into the writing area and review its formatting before publication.

The sidebar holds category and tags plus featured image and author details. Use Preview before saving. Publish makes the article public. Draft saves it privately and asks for confirmation before removing an already published article from the website. Existing block-based articles convert in the editor without a database migration. Saving an edited article stores validated rich text JSON. The public renderer escapes text and uses an allowlist of elements and attributes rather than accepting raw HTML.

Featured images support drag and drop or file selection. Inline images support a URL or upload. Admin-only uploads accept JPEG or PNG or WebP up to 5 MB and 25 million decoded pixels. The server re-encodes uploads as WebP up to 1600 pixels wide. Uploaded files live in `.local/blog-media` by default and are served through `/api/blog-media/<uuid>.webp` with immutable caching. Set `BLOG_UPLOAD_DIR` to a persistent absolute directory on the production server and include it in backups. Uploaded images are public assets. Removing an article does not remove its images because they may be reused by another article.

Delete moves an article to Trash after confirmation. Restore returns it with its previous publication status. Saving and deletion use revisions to prevent concurrent edits from silently overwriting each other. Admin actions record the signed-in actor in `fa_audit_events`.

Run `npm run db:migrate` before starting the updated application. Migration `004-blog.sql` adds the blog table and public listing index. Blog text and styling live in PostgreSQL. The five initial photos are local WebP files under `public/images/blog`. Their CC0 sources are recorded in `credits.json` and linked under article covers.

`npm run blog:seed` adds the five initial articles to the local `fa_local` database only. Existing matching slugs are skipped so running it again does not overwrite editorial changes. These articles deliberately omit commas and em/en dashes. This is an editorial choice for the initial content rather than a restriction on future admin writing.

`npm run test:blog` needs the local application and database running. It creates a temporary user and article to test access control and publication transitions then removes its own fixtures.

Public listing pages fetch at most ten records and show nine cards. The admin fetches twenty rows at a time. The editor is loaded only when its tab is opened. Article queries use the unique slug index and reuse the existing bounded PostgreSQL connection pool. Public pages read current publication state so drafts and trash are excluded immediately.
