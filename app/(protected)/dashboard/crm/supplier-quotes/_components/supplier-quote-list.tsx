"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useMemo } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import { getItems } from "@/actions/master-item"
import { getSupplierQuotes } from "@/actions/supplier-quote"
import { getColumns } from "./supplier-quote-table-column"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { DataTableFilter } from "@/components/data-table/data-table-filter"
import { FilterFields } from "@/components/data-table/data-table-filter"
import { REQUISITION_PURCHASING_STATUS_OPTIONS, REQUISITION_RESULT_OPTIONS } from "@/schema/requisition"
import { SUPPLIER_QUOTE_STATUS_OPTIONS } from "@/schema/supplier-quote"
import { useDataTable } from "@/hooks/use-data-table"
import DataImportExport from "@/components/data-table/data-import-export"
import { styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"
import { RequestedItemsJSONData } from "@/actions/requisition"
import { multiply } from "mathjs"
import { formatCurrency, formatNumber } from "@/lib/formatter"

type SupplierQuoteListProps = {
  supplierQuotes: Awaited<ReturnType<typeof getSupplierQuotes>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function SupplierQuoteList({ supplierQuotes, items }: SupplierQuoteListProps) {
  const columns = useMemo(() => getColumns(items), [JSON.stringify(items)])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "ID #", columnId: "id #", type: "text" },
      { label: "Date", columnId: "date", type: "date" },
      { label: "Requisition - Code", columnId: "requisition", type: "text" },
      { label: "Requisition - Salesperson", columnId: "requisition salesperson", type: "text" },
      { label: "Requisition - Status", columnId: "requisition status", type: "select", options: REQUISITION_PURCHASING_STATUS_OPTIONS },
      { label: "Requisition - Result", columnId: "requisition result", type: "select", options: REQUISITION_RESULT_OPTIONS },
      { label: "Requisition - MPN", columnId: "requisition mpn", type: "text" },
      { label: "Supplier", columnId: "supplier", type: "text" },
      { label: "Buyer", columnId: "buyers", type: "text" },
      { label: "Status", columnId: "status", type: "select", options: SUPPLIER_QUOTE_STATUS_OPTIONS },
      { label: "MPN", columnId: "mpn", type: "text" },
      { label: "MFR", columnId: "mfr", type: "text" },
      { label: "Date Code", columnId: "date code", type: "text" },
      { label: "Condition", columnId: "condition", type: "text" },
      { label: "Comments", columnId: "comments", type: "text" },
      { label: "Total Cost", columnId: "total cost", type: "text" },
    ]
  }, [])

  const handleImport: (...args: any[]) => void = async (args) => {}

  const handleExport: (...args: any[]) => void = async (args) => {
    const { start, end, data, setStats } = args
    const tableData = data as typeof supplierQuotes

    try {
      //* start exporting
      start("exporting")

      //* reshape data - property names will be the header values
      const excelData = tableData.map((sq) => {
        const requestedItems = (sq.requisition?.requestedItems || []) as RequestedItemsJSONData

        const primaryRequestedItem = requestedItems?.[0]
        const requisitionItem = items.find((item) => item.ItemCode === primaryRequestedItem?.code)
        const supplierQuoteItem = items.find((item) => item.ItemCode === sq.itemCode)

        const getTotalCost = (quantity?: string, price?: string) => {
          const x = parseFloat(String(quantity))
          const y = parseFloat(String(price))

          if (isNaN(x) || isNaN(y)) return ""

          const result = multiply(x, y)
          return formatCurrency({ amount: result, minDecimal: 2 })
        }

        const getFormattedQuantity = (quantity?: string) => {
          const x = parseFloat(String(quantity))
          if (!x || isNaN(x)) return ""
          return formatNumber({ amount: x, maxDecimal: 2 })
        }

        const getFormattedPrice = (price?: string) => {
          const x = parseFloat(String(price))
          if (!x || isNaN(x)) return ""
          return formatCurrency({ amount: x, maxDecimal: 5 })
        }

        return {
          "ID #": sq.code,
          Date: format(sq.date, "MM-dd-yyyy"),
          Requisition: sq.requisitionCode,
          "Requisition - Salesperson": sq.requisition.salesPersons?.map((person) => person?.user?.name || person?.user?.email).join(", ") || "", // prettier-ignore
          "Requisition - Status": REQUISITION_PURCHASING_STATUS_OPTIONS.find((item) => item.value === sq?.requisition?.purchasingStatus)?.label || "", // prettier-ignore
          "Requisition - Result": REQUISITION_RESULT_OPTIONS.find((item) => item.value === sq?.requisition?.result)?.label || "", // prettier-ignore
          "Requisition - MPN": requisitionItem?.ItemCode || "",
          "Requisition - Quantity": getFormattedQuantity(sq.requisition?.quantity as any),
          Supplier: sq.supplier?.CardName || "",
          Buyer: sq.buyers?.map((person) => person?.user?.name || person?.user?.email).join(", ") || "",
          Status: SUPPLIER_QUOTE_STATUS_OPTIONS.find((item) => item.value === sq?.status)?.label || "",
          MPN: supplierQuoteItem?.ItemCode || "",
          MFR: supplierQuoteItem?.FirmName || "",
          "Date Code": sq.dateCode || "",
          Condition: sq.condition || "",
          "Quantity Quoted ": getFormattedQuantity(sq.quotedQuantity),
          "Quoted Price": getFormattedPrice(sq.quotedPrice),
          Comments: sq.comments || "",
          "Total Cost": getTotalCost(sq.quotedQuantity, sq.quotedPrice),
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
        { wch: 20 }, //* Requisition
        { wch: 100 }, //* Requisition - Salesperson
        { wch: 30 }, //* Requisition - Status
        { wch: 30 }, //* Requisition - Result
        { wch: 30 }, //* Requisition - MPN
        { wch: 30 }, //* Requisition - Quantity
        { wch: 45 }, //* Supplier
        { wch: 100 }, //* Buyer
        { wch: 30 }, //* Status
        { wch: 30 }, //* MPN
        { wch: 45 }, //* MFR
        { wch: 15 }, //* Date Code
        { wch: 20 }, //* Condition
        { wch: 30 }, //* Quantity Quoted
        { wch: 30 }, //* Quoted Price
        { wch: 100 }, //* Comments
        { wch: 35 }, //* Total Cost
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
      utils.book_append_sheet(wb, ws, "SUPPLIER_QUOTES")
      writeFileXLSX(wb, `SUPPLIER_QUOTES-${format(new Date(), "MM-dd-yyyy")}.xlsx`)

      //* end exporting
      end()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to export data")
      end()
    }
  }

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: supplierQuotes,
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
            onExport={(args) => handleExport({ ...args, data: supplierQuotes })}
          />
        </div>
      </div>
    </DataTable>
  )
}
