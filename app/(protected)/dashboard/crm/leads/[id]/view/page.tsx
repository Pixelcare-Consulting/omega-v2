import { getLeadById } from "@/actions/lead"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { notFound } from "next/navigation"
import ViewLead from "./_components/view-lead"

export default async function ViewLeadPage({ params }: { params: { id: string } }) {
  const { id } = params

  const [lead] = await Promise.all([id === "add" ? null : await getLeadById(id)])

  if (!lead) notFound()

  return (
    <ContentLayout title='Leads'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Leads", href: "/dashboard/crm/leads" },
          { label: lead ? lead.name : "Add" },
          { label: "View", isPage: true },
        ]}
      />

      <ContentContainer>
        <ViewLead lead={lead} />
      </ContentContainer>
    </ContentLayout>
  )
}
