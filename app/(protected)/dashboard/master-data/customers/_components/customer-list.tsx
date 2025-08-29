"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useMemo } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import getColumns from "./customer-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { getBpMasters } from "@/actions/master-bp"
import { SOURCES_OPTIONS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { BP_MASTER_CUSTOMER_STATUS_OPTIONS, BP_MASTER_CUSTOMER_TYPE_OPTIONS } from "@/schema/master-bp"
import { styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"

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

  const handleImport: (...args: any[]) => void = async (args) => {}

  const handleExport: (...args: any[]) => void = async (args) => {
    const { start, end, data, setStats } = args
    const tableData = data as typeof customers

    try {
      //* start exporting
      start("exporting")

      //* reshape data - property names will be the header values
      const excelData = tableData.map((customer) => {
        return {}
      })

      setStats({ total: 1, completed: 0, progress: 75, error: [] })

      //* create workbook & worksheet
      const wb = utils.book_new()
      const ws = utils.json_to_sheet(excelData)

      //* set Column widths
      ws["!cols"] = [
        { wch: 20 }, //* Name
        { wch: 15 }, //* Email
        { wch: 15 }, //* Phone
        { wch: 25 }, //* Website
        { wch: 30 }, //* Industry
        { wch: 10 }, //* Status
        { wch: 35 }, //* Full Address
      ]

      //* tyle worksheet
      styleWorkSheet({
        worksheet: ws,
        cellStyle: { alignment: { horizontal: "left", vertical: "center", wrapText: true } },
        headerStyle: { font: { bold: true } },
      })

      //* delay 1 seeconds
      await delay(500)
      setStats({ total: 0, completed: 1, progress: 100, error: [] })
      await delay(500)

      //* append worksheet to workbook
      utils.book_append_sheet(wb, ws, "CUSTOMER")
      writeFileXLSX(wb, `CUSTOMER-${format(new Date(), "yyyy-MM-dd")}.xlsx`)

      //* end exporting
      end()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to export data")
      end()
    }
  }

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
