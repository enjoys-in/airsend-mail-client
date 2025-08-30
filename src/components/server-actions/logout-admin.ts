"use server";

import serverAxios from "@/lib/api/serverAxios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function AdminLogout() {
    try {
        const { data } = await serverAxios.get("/api/v1/auth/admin/logout")
        if (data.success) {
            (await cookies()).delete("admin_access_token")
        }
        return redirect("/")
    } catch (error) {

    }
}