import { notFound } from "next/navigation"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import ViewSupplier from "./_components/view-supplier"
import { getBpMasterByCardCode, getCountries } from "@/actions/master-bp"
import { getItemGroups } from "@/actions/master-item"
import { getManufacturers } from "@/actions/manufacturer"

export default async function ViewSupplierPage({ params }: { params: { code: string } }) {
  const { code } = params

  const [supplier, itemGroups, manufacturers, countries] = await Promise.all([
    !code ? null : await getBpMasterByCardCode(code),
    getItemGroups(),
    getManufacturers(),
    getCountries(),
  ])

  if (!supplier) notFound()

  return (
    <ContentLayout title='Suppliers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data" },
          { label: "Suppliers", href: "/dashboard/master-data/suppliers" },
          { label: supplier.CardName },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewSupplier
          supplier={supplier}
          itemGroups={itemGroups?.value || []}
          manufacturers={manufacturers?.value || []}
          countries={countries?.value || []}
        />
      </ContentContainer>
    </ContentLayout>
  )
}
