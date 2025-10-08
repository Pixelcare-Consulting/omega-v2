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
import { getProductBrandByCode } from "@/actions/product-brand"
import ProductBrandForm from "../_components/product-brand-form"

export default async function ProductBrandPage({ params }: { params: { code: string } }) {
  const { code } = params

  const productBrand = await getProductBrandByCode(parseInt(code))

  const getPageMetadata = () => {
    if (!productBrand || !productBrand?.id || code === "add")
      return { title: "Add Product Brand", description: "Fill in the form to create a new product brand." }
    return { title: "Edit Product Brand", description: "Edit the form to update this product brand's information." }
  }

  const pageMetadata = getPageMetadata()

  if (code !== "add" && !productBrand) notFound()

  return (
    <ContentLayout title='Product Brands'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Product Brands", href: "/dashboard/crm/product-brands" },
          { label: code !== "add" && productBrand ? String(productBrand.code) : "Add", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/product-brands`}>
                Back
              </Link>

              {productBrand && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/product-brands/add`}>
                        <Icons.plus className='mr-2 size-4' /> Add
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/product-brands/${productBrand.code}/view`}>
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
            <ProductBrandForm productBrand={productBrand} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
