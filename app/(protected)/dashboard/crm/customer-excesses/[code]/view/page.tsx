import { getCustomerExcessByCode } from "@/actions/customer-excess"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { notFound } from "next/navigation"
import ViewCustomerExcess from "./_components/view-customer-excess"

export default async function ViewCustomerExcessPage({ params }: { params: { code: string } }) {
  const { code } = params

  const customerExcess = await getCustomerExcessByCode(parseInt(code))

  if (!customerExcess) notFound()

  return (
    <ContentLayout title='Customer Excess'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Customer Excess", href: "/dashboard/crm/customer-excesses" },
          { label: String(customerExcess.code) },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewCustomerExcess customerExcess={customerExcess} />
      </ContentContainer>
    </ContentLayout>
  )
}
