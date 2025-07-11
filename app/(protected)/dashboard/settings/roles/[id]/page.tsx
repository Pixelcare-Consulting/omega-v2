import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import RoleForm from "../_components/role-form"
import { getRoleById } from "@/actions/role"
import { notFound } from "next/navigation"
import { getPermissions } from "@/actions/permissions"
import { getCurrentUser } from "@/actions/auth"
import ContentContainer from "@/app/(protected)/_components/content-container"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"

export default async function RolePage({ params }: { params: { id: string } }) {
  const { id } = params

  const [user, role, permissions] = await Promise.all([getCurrentUser(), id === "add" ? null : getRoleById(params.id), getPermissions()])

  if ((id !== "add" && !role) || !user) notFound()

  return (
    <ContentLayout title='Roles & Permissions'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: `/dashboard/settings/${user.role}` },
          { label: "Roles & Permissions", href: "/dashboard/settings/roles" },
          { label: id !== "add" && role ? role.name : "Add" },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Roles & Permissions'
          description="Add and set role and assign each of its respective permission's access."
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/settings/roles`}>
                Back
              </Link>

              {/* {role && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/settings/roles/${role.id}/view`}>
                        <Icons.eye className='mr-2 size-4' /> View
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )} */}
            </div>
          }
        >
          <Card className='p-6'>
            <RoleForm role={role} permissions={permissions} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
