import { notFound } from "next/navigation"

import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import ViewSupplier from "./_components/view-supplier"
import { getBpMasterByCardCode } from "@/actions/sap-bp-master"

export default async function ViewSupplierPage({ params }: { params: { code: string } }) {
  const { code } = params
  const supplier = !code ? null : await getBpMasterByCardCode({ cardCode: code })

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
        <ViewSupplier supplier={supplier} />
      </ContentContainer>
    </ContentLayout>
  )
}
