import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/Breadcrumbs"
import SupplierList from "./_components/supplier-list"
import { getSuppliers } from "@/actions/supplier"

export default async function CustomersPage() {
  const suppliers = await getSuppliers()

  return (
    <ContentLayout title='Customers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Suppliers", href: "/dashboard/admin/global-procurement/suppliers" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <SupplierList suppliers={suppliers} />
      </div>
    </ContentLayout>
  )
}
