import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET /api/crypto — returns the ENCRYPTION_KEY to authenticated users.
 * Called once per session, key is cached in client memory for E2E crypto.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("access_token")?.value ||
    cookieStore.get("admin_access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ key: process.env.ENCRYPTION_KEY || "" });
}
