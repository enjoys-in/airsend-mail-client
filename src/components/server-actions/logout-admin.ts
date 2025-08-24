"use server";

import serverAxios from "@/lib/api/serverAxios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function AdminLogout() {
    try {
        (await cookies()).delete("admin_access_token")
        await serverAxios.get("/api/v1/auth/admin/logout")

        
        return  redirect("/")
    } catch (error) {

    }
}