"use client"

import { utils, writeFileXLSX } from "xlsx-js-style"
import { useMemo } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { format } from "date-fns"
import { useRouter } from "nextjs-toploader/app"

import { getLeads } from "@/actions/lead"
import { getColumns } from "./lead-table-column"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { useDataTable } from "@/hooks/use-data-table"
import { LEAD_STATUSES_OPTIONS } from "@/schema/lead"
import DataImportExport from "@/components/data-table/data-import-export"
import { styleWorkSheet } from "@/lib/xlsx"
import { delay } from "@/lib/utils"

type LeadListProps = {
  leads: Awaited<ReturnType<typeof getLeads>>
}

export default function LeadList({ leads }: LeadListProps) {
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

  const handleImport: (...args: any[]) => void = async (args) => {}

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
