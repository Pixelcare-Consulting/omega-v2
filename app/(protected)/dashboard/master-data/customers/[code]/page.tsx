import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import ContentContainer from "@/app/(protected)/_components/content-container"
import UnderDevelopment from "@/components/under-development"

export default function CustomerPage({ params }: { params: { code: string } }) {
  return (
    <ContentLayout title='Customers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data" },
          { label: "Customers", href: "/dashboard/master-data/customers" },
          { label: "Undefined", isPage: true },
        ]}
      />
      <ContentContainer>
        <UnderDevelopment className='h-[80vh]' />
      </ContentContainer>
    </ContentLayout>
  )
}
