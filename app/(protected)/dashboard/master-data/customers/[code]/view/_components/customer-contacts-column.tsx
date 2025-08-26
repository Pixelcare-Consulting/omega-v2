import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import ActionTooltipProvider from "@/components/provider/tooltip-provider"
import { Badge, BadgeProps } from "@/components/badge"
import { Icons } from "@/components/icons"
import { useState } from "react"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { bpMasterContactSetAsDefault, getBpMasterByCardCode } from "@/actions/master-bp"
import { SYNC_STATUSES_COLORS, SYNC_STATUSES_OPTIONS } from "@/constant/common"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDialogStore } from "@/hooks/use-dialog"
import { deleteContactMaster } from "@/actions/master-contact"
import AlertModal from "@/components/alert-modal"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import ContactReadOnlyView from "../../../../_components/contact-read-only"

type ContactData = NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>["contacts"][number]

export function getColumns(contactPerson?: string | null): ColumnDef<ContactData>[] {
  return [
    {
      accessorKey: "id",
      id: "id #",
      header: ({ column }) => <DataTableColumnHeader column={column} title='ID #' />,
      cell: ({ row }) => {
        const { id } = row.original

        const isDefault = id === contactPerson

        return (
          <div className='flex flex-col justify-center gap-2'>
            <span>{id}</span>
            {isDefault && (
              <Badge className='w-fit' variant='soft-violet'>
                Default
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      id: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
      cell: ({ row }) => {
        const date = row.original.createdAt
        return <div>{format(date, "MM-dd-yyyy")}</div>
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        const date = row.original.createdAt
        const filterDateValue = new Date(filterValue)
        return dateFilter(date, filterDateValue)
      },
      sortingFn: (rowA, rowB, columnId) => {
        const rowADate = rowA.original.createdAt
        const rowBDate = rowB.original.createdAt
        return dateSort(rowADate, rowBDate)
      },
    },
    {
      accessorFn: (row) => {
        let fullName = ""
        if (row.FirstName) fullName += row.FirstName + " "
        if (row.LastName) fullName += row.LastName
        return fullName
      },
      id: "fullName",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Full Name' />,
      cell: ({ row }) => {
        let fullName = ""
        if (row.original.FirstName) fullName += row.original.FirstName + " "
        if (row.original.LastName) fullName += row.original.LastName
        return <div>{fullName}</div>
      },
    },
    {
      accessorKey: "Title",
      id: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
      cell: ({ row }) => {
        const title = row.original.Title
        return <div>{title}</div>
      },
    },
    {
      accessorKey: "Cellolar",
      id: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Phone' />,
      cell: ({ row }) => {
        const phone = row.original.Cellolar
        return <div>{phone}</div>
      },
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

        const { executeAsync: deleteContactMasterExecuteAsync } = useAction(deleteContactMaster)
        const { executeAsync: bpMasterContactSetAsDefaultExecuteAsync } = useAction(bpMasterContactSetAsDefault)

        const [showConfirmationDelete, setShowConfirmationDelete] = useState(false)
        const [showConfirmationSetAsDefault, setShowConfirmationSetAsDefault] = useState(false)
        const [showReadOnlyView, setShowReadOnlyView] = useState(false)

        const { id, CardCode, source } = row.original

        const { setIsOpen, setData } = useDialogStore(["setIsOpen", "setData"])

        const isDefault = id === contactPerson

        const handleEdit = () => {
          setData(row.original)
          setTimeout(() => setIsOpen(true), 1000)
        }

        async function handleDelete() {
          setShowConfirmationDelete(false)

          toast.promise(deleteContactMasterExecuteAsync({ id }), {
            loading: "Deleting contact...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete contact!", unExpectedError: true }

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

        async function handleSetAsDefault() {
          setShowConfirmationSetAsDefault(false)

          toast.promise(bpMasterContactSetAsDefaultExecuteAsync({ cardCode: CardCode, contactId: id }), {
            loading: "Setting as default...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to set as default!", unExpectedError: true }

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
          <div className='flex gap-2'>
            <ActionTooltipProvider label='View Contact'>
              <Icons.eye className='size-4 cursor-pointer transition-all hover:scale-125' onClick={() => setShowReadOnlyView(true)} />
            </ActionTooltipProvider>

            {source === "portal" && (
              <ActionTooltipProvider label='Edit Contact'>
                <Icons.pencil className='size-4 cursor-pointer transition-all hover:scale-125' onClick={handleEdit} />
              </ActionTooltipProvider>
            )}

            <ActionTooltipProvider label='Delete Contact'>
              <Icons.trash
                className='size-4 cursor-pointer text-red-500 transition-all hover:scale-125'
                onClick={() => setShowConfirmationDelete(true)}
              />
            </ActionTooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <ActionTooltipProvider label='More Options'>
                  <Icons.moreHorizontal className='size-4 cursor-pointer transition-all hover:scale-125' />
                </ActionTooltipProvider>
              </DropdownMenuTrigger>

              <DropdownMenuContent align='end'>
                {!isDefault && (
                  <DropdownMenuItem onClick={() => setShowConfirmationSetAsDefault(true)}>
                    <Icons.checkCircleBig className='mr-2 size-4' /> Set as Default
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertModal
              isOpen={showConfirmationDelete}
              title='Are you sure?'
              description={`Are you sure you want to delete this contact #${id}?`}
              onConfirm={handleDelete}
              onConfirmText='Delete'
              onCancel={() => setShowConfirmationDelete(false)}
            />

            <AlertModal
              isOpen={showConfirmationSetAsDefault}
              title='Are you sure?'
              description={`Are you sure you want to set this contact #${id} as default contact?`}
              onConfirm={handleSetAsDefault}
              onConfirmText='Set as Default'
              onCancel={() => setShowConfirmationDelete(false)}
            />

            <Dialog open={showReadOnlyView} onOpenChange={setShowReadOnlyView}>
              <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
                <Card className='p-3'>
                  <ContactReadOnlyView contact={row.original} />
                </Card>
              </DialogContent>
            </Dialog>
          </div>
        )
      },
    },
  ]
}
