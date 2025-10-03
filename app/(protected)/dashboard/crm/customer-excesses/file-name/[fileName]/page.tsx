import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getCustomerExcessLineItemsByFileName } from "@/actions/customer-excess"
import CustomerExcessLineItemList from "../../_components/customer-excess-line-item-list"
import { notFound } from "next/navigation"

export default async function CustomerExcessLineItemsPage({ params }: { params: { fileName: string } }) {
  const { fileName } = params

  if (!fileName) notFound()

  const lineItems = await getCustomerExcessLineItemsByFileName(fileName)

  return (
    <ContentLayout title={`Customer Excess - ${fileName}`}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Customer Excess" },
          { label: "File Name" },
          { label: fileName, isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title={`Customer Excess - ${fileName}`}
          description={`View the line items for this customer excess with file name - ${fileName}`}
          defaultAction={{
            label: "Back",
            href: "/dashboard/crm/customer-excesses",
          }}
        >
          <Card className='rounded-lg p-6 shadow-md'>
            <CustomerExcessLineItemList fileName={fileName} lineItems={lineItems} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
