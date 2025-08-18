"use client"

import { useMemo } from "react"

import getColumns from "./supplier-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { getBpMasters } from "@/actions/master-bp"
import { SOURCES_OPTIONS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { BP_MASTER_SUPPLIER_SCOPE_OPTIONS } from "@/schema/master-bp"

type SuppliersListsProps = {
  suppliers: Awaited<ReturnType<typeof getBpMasters>>
  itemGroups?: any
  manufacturers?: any
}

export default function SupplierLists({ suppliers, itemGroups, manufacturers }: SuppliersListsProps) {
  const columns = useMemo(() => getColumns(itemGroups, manufacturers), [JSON.stringify(itemGroups), JSON.stringify(manufacturers)])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Supplier", columnId: "supplier", type: "text" },
      { label: "Group", columnId: "group name", type: "text" },
      { label: "Status", columnId: "status", type: "text" },
      { label: "scope", columnId: "scope", type: "select", options: BP_MASTER_SUPPLIER_SCOPE_OPTIONS },
      { label: "Date Created", columnId: "date created", type: "date" },
      { label: "Assigned Buyer", columnId: "assigned buyer", type: "text" },
      { label: "Commodity Strengths", columnId: "commodity strengths", type: "text" },
      { label: "MFR Strengths", columnId: "mfr strengths", type: "text" },
      { label: "Sync Status", columnId: "sync status", type: "select", options: SYNC_STATUSES_OPTIONS },
      { label: "Source", columnId: "source", type: "select", options: SOURCES_OPTIONS },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: suppliers,
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
