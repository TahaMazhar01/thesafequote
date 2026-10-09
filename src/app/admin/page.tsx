import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/server/auth";
import { HttpError } from "@/lib/server/http";
import { Dashboard } from "@/components/admin/dashboard";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  let admin;
  try { admin = await requireAdmin(await headers()); }
  catch (error) {
    if (error instanceof HttpError && error.status === 401) redirect("/admin/login");
    return <div className="admin-login"><h1>{error instanceof HttpError && error.status === 403 ? "Admin access required" : "Admin service unavailable"}</h1><p>{error instanceof HttpError ? error.message : "Check that the local database is running and setup is complete, then try again."}</p><a className="admin-button" href="/admin/login">Back to sign in</a></div>;
  }
  return <Dashboard email={admin.email} />;
}
