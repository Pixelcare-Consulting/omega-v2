"use client"

import { getBpMasterByCardCode } from "@/actions/master-bp"
import { useMemo } from "react"
import { getColumns } from "./supplier-addresses-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { ADDRESS_TYPE_OPTIONS } from "@/schema/master-address"
import { SOURCES_OPTIONS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

type SupplierAddressesListProps = {
  addresses: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>["addresses"]
  billToDef?: string | null
  shipToDef?: string | null
}

export default function SupplierAddressesList({ addresses, billToDef, shipToDef }: SupplierAddressesListProps) {
  const columns = useMemo(() => getColumns(billToDef, shipToDef), [billToDef, shipToDef])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "ID #", columnId: "id #", type: "text" },
      { label: "Date", columnId: "date", type: "date" },
      { label: "Type", columnId: "type", type: "select", options: ADDRESS_TYPE_OPTIONS },
      { label: "Streets", columnId: "streets", type: "text" },
      { label: "City", columnId: "city", type: "text" },
      { label: "State", columnId: "stateName", type: "text" },
      { label: "Country", columnId: "countryName", type: "text" },
      { label: "Zip Code", columnId: "zipCode", type: "text" },
      { label: "Sync Status", columnId: "sync status", type: "select", options: SYNC_STATUSES_OPTIONS },
      { label: "Source", columnId: "source", type: "select", options: SOURCES_OPTIONS },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: addresses,
    columns: columns,
    initialState: {
      columnPinning: { right: ["actions"] },
      sorting: [{ id: "date", desc: true }],
    },
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
