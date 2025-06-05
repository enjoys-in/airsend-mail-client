"use server";

import serverAxios from "@/lib/api/serverAxios";

export async function SendMail(input: any) {
    try {

        const { data } = await serverAxios.post("/api/v1/send-mail", input)

        return data
    } catch (error) {
        return {
            success: false,
            result: null,
            message: "Something went wrong"
        }
    }
}