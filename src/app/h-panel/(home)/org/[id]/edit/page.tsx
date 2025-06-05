import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { OrganizationForm } from "../../_components/organization-form"

// Mock data for the organization
const organizationData = {
  id: "ORG001",
  name: "Acme Corporation",
  logo: "/placeholder.svg?height=100&width=100",
  banner: "/placeholder.svg?height=200&width=800",
  footer: "© 2024 Acme Corporation. All rights reserved.",
  headerColor: "#3b82f6",
  permissions: ["read", "write", "admin"],
  role: "owner",
  domains: ["acme.com", "acme.org"],
}

export default function EditOrganizationPage({ params }: { params:any }) {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Edit Organization - {params.id}</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <OrganizationForm mode="edit" initialData={organizationData} />
      </div>
    </SidebarInset>
  )
}
