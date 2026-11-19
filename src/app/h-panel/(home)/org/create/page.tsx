"use client"

import { OrganizationForm } from "../_components/organization-form"
import { OrgPage, PageHeader } from "../_components/kit"

export default function CreateOrganizationPage() {
    return (
        <OrgPage narrow>
            <PageHeader
                back={{ href: "/h-panel/org", label: "Organizations" }}
                title="Create organization"
                description="Set up a workspace, link your verified domains and add contact details."
            />
            <OrganizationForm mode="add" />
        </OrgPage>
    )
}
