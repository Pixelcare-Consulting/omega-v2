import Breadcrumbs from "@/components/breadcrumbs"
import { ContentLayout } from "../../_components/content-layout"
import ContentContainer from "../../_components/content-container"
import PageWrapper from "../../_components/page-wrapper"
import { getActivityLogs } from "@/actions/activity-logs"
import ActivityLogList from "./_components/activity-logs-list"

export default async function ActivityLogsPage() {
  const activityLogs = await getActivityLogs()

  return (
    <ContentLayout title='Activity Logs'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Activity Logs", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper title='Activity Logs' description='Manage and track your activity Logs effectively'>
          <ActivityLogList activityLogs={activityLogs} />
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
