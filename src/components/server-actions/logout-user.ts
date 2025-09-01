"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function UserLogout() {
    try {
        (await cookies()).delete("access_token")

        return redirect("/v2")
    } catch (error) {

    }
}