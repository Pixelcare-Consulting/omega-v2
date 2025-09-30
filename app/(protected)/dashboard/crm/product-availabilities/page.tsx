import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getProductAvailabilities } from "@/actions/product-availability"

export default async function ProductAvailabilitiesPage() {
  const productAvailabilities = await getProductAvailabilities()

  return (
    <ContentLayout title='Product Availabilities'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Product Availabilities", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Product Availabilities'
          description='Manage and track your product availabilities effectively'
          defaultAction={{
            label: "Add Product Availability",
            href: "/dashboard/crm/product-availabilities/add",
            icon: Icons.plus,
          }}
        >
          <Card className='rounded-lg p-6 shadow-md'></Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
