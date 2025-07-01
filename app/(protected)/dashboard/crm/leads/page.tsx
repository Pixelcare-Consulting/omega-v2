import Breadcrumbs from "@/components/breadcrumbs"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { getLeads } from "@/actions/lead"
import LeadList from "./_components/lead-list"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Icons } from "@/components/icons"

export default async function LeadsPage() {
  const leads = await getLeads()

  return (
    <ContentLayout title='Leads'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Leads", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Leads'
          description='Manage and track your leads effectively'
          defaultAction={{
            label: "Add Lead",
            href: "/dashboard/crm/leads/add",
            icon: Icons.plus,
          }}
        >
          <LeadList leads={leads} />
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
