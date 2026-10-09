import "server-only";
import { Pool, type PoolClient } from "pg";

const state = globalThis as unknown as { faPool?: Pool; faPoolURL?: string };
export function databaseConfigured() { return Boolean(process.env.DATABASE_URL); }
export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("Database is not configured.");
  if (state.faPool && state.faPoolURL !== process.env.DATABASE_URL) { void state.faPool.end(); state.faPool = undefined; }
  if (!state.faPool) {
    state.faPoolURL = process.env.DATABASE_URL;
    state.faPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ...(process.env.DB_TLS === "verify" ? {ssl:{rejectUnauthorized:true,...(process.env.DB_CA_PEM?{ca:process.env.DB_CA_PEM}:{})}} : {}),
      max: Math.max(1, Math.min(20, Number(process.env.DB_POOL_MAX) || 5)),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 3_000,
      statement_timeout: 5_000,
      idle_in_transaction_session_timeout: 5_000,
      application_name: "thesafequote",
    });
    // Do not log connection URLs, credentials, SQL parameters or lead data.
    state.faPool.on("error", () => console.error("An idle database connection failed."));
  }
  return state.faPool;
}
export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally { client.release(); }
}
