import { notFound } from "next/navigation"
import Link from "next/link"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getCustomerExcessByCode } from "@/actions/customer-excess"
import CustomerExcessForm from "../_components/customer-excess-form"

export default async function CustomerExcessPage({ params }: { params: { code: string } }) {
  const { code } = params

  const customerExcess = await getCustomerExcessByCode(parseInt(code))

  const getPageMetadata = () => {
    if (!customerExcess || !customerExcess?.id || code === "add")
      return { title: "Add Customer Excess", description: "Fill in the form to create a new customer excess." }
    return { title: "Edit Customer Excess", description: "Edit the form to update this customer excess's information." }
  }

  const pageMetadata = getPageMetadata()

  if (code !== "add" && !customerExcess) notFound()

  return (
    <ContentLayout title='Customer Excess'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Customer Excess", href: "/dashboard/crm/customer-excesses" },
          { label: code !== "add" && customerExcess ? String(customerExcess.code) : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/customer-excesses`}>
                Back
              </Link>

              {customerExcess && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/customer-excesses/add`}>
                        <Icons.plus className='mr-2 size-4' /> Add
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/customer-excesses/${customerExcess.code}/view`}>
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
            <CustomerExcessForm customerExcess={customerExcess} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
