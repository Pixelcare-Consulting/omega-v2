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
import { getSupplierOfferByCode } from "@/actions/supplier-offer"
import SupplierOfferForm from "../_components/supplier-offer-form"

export default async function SupplierOfferPage({ params }: { params: { code: string } }) {
  const { code } = params

  const supplierOffer = await getSupplierOfferByCode(parseInt(code))

  const getPageMetadata = () => {
    if (!supplierOffer || !supplierOffer?.id || code === "add")
      return { title: "Add Supplier Offer", description: "Fill in the form to create a new supplier offer." }
    return { title: "Edit Supplier Offer", description: "Edit the form to update this supplier offer's information." }
  }

  const pageMetadata = getPageMetadata()

  if (code !== "add" && !supplierOffer) notFound()

  return (
    <ContentLayout title='Supplier Offers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Supplier Offers", href: "/dashboard/crm/supplier-offers" },
          { label: code !== "add" && supplierOffer ? String(supplierOffer.code) : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/supplier-offers`}>
                Back
              </Link>

              {supplierOffer && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/supplier-offers/add`}>
                        <Icons.plus className='mr-2 size-4' /> Add
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/supplier-offers/${supplierOffer.code}/view`}>
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
            <SupplierOfferForm supplierOffer={supplierOffer} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
