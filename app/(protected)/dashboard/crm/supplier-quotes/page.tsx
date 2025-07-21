import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getSupplierQuotes } from "@/actions/supplier-quote"
import SupplierQuoteList from "./_components/supplier-quote-list"
import { getItems } from "@/actions/item-master"

export default async function SupplierQuotesPage() {
  const [supplierQuotes, items] = await Promise.all([getSupplierQuotes(), getItems()])

  return (
    <ContentLayout title='Supplier Quotes'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Supplier Quotes", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Supplier Quotes'
          description='Manage and track your supplie quotes effectively'
          defaultAction={{
            label: "Add Supplier Quote",
            href: "/dashboard/crm/supplier-quotes/add",
            icon: Icons.plus,
          }}
        >
          <Card className='rounded-lg p-6 shadow-md'>
            <SupplierQuoteList supplierQuotes={supplierQuotes} items={items} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
