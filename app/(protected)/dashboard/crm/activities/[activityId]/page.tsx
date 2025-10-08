import { notFound } from "next/navigation"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getAcvtityById } from "@/actions/activity"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import ActivityForm from "../_components/activity-form"
import { getLeads } from "@/actions/lead"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"

export default async function ActivityPage({ params }: { params: { id: string; activityId: string } }) {
  const { activityId } = params

  const activity = await getAcvtityById(activityId)

  const getPageMetadata = () => {
    if (!activity || !activity?.id || activityId === "add")
      return { title: "Add Activity", description: "Fill in the form to create a new activity." }
    return { title: "Edit Activity", description: "Edit the form to update this activity's information." }
  }

  const pageMetadata = getPageMetadata()

  if (activityId !== "add" && !activity) notFound()

  return (
    <ContentLayout title='Activities'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Activities" },
          { label: activityId !== "add" && activity ? activity.title : "Add" },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={pageMetadata.title}
          description={pageMetadata.description}
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/calendar`}>
                Back
              </Link>

              {activity && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='default' size='icon'>
                      <Icons.moreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/activities/add`}>
                        <Icons.plus className='mr-2 size-4' /> Add
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/crm/activities/${activity.id}/view`}>
                        <Icons.eye className='mr-2 size-4' /> View
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          }
        >
          <Card className='rounded-lg p-6 shadow-md'>
            <ActivityForm activity={activity} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
