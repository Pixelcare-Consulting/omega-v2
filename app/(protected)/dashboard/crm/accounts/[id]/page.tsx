import Link from "next/link"
import { notFound } from "next/navigation"

import { getAccountById } from "@/actions/account"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import AccountForm from "../_components/account-form"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"

export default async function AccountPage({ params }: { params: { id: string } }) {
  const { id } = params
  const account = id === "add" ? null : await getAccountById(id)

  const getPageMetadata = () => {
    if (!account || !account?.id || id === "add") return { title: "Add Account", description: "Fill in the form to create a new account." }
    return { title: "Edit Account", description: "Edit the form to update this account's information." }
  }

  const pageMetadata = getPageMetadata()

  if (id !== "add" && !account) notFound()

  return (
    <ContentLayout title='Accounts'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Accounts", href: "/dashboard/crm/accounts" },
          { label: id !== "add" && account ? account.name : "Add", isPage: true },
        ]}
      />
      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/accounts`}>
                Back
              </Link>

              {account && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/accounts/add`}>
                        <Icons.plus className='mr-2 size-4' /> Add
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/accounts/${account.id}/view`}>
                        <Icons.eye className='mr-2 size-4' /> View
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          }
        >
          <Card className='p-6'>
            <AccountForm account={account} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
