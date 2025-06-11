"use client"

import { useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { getAcvtityById, upsertActivity } from "@/actions/activity"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { ACTIVITY_STATUSES_OPTIONS, ACTIVITY_TYPES_OPTIONS, activityFormSchema, type ActivityForm } from "@/schema/activity"
import { FormDebug } from "@/components/form/form-debug"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import InputField from "@/components/form/input-field"
import { getLeads } from "@/actions/lead"
import { Form } from "@/components/ui/form"
import { ComboboxField } from "@/components/form/combobox-field"
import DatePickerField from "@/components/form/date-picker-field"
import MinimalRichTextEditorField from "@/components/form/minimal-rich-text-editor-field"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { toast } from "sonner"

type ActivityFormProps = {
  activity?: Awaited<ReturnType<typeof getAcvtityById>>
  leads: Awaited<ReturnType<typeof getLeads>>
}

export default function ActivityForm({ activity, leads }: ActivityFormProps) {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const pageMetadata = useMemo(() => {
    if (!activity || !activity?.id || id === "add")
      return { title: "Add Activity", description: "Fill in the form to create a new activity." }
    return { title: "Edit Activity", description: "Edit the form to update this activity's information." }
  }, [activity])

  const values = useMemo(() => {
    if (activity) return activity

    return {
      id: "add",
      leadId: "",
      title: "",
      type: "",
      body: "",
      link: "",
      date: undefined,
      startDate: undefined,
      endDate: undefined,
      startTime: "",
      endTime: "",
      status: "pending",
      metadata: {},
    }
  }, [JSON.stringify(activity)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(activityFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertActivity)

  const type = useWatch({ control: form.control, name: "type" })

  const leadsOptions = useMemo(() => {
    if (!leads || leads?.length < 1) return []
    return leads.map((lead) => ({ label: lead.name, value: lead.id }))
  }, [leads])

  const onSubmit = async (formData: ActivityForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.activity && "id" in result?.data?.activity) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/admin/crm/activities/${result.data.activity.id}`)
        }, 1500)
      }
    } catch (error) {
      console.error(toast.error("Something went wrong! Please try again later."))
    }
  }

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <PageLayout title={pageMetadata.title} description={pageMetadata.description}>
        <Form {...form}>
          <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
            <div className='col-span-12 gap-4 lg:col-span-4'>
              <ComboboxField data={leadsOptions} control={form.control} name='leadId' label='Lead' isRequired />
            </div>

            <div className='col-span-12 gap-4 lg:col-span-4'>
              <InputField
                control={form.control}
                name='title'
                label='Title'
                extendedProps={{ inputProps: { placeholder: "Enter title" } }}
                isRequired
              />
            </div>

            <div className='col-span-12 gap-4 lg:col-span-4'>
              <ComboboxField data={ACTIVITY_TYPES_OPTIONS} control={form.control} name='type' label='Type' isRequired />
            </div>

            {type === "meeting" && (
              <>
                <div className='col-span-12 lg:col-span-6'>
                  <ComboboxField
                    data={ACTIVITY_STATUSES_OPTIONS}
                    control={form.control}
                    name='status'
                    label='Status'
                    extendedProps={{ buttonProps: { disabled: activity ? false : true } }}
                    isRequired
                  />
                </div>

                <div className='col-span-12 lg:col-span-6'>
                  <InputField
                    control={form.control}
                    name='link'
                    label='Link'
                    extendedProps={{ inputProps: { placeholder: "Enter Link" } }}
                  />
                </div>

                <div className='col-span-4'>
                  <DatePickerField
                    control={form.control}
                    name='date'
                    label='Date'
                    extendedProps={{
                      calendarProps: {
                        mode: "single",
                        fromYear: 1800,
                        toYear: new Date().getFullYear(),
                        captionLayout: "dropdown-buttons",
                      },
                    }}
                    isRequired
                  />
                </div>

                <div className='col-span-4'>
                  <InputField
                    control={form.control}
                    name='startTime'
                    label='Start Time'
                    extendedProps={{
                      inputProps: { placeholder: "Enter title", type: "time", disabled: form.watch("date") ? false : true },
                    }}
                    isRequired
                  />
                </div>

                <div className='col-span-4'>
                  <InputField
                    control={form.control}
                    name='endTime'
                    label='End Time'
                    extendedProps={{
                      inputProps: { placeholder: "Enter title", type: "time", disabled: form.watch("startTime") ? false : true },
                    }}
                    isRequired
                  />
                </div>
              </>
            )}

            <div className='col-span-12'>
              <MinimalRichTextEditorField
                control={form.control}
                name='body'
                label='Body'
                showLabel={false}
                isRequired
                extendedProps={{
                  minimalRichTextEditorProps: {
                    className: cn("w-full rounded-xl", type === "meeting" ? "max-h-[260px] min-h-[360px]" : "max-h-[420px] min-h-[420px]"),
                    throttleDelay: 1000,
                    editorClassName: "focus:outline-none px-5 py-4 h-full w-full",
                    editorContentClassName: "overflow-auto h-full",
                    placeholder: "Type your content here",
                    output: "html",
                    editable: true,
                  },
                }}
              />
            </div>

            <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
              <Button
                type='button'
                variant='secondary'
                disabled={isExecuting}
                onClick={() => router.push(`/dashboard/admin/crm/activities`)}
              >
                Cancel
              </Button>
              <LoadingButton isLoading={isExecuting} type='submit'>
                Save
              </LoadingButton>
            </div>
          </form>
        </Form>
      </PageLayout>
    </>
  )
}
