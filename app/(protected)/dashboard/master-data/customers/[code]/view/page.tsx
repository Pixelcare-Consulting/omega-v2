import { notFound } from "next/navigation"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import ViewCustomer from "./_components/view-customer"
import { getBpMasters } from "@/actions/sap-bp-master"

export default async function ViewCustomersPage({ params }: { params: { code: string } }) {
  const { code } = params

  const customers = await getBpMasters({ cardType: "C" })

  const customer = customers?.value?.find((customer: any) => customer.CardCode === code)

  if (!customer) notFound()

  return (
    <ContentLayout title='Customers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data" },
          { label: "Customers", href: "/dashboard/master-data/customers" },
          { label: customer.CardName },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewCustomer customer={customer} />
      </ContentContainer>
    </ContentLayout>
  )
}
