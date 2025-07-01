import { ContentLayout } from "@/app/(protected)/_components/content-layout"
import Breadcrumbs from "@/components/breadcrumbs"
import React from "react"
import CustomerList from "./_components/customer-list"
import { getCustomers } from "@/actions/customer"

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <ContentLayout title='Customers'>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Customers", href: "/dashboard/admin/global-procurement/customers" },
        ]}
      />

      <div className='min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)]'>
        <CustomerList customers={customers} />
      </div>
    </ContentLayout>
  )
}
