import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { Icons } from "@/components/icons"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Card } from "@/components/ui/card"
import { getItems } from "@/actions/item-master"
import SaleQuoteList from "./_components/sale-quote-list"

export default async function SaleQuotesPage() {
  const salesQuotes = [] as any

  return (
    <ContentLayout title='Sale Quotes'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Sale Quotes", isPage: true },
        ]}
      />

      <ContentContainer>
        <PageWrapper
          title='Sale Quotes'
          description='Manage and track your sale quotes effectively'
          defaultAction={{
            label: "Add Sale Quote",
            href: "/dashboard/crm/sale-quotes/add",
            icon: Icons.plus,
          }}
        >
          <Card className='rounded-lg p-6 shadow-md'>
            <SaleQuoteList salesQuotes={salesQuotes} />
          </Card>
        </PageWrapper>
      </ContentContainer>
    </ContentLayout>
  )
}
