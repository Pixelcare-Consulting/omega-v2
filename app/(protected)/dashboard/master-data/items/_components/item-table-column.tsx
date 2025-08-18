import { useRouter } from "nextjs-toploader/app"
import { ColumnDef } from "@tanstack/react-table"

import { Badge, BadgeProps } from "@/components/badge"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteItem, getItems } from "@/actions/master-item"
import { SYNC_STATUSES_COLORS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import AlertModal from "@/components/alert-modal"

type ItemData = Awaited<ReturnType<typeof getItems>>[number]

export default function getColumns(): ColumnDef<ItemData>[] {
  return [
    {
      accessorFn: (row) => row.ItemName,
      id: "item",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Item' />,
      size: 150,
      cell: ({ row }) => <span className='font-semibold'>{row.original.ItemName}</span>,
    },
    {
      accessorKey: "ItmsGrpNam",
      id: "group",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Group' />,
      cell: ({ row }) => <Badge variant='soft-blue'>{row.original.ItmsGrpNam || ""}</Badge>,
    },
    {
      accessorKey: "ItemCode",
      id: "mpn",
      header: ({ column }) => <DataTableColumnHeader column={column} title='MPN' />,
      cell: ({ row }) => <div>{row.original.ItemCode || ""}</div>,
    },
    {
      accessorKey: "FirmName",
      id: "manufacturer",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Manufacturer' />,
      cell: ({ row }) => <div>{row.original?.FirmName || ""}</div>,
    },
    {
      accessorKey: "BuyUnitMsr",
      id: "uom",
      header: ({ column }) => <DataTableColumnHeader column={column} title='UOM' />,
      cell: ({ row }) => <div>{row.original?.BuyUnitMsr || ""}</div>,
    },
    {
      accessorKey: "status",
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: () => "",
    },
    {
      accessorKey: "syncStatus",
      id: "sync status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Sync Status' />,
      cell: ({ row }) => {
        const syncStatus = row.original?.syncStatus
        const label = SYNC_STATUSES_OPTIONS.find((item) => item.value === syncStatus)?.label
        const color = SYNC_STATUSES_COLORS.find((item) => item.value === syncStatus)?.color

        if (!syncStatus || !label || !color) return null

        return <Badge variant={color as BadgeProps["variant"]}>{label}</Badge>
      },
    },
    {
      accessorFn: (row) => row.source,
      accessorKey: "source",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Source' />,
      cell: ({ row }) => {
        const isSAP = row.original.source === "sap"
        return isSAP ? <Badge variant='soft-green'>SAP</Badge> : <Badge variant='soft-amber'>Portal</Badge>
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteItem)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { ItemCode, source } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ code: ItemCode }), {
            loading: "Deleting item...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete item!", unExpectedError: true }

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
            <div className='flex gap-2'>
              <ActionTooltipProvider label='View Item'>
                <Icons.eye
                  className='size-4 cursor-pointer transition-all hover:scale-125'
                  onClick={() => router.push(`/dashboard/master-data/items/${ItemCode}/view`)}
                />
              </ActionTooltipProvider>

              {source === "portal" && (
                <ActionTooltipProvider label='Edit Item'>
                  <Icons.pencil
                    className='size-4 cursor-pointer transition-all hover:scale-125'
                    onClick={() => router.push(`/dashboard/master-data/items/${ItemCode}`)}
                  />
                </ActionTooltipProvider>
              )}

              <ActionTooltipProvider label='Delete Item'>
                <Icons.trash
                  className='size-4 cursor-pointer text-red-500 transition-all hover:scale-125'
                  onClick={() => setShowConfirmation(true)}
                />
              </ActionTooltipProvider>

              <ActionTooltipProvider label='More Options'>
                <Icons.moreHorizontal className='size-4 cursor-pointer transition-all hover:scale-125' />
              </ActionTooltipProvider>

              <AlertModal
                isOpen={showConfirmation}
                title='Are you sure?'
                description={`Are you sure you want to delete this item (#${ItemCode})?`}
                onConfirm={handleDelete}
                onConfirmText='Delete'
                onCancel={() => setShowConfirmation(false)}
              />
            </div>
          </>
        )
      },
    },
  ]
}
