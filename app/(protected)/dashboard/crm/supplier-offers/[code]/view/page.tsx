import { getSupplierOfferByCode } from "@/actions/supplier-offer"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { notFound } from "next/navigation"
import ViewSupplierOffer from "./_components/view-supplier-offer"

export default async function ViewSupplierOfferPage({ params }: { params: { code: string } }) {
  const { code } = params

  const supplierOffer = await getSupplierOfferByCode(parseInt(code))

  if (!supplierOffer) notFound()

  return (
    <ContentLayout title='Supplier Offers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Supplier Offers", href: "/dashboard/crm/supplier-offers" },
          { label: String(supplierOffer.code) },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewSupplierOffer supplierOffer={supplierOffer} />
      </ContentContainer>
    </ContentLayout>
  )
}
