import { notFound } from "next/navigation"

import { getItems } from "@/actions/item-master"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { getSaleQuoteByCode } from "@/actions/sale-quote"
import { getRequisitions } from "@/actions/requisition"
import ViewSaleQuote from "../_components/view-sale-quote"
import { getPaymentTerms } from "@/actions/bp-master"

export default async function ViewSaleQuotePage({ params }: { params: { code: string } }) {
  const { code } = params

  const [saleQuote, items, requisitions, paymentTerms] = await Promise.all([
    code === "add" ? null : getSaleQuoteByCode(parseInt(code)),
    getItems(),
    getRequisitions(),
    getPaymentTerms(),
  ])

  if (!saleQuote) notFound()

  return (
    <ContentLayout title='Sale Quotes'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Sale Quotes", href: "/dashboard/crm/sale-quotes" },
          { label: String(saleQuote.code) },
          { label: "View", isPage: true },
        ]}
      />

      <ContentContainer>
        <ViewSaleQuote saleQuote={saleQuote} items={items} requisitions={requisitions} paymentTerms={paymentTerms?.value || []} />
      </ContentContainer>
    </ContentLayout>
  )
}
