import { notFound } from "next/navigation"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import ViewCustomer from "./_components/view-customer"
import { getBpMasterByCardCode, getCountries } from "@/actions/master-bp"

export default async function ViewCustomersPage({ params }: { params: { code: string } }) {
  const { code } = params

  const [customer, countries] = await Promise.all([!code ? null : await getBpMasterByCardCode(code), getCountries()])

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
        <ViewCustomer customer={customer} countries={countries?.value || []} />
      </ContentContainer>
    </ContentLayout>
  )
}
