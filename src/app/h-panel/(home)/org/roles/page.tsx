"use client"

import * as React from "react"
import type { IRole } from "../_lib/types"
import { API } from "@/lib/api/handler"
import { RolesView, type RoleFormValues } from "../_components/roles-view"

export default function RolesPage() {
    const [roles, setRoles] = React.useState<IRole[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        API.getRoles()
            .then((res) => setRoles(res.data?.result || res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const handleSave = async (editingRole: IRole | null, values: RoleFormValues) => {
        const { name, description, permissions } = values
        try {
            if (editingRole) {
                const { data } = await API.updateRole(editingRole.id, { name, description, permissions })
                const updated = data?.result || { ...editingRole, name, description, permissions }
                setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? updated : r)))
            } else {
                const { data } = await API.createRole({ name: name.trim(), description: description.trim(), permissions })
                const newRole = data?.result || {
                    id: `role_${Date.now()}`,
                    name: name.trim(),
                    description: description.trim(),
                    permissions,
                    is_default: false,
                    is_system: false,
                    user_count: 0,
                    created_at: new Date().toISOString(),
                }
                setRoles((prev) => [...prev, newRole])
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (role: IRole) => {
        try {
            await API.deleteRole(role.id)
            setRoles((prev) => prev.filter((r) => r.id !== role.id))
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <RolesView
            roles={roles}
            loading={loading}
            title="Roles and permissions"
            description="Group permissions into roles, then give a role to members."
            onSave={handleSave}
            onDelete={handleDelete}
            deleteNote="Members with this role fall back to Member."
        />
    )
}
