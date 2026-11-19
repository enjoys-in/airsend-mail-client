import { OrganizationForm } from "../../_components/organization-form"
import { OrgPage, PageHeader } from "../../_components/kit"
import serverAxios from "@/lib/api/serverAxios"

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    let org = null
    try {
        const { data } = await serverAxios.get(`/api/v1/admin/organization/${id}`)
        if (data.success) {
            org = data.result
        }
    } catch {
        org = null
    }

    return (
        <OrgPage narrow>
            <PageHeader
                back={{ href: "/h-panel/org", label: "Organizations" }}
                title={org?.name ? `Edit ${org.name}` : "Edit organization"}
                description="Update the brand, change the linked domains and the contact details."
            />
            <OrganizationForm mode="edit" initialData={org} />
        </OrgPage>
    )
}
