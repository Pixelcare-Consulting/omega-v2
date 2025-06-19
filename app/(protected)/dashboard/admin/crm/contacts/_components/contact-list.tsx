"use client"

import { useMemo } from "react"
import { useRouter } from "nextjs-toploader/app"

import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { useDataTable } from "@/hooks/use-data-table"
import { getColumns } from "./contact-table-column"
import { getContacts } from "@/actions/contacts"
import { CONTACT_PRIORITIES_OPTIONS, CONTACT_TYPES_OPTIONS } from "@/schema/contact"

type ContactListProps = {
  contacts: Awaited<ReturnType<typeof getContacts>>
}

export default function ContactList({ contacts }: ContactListProps) {
  const router = useRouter()

  const columns = useMemo(() => getColumns(), [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Name", columnId: "name", type: "text" },
      { label: "Email", columnId: "email", type: "text" },
      { label: "Phone", columnId: "phone", type: "text" },
      { label: "Title", columnId: "title", type: "text" },
      { label: "Company", columnId: "company", type: "text" },
      { label: "Type", columnId: "type", type: "select", options: CONTACT_TYPES_OPTIONS },
      { label: "Priority", columnId: "priority", type: "select", options: CONTACT_PRIORITIES_OPTIONS },
    ]
  }, [])

  const { table, columnFilters, columnVisibility } = useDataTable({
    data: contacts,
    columns: columns,
    initialState: { columnVisibility: { email: false } },
  })

  return (
    <PageLayout
      title='Contacts'
      description='Manage and track your contacts effectively'
      addButton={{
        label: "Add Contact",
        onClick: () => router.push("/dashboard/admin/crm/contacts/add"),
      }}
    >
      <DataTable table={table}>
        <div className='flex flex-col items-stretch justify-center gap-2 md:flex-row md:items-center md:justify-between'>
          <DataTableSearch table={table} className='' />

          <div className='flex items-center gap-2'>
            <DataTableFilter className='w-full md:w-fit' table={table} filterFields={filterFields} columnFilters={columnFilters} />
            <DataTableViewOptions className='w-full md:w-fit' table={table} columnVisibility={columnVisibility} />
          </div>
        </div>
      </DataTable>
    </PageLayout>
  )
}
