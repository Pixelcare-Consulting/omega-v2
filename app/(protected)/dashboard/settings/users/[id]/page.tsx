import { notFound } from "next/navigation"
import Link from "next/link"

import { getUserById } from "@/actions/user"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getRoles } from "@/actions/role"
import UserForm from "../_components/user-form"
import { getCurrentUser } from "@/actions/auth"

export default async function UserPage({ params }: { params: { id: string } }) {
  const { id } = params

  const [currentUser, user, roles] = await Promise.all([getCurrentUser(), id === "add" ? null : await getUserById(id), getRoles()])

  const getPageMetadata = () => {
    if (!user || !user?.id || id === "add") return { title: "Add User", description: "Fill in the form to create a new user." }
    return { title: "Edit User", description: "Edit the form to update this user's information." }
  }

  const pageMetadata = getPageMetadata()

  if ((id !== "add" && !user) || !currentUser) notFound()

  return (
    <ContentLayout title='Users'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: `/dashboard/settings/${currentUser.role}` },
          { label: "Users", href: "/dashboard/settings/users" },
          { label: id !== "add" && user ? user.name || user.email : "Add", isPage: true },
        ]}
      />
      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/settings/users`}>
                Back
              </Link>

              {/* {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/settings/users/${user.id}/view`}>
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
            <UserForm user={user} roles={roles} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
