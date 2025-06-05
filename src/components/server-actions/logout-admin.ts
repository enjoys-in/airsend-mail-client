"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function AdminLogout() {
    try {
        (await cookies()).delete("admin_access_token")
        // const { data } = await serverAxios.post("/send-mail",input)

        // return data
        return  redirect("/")
    } catch (error) {

    }
}