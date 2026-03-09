import * as crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const { payload } = await req.json()
    if (typeof payload !== "string") {
        return NextResponse.json({ error: "invalid payload" }, { status: 400 })
    }
    const secret = process.env.APP_SECRET || ""
    const hmac = crypto.createHmac("sha512", secret).update(payload)
    return NextResponse.json({ signature: hmac.digest("hex") })
}
