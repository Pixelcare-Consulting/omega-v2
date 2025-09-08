"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useMemo } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import { getLeads, leadCreateMany } from "@/actions/lead"
import { getColumns } from "./lead-table-column"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { useDataTable } from "@/hooks/use-data-table"
import { LEAD_STATUSES_OPTIONS } from "@/schema/lead"
import DataImportExport from "@/components/data-table/data-import-export"
import { parseExcelFile, styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"
import { Stats } from "@/types/common"

type LeadListProps = {
  leads: Awaited<ReturnType<typeof getLeads>>
}

export default function LeadList({ leads }: LeadListProps) {
  const router = useRouter()
  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Name", columnId: "name", type: "text" },
      { label: "Status", columnId: "status", type: "select", options: LEAD_STATUSES_OPTIONS },
      { label: "Account", columnId: "account", type: "text" },
      { label: "Title", columnId: "title", type: "text" },
      { label: "Email", columnId: "email", type: "text" },
      { label: "Phone", columnId: "phone", type: "text" },
    ]
  }, [])

  const { executeAsync } = useAction(leadCreateMany)

  const handleImport: (...args: any[]) => void = async (args) => {
    const { end, file, setStats, setShowErrorDialog } = args

    try {
      //* constant values
      const headers = [
        "Name",
        "Email",
        "Phone",
        "Status",
        "Title",
        "Related Account",
        "Street 1",
        "Street 2",
        "Street 3",
        "Street No",
        "Building/Floor/Room",
        "Block",
        "City",
        "Zip Code",
        "County",
        "Country",
        "State",
        "GLN",
      ]
      const batchSize = 5

      //* parse excel file
      const parseData = await parseExcelFile({ file, header: headers })

      //* trigger write by batch
      let batch: typeof parseData = []
      let stats: Stats = { total: 0, completed: 0, progress: 0, error: [], status: "processing" }

      for (let i = 0; i < parseData.length; i++) {
        const isLastBatch = i === parseData.length - 1
        const row = parseData[i]

        //* add to batch
        batch.push({ rowNumber: i + 2, ...row })

        //* check if batch size is reached or last batch
        if (batch.length === batchSize || isLastBatch) {
          const response = await executeAsync({ data: batch, total: parseData.length, stats, isLastBatch })
          const result = response?.data

          if (result?.error) {
            setStats((prev: any) => ({ ...prev, error: [...prev.error, ...batch] }))
            stats.error = [...stats.error, ...batch]
          } else if (result?.stats) {
            setStats(result.stats)
            stats = result.stats
          }

          batch = []
        }
      }

      if (stats.status === "completed") {
        toast.success("Leads imported successfully!")
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
    const tableData = data as typeof leads

    try {
      //* start exporting
      start("exporting")

      //* reshape data - property names will be the header values
      const excelData = tableData.map((lead) => {
        return {
          Name: lead.name,
          Email: lead.email,
          Status: LEAD_STATUSES_OPTIONS.find((item) => item.value === lead.status)?.label || "",
          Account: lead.account?.name || "",
          Title: lead.title || "",
          Phone: lead.phone,
        }
      })

      setStats({ total: 1, completed: 0, progress: 75, error: [] })

      //* create workbook & worksheet
      const wb = utils.book_new()
      const ws = utils.json_to_sheet(excelData)

      //* set Column widths
      ws["!cols"] = [
        { wch: 30 }, //* Name
        { wch: 30 }, //* Email
        { wch: 20 }, //* Status
        { wch: 45 }, //* Account
        { wch: 45 }, //* Title
        { wch: 30 }, //* Phone
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
      utils.book_append_sheet(wb, ws, "LEADS")
      writeFileXLSX(wb, `LEADS-${format(new Date(), "MM-dd-yyyy")}.xlsx`)

      //* end exporting
      end()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "Failed to export data")
      end()
    }
  }

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: leads,
    columns: columns,
    initialState: { columnVisibility: { email: false }, columnPinning: { right: ["actions"] } },
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
            onExport={(args) => handleExport({ ...args, data: leads })}
          />
        </div>
      </div>
    </DataTable>
  )
}
