import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/Breadcrumbs"
import LeadList from "./_components/lead-list"
import { getLeads } from "@/actions/lead"

export default async function LeadsPage() {
  const leads = await getLeads()

  return (
    <ContentLayout title='Leads'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Leads", href: "/dashboard/admin/crm/leads" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <LeadList leads={leads} />
      </div>
    </ContentLayout>
  )
}
