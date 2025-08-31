"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useMemo } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import { getSaleQuotes } from "@/actions/sale-quote"
import { getColumns } from "./sale-quote-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import DataImportExport from "@/components/data-table/data-import-export"
import { styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"

type SalesQuoteListProps = {
  salesQuotes: Awaited<ReturnType<typeof getSaleQuotes>>
}

export default function SaleQuoteList({ salesQuotes }: SalesQuoteListProps) {
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "ID #", columnId: "id #", type: "text" },
      { label: "Date", columnId: "date", type: "date" },
      { label: "Customer", columnId: "customer", type: "text" },
      { label: "Sales Rep", columnId: "sales rep", type: "text" },
      { label: "Approval", columnId: "approval", type: "text" },
      { label: "Valid Until", columnId: "valid until", type: "date" },
    ]
  }, [])

  const handleImport: (...args: any[]) => void = async (args) => {}

  const handleExport: (...args: any[]) => void = async (args) => {
    const { start, end, data, setStats } = args
    const tableData = data as typeof salesQuotes

    try {
      //* start exporting
      start("exporting")

      //* reshape data - property names will be the header values
      const excelData = tableData.map((slq) => {
        return {
          "ID #": slq.code,
          Date: format(slq.date, "MM-dd-yyyy"),
          Customer: slq.customer?.CardName || "",
          SalesRep: slq.salesRep?.name || slq.salesRep?.email || "",
          Approval: slq.approval?.name || slq.approval?.email || "",
          ValidUntil: slq.validUntil || "",
        }
      })

      setStats({ total: 1, completed: 0, progress: 75, error: [] })

      //* create workbook & worksheet
      const wb = utils.book_new()
      const ws = utils.json_to_sheet(excelData)

      //* set Column widths
      ws["!cols"] = [
        { wch: 30 }, //* ID #
        { wch: 20 }, //* Date
        { wch: 45 }, //* Customer
        { wch: 50 }, //* Sales Rep
        { wch: 50 }, //* Approval
        { wch: 20 }, //* Valid Until
      ]

      //* style worksheet
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
      utils.book_append_sheet(wb, ws, "SALES_QUOTES")
      writeFileXLSX(wb, `SALES_QUOTES-${format(new Date(), "MM-dd-yyyy")}.xlsx`)

      //* end exporting
      end()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to export data")
      end()
    }
  }

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: salesQuotes,
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

          <DataImportExport
            className='w-full md:w-fit'
            onImport={(args) => handleImport(args)}
            onExport={(args) => handleExport({ ...args, data: salesQuotes })}
          />
        </div>
      </div>
    </DataTable>
  )
}
