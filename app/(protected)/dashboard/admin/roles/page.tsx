import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import RoleList from "./_components/role-list"
import { getRoles } from "@/actions/role"

export default async function RolesPage() {
  const roles = await getRoles()

  return (
    <ContentLayout title='Roles & Permissions'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/dashboard/admin/settings" },
          { label: "Roles & Permissions", href: "/dashboard/admin/roles" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <RoleList roles={roles} />
      </div>
    </ContentLayout>
  )
}
