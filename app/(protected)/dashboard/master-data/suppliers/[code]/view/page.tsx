import { notFound } from "next/navigation"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import ViewSupplier from "./_components/view-supplier"
import { getBpMasterByCardCode } from "@/actions/bp-master"
import { getItemMasterGroups } from "@/actions/item-master"
import { getManufacturers } from "@/actions/manufacturer"

export default async function ViewSupplierPage({ params }: { params: { code: string } }) {
  const { code } = params

  const [supplier, itemGroups, manufacturers] = await Promise.all([
    !code ? null : await getBpMasterByCardCode(code),
    getItemMasterGroups(),
    getManufacturers(),
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
        <ViewSupplier supplier={supplier} itemGroups={itemGroups?.value || []} manufacturers={manufacturers?.value || []} />
      </ContentContainer>
    </ContentLayout>
  )
}
