import { SomethingWentWrong } from "@/components/common/SomethingWentWrong"
import serverAxios from "@/lib/api/serverAxios"
import { ApiResponse } from "@/lib/types"
import { ManageIP } from "./_components/ManageIP"

export default async function Page() {
  try {
    const [globalRes, domainRes] = await Promise.all([
      serverAxios.get<ApiResponse<string[]>>("/api/v1/admin/blocked-ips"),
      serverAxios.get<ApiResponse<Record<string, string[]>>>("/api/v1/admin/blocked-ips/domains"),
    ])
    if (!globalRes.data.success || !domainRes.data.success) {
      throw new Error("Failed to fetch blocked IPs")
    }
    return (
      <ManageIP
        globalIPs={globalRes.data.result || []}
        domainIPs={domainRes.data.result || {}}
      />
    )
  } catch {
    return <SomethingWentWrong />
  }
}
