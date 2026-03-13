import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const baseUrl = process.env.APP_URL || "";
  const url = new URL(`/api/v1/admin/blocked-ips/${encodeURIComponent(id)}`, baseUrl);

  try {
    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to unblock IP" },
      { status: 500 }
    );
  }
}
