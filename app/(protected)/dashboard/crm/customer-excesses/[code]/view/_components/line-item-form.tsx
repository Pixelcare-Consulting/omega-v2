import { useRouter } from "nextjs-toploader/app"
import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { useDialogStore } from "@/hooks/use-dialog"
import { lineItemFormSchema, type LineItemForm } from "@/schema/customer-excess"
import { zodResolver } from "@hookform/resolvers/zod"
import { LineItemsJSONData, updateLineItems } from "@/actions/customer-excess"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import TextAreaField from "@/components/form/textarea-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"

type LineItemFormProps = {
  customerExcessId: string
  lineItems: LineItemsJSONData
}

function LineItemForm({ customerExcessId, lineItems }: LineItemFormProps) {
  const router = useRouter()
  const { setIsOpen, data: lineItem, setData } = useDialogStore(["setIsOpen", "data", "setData"])

  const values = useMemo(() => {
    if (lineItem) return lineItem

    return {
      cpn: "",
      mpn: "",
      mfr: "",
      qtyOnHand: 0,
      qtyOrdered: 0,
      unitPrice: 0,
      dateCode: "",
      notes: "",
    }
  }, [JSON.stringify(lineItem)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(lineItemFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(updateLineItems)

  const handleClose = () => {
    setIsOpen(false)
    setData(null)
    form.reset()
  }

  const onSubmit = useCallback(
    async (formData: LineItemForm) => {
      try {
        let action: "create" | "update" = "create"
        const newLineItems = [...lineItems]

        if (lineItem) {
          action = "update"
          newLineItems.splice(lineItem.index, 1, formData)
        } else newLineItems.push(formData)

        const response = await executeAsync({ action, customerExcessId, lineItems: newLineItems })
        const result = response?.data

        if (result?.error) {
          toast.error(result.message)
          return
        }

        toast.success(result?.message)
        handleClose()

        setTimeout(() => {
          router.refresh()
        }, 1500)
      } catch (error) {
        console.error(error)
        toast.error("Something went wrong! Please try again later.")
      }
    },
    [customerExcessId, JSON.stringify(lineItems), JSON.stringify(lineItem)]
  )

  return (
    <Form {...form}>
      <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <InputField control={form.control} name='cpn' label='CPN' extendedProps={{ inputProps: { placeholder: "Enter CPN" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <InputField control={form.control} name='mpn' label='MPN' extendedProps={{ inputProps: { placeholder: "Enter MPN" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <InputField control={form.control} name='mfr' label='MFR' extendedProps={{ inputProps: { placeholder: "Enter MFR" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='qtyOnHand'
              label='QTY On Hand'
              extendedProps={{ inputProps: { placeholder: "Enter qty on hand", type: "number" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='qtyOrdered'
              label='QTY Ordered'
              extendedProps={{ inputProps: { placeholder: "Enter qty ordered", type: "number" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='unitPrice'
              label='Unit Price'
              extendedProps={{ inputProps: { placeholder: "Enter unit price", type: "number" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='dateCode'
              label='Date Code'
              extendedProps={{ inputProps: { placeholder: "Enter date code" } }}
            />
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='notes'
              label='Notes'
              extendedProps={{ textAreaProps: { placeholder: "Enter notes", rows: 10 } }}
            />
          </div>

          <div className='col-span-12 flex items-center justify-end gap-2'>
            <Button variant='secondary' type='button' onClick={handleClose}>
              Cancel
            </Button>
            <LoadingButton isLoading={isExecuting} type='submit'>
              Save
            </LoadingButton>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default LineItemForm
