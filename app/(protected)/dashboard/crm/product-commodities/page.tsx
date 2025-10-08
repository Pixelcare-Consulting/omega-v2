import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getProductCommodities } from "@/actions/product-commodity"
import ProductCommodityList from "./_components/product-commodity-list"

export default async function ProductCommoditiesPage() {
  const productCommodities = await getProductCommodities()

  return (
    <ContentLayout title='Product Commodities'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Product Commodities", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Product Commodities'
          description='Manage and track your product commodity effectively'
          defaultAction={{
            label: "Add Product Commodity",
            href: "/dashboard/crm/product-commodities/add",
            icon: Icons.plus,
          }}
        >
          <Card className='rounded-lg p-6 shadow-md'>
            <ProductCommodityList productCommodities={productCommodities} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
