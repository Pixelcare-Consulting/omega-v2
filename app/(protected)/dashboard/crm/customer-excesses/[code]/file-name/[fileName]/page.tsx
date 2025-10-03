import { notFound } from "next/navigation"

import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getCustomerExcessLineItemsByFileName } from "@/actions/customer-excess"
import CustomerExcessLineItemList from "./_components/customer-excess-line-item-list"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default async function CustomerExcessLineItemsPage({ params }: { params: { code: string; fileName: string } }) {
  const { code, fileName } = params

  if (!fileName) notFound()

  const lineItems = await getCustomerExcessLineItemsByFileName(fileName)

  return (
    <ContentLayout title={`Customer Excess - ${fileName}`}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Customer Excess" },
          { label: "File Name" },
          { label: fileName, isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={`Customer Excess - ${fileName}`}
          description={`View the line items for this customer excess with file name - ${fileName}`}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/customer-excesses`}>
                Back
              </Link>

              {code && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/customer-excesses/${code}`}>
                        <Icons.pencil className='mr-2 size-4' /> Edit
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/customer-excesses/${code}/view`}>
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
            <CustomerExcessLineItemList fileName={fileName} lineItems={lineItems} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
