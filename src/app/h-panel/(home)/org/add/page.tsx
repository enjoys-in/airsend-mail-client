import { OrganizationForm } from "../_components/organization-form"

export default function AddOrganizationPage() {
  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <h1 className="text-lg font-semibold">Add Organization</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <OrganizationForm mode="add" />
      </div>
    </div>
  )
}
