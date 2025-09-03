import { toast } from "sonner"
import { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { Icons } from "../icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"
import { ChangeEvent, useRef, useState } from "react"
import { Stats } from "@/types/common"
import { Card } from "../ui/card"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "./data-table"
import { DataTableColumnHeader } from "./data-table-column-header"

type DataImportExportProps = {
  className?: string
  onImport: (...args: any[]) => void
  onExport: (...args: any[]) => void
  isLoadingDependencies?: boolean
}

export default function DataImportExport({ className, onImport, onExport, isLoadingDependencies }: DataImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [action, setAction] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, progress: 0, error: [], status: "processing" })

  const start = (action: string, callback?: (...args: any[]) => void) => {
    setIsLoading(true)
    setAction(action)
    setStats({ total: 0, completed: 0, progress: 0, error: [], status: "processing" })
    if (callback) callback()
  }

  const end = (callback?: (...args: any[]) => void) => {
    setIsLoading(false)
    setAction(null)
    if (callback) callback()
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    //* set loading & action state
    start("importing")

    //* importing only support xlsx file, only 1 file at a time
    const file = e.target.files?.[0]

    //* check if file exist, if not throw error
    if (!file) {
      toast.error("File not found!")
      return
    }

    //* check if file is xlsx or xls, if not throw error;
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Only .xlsx or .xls file is supported!")
      return
    }

    onImport({ end, file, setStats, setShowErrorDialog })
  }

  const columns: ColumnDef<{ [key: string]: any }>[] = [
    {
      accessorKey: "rowNumber",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader className='justify-center' column={column} title='Row #' />,
      size: 50,
      cell: ({ row }) => {
        return <div className='text-center font-semibold'>#{row.original.rowNumber}</div>
      },
    },
    {
      accessorKey: "description",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader className='justify-center' column={column} title='Description' />,
      size: 100,
      cell: ({ row }) => {
        return (
          <div className='flex items-center justify-center gap-2'>
            <Icons.triangleAlert className='mr-1 text-red-500' />
            {row.original.description}
          </div>
        )
      },
    },
  ]

  const { table } = useDataTable({
    data: stats?.error?.sort((a, b) => a.rowNumber - b.rowNumber) || [],
    columns,
    initialState: { columnVisibility: { email: false }, columnPinning: { right: ["actions"] } },
  })

  return (
    <>
      <input type='file' className='hidden' ref={fileInputRef} onChange={(e) => handleFileUpload(e)} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={isLoading || isLoadingDependencies} variant='outline' size='sm' className={cn("capitalize", className)}>
            {isLoading || isLoadingDependencies ? (
              <>
                <Icons.spinner className='size-4 animate-spin text-pretty' />
                {isLoadingDependencies
                  ? "Loading dependencies..."
                  : action
                    ? `${stats.progress.toFixed(0)}% ${action}...`
                    : "Processing..."}
              </>
            ) : (
              <>
                <Icons.fileSpreadSheet className='size-4' />
                File
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='min-w-10'>
          <DropdownMenuItem className='flex items-center gap-2' onClick={() => fileInputRef.current?.click()}>
            <Icons.fileUp className='size-4' />
            Import
          </DropdownMenuItem>

          <DropdownMenuItem className='flex items-center gap-2' onClick={() => onExport({ start, end, setStats })}>
            <Icons.fileDown className='size-4' />
            Export
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog modal={false} open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Import Error</DialogTitle>
            <DialogDescription>There was an error encountered while importing. Please see the table below for details.</DialogDescription>
          </DialogHeader>

          <Card className='p-0'>
            <DataTable table={table} />
          </Card>
        </DialogContent>
      </Dialog>
    </>
  )
}
