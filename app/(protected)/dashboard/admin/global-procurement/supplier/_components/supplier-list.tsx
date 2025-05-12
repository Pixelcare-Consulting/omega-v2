"use client"

import { useState } from "react"
import { columns, Supplier } from "./columns"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { DataTableWithToolbar } from "@/components/ui/data-table/data-table-with-toolbar"
import { useRouter } from "next/navigation"

const data: Supplier[] = [
  {
    id: "467",
    status: "Approved",
    companyName: "Atlantic Semiconductor  (Do not send inquiry unless Showing stock)",
    tierLevel: "3 - Open MKT (US)",
    accountNumber: "",
    availableExcess: "",
    percentageOfQuotedRFQ: "44%",
    createdAt: "12-18-2012 04:08 PM",
    assignedBuyer: "Amanda Miner",
    cancellationRate: "",
    poFailureRate: "",
    activityRecords: "0",
    productStrength: "",
    mfrStrength: "",
    notes2: "",
  },
]

export function SupplierListClient() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filteredData = data.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    return item.companyName.toLowerCase().includes(searchLower) || item.status.toLowerCase().includes(searchLower)
  })

  return (
    <PageLayout
      title='Supplier'
      description='Manage and organize your supplier effectively'
      addButton={{
        label: "Add Supplier",
        onClick: () => router.push("/dashboard/admin/global-procurement/supplier/add"),
      }}
    >
      <DataTableWithToolbar
        columns={columns}
        data={filteredData}
        searchKey='supplier lists'
        onSearch={setSearchQuery}
        loading={isLoading}
        searchPlaceholder='Search supplier...'
      />
    </PageLayout>
  )
}
