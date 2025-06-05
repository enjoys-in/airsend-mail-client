
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function UserLogout() {
    try {
        (await cookies()).delete("_access_token")
        // const { data } = await serverAxios.post("/send-mail",input)

        // return data
        return redirect("/v2")
    } catch (error) {

    }
}