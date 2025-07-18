import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import SupplierLists from "./_components/supplier-list"
import { getBpMasters } from "@/actions/bp-master"
import { getSyncMetaByCode } from "@/actions/sync-meta"
import SupplierListHeader from "./_components/supplier-list-header"
import { Icons } from "@/components/icons"

export default async function SuppliersPage() {
  const [syncMeta, suppliers] = await Promise.all([getSyncMetaByCode("S"), getBpMasters({ cardType: "S" })])

  return (
    <ContentLayout title='Suppliers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data" },
          { label: "Suppliers", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Suppliers'
          description='Manage and track your suppliers effectively'
          defaultAction={{
            label: "Add Supplier",
            href: "/dashboard/master-data/suppliers/add",
            icon: Icons.plus,
          }}
        >
          {syncMeta && (
            <Card className='rounded-lg p-6 shadow-md'>
              <SupplierListHeader syncMeta={syncMeta} />
            </Card>
          )}

          <Card className='rounded-lg p-6 shadow-md'>
            <SupplierLists suppliers={suppliers} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
