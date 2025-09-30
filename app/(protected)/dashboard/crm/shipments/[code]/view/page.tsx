import { getShipmentByCode } from "@/actions/shipment"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { notFound } from "next/navigation"
import ViewShipment from "./_components/view-shipment"

export default async function ViewShipmentPage({ params }: { params: { code: string } }) {
  const { code } = params

  const shipment = await getShipmentByCode(parseInt(code))

  if (!shipment) notFound()

  return (
    <ContentLayout title='Shipments'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Shipments", href: "/dashboard/crm/shipments" },
          { label: String(shipment.code) },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewShipment shipment={shipment} />
      </ContentContainer>
    </ContentLayout>
  )
}
