
"use server";

import serverAxios from "@/lib/api/serverAxios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function UserLogout() {
    try {
        const { data } = await serverAxios.get("/api/v1/auth/logout")
        if (data.success) {
            (await cookies()).delete("access_token")
        }

        return redirect("/v2")
    } catch (error) {

    }
}