"use client"

import { useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "nextjs-toploader/app"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Form } from "@/components/ui/form"
import {
  ACTIVITY_STATUSES_OPTIONS,
  ACTIVITY_TYPES_COLORS,
  ACTIVITY_TYPES_OPTIONS,
  type ActivityForm,
  activityFormSchema,
} from "@/schema/activity"
import InputField from "@/components/form/input-field"
import { cn } from "@/lib/utils"
import DatePickerField from "@/components/form/date-picker-field"
import MinimalRichTextEditorField from "@/components/form/minimal-rich-text-editor-field"
import LoadingButton from "@/components/loading-button"
import { upsertActivity } from "@/actions/activity"
import { ComboboxField } from "@/components/form/combobox-field"
import { Activity } from "./tabs/lead-activities-tab"
import { useDialogStore } from "@/hooks/use-dialog"
import { FormDebug } from "@/components/form/form-debug"

type ActivityFormDrawerProps = {
  activity: Activity | null
  setActivity: (value: Activity | null) => void
  leadId: string
}

export default function ActivityFormDrawer({ leadId, activity, setActivity }: ActivityFormDrawerProps) {
  const router = useRouter()

  const { isOpen, setIsOpen } = useDialogStore(["isOpen", "setIsOpen"])

  const values = useMemo(() => {
    if (activity) return activity

    return {
      id: "add",
      leadId,
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

  const form = useForm<ActivityForm>({
    mode: "onChange",
    values,
    resolver: zodResolver(activityFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertActivity)

  const type = useWatch({ control: form.control, name: "type" })

  const typeMetadata = useMemo(() => {
    const value = type || "note"
    const label = ACTIVITY_TYPES_OPTIONS.find((item: any) => item.value === value)?.label ?? "Note"
    const color = ACTIVITY_TYPES_COLORS.find((item: any) => item.value === value)?.color ?? "slate"

    const STATUS_CLASSES: Record<string, string> = {
      slate: "bg-slate-50 text-slate-600 ring-slate-500/10",
      purple: "bg-purple-50 text-purple-600 ring-purple-500/10",
      orange: "bg-orange-50 text-orange-600 ring-orange-500/10",
    }

    return { label, color, class: STATUS_CLASSES[color], value }
  }, [type])

  const handleClose = () => {
    setIsOpen(false)
    form.reset()
    form.clearErrors()
    setActivity(null)
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
        handleClose()

        setTimeout(() => {
          router.refresh()
        }, 1500)
      }
    } catch (error) {
      console.error(toast.error("Something went wrong! Please try again later."))
    }
  }

  if (!leadId || leadId === "add") return null

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction='right' dismissible={false} modal={false}>
      <DrawerTrigger asChild>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className='relative' type='button' variant='outline-primary'>
              <Icons.plus className='size-4' />
              New Activity
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>Type</DropdownMenuLabel>
            <DropdownMenuItem
              className='flex items-center gap-2'
              onClick={() => {
                setIsOpen(true)
                form.setValue("type", "meeting")
              }}
            >
              <Icons.clock className='size-4' /> <span>Meeting</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='flex items-center gap-2'
              onClick={() => {
                setIsOpen(true)
                form.setValue("type", "note")
                form.setValue("status", "")
              }}
            >
              <Icons.notebookPen className='size-4' /> <span>Note</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DrawerTrigger>

      <DrawerContent className='righ-0 fixed left-auto h-fit w-[540px] overflow-hidden rounded-lg shadow-2xl'>
        <header className='flex items-center justify-between gap-2 border-b px-4 py-1.5'>
          <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-center text-sm font-medium ring-1", typeMetadata.class)}>
            {typeMetadata.label}
          </span>

          <Button size='icon' variant='ghost' className='ml-auto' onClick={() => handleClose()}>
            <Icons.x className='size-4' />
          </Button>
        </header>

        {/* <FormDebug form={form} /> */}

        <Form {...form}>
          <form className='grid grid-cols-12 gap-4 p-5' onSubmit={form.handleSubmit(onSubmit)}>
            <div className={cn("col-span-8", type === "meeting" ? "col-span-8" : "col-span-12")}>
              <InputField
                control={form.control}
                name='title'
                label='Title'
                extendedProps={{ inputProps: { placeholder: "Enter title" } }}
                isRequired
              />
            </div>

            {type === "meeting" && (
              <>
                <div className='col-span-4'>
                  <ComboboxField
                    data={ACTIVITY_STATUSES_OPTIONS}
                    control={form.control}
                    name='status'
                    label='Status'
                    extendedProps={{ buttonProps: { disabled: activity ? false : true } }}
                    isRequired
                  />
                </div>

                <div className='col-span-12'>
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
              <Button type='button' variant='secondary' disabled={isExecuting} onClick={() => handleClose()}>
                Cancel
              </Button>
              <LoadingButton isLoading={isExecuting} type='button' onClick={() => form.handleSubmit(onSubmit)()}>
                Save
              </LoadingButton>
            </div>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}
