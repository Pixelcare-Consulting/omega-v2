import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getCustomerExcesses } from "@/actions/customer-excess"
import CustomerExcessList from "./_components/customer-excess-list"

export default async function CustomerExcessesPage() {
  const customerExcesses = await getCustomerExcesses()

  return (
    <ContentLayout title='Customer Excess'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Customer Excess", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Customer Excess'
          description='Manage and track your customer excess effectively'
          defaultAction={{
            label: "Add Customer Excess",
            href: "/dashboard/crm/customer-excesses/add",
            icon: Icons.plus,
          }}
        >
          <Card className='rounded-lg p-6 shadow-md'>
            <CustomerExcessList customerExcesses={customerExcesses} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
