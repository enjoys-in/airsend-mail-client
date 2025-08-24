
"use server";

import serverAxios from "@/lib/api/serverAxios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function UserLogout() {
    try {
        (await cookies()).delete("access_token")
        await serverAxios.get("/api/v1/auth/logout")


        return redirect("/v2")
    } catch (error) {

    }
}