"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useMemo } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import { getColumns } from "./requisition-table-columns"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { getRequisitions, RequestedItemsJSONData } from "@/actions/requisition"
import { getItems } from "@/actions/master-item"
import DataImportExport from "@/components/data-table/data-import-export"
import { styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"
import {
  REQUISITION_PURCHASING_STATUS_OPTIONS,
  REQUISITION_RESULT_OPTIONS,
  REQUISITION_SALES_CATEGORY_OPTIONS,
  REQUISITION_URGENCY_OPTIONS,
} from "@/schema/requisition"

type RequisitionListProps = {
  requisitions: Awaited<ReturnType<typeof getRequisitions>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function RequisitionList({ requisitions, items }: RequisitionListProps) {
  const columns = useMemo(() => getColumns(items), [JSON.stringify(items)])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "ID #", columnId: "id #", type: "text" },
      { label: "Date", columnId: "date", type: "date" },
      { label: "Customer", columnId: "customer", type: "text" },
      { label: "Customer PO Hit Rate", columnId: "customer po hit rate", type: "text" },
      { label: "Salesperson", columnId: "salesperson", type: "text" },
      { label: "Sales Category", columnId: "sales category", type: "select", options: REQUISITION_SALES_CATEGORY_OPTIONS },
      { label: "Urgency", columnId: "urgency", type: "select", options: REQUISITION_URGENCY_OPTIONS },
      { label: "Purchasing Status", columnId: "purchasing status", type: "select", options: REQUISITION_PURCHASING_STATUS_OPTIONS },
      { label: "Result", columnId: "result", type: "select", options: REQUISITION_RESULT_OPTIONS },
      { label: "MPN", columnId: "mpn", type: "text" },
      { label: "MFR", columnId: "mfr", type: "text" },
      { label: "Requested Quantity", columnId: "requested quantity", type: "text" },
      { label: "Omega Buyer", columnId: "omega buyer", type: "text" },
    ]
  }, [])

  const handleImport: (...args: any[]) => void = async (args) => {}

  const handleExport: (...args: any[]) => void = async (args) => {
    const { start, end, data, setStats } = args
    const tableData = data as typeof requisitions

    try {
      //* start exporting
      start("exporting")

      //* reshape data - property names will be the header values
      const excelData = tableData.map((req) => {
        const requestedItems = (req?.requestedItems || []) as RequestedItemsJSONData

        const primaryRequestedItem = requestedItems?.[0]
        const item = items.find((item) => item.ItemCode === primaryRequestedItem?.code)

        return {
          "Id #": req.code,
          Date: format(req.date, "MM-dd-yyyy"),
          Customer: req.customer?.CardName || "",
          Salesperson: req.salesPersons?.map((person) => person?.user?.name || person?.user?.email).join(", ") || "",
          "Sales Category": REQUISITION_SALES_CATEGORY_OPTIONS.find((item) => item.value === req.salesCategory)?.label || "",
          Urgency: REQUISITION_URGENCY_OPTIONS.find((item) => item.value === req?.urgency)?.label || "",
          "Purchasing Status": REQUISITION_PURCHASING_STATUS_OPTIONS.find((item) => item.value === req?.purchasingStatus)?.label || "",
          Result: REQUISITION_RESULT_OPTIONS.find((item) => item.value === req?.result)?.label || "",
          MPN: item?.ItemCode || "",
          MFR: item?.FirmName || "",
          "Requested Quantity": req.quantity ?? "",
          "Omega Buyer": req.omegaBuyers?.map((person) => person?.user?.name || person?.user?.email).join(", ") || "",
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
        { wch: 100 }, //* Salesperson
        { wch: 30 }, //* Sales Category
        { wch: 30 }, //* Urgency
        { wch: 30 }, //* Purchasing Status
        { wch: 30 }, //* Result
        { wch: 30 }, //* MPN
        { wch: 45 }, //* MFR
        { wch: 30 }, //* Requested Quantity
        { wch: 100 }, //* Omega Buyer
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
      utils.book_append_sheet(wb, ws, "REQUISITIONS")
      writeFileXLSX(wb, `REQUISITIONS-${format(new Date(), "MM-dd-yyyy")}.xlsx`)

      //* end exporting
      end()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to export data")
      end()
    }
  }

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: requisitions,
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
            onExport={(args) => handleExport({ ...args, data: requisitions })}
          />
        </div>
      </div>
    </DataTable>
  )
}
