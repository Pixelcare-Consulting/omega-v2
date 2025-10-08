import { notFound } from "next/navigation"
import Link from "next/link"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import RequisitionForm from "../_components/requisition-form"
import { getUsers } from "@/actions/user"
import { getRequisitionByCode } from "@/actions/requisition"
import { getBpMasters } from "@/actions/master-bp"
import { getItems } from "@/actions/master-item"
import { Card } from "@/components/ui/card"

export default async function RequisitionPage({ params }: { params: { code: string } }) {
  const { code } = params

  const [requisition, users, customers, items] = await Promise.all([
    code === "add" ? null : getRequisitionByCode(parseInt(code)),
    getUsers(),
    getBpMasters("C"),
    getItems(),
  ])

  const getPageMetadata = () => {
    if (!requisition || !requisition?.id || code === "add")
      return { title: "Add Requisition", description: "Fill in the form to create a new requisition." }
    return { title: "Edit Requisition", description: "Edit the form to update this requisition's information." }
  }

  const pageMetadata = getPageMetadata()

  if (code !== "add" && !requisition) notFound()

  return (
    <ContentLayout title='Requisitions'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Requisitions", href: "/dashboard/crm/requisitions" },
          { label: code !== "add" && requisition ? String(requisition.code) : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/requisitions`}>
                Back
              </Link>

              {requisition && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/requisitions/add`}>
                        <Icons.plus className='mr-2 size-4' /> Add
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/requisitions/${requisition.code}/view`}>
                        <Icons.eye className='mr-2 size-4' /> View
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          }
        >
          <Card className='rounded-lg p-6 shadow-md'>
            <RequisitionForm requisition={requisition} users={users} customers={customers} items={items} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
