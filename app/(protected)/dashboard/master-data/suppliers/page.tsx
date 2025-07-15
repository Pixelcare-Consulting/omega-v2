import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import SupplierLists from "./_components/supplier-list"
import { getBpMasters } from "@/actions/sap-bp-master"

export default async function SuppliersPage() {
  const suppliers = await getBpMasters({ cardType: "S" })

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
        <PageWrapper title='Suppliers' description='Manage and track your suppliers effectively'>
          <Card className='p-6'>
            <SupplierLists suppliers={suppliers?.value || []} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
