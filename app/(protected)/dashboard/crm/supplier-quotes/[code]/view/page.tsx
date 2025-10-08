import { notFound } from "next/navigation"

import { getItems } from "@/actions/master-item"
import { getSupplierQuoteByCode } from "@/actions/supplier-quote"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import ViewSupplierQuote from "./_components/view-supplier-quote"

export default async function ViewSupplierQuotePage({ params }: { params: { code: string } }) {
  const { code } = params

  const [supplierQuote, items] = await Promise.all([code === "add" ? null : await getSupplierQuoteByCode(parseInt(code)), getItems()])

  if (!supplierQuote) notFound()

  return (
    <ContentLayout title='Supplier Quotes'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Supplier Quotes", href: "/dashboard/crm/supplier-quotes" },
          { label: String(supplierQuote.code) },
          { label: "View", isPage: true },
        ]}
      />

      <ContentContainer>
        <ViewSupplierQuote supplierQuote={supplierQuote} items={items} />
      </ContentContainer>
    </ContentLayout>
  )
}
