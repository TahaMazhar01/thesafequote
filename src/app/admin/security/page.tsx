import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {requireAdmin} from "@/lib/server/auth";
import {AdminSecurity} from "@/components/admin/security";
import {getPool} from "@/lib/server/db";
import {HttpError} from "@/lib/server/http";
export const dynamic="force-dynamic";
export default async function SecurityPage(){let user;try{user=await requireAdmin(await headers(),true);}catch(error){if(error instanceof HttpError&&error.status===401)redirect("/admin/login");throw error;}const result=await getPool().query('SELECT "twoFactorEnabled" FROM "user" WHERE id=$1',[user.id]);return <AdminSecurity enabled={Boolean(result.rows[0]?.twoFactorEnabled)}/>;}
