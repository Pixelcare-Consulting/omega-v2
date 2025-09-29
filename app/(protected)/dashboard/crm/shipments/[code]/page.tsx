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
import ShipmentForm from "../_components/shipment-form"
import { getShipmentByCode } from "@/actions/shipment"

export default async function ShipmentPage({ params }: { params: { code: string } }) {
  const { code } = params

  const shipment = await getShipmentByCode(parseInt(code))

  const getPageMetadata = () => {
    if (!shipment || !shipment?.id || code === "add")
      return { title: "Add Shipment", description: "Fill in the form to create a new shipment." }
    return { title: "Edit Shipment", description: "Edit the form to update this shipment's information." }
  }

  const pageMetadata = getPageMetadata()

  if (code !== "add" && !shipment) notFound()

  return (
    <ContentLayout title='Shipments'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Shipments", href: "/dashboard/logistics/shipments" },
          { label: code !== "add" && shipment ? String(shipment.code) : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/shipments`}>
                Back
              </Link>

              {shipment && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/shipments/${shipment.code}/view`}>
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
            <ShipmentForm shipment={shipment} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
