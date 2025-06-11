import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/Breadcrumbs"
import ActivityList from "./_components/activity-list"
import { getActivities } from "@/actions/activity"

export default async function ActivitiesPage() {
  const activities = await getActivities()

  return (
    <ContentLayout title='Activities'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Activities", href: "/dashboard/admin/crm/activities" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <ActivityList activities={activities} />
      </div>
    </ContentLayout>
  )
}
