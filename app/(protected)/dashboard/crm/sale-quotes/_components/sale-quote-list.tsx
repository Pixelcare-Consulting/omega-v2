"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useMemo } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import { getSaleQuotes, salesQuoteCreateMany } from "@/actions/sale-quote"
import { getColumns } from "./sale-quote-table-column"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import DataImportExport from "@/components/data-table/data-import-export"
import { ExcelParseData, parseExcelFile, styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"
import { Stats } from "@/types/common"

type SalesQuoteListProps = {
  salesQuotes: Awaited<ReturnType<typeof getSaleQuotes>>
}

export default function SaleQuoteList({ salesQuotes }: SalesQuoteListProps) {
  const router = useRouter()
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

  const { executeAsync } = useAction(salesQuoteCreateMany)

  const handleImport: (...args: any[]) => void = async (args) => {
    const { end, file, setStats, setShowErrorDialog } = args

    try {
      //* constant values
      const headers = [
        "Item",
        "Requisition",
        "Supplier Quote",
        "Quantity",
        "Unit Price",
        "MPN",
        "MFR",
        "Date Code",
        "Condition",
        "COO",
        "Lead Time",
        "Notes",
        "ID",
        "Row Type", //* - MAIN, LINE_ITEM
        "Date",
        "Customer",
        "Sales Rep",
        "Bill To",
        "Ship To",
        "Payment Terms",
        "FOB Point",
        "Shipping Method",
        "Valid Until",
        "Approval",
        "Approval Date",
      ]
      const batchSize = 5

      //* parse excel file
      const parseData = await parseExcelFile({ file, header: headers })

      const parseDataWithDetails = parseData
        .map((row: any, i: number) => ({ ...row, rowNumber: i + 2 }))
        .filter((row: any) => row["Row Type"] === "MAIN")
        .map((row: any) => {
          const lineItems = parseData
            .filter((r) => r?.["ID"] === row?.["ID"] && r?.["Row Type"] === "LINE_ITEM")
            .map((r) => {
              const quantity = parseFloat(String(r?.["Quantity"]))
              const unitPrice = parseFloat(String(r?.["Unit Price"]))
              const requisition = parseInt(r?.["Requisition"])
              const supplierQuote = parseInt(r?.["Supplier Quote"])

              return {
                code: r?.["Item"] || "",
                requisitionCode: isNaN(requisition) ? 0 : requisition,
                supplierQuoteCode: isNaN(supplierQuote) ? 0 : supplierQuote,
                quantity: isNaN(quantity) ? 0 : quantity,
                unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
                details: {
                  mpn: r?.["MPN"] || "",
                  mfr: r?.["MFR"] || "",
                  dateCode: r?.["Date Code"] || "",
                  condition: r?.["Condition"] || "",
                  coo: r?.["COO"] || "",
                  leadTime: r?.["Lead Time"] || "",
                  notes: r?.["Notes"] || "",
                },
              }
            })
            .filter((item) => {
              if (item.code !== "" && item.requisitionCode !== 0 && item.supplierQuoteCode !== 0) return true
              return false
            })

          return {
            ...row,
            ["Line Items"]: lineItems?.length > 0 ? lineItems : [],
          }
        })

      //* trigger write by batch
      let batch: ExcelParseData[] = []
      let stats: Stats = { total: 0, completed: 0, progress: 0, error: [], status: "processing" }

      for (let i = 0; i < parseDataWithDetails.length; i++) {
        const isLastBatch = i === parseDataWithDetails.length - 1
        const row = parseDataWithDetails[i]

        //   //* add to batch
        batch.push({ ...row })

        //   //* check if batch size is reached or last batch
        if (batch.length === batchSize || isLastBatch) {
          const response = await executeAsync({ data: batch, total: parseDataWithDetails.length, stats, isLastBatch })
          const result = response?.data

          if (result?.error) {
            setStats((prev: any) => ({ ...prev, error: [...prev.error, ...result.stats.error] }))
            stats.error = [...stats.error, ...result.stats.error]
          } else if (result?.stats) {
            setStats(result.stats)
            stats = result.stats
          }

          batch = []
        }
      }

      if (stats.status === "completed") {
        toast.success("Sales quotes imported successfully!")
        setStats((prev: any) => ({ ...prev, total: 0, completed: 0, progress: 0, status: "processing" }))
        router.refresh()
      }

      if (stats.error.length > 0) setShowErrorDialog(true)

      end()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to import file")
      end()
    }
  }

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
            code='sales-quote'
          />
        </div>
      </div>
    </DataTable>
  )
}
