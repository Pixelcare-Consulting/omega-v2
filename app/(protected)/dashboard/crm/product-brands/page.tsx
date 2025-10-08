import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getProductBrands } from "@/actions/product-brand"
import ProductBrandList from "./_components/product-brand-list"

export default async function ProductBrandsPage() {
  const productBrands = await getProductBrands()

  return (
    <ContentLayout title='Product Brands'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Product Brands", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Product Brands'
          description='Manage and track your product brand effectively'
          defaultAction={{
            label: "Add Product Brand",
            href: "/dashboard/crm/product-brands/add",
            icon: Icons.plus,
          }}
        >
          <Card className='rounded-lg p-6 shadow-md'>
            <ProductBrandList productBrands={productBrands} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
