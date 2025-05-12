import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"

//* Temporaray
export type Supplier = {
  id: string
  status: string
  companyName: string
  tierLevel: string
  accountNumber: string
  availableExcess: string
  percentageOfQuotedRFQ: string
  createdAt: string
  assignedBuyer: string
  cancellationRate: string
  poFailureRate: string
  activityRecords: string
  productStrength: string
  mfrStrength: string
  notes2: string
}

export const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "id",
    header: "Record ID#",
  },
  {
    accessorKey: "companyName",
    header: "Company Name",
  },
  {
    accessorKey: "tierLevel",
    header: "Tier Level",
  },
  {
    accessorKey: "availableExcess",
    header: "Available Excess",
  },
  {
    accessorKey: "percentageOfQuotedRFQ",
    header: "Percentage of Quoted RFQ's",
  },
  {
    accessorKey: "dateCreated",
    header: "Date Created",
  },
  {
    accessorKey: "assignedBuyer",
    header: "Assigned Buyer",
  },
  {
    accessorKey: "cancellationRate",
    header: "Cancellation Rate",
  },
  {
    accessorKey: "poFailureRate",
    header: "PO Failure Rate",
  },
  {
    accessorKey: "activityRecords",
    header: "# of Supplier Activity Records",
  },
  {
    accessorKey: "productStrength",
    header: "Product Strength",
  },
  {
    accessorKey: "mfrStrength",
    header: "MFR Strength",
  },
  {
    accessorKey: "notes2",
    header: "Notes2",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <Icons.moreHorizontal className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Icons.pencil className='mr-2 size-4' /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className='text-red-600'>
              <Icons.trash className='mr-2 size-4' /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
