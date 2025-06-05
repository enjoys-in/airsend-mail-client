import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { MembersTable } from "../../_components/members-table"
import { Button } from "@/components/ui/button"
import { UserPlus, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock data for organization-specific members
const getOrganizationMembers = (orgId: string) => [
  {
    id: "1",
    name: "John Doe",
    email: "john@acme.com",
    role: "Owner",
    organization: "Acme Corporation",
    domain: "acme.com",
    status: "Active",
    joinedDate: "2024-01-01",
    lastActive: "2024-01-15 10:30",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@acme.com",
    role: "Administrator",
    organization: "Acme Corporation",
    domain: "acme.com",
    status: "Active",
    joinedDate: "2024-01-05",
    lastActive: "2024-01-15 09:45",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@acme.org",
    role: "Member",
    organization: "Acme Corporation",
    domain: "acme.org",
    status: "Active",
    joinedDate: "2024-01-10",
    lastActive: "2024-01-14 16:20",
  },
]

export default function OrganizationMembersPage({ params }: { params: any}) {
  const members = getOrganizationMembers(params.id)

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Link>
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Members - {params.id}</h1>
        <div className="ml-auto">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <MembersTable data={members} />
      </div>
    </SidebarInset>
  )
}
