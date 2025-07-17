import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import RequisitionList from "./_components/requisition-list"
import { getRequisitions } from "@/actions/requisition"
import { Card } from "@/components/ui/card"
import { getItems } from "@/actions/item-master"

export default async function RequisitionsPage() {
  const [requisitions, items] = await Promise.all([await getRequisitions(), await getItems()])

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
          <Card className='p-6'>
            <RequisitionList requisitions={requisitions} items={items} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
