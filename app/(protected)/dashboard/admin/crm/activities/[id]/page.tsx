import { getAcvtityById } from "@/actions/activity"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/Breadcrumbs"
import { notFound } from "next/navigation"
import ActivityForm from "../_components/activity-form"
import { getLeads } from "@/actions/lead"

export default async function ActivityPage({ params }: { params: { id: string } }) {
  const { id } = params

  const [activity, leads] = await Promise.all([id === "add" ? null : await getAcvtityById(id), await getLeads()])

  if (id !== "add" && !activity) notFound()

  return (
    <ContentLayout title='Activities'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Activities", href: "/dashboard/admin/crm/activities" },
          { label: id !== "add" && activity ? activity.title : "Add" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <ActivityForm activity={activity} leads={leads} />
      </div>
    </ContentLayout>
  )
}
