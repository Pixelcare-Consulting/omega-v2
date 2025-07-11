import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { toast } from "sonner"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"
import { deleteUser, getUsers } from "@/actions/user"
import AlertModal from "@/components/alert-modal"
import { getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/badge"

type UserData = Awaited<ReturnType<typeof getUsers>>[number]

export function getColumns(): ColumnDef<UserData>[] {
  return [
    {
      accessorKey: "name",
      id: "user",
      header: ({ column }) => <DataTableColumnHeader column={column} title='User' />,
      cell: ({ row }) => {
        const name = row.original?.name
        const profileDetails = row.original?.profile?.details as any
        const imageUrl = profileDetails?.avatarUrl || undefined

        if (!name) return null

        return (
          <div className='flex items-center gap-2'>
            <Avatar>
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback className='uppercase'>{getInitials(name)}</AvatarFallback>
            </Avatar>

            <span className='font-medium'>{name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
      cell: ({ row }) => {
        const email = row.original?.email
        if (!email) return null
        return <div>{email}</div>
      },
    },
    {
      accessorFn: (row) => row.role.name,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Role' />,
      id: "role",
      cell: ({ row }) => {
        const role = row.original?.role?.name

        if (!role) return null

        return (
          <Badge variant='soft-purple'>
            <Icons.userRoundCog className='mr-1 size-3.5' />
            {role}
          </Badge>
        )
      },
    },
    {
      accessorFn: (row) => (row.isActive ? "Active" : "Inactive"),
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => (
        <Badge variant={row.original?.isActive ? "soft-green" : "soft-red"}>
          <Icons.checkCircle className='mr-1 size-3.5' /> {row.original?.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 80,
      cell: function ActionCell({ row }) {
        const router = useRouter()
        const { executeAsync } = useAction(deleteUser)
        const [showConfirmation, setShowConfirmation] = useState(false)

        const { id, name, email } = row.original

        async function handleDelete() {
          setShowConfirmation(false)

          toast.promise(executeAsync({ id }), {
            loading: "Deleting user...",
            success: (response) => {
              const result = response?.data

              if (!response || !result) throw { message: "Failed to delete user!", unExpectedError: true }

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='size-8 p-0'>
                  <Icons.moreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {/* <DropdownMenuItem onClick={() => router.push(`/dashboard/settings/users/${id}/view`)}>
                  <Icons.eye className='mr-2 size-4' /> View
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={() => router.push(`/dashboard/settings/users/${id}`)}>
                  <Icons.pencil className='mr-2 size-4' /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className='text-red-600' onClick={() => setShowConfirmation(true)}>
                  <Icons.trash className='mr-2 size-4' /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertModal
              isOpen={showConfirmation}
              title='Are you sure?'
              description={`Are you sure you want to delete this user ${name ? "named" : "emailed"} "${name || email}"?`}
              onConfirm={handleDelete}
              onConfirmText='Delete'
              onCancel={() => setShowConfirmation(false)}
            />
          </>
        )
      },
    },
  ]
}
