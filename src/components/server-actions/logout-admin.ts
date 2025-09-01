"use server";

import { cookies } from "next/headers";


export async function AdminLogout() {
     (await cookies()).delete("admin_access_token")
}