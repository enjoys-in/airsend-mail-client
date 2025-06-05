import { OrganizationsTable } from "./_components/organizations-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

// Mock data for SSR
const organizations = [
  {
    id: "ORG001",
    name: "Acme Corporation",
    createdBy: "John Doe",
    totalDomains: 5,
    status: "Active",
    role: "Owner",
  },
  {
    id: "ORG002",
    name: "TechStart Inc",
    createdBy: "Jane Smith",
    totalDomains: 3,
    status: "Active",
    role: "Admin",
  },
  {
    id: "ORG003",
    name: "Global Solutions",
    createdBy: "Mike Johnson",
    totalDomains: 8,
    status: "Suspended",
    role: "Member",
  },
]

export default function OrganizationsPage() {
  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">

        <h1 className="text-lg font-semibold">Organizations</h1>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/organizations/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 w-full">
        <OrganizationsTable data={organizations} />
      </div>
    </div>
  )
}
