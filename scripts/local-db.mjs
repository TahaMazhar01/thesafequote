import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const root = process.cwd();
const databaseDir = path.join(root, ".local", "postgres");
await mkdir(path.join(root, ".local"), { recursive: true });
const credentialsFile = path.join(root, ".local", "database.json");
let credentials;
if (existsSync(credentialsFile)) credentials = JSON.parse(await readFile(credentialsFile, "utf8"));
else {
  credentials = { user: "fa_local", password: randomBytes(24).toString("hex"), port: 55432 };
  await writeFile(credentialsFile, JSON.stringify(credentials), { mode: 0o600, flag: "wx" });
}
if (!existsSync(path.join(root, ".env.local"))) {
  await writeFile(path.join(root, ".env.local"), [
    `DATABASE_URL=postgresql://${credentials.user}:${credentials.password}@127.0.0.1:${credentials.port}/fa_local`,
    `BETTER_AUTH_SECRET=${randomBytes(48).toString("base64url")}`,
    "BETTER_AUTH_URL=http://127.0.0.1:3000", "NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000", "DB_POOL_MAX=5", "",
  ].join("\n"), { mode: 0o600, flag: "wx" });
}
const db = new EmbeddedPostgres({
  ...credentials, databaseDir, persistent: true, authMethod: "scram-sha-256",
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  postgresFlags: ["-h", "127.0.0.1", "-c", "max_connections=30", "-c", "shared_buffers=64MB"],
  onLog: () => {}, onError: message => console.error(message),
});
if (!existsSync(path.join(databaseDir, "PG_VERSION"))) await db.initialise();
await db.start();
const client = db.getPgClient();
await client.connect();
const result = await client.query("SELECT 1 FROM pg_database WHERE datname = 'fa_local'");
if (!result.rowCount) await client.query("CREATE DATABASE fa_local");
await client.end();
console.log(`Local PostgreSQL is running at 127.0.0.1:${credentials.port}. Data persists in .local/postgres.`);
console.log("Leave this process running while developing. Ctrl+C stops the database safely.");
process.on("SIGINT", async () => { await db.stop(); process.exit(0); });
process.on("SIGTERM", async () => { await db.stop(); process.exit(0); });
await new Promise(() => {});
