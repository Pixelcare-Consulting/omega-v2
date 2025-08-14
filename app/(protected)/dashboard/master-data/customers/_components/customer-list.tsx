"use client"

import { useMemo } from "react"

import getColumns from "./customer-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { getBpMasters } from "@/actions/bp-master"
import { SOURCES_OPTIONS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { BP_MASTER_CUSTOMER_STATUS_OPTIONS, BP_MASTER_CUSTOMER_TYPE_OPTIONS } from "@/schema/bp-master"

type CustomersListsProps = {
  customers: Awaited<ReturnType<typeof getBpMasters>>
}

export default function CustomerLists({ customers }: CustomersListsProps) {
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Customer", columnId: "customer", type: "text" },
      { label: "Group", columnId: "group name", type: "text" },
      {
        label: "Credit Hold",
        columnId: "credit hold",
        type: "select",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      { label: "Type", columnId: "type", type: "select", options: BP_MASTER_CUSTOMER_TYPE_OPTIONS },
      { label: "Status", columnId: "status", type: "select", options: BP_MASTER_CUSTOMER_STATUS_OPTIONS },
      {
        label: "Active",
        columnId: "active",
        type: "select",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      { label: "Sales Employee", columnId: "sales employee", type: "text" },
      { label: "BDR / Inside Sales Rep", columnId: "bdr inside sales rep", type: "text" },
      { label: "Account Executive", columnId: "account executive", type: "text" },
      { label: "Account Associate", columnId: "account associate", type: "text" },
      { label: "Sync Status", columnId: "sync status", type: "select", options: SYNC_STATUSES_OPTIONS },
      {
        label: "Source",
        columnId: "source",
        type: "select",
        options: SOURCES_OPTIONS,
      },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: customers,
    columns: columns,
    initialState: { columnPinning: { right: ["actions"] } },
  })

  return (
    <DataTable table={table}>
      <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
        <DataTableSearch table={table} className='' />

        <div className='flex items-center gap-2'>
          <DataTableFilter className='w-full md:w-fit' table={table} filterFields={filterFields} columnFilters={columnFilters} />
          <DataTableViewOptions className='w-full md:w-fit' table={table} columnVisibility={columnVisibility} />
        </div>
      </div>
    </DataTable>
  )
}
