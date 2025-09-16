import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"
import { ContentLayout } from "../../_components/content-layout"
import ContentContainer from "../../_components/content-container"
import PageWrapper from "../../_components/page-wrapper"
import ScheduleCalendar from "./_components/schedule-calendar"
import { getActivitiesByType, getActivitiesByModule } from "@/actions/activity"

export default async function CalendarPage() {
  const activities = await getActivitiesByType(["meeting"])

  return (
    <ContentLayout title='Leads'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Calendar", href: "/dashboard/calendar", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Calendar'
          description='Manage and track your meetings and other various events.'
          defaultAction={{
            label: "Add ",
            href: "/dashboard/crm/activities/add",
            icon: Icons.plus,
          }}
        >
          <Card className='rounded-lg p-6 shadow-md'>
            <ScheduleCalendar activities={activities} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
