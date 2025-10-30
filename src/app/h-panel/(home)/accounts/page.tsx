import { SomethingWentWrong } from "@/components/common/SomethingWentWrong"
import serverAxios from "@/lib/api/serverAxios"
import { ApiResponse } from "@/lib/types"
import { FetchAllUsersRootObject } from "./_components/types"
import { UserManagement } from "./_components/displayAccounts"

export default async function Page() {
  try {
    const { data } = await serverAxios.get<ApiResponse<FetchAllUsersRootObject[]>>("/api/v1/admin/users")
    if (!data.success) {
      throw new Error(data.message)
    }
    return <UserManagement users={data.result} />
  } catch (error) {
    return <SomethingWentWrong />
  }

}
