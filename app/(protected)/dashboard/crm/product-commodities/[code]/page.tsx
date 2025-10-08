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
import { getProductCommodityByCode } from "@/actions/product-commodity"
import ProductCommodityForm from "../_components/product-commodity-form"

export default async function ProductCommodityPage({ params }: { params: { code: string } }) {
  const { code } = params

  const productCommodity = await getProductCommodityByCode(parseInt(code))

  const getPageMetadata = () => {
    if (!productCommodity || !productCommodity?.id || code === "add")
      return { title: "Add Product Commodity", description: "Fill in the form to create a new product commodity." }
    return { title: "Edit Product Commodity", description: "Edit the form to update this product commodity's information." }
  }

  const pageMetadata = getPageMetadata()

  if (code !== "add" && !productCommodity) notFound()

  return (
    <ContentLayout title='Product Commodities'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Product Commodities", href: "/dashboard/crm/product-commodities" },
          { label: code !== "add" && productCommodity ? String(productCommodity.code) : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/product-commodities`}>
                Back
              </Link>

              {productCommodity && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/product-commodities/add`}>
                        <Icons.plus className='mr-2 size-4' /> Add
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/product-commodities/${productCommodity.code}/view`}>
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
            <ProductCommodityForm productCommodity={productCommodity} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
