import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"

export default function ShipmentsPage() {
  return (
    <ContentLayout title='Shipments'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Logistics" },
          { label: "Shipments", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Shipments'
          description='Manage and track your shipments effectively'
          defaultAction={{
            label: "Add Shipment",
            href: "/dashboard/crm/shipments/add",
            icon: Icons.plus,
          }}
        >
          <Card className='rounded-lg p-6 shadow-md'></Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
