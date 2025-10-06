import { notFound } from "next/navigation"

import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getSupplierOfferLineItemsByFileName } from "@/actions/supplier-offer"
import SupplierOfferLineItemList from "./_components/supplier-offer-line-item-list"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default async function SupplierOfferLineItemsPage({ params }: { params: { code: string; fileName: string } }) {
  const { code, fileName } = params

  if (!fileName) notFound()

  const lineItems = await getSupplierOfferLineItemsByFileName(fileName)

  return (
    <ContentLayout title={`Supplier Offers - ${fileName}`}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Supplier Offers" },
          { label: "File Name" },
          { label: fileName, isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={`Supplier Offers - ${fileName}`}
          description={`View the line items for this supplier offer with file name - ${fileName}`}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/supplier-offers`}>
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
                      <Link href={`/dashboard/crm/supplier-offers/${code}`}>
                        <Icons.pencil className='mr-2 size-4' /> Edit
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/supplier-offers/${code}/view`}>
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
            <SupplierOfferLineItemList fileName={fileName} lineItems={lineItems} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
