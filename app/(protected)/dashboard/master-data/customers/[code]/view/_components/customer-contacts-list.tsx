"use client"

import { getBpMasterByCardCode } from "@/actions/master-bp"
import { useMemo } from "react"
import { getColumns } from "./customer-contacts-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { SOURCES_OPTIONS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

type CustomerContactsListProps = {
  contacts: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>["contacts"]
  contactPerson?: string | null
}

export default function CustomerContactsList({ contacts, contactPerson }: CustomerContactsListProps) {
  const columns = useMemo(() => getColumns(contactPerson), [contactPerson])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "ID #", columnId: "id #", type: "text" },
      { label: "Date", columnId: "date", type: "date" },
      { label: "Full Name", columnId: "fullName", type: "text" },
      { label: "Title", columnId: "title", type: "text" },
      { label: "Phone", columnId: "phone", type: "text" },
      { label: "Sync Status", columnId: "sync status", type: "select", options: SYNC_STATUSES_OPTIONS },
      { label: "Source", columnId: "source", type: "select", options: SOURCES_OPTIONS },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: contacts,
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
