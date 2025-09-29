import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import ShipmentList from "./_components/shipment-list"
import { getShipments } from "@/actions/shipment"

export default async function ShipmentsPage() {
  const shipments = await getShipments()

  return (
    <ContentLayout title='Shipments'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
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
          <Card className='rounded-lg p-6 shadow-md'>
            <ShipmentList shipments={shipments} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
