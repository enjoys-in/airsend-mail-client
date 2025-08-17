"use server";

import serverAxios from "@/lib/api/serverAxios";
import { AxiosError } from "axios";

export async function SendMail(input: any) {
    try {

        const { data } = await serverAxios.post("/api/v1/send-mail", input, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })

        return data
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data
        }
        return {
            success: false,
            result: error,
            message: "Something went wrong"
        }
    }
}