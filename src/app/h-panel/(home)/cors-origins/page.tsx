import axios from "axios"
import { Lock } from "lucide-react"
import { SomethingWentWrong } from "@/components/common/SomethingWentWrong"
import serverAxios from "@/lib/api/serverAxios"
import { ApiResponse } from "@/lib/types"
import { EmptyState, PageHeader, PageShell, Section } from "@/components/h-panel/kit"
import { CorsOrigin, CorsOrigins } from "./_components/CorsOrigins"

export default async function Page() {
  try {
    const res = await serverAxios.get<ApiResponse<CorsOrigin[]>>("/api/v1/admin/cors-origins")
    if (!res.data.success) throw new Error(res.data.message)
    return <CorsOrigins initial={res.data.result || []} />
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return (
        <PageShell>
          <PageHeader title="Allowed origins" description="Websites that may call the workspace server from a browser." />
          <Section flush>
            <EmptyState icon={Lock} title="Super admin only" description="Only the super admin can manage allowed origins." />
          </Section>
        </PageShell>
      )
    }
    return <SomethingWentWrong />
  }
}
