import { getItems } from "@/actions/item"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ItemList from "./_components/item-list"

export default async function ItemsPage() {
  const items = await getItems()

  return (
    <ContentLayout title='Items'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "items", href: "/dashboard/global-procurement/items" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <ItemList items={items} />
      </div>
    </ContentLayout>
  )
}
