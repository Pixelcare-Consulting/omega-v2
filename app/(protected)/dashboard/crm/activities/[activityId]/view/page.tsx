import { notFound } from "next/navigation"

import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { getAcvtityById } from "@/actions/activity"
import ViewActivity from "./_components/ViewActivity"

export default async function ViewActivityPage({ params }: { params: { activityId: string } }) {
  const { activityId } = params

  const activity = await getAcvtityById(activityId)

  if (!activity) notFound()

  return (
    <ContentLayout title='Requisitions'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Activities" },
          { label: activity.title },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewActivity activity={activity} />
      </ContentContainer>
    </ContentLayout>
  )
}
