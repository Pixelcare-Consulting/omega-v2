import { notFound } from "next/navigation"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import ViewItem from "./_components/view-item"
import { getItems } from "@/actions/sap-item"

export default async function ViewItemPage({ params }: { params: { code: string } }) {
  const { code } = params

  const items = await getItems()

  const item = items?.value?.find((item: any) => item.ItemCode === decodeURIComponent(code))

  if (!item) notFound()

  return (
    <ContentLayout title='Items'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data" },
          { label: "Items", href: "/dashboard/master-data/items" },
          { label: item.ItemName },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewItem item={item} />
      </ContentContainer>
    </ContentLayout>
  )
}
