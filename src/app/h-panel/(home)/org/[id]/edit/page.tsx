import { OrganizationForm } from "../../_components/organization-form"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MOCK_ORGANIZATIONS } from "../../_lib/mock-data"

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const org = MOCK_ORGANIZATIONS.find((o) => o.id === id)

    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/h-panel/org">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold">Edit Organization — {id}</h1>
            </header>
            <div className="flex-1 p-4 min-w-0 overflow-auto">
                <OrganizationForm mode="edit" initialData={org} />
            </div>
        </div>
    )
}
