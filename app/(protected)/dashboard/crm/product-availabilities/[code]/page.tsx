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
import { getProductAvailabilityByCode } from "@/actions/product-availability"
import ProductAvailabilityForm from "../_components/product-availability-form"

export default async function ProductAvailabilityPage({ params }: { params: { code: string } }) {
  const { code } = params

  const productAvailability = await getProductAvailabilityByCode(parseInt(code))

  const getPageMetadata = () => {
    if (!productAvailability || !productAvailability?.id || code === "add")
      return { title: "Add Product Availability", description: "Fill in the form to create a new product availability." }
    return { title: "Edit Product Availability", description: "Edit the form to update this product availability's information." }
  }

  const pageMetadata = getPageMetadata()

  if (code !== "add" && !productAvailability) notFound()

  return (
    <ContentLayout title='Product Availability'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Product Availability", href: "/dashboard/crm/product-availabilities" },
          { label: code !== "add" && productAvailability ? String(productAvailability.code) : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/product-availabilities`}>
                Back
              </Link>

              {productAvailability && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/product-availabilities/${productAvailability.code}/view`}>
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
            <ProductAvailabilityForm productAvailability={productAvailability} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
