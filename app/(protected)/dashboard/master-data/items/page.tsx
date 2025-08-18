import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import ItemList from "./_components/item-list"
import { getSyncMetaByCode } from "@/actions/sync-meta"
import ItemListHeader from "./_components/item-list-header"
import { getItems } from "@/actions/master-item"
import { Icons } from "@/components/icons"

export default async function ItemsPage() {
  const [syncMeta, items] = await Promise.all([getSyncMetaByCode("item"), getItems()])

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
        <PageWrapper
          title='Items'
          description='Manage and track your items effectively'
          defaultAction={{
            label: "Add Item",
            href: "/dashboard/master-data/items/add",
            icon: Icons.plus,
          }}
        >
          {syncMeta && (
            <Card className='rounded-lg p-6 shadow-md'>
              <ItemListHeader syncMeta={syncMeta} />
            </Card>
          )}

          <Card className='rounded-lg p-6 shadow-md'>
            <ItemList items={items} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
