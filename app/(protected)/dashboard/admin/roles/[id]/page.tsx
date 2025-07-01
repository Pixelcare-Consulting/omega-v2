import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import RoleForm from "../_components/role-form"
import { getRoleById } from "@/actions/role"
import { notFound } from "next/navigation"
import { getPermissions } from "@/actions/permissions"

export default async function RolePage({ params }: { params: { id: string } }) {
  const { id } = params
  const role = id === "add" ? null : await getRoleById(params.id)
  const permissions = await getPermissions()

  if (id !== "add" && !role) notFound()

  return (
    <ContentLayout title='Roles & Permissions'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/dashboard/admin/settings" },
          { label: "Roles & Permissions", href: "/dashboard/admin/roles" },
          { label: id !== "add" && role ? role.name : "Add" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <RoleForm role={role} permissions={permissions} />
      </div>
    </ContentLayout>
  )
}
