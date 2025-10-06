import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getSupplierOffers } from "@/actions/supplier-offer"
import SupplierOfferList from "./_components/supplier-offer-list"

export default async function SupplierOffersPage() {
  const supplierOffers = await getSupplierOffers()

  return (
    <ContentLayout title='Supplier Offers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Supplier Offers", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Supplier Offers'
          description='Manage and track your supplier offers effectively'
          defaultAction={{
            label: "Add Supplier Offer",
            href: "/dashboard/crm/supplier-offers/add",
            icon: Icons.plus,
          }}
        >
          <Card className='rounded-lg p-6 shadow-md'>
            <SupplierOfferList supplierOffers={supplierOffers} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
