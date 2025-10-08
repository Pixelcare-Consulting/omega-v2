import { getProductBrandByCode } from "@/actions/product-brand"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { notFound } from "next/navigation"
import ViewProductBrand from "./_components/view-product-brand"

export default async function ViewProductBrandPage({ params }: { params: { code: string } }) {
  const { code } = params

  const productBrand = await getProductBrandByCode(parseInt(code))

  if (!productBrand) notFound()

  return (
    <ContentLayout title='Product Brands'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Product Brands", href: "/dashboard/crm/product-brands" },
          { label: String(productBrand.code) },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewProductBrand productBrand={productBrand} />
      </ContentContainer>
    </ContentLayout>
  )
}
