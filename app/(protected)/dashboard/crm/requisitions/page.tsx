import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import RequisitionList from "./_components/requisition-list"

export default function RequisitionsPage() {
  const requisitions = [
    {
      date: "7/3/2025",
      customer: "Moon Corp",
      customerPoHitRate: "1.86%",
      salesperson: "John Doe",
      brokerBuy: "",
      urgency: "Hot! - Shortage",
      purchasingStatus: "New",
      result: "Not Quoted",
      mpn: "SM3ZS067U215AAS1499",
      mfr: "Microchip",
      requestedQuantity: "100",
      omegaBuyer: "Kennen Johnson",
    },
    {
      date: "7/3/2025",
      customer: "Rocket Inc.",
      customerPoHitRate: "30.24%",
      salesperson: "Kitty Doe",
      brokerBuy: "Broker Buy",
      urgency: "Normal - VMI",
      purchasingStatus: "Answers Back",
      result: "Not Quoted",
      mpn: "SK3ZS088U211BBS1488",
      mfr: "Intel",
      requestedQuantity: "45",
      omegaBuyer: "PO Won",
    },
    {
      date: "7/3/2025",
      customer: "Platinum Corp.",
      customerPoHitRate: "56%",
      salesperson: "Sam Willy",
      brokerBuy: "Broker Buy",
      urgency: "Hot! - Shortage",
      purchasingStatus: "New",
      result: "Quoted - Waiting",
      mpn: "SK3ZS088U222CCS1477",
      mfr: "Nvidia",
      requestedQuantity: "200",
      omegaBuyer: "Jerry Mio",
    },
  ]

  return (
    <ContentLayout title='Requisitions'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Requisitions", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Requisitions'
          description='Manage and track your requisitions effectively'
          defaultAction={{
            label: "Add Requisition",
            href: "/dashboard/crm/requisitions/add",
            icon: Icons.plus,
          }}
        >
          <RequisitionList requisitions={requisitions} />
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
