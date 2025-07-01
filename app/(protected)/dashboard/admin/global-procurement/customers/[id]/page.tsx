import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import CustomerForm from "../_components/customer-form"
import { getCustomerById } from "@/actions/customer"
import { notFound } from "next/navigation"

export default async function CustomerPage({ params }: { params: { id: string } }) {
  const { id } = params
  const customer = id === "add" ? null : await getCustomerById(id)

  if (id !== "add" && !customer) notFound()

  return (
    <ContentLayout title='Customers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Customer", href: "/dashboard/admin/global-procurement/customers" },
          { label: id !== "add" && customer ? customer.CardName || customer.id : "Add" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <CustomerForm customer={customer} />
      </div>
    </ContentLayout>
  )
}
