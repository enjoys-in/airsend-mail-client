 
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { MembersTable } from "../_components/members-table"

// Mock data for members
const members = [
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
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "Viewer",
    organization: "TechStart Inc",
    domain: "example.com",
    status: "Banned",
    joinedDate: "2024-01-08",
    lastActive: "2024-01-12 14:15",
  },
]

export default function MembersPage() {
  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        
        <h1 className="text-lg font-semibold">Members Management</h1>
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
    </div>
  )
}
