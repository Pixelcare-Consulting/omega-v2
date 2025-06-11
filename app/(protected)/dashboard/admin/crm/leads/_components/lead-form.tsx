"use client"

import { memo, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "nextjs-toploader/app"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { useParams } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"

import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { LEAD_STATUSES_OPTIONS, leadFormSchema, type LeadForm } from "@/schema/lead"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import { ComboboxField } from "@/components/form/combobox-field"
import { Separator } from "@/components/ui/separator"
import TextAreaField from "@/components/form/textarea-field"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import LoadingButton from "@/components/loading-button"
import { getLeadById, upsertLead } from "@/actions/lead"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ActivityFormDrawer from "../../activities/_components/activity-form-drawer"
import ActivityCardList from "../../activities/_components/activity-card-list"
import LeadFormHeader from "./lead-form-header"
import { useDataTable } from "@/hooks/use-data-table"
import { dateFilter, dateSort } from "@/lib/data-table/data-table"
import { ACTIVITY_STATUSES_OPTIONS, ACTIVITY_TYPES_OPTIONS } from "@/schema/activity"
import { DataTableFilter, FilterFields } from "@/components/data-table/data-table-filter"

export type Lead = NonNullable<Awaited<ReturnType<typeof getLeadById>>>
export type Activity = Lead["activities"][number]

type LeadFormProps = {
  lead?: Awaited<ReturnType<typeof getLeadById>>
}

const LeadForm = memo(function LeadForm({ lead }: LeadFormProps) {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [activity, setActivity] = useState<Activity | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const isCreate = id === "add"

  const columns = useMemo((): ColumnDef<Activity>[] => {
    return [
      { accessorKey: "title" },
      { accessorKey: "type" },
      { accessorKey: "status" },
      { accessorFn: (row) => row.createdByUser?.name || "", id: "owner" },
      {
        id: "schedule",
        filterFn: (row, columnId, filterValue, addMeta) => {
          if (row.original.type !== "meeting" || !row.original.date) return false
          const date = row.original.date
          const filterDateValue = new Date(filterValue)
          return dateFilter(date, filterDateValue)
        },
        sortingFn: (rowA, rowB, columnId) => {
          if (rowA.original.type !== "meeting" || !rowA.original.date) return 0
          if (rowB.original.type !== "meeting" || !rowB.original.date) return 0

          const d1 = new Date(rowA.original.date)
          const d2 = new Date(rowB.original.date)

          return dateSort(d1, d2)
        },
      },
    ]
  }, [])

  const filterFields = useMemo((): FilterFields[] => {
    return [
      { label: "Title", columnId: "title", type: "text" },
      { label: "Type", columnId: "type", type: "select", options: ACTIVITY_TYPES_OPTIONS },
      { label: "Owner", columnId: "owner", type: "text" },
      { label: "Schedule", columnId: "schedule", type: "date" },
      { label: "Status", columnId: "status", type: "select", options: ACTIVITY_STATUSES_OPTIONS },
    ]
  }, [])

  const { table, columnFilters } = useDataTable({ data: lead?.activities || [], columns: columns })

  const pageMetadata = useMemo(() => {
    if (!lead || !lead?.id || id === "add") return { title: "Add Lead", description: "Fill in the form to create a new lead." }
    return { title: "Edit Lead", description: "Edit the form to update this lead's information." }
  }, [lead])

  const values = useMemo(() => {
    if (lead) return lead

    if (id === "add" && !lead) {
      return {
        id: "add",
        name: "",
        email: "",
        phone: "",
        title: "",
        company: "",
        status: "new-lead",
        street: "",
        block: "",
        city: "",
        zipCode: "",
        county: "",
        state: "",
        country: "",
        streetNo: "",
        buildingFloorRoom: "",
        gln: "",
      }
    }

    return undefined
  }, [JSON.stringify(lead)])

  const form = useForm<LeadForm>({
    mode: "onChange",
    values,
    resolver: zodResolver(leadFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertLead)

  const onSubmit = async (formData: LeadForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.lead && "id" in result?.data?.lead) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/admin/crm/leads/${result.data.lead.id}`)
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <PageLayout title={pageMetadata.title} description={pageMetadata.description}>
        <LeadFormHeader lead={lead} />

        <Form {...form}>
          <form className='grid grid-cols-12 gap-x-2' onSubmit={form.handleSubmit(onSubmit)}>
            {/* left side */}

            <div
              className={cn(
                "overflow-hidden transition-all lg:col-span-8",
                isCreate ? "hidden" : "order-last col-span-12 w-full border-r-0 border-t px-6 pt-6 lg:order-first lg:border-r lg:border-t-0"
              )}
            >
              <div className='flex flex-wrap items-center justify-between gap-2 border-b p-3'>
                <div className='flex items-center gap-2 divide-x'>
                  <div className='flex items-center gap-2'>
                    <Button className='space-x-2' type='button' variant='outline-primary'>
                      <Icons.mailPlus className='size-4' />
                      <span>New Email</span>

                      <span className='inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-center text-xs font-medium text-purple-600 ring-1 ring-purple-500/10'>
                        Coming Soon
                      </span>
                    </Button>

                    {lead && (
                      <ActivityFormDrawer isOpen={isOpen} setIsOpen={setIsOpen} activity={activity} setActivity={setActivity} leadId={id} />
                    )}
                  </div>

                  <div>
                    <DataTableFilter
                      className='ml-2'
                      table={table}
                      filterFields={filterFields}
                      columnFilters={columnFilters}
                      buttonProps={{ variant: "ghost" }}
                    />
                  </div>
                </div>

                <div className='flex items-center gap-2 divide-x'>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button className='relative' type='button' variant='ghost'>
                        <Icons.blocks className='size-4' />
                        <span>Integrate</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                      <DropdownMenuItem className='space-x-2'>
                        <img className='size-4' src='/icons/vonage-icon.svg' alt='Vonage' />
                        <span>Vonage</span>

                        <span className='inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-center text-xs font-medium text-purple-600 ring-1 ring-purple-500/10'>
                          Coming Soon
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='space-x-2'>
                        <img className='size-4' src='/icons/ms-outlook-icon.svg' alt='Microsft Outlook' />
                        <span>Outlook</span>

                        <span className='inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-center text-xs font-medium text-purple-600 ring-1 ring-purple-500/10'>
                          Coming Soon
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* activity content */}
              <div className='p-4'>
                <ActivityCardList table={table} lead={lead} setActivity={setActivity} setIsOpen={setIsOpen} columnFilters={columnFilters} />
              </div>
            </div>

            {/* right side */}
            <div
              className={cn(
                `col-span-12 grid h-fit grid-cols-12 items-start gap-4`,
                !isCreate && "border-l-0 px-6 py-6 md:border-t lg:col-span-4 lg:border-t-0 lg:py-0"
              )}
            >
              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField
                  control={form.control}
                  name='name'
                  label='Name'
                  isRequired
                  extendedProps={{ inputProps: { placeholder: "Enter name" } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <ComboboxField
                  data={LEAD_STATUSES_OPTIONS}
                  control={form.control}
                  name='status'
                  label='Status'
                  isRequired
                  extendedProps={{ buttonProps: { disabled: isCreate } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField
                  control={form.control}
                  name='email'
                  label='Email'
                  isRequired
                  extendedProps={{ inputProps: { placeholder: "Enter email" } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField
                  control={form.control}
                  name='phone'
                  label='Phone'
                  isRequired
                  extendedProps={{ inputProps: { placeholder: "Enter phone" } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField
                  control={form.control}
                  name='title'
                  label='Title'
                  extendedProps={{ inputProps: { placeholder: "Enter title" } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField
                  control={form.control}
                  name='company'
                  label='Company'
                  extendedProps={{ inputProps: { placeholder: "Enter company" } }}
                />
              </div>

              <div className={cn("col-span-12 mt-2 space-y-4", isCreate && "lg:col-span-12")}>
                <Separator />

                <div>
                  <h1 className='text-base font-bold'>Address Details</h1>
                  <p className='text-xs text-muted-foreground'>Lead address details</p>
                </div>
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <TextAreaField
                  control={form.control}
                  name='street'
                  label='Street'
                  extendedProps={{ textAreaProps: { placeholder: "Enter street" } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField
                  control={form.control}
                  name='streetNo'
                  label='Street No.'
                  extendedProps={{ inputProps: { placeholder: "Enter street no." } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField
                  control={form.control}
                  name='buildingFloorRoom'
                  label='Building/Floor/ Room'
                  extendedProps={{ inputProps: { placeholder: "Enter building/floor/room" } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField
                  control={form.control}
                  name='block'
                  label='Block'
                  extendedProps={{ inputProps: { placeholder: "Enter block" } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField control={form.control} name='city' label='City' extendedProps={{ inputProps: { placeholder: "Enter city" } }} />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField
                  control={form.control}
                  name='zipCode'
                  label='Zip Code'
                  extendedProps={{ inputProps: { placeholder: "Enter zip code" } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField
                  control={form.control}
                  name='county'
                  label='County'
                  extendedProps={{ inputProps: { placeholder: "Enter county" } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField
                  control={form.control}
                  name='state'
                  label='State'
                  extendedProps={{ inputProps: { placeholder: "Enter state" } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField
                  control={form.control}
                  name='country'
                  label='Country'
                  extendedProps={{ inputProps: { placeholder: "Enter country" } }}
                />
              </div>

              <div className={cn("col-span-12", isCreate && "lg:col-span-4")}>
                <InputField control={form.control} name='gln' label='GLN' extendedProps={{ inputProps: { placeholder: "Enter gln" } }} />
              </div>

              <div className={cn("col-span-12 mt-2 flex items-center justify-end gap-2", isCreate ? "order-last" : "order-first")}>
                <Button type='button' variant='secondary' onClick={() => router.push(`/dashboard/admin/crm/leads`)}>
                  Cancel
                </Button>
                <LoadingButton isLoading={isExecuting} type='submit'>
                  Save
                </LoadingButton>
              </div>
            </div>
          </form>
        </Form>
      </PageLayout>
    </>
  )
})

export default LeadForm
