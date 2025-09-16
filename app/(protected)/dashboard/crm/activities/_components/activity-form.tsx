"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"

import { getAcvtityById, upsertActivity } from "@/actions/activity"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import {
  ACTIVITY_MODULES_OPTIONS,
  ACTIVITY_STATUSES_OPTIONS,
  ACTIVITY_TYPES_OPTIONS,
  activityFormSchema,
  type ActivityForm,
} from "@/schema/activity"
import { FormDebug } from "@/components/form/form-debug"
import InputField from "@/components/form/input-field"
import { getLeadsClient } from "@/actions/lead"
import { Form } from "@/components/ui/form"
import { ComboboxField } from "@/components/form/combobox-field"
import DatePickerField from "@/components/form/date-picker-field"
import MinimalRichTextEditorField from "@/components/form/minimal-rich-text-editor-field"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { toast } from "sonner"
import { getRequisitionsClient } from "@/actions/requisition"
import { FormOption } from "@/types/form"

type ActivityFormProps = {
  activity?: Awaited<ReturnType<typeof getAcvtityById>>
}

export default function ActivityForm({ activity }: ActivityFormProps) {
  const router = useRouter()

  const values = useMemo(() => {
    if (activity) return activity

    return {
      id: "add",
      referenceId: "",
      module: "",
      title: "",
      type: "",
      body: "",
      link: "",
      date: null,
      startDate: null,
      endDate: null,
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

  const moduleValue = useWatch({ control: form.control, name: "module" })
  const type = useWatch({ control: form.control, name: "type" })

  const { executeAsync, isExecuting } = useAction(upsertActivity)

  const {
    execute: getLeadsExecute,
    isExecuting: isLeadsLoading,
    result: { data: leads },
  } = useAction(getLeadsClient)

  const {
    execute: getRequisitionsExecute,
    isExecuting: isRequisitionsLoading,
    result: { data: requisitions },
  } = useAction(getRequisitionsClient)

  const leadsOptions = useMemo(() => {
    if (!leads || leads?.length < 1) return []
    return leads.map((lead) => ({ label: lead.name, value: lead.id, lead }))
  }, [JSON.stringify(leads), isLeadsLoading])

  const requisitionsOptions = useMemo(() => {
    if (!requisitions || requisitions?.length < 1) return []
    return requisitions.map((req) => ({ label: String(req.code), value: String(req.code), requisition: req }))
  }, [JSON.stringify(requisitions), isRequisitionsLoading])

  const referenceOptions = useMemo(() => {
    if (!moduleValue) return []

    switch (moduleValue) {
      case "lead":
        return leadsOptions

      case "requisition":
        return requisitionsOptions

      default:
        return []
    }
  }, [moduleValue, JSON.stringify(leadsOptions), JSON.stringify(requisitionsOptions)])

  const referenceRenderItem = useCallback(
    (item: FormOption & { [key: string]: any }, selected: boolean, index: number) => {
      switch (moduleValue) {
        case "lead": {
          return (
            <div
              key={`${moduleValue}-${index}-${item.value}`}
              className={cn("flex w-full items-center justify-between px-2.5", selected && "bg-accent")}
            >
              <span className={cn("truncate", selected && "text-accent-foreground")}>{item.label}</span>
            </div>
          )
        }

        case "requisition": {
          return (
            <div
              key={`${moduleValue}-${index}-${item.value}`}
              className={cn("flex w-full items-center justify-between px-2.5", selected && "bg-accent")}
            >
              <div className='flex w-[80%] flex-col justify-center'>
                <span className={cn("truncate", selected && "text-accent-foreground")}>{item?.requisition?.customer?.CardName}</span>
                {item?.requisition?.requestedItems?.length > 0 && (
                  <span className='text-xs text-muted-foreground'>{item.requisition.requestedItems[0].code}</span>
                )}
              </div>

              <span className={cn("text-xs text-muted-foreground", selected && "text-accent-foreground")}>#{item?.value}</span>
            </div>
          )
        }
        default:
          return null
      }
    },
    [moduleValue]
  )

  const handleTypeCallback = (args: any) => {
    if (args?.option?.value === "note") {
      form.setValue("date", null)
      form.setValue("startTime", null)
      form.setValue("endTime", null)
      form.setValue("startTime", "")
      form.setValue("endTime", "")
      form.setValue("status", "")
      form.setValue("link", "")
      form.setValue("metadata", {})
    }
  }

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
          router.push(`/dashboard/crm/activities/${result.data.activity.id}`)
        }, 1500)
      }
    } catch (error) {
      console.error(toast.error("Something went wrong! Please try again later."))
    }
  }

  //* trigger fetching if activity exist
  useEffect(() => {
    if (activity) {
      switch (activity.module) {
        case "lead":
          getLeadsExecute()
          break

        case "requisition":
          getRequisitionsExecute()
          break
      }
    }
  }, [JSON.stringify(activity)])

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={ACTIVITY_MODULES_OPTIONS}
              control={form.control}
              name='module'
              label='Module'
              isRequired
              callback={(args) => {
                if (args?.option?.value === "lead") getLeadsExecute()
                if (args?.option?.value === "requisition") getRequisitionsExecute()
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={referenceOptions}
              control={form.control}
              name='referenceId'
              label='Reference'
              isRequired
              extendedProps={{ buttonProps: { disabled: !moduleValue } }}
              isLoading={isLeadsLoading || isRequisitionsLoading}
              renderItem={referenceRenderItem}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='title'
              label='Title'
              extendedProps={{ inputProps: { placeholder: "Enter title" } }}
              isRequired
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={ACTIVITY_TYPES_OPTIONS}
              control={form.control}
              name='type'
              label='Type'
              isRequired
              callback={handleTypeCallback}
            />
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
                <InputField control={form.control} name='link' label='Link' extendedProps={{ inputProps: { placeholder: "Enter Link" } }} />
              </div>

              <div className='col-span-12 lg:col-span-4'>
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

              <div className='col-span-12 lg:col-span-4'>
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

              <div className='col-span-12 lg:col-span-4'>
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
            <Button type='button' variant='secondary' disabled={isExecuting} onClick={() => router.push(`/dashboard/admin/crm/activities`)}>
              Cancel
            </Button>
            <LoadingButton isLoading={isExecuting} type='submit'>
              Save
            </LoadingButton>
          </div>
        </form>
      </Form>
    </>
  )
}
