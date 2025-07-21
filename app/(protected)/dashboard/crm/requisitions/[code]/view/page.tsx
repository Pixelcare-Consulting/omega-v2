import { notFound } from "next/navigation"

import { getRequisitionByCode } from "@/actions/requisition"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ViewRequisition from "./_components/view-requisition"
import { getItems } from "@/actions/item-master"

export default async function ViewRequisitionPage({ params }: { params: { code: string } }) {
  const { code } = params

  const [requisition, items] = await Promise.all([code === "add" ? null : await getRequisitionByCode(parseInt(code)), getItems()])

  if (!requisition) notFound()

  return (
    <ContentLayout title='Requisitions'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Requisitions", href: "/dashboard/crm/requisitions" },
          { label: String(requisition.code) },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewRequisition requisition={requisition} items={items} />
      </ContentContainer>
    </ContentLayout>
  )
}
