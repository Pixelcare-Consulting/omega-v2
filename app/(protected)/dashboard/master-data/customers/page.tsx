import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import CustomerLists from "./_components/customer-list"
import { getBpMasters } from "@/actions/sap-bp-master"

export default async function CustomersPage() {
  const customers = await getBpMasters({ cardType: "C" })

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
          <Card className='p-6'>
            <CustomerLists customers={customers?.value || []} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
