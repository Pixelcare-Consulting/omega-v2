import { getLeadById, getLeads } from "@/actions/lead"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { notFound } from "next/navigation"
import ViewLead from "./_components/view-lead"
import { getAccounts } from "@/actions/account"

export default async function ViewLeadPage({ params }: { params: { id: string } }) {
  const { id } = params

  const [lead, accounts, leads] = await Promise.all([id === "add" ? null : await getLeadById(id), getAccounts(), getLeads()])

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
        <ViewLead lead={lead} leads={leads} accounts={accounts} />
      </ContentContainer>
    </ContentLayout>
  )
}
