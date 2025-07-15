import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import CustomerLists from "./_components/customer-list"
import { getBpMasters } from "@/actions/sap-bp-master"
import { getSyncMetaByCode } from "@/actions/sync-meta"
import CustomerListHeader from "./_components/customer-list-header"

export default async function CustomersPage() {
  const [syncMeta, customers] = await Promise.all([getSyncMetaByCode("C"), getBpMasters({ cardType: "C" })])

  return (
    <ContentLayout title='Customers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data" },
          { label: "Customers", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper title='Customers' description='Manage and track your customers effectively'>
          {syncMeta && (
            <Card className='rounded-lg p-6 shadow-md'>
              <CustomerListHeader syncMeta={syncMeta} />
            </Card>
          )}

          <Card className='rounded-lg p-6 shadow-md'>
            <CustomerLists customers={customers} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
