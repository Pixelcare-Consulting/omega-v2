import { notFound } from "next/navigation"

import { getUsers } from "@/actions/user"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import UserList from "./_components/user-list"
import { getRoles } from "@/actions/role"
import { getCurrentUser } from "@/actions/auth"
import { Card } from "@/components/ui/card"

export default async function UsersPage() {
  const [user, users, roles] = await Promise.all([getCurrentUser(), getUsers(), getRoles()])

  if (!user) notFound()

  return (
    <ContentLayout title='Users'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: `/dashboard/settings/${user.role}` },
          { label: "Users", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Users'
          description='Manage and track your users effectively'
          defaultAction={{
            label: "Add Account",
            href: "/dashboard/settings/users/add",
            icon: Icons.plus,
          }}
        >
          <Card className='p-6'>
            <UserList users={users} roles={roles} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
