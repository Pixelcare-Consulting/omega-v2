import { notFound } from "next/navigation"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import RoleList from "./_components/role-list"
import { getRoles } from "@/actions/role"
import { getCurrentUser } from "@/actions/auth"
import ContentContainer from "@/app/(protected)/_components/content-container"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"

export default async function RolesPage() {
  const [user, roles] = await Promise.all([getCurrentUser(), getRoles()])

  if (!user) notFound()

  return (
    <ContentLayout title='Roles & Permissions'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: `/dashboard/settings/${user.role}` },
          { label: "Roles & Permissions", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Roles & Permissions'
          description='Each role is assigned specific menus and features, ensuring that users can access only the functions relevant to their designated role.'
          defaultAction={{
            label: "Add Role",
            href: "/dashboard/settings/roles/add",
            icon: Icons.plus,
          }}
        >
          <Card className='p-6'>
            <RoleList roles={roles} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
