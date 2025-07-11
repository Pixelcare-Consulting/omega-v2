import { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"

import { Badge } from "@/components/badge"
import { Icons } from "@/components/icons"
import { updateRequisitionReqItems } from "@/actions/requisition"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { RequestedItemForm } from "@/schema/requisition"
import { toast } from "sonner"
import AlertModal from "@/components/alert-modal"

export function getColumns(reqId: string, requestedItems: RequestedItemForm[]): ColumnDef<RequestedItemForm>[] {
  return [
    {
      accessorKey: "name",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Item' />,
    },
    {
      accessorFn: (row, index) => (index === 0 ? "primary" : "alternative"),
      id: "type",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => {
        const index = row.index
        const isPrimary = index === 0
        return (
          <Badge className='w-fit' variant={isPrimary ? "soft-sky" : "soft-amber"}>
            {isPrimary ? "Primary" : "Alternative"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "mpn",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MPN' />,
      enableSorting: false,
      cell: ({ row }) => {
        const mpn = row.original?.mpn
        if (!mpn) return null
        return <Badge variant='soft-slate'>{mpn}</Badge>
      },
    },
    {
      accessorKey: "mfr",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MFR' />,
      enableSorting: false,
      cell: ({ row }) => {
        const mfr = row.original?.mfr
        if (!mfr) return null
        return <Badge variant='soft-slate'>{mfr}</Badge>
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(updateRequisitionReqItems)
        const [showConfirmation, setShowConfirmation] = useState(false)

        if (!requestedItems || requestedItems.length < 2) return null

        const { id, name, mpn } = row.original

        const handleRemoveItem = (reqId: string, itemId: string, requestedItems: RequestedItemForm[]) => {
          setShowConfirmation(false)

          const filteredReqItems = requestedItems.filter((item) => item.id !== itemId)

          toast.promise(executeAsync({ reqId, requestedItems: filteredReqItems }), {
            loading: "Removing requested item...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to requested item!", unExpectedError: true }

              if (!result.error) {
                setTimeout(() => {
                  router.refresh()
                }, 1500)

                return result.message
              }

              throw { message: result.message, expectedError: true }
            },
            error: (err: Error & { expectedError: boolean }) => {
              return err?.expectedError ? err.message : "Something went wrong! Please try again later."
            },
          })
        }

        return (
          <>
            <Icons.trash className='size-4 cursor-pointer text-red-600' onClick={() => setShowConfirmation(true)} />

            <AlertModal
              isOpen={showConfirmation}
              title='Are you sure?'
              description={`Are you sure you want to remove this requested item named "${name}" with MPN of "${mpn}"?`}
              onConfirm={() => handleRemoveItem(reqId, id, requestedItems)}
              onConfirmText='Remove'
              onCancel={() => setShowConfirmation(false)}
            />
          </>
        )
      },
    },
  ]
}
