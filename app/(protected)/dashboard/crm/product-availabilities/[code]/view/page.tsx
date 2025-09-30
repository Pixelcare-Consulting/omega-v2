import { getProductAvailabilityByCode } from "@/actions/product-availability"
import ContentContainer from "@/app/(protected)/_components/content-container"
import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import { notFound } from "next/navigation"
import ViewProductAvailability from "./_components/view-product-availability"

export default async function ViewProductAvailabilityPage({ params }: { params: { code: string } }) {
  const { code } = params

  const productAvailability = await getProductAvailabilityByCode(parseInt(code))

  if (!productAvailability) notFound()

  return (
    <ContentLayout title='Product Availabilities'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM" },
          { label: "Product Availabilities", href: "/dashboard/crm/product-availabilities" },
          { label: String(productAvailability.code) },
          { label: "View", isPage: true },
        ]}
      />
      <ContentContainer>
        <ViewProductAvailability productAvailability={productAvailability} />
      </ContentContainer>
    </ContentLayout>
  )
}
