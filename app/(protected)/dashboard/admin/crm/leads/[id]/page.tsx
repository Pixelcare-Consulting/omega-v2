import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/Breadcrumbs"
import LeadForm from "../_components/lead-form"
import { getLeadById } from "@/actions/lead"
import { notFound } from "next/navigation"

export default async function LeadPage({ params }: { params: { id: string } }) {
  const { id } = params
  const lead = id === "add" ? null : await getLeadById(id)

  if (id !== "add" && !lead) notFound()

  return (
    <ContentLayout title='Leads'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Leads", href: "/dashboard/admin/crm/leads" },
          { label: id !== "add" && lead ? lead.name : "Add" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <LeadForm lead={lead} />
      </div>
    </ContentLayout>
  )
}
