import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import UnderDevelopment from "@/components/under-development"

export default function SupplierPage({ params }: { params: { code: string } }) {
  return (
    <ContentLayout title='Suppliers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data" },
          { label: "Suppliers", href: "/dashboard/master-data/suppliers" },
          { label: "Undefined", isPage: true },
        ]}
      />
      <ContentContainer>
        <UnderDevelopment className='h-[80vh]' />
      </ContentContainer>
    </ContentLayout>
  )
}
