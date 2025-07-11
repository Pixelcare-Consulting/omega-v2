import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import SupplierForm from "../_components/supplier-form"
import { getSupplierById } from "@/actions/supplier"

export default async function SupplierPage({ params }: { params: { id: string } }) {
  const { id } = params
  const supplier = id === "add" ? null : await getSupplierById(id)

  return (
    <ContentLayout title='Supplier'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Suppliers", href: "/dashboard/global-procurement/suppliers" },
          { label: id !== "add" && supplier ? supplier.CardName || supplier.id : "Add" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <SupplierForm supplier={supplier} />
      </div>
    </ContentLayout>
  )
}
