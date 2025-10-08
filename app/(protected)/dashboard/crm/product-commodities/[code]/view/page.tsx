import { getProductCommodityByCode } from "@/actions/product-commodity"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { notFound } from "next/navigation"
import ViewProductCommodity from "./_components/view-product-commodity"

export default async function ViewProductCommodityPage({ params }: { params: { code: string } }) {
  const { code } = params

  const productCommodity = await getProductCommodityByCode(parseInt(code))

  if (!productCommodity) notFound()

  return (
    <ContentLayout title='Product Commodities'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Product Commodities", href: "/dashboard/crm/product-commodities" },
          { label: String(productCommodity.code) },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewProductCommodity productCommodity={productCommodity} />
      </ContentContainer>
    </ContentLayout>
  )
}
