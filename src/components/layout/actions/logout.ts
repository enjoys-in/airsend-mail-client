"use server";

import serverAxios from "@/lib/api/serverAxios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleServerlogout() {
    const mycookie = await cookies()
    try {
        const { data } = await serverAxios.post("/auth/logout");

        if (data.status === 401 || data.success) {
            mycookie.delete("shield_user")
            mycookie.delete("access_token")
            data.success = true
        }
        redirect("/")

    } catch (error: any) {
        if (error.response?.status === 401) {
            mycookie.delete("shield_user");
            mycookie.delete("access_token");
            return { success: true };
        }
        redirect("/")

    }
}