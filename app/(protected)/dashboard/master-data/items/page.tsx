import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import ItemList from "./_components/item-list"
import { getItems } from "@/actions/sap-item"

export default async function ItemsPage() {
  const items = await getItems()

  return (
    <ContentLayout title='Items'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data" },
          { label: "Items", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper title='Items' description='Manage and track your items effectively'>
          <Card className='p-6'>
            <ItemList items={items?.value || []} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
