"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { getItems } from "@/actions/item"
import { useDialogStore } from "@/hooks/use-dialog"
import { getRequisitionById, updateRequisitionReqItems } from "@/actions/requisition"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RequestedItemForm, requestedItemFormSchema } from "@/schema/requisition"
import RequisitionRequestedItemsList from "../requisition-requested-items-list"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ComboboxField } from "@/components/form/combobox-field"
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCallback, useEffect, useMemo } from "react"
import LoadingButton from "@/components/loading-button"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import ReadOnlyField from "@/components/read-only-field"

type RequisitionRequestedItemsTabProps = {
  requisition: NonNullable<Awaited<ReturnType<typeof getRequisitionById>>>
  items: Awaited<ReturnType<typeof getItems>>
}

export default function RequisitionRequestedItemsTab({ requisition, items }: RequisitionRequestedItemsTabProps) {
  const router = useRouter()
  const requestedItemIds = requisition?.requestedItems as string[] | null

  const { isOpen, setIsOpen } = useDialogStore(["isOpen", "setIsOpen"])

  //* get full details of the items
  const requestedItemsFullDetails = useMemo(() => {
    const fullDetailsItems =
      requestedItemIds?.map((itemId) => {
        const selectedItem = items.find((item) => itemId === item.id)
        if (selectedItem) {
          return { id: itemId, name: selectedItem.ItemName, mpn: selectedItem.ManufacturerPn, mfr: selectedItem.Manufacturer }
        }
        return null
      }) || []

    return fullDetailsItems.filter((item) => item !== null)
  }, [JSON.stringify(items), JSON.stringify(requestedItemIds)])

  const form = useForm({
    mode: "onChange",
    values: {
      id: "",
      name: "",
      mpn: "",
      mfr: "",
    },
    resolver: zodResolver(requestedItemFormSchema),
  })

  const itemsOptions = useMemo(() => {
    if (!items) return []

    const reqItems = requestedItemIds || []

    //* only show items that are not already in the requested items
    return items
      .filter((item) => !reqItems.find((itemId) => itemId === item.id))
      .map((item) => ({ label: item?.ItemName || item.ItemCode, value: item.id }))
  }, [items, JSON.stringify(requestedItemIds)])

  const Actions = () => {
    return (
      <Button variant='outline-primary' onClick={() => setIsOpen(true)}>
        Add Item
      </Button>
    )
  }

  const handleClose = () => {
    setIsOpen(false)
    form.clearErrors()
    form.reset()
  }

  const { executeAsync, isExecuting } = useAction(updateRequisitionReqItems)

  const onSubmit = useCallback(
    async (formData: RequestedItemForm) => {
      try {
        const newReqItems = [...(requestedItemsFullDetails || []), formData]

        const response = await executeAsync({ reqId: requisition.id, requestedItems: newReqItems })
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
    [requisition.id, JSON.stringify(requestedItemsFullDetails)]
  )

  //* auto populate mpn and mfr if item is selected
  useEffect(() => {
    const itemId = form.getValues("id")

    if (itemId && items.length > 0) {
      const selectedItem = items.find((item) => item.id === itemId)

      if (selectedItem) {
        form.setValue("name", selectedItem.ItemName)
        form.setValue("mpn", selectedItem.ManufacturerPn)
        form.setValue("mfr", selectedItem.Manufacturer)
      }
    }
  }, [form.watch("id"), JSON.stringify(items)])

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-x-3 gap-y-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Requested Items'
          description="Requisition's requested items list"
          actions={<Actions />}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-4' title='Quantity' value={(requisition.quantity as any) ?? 0} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Customer Standard Price'
          value={(requisition.customerStandardPrice as any) ?? 0}
        />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-4'
          title='Customer Standard Opportunity Value'
          value={(requisition.customerStandardOpportunityValue as any) ?? 0}
        />

        <div className='col-span-12'>
          <RequisitionRequestedItemsList reqId={requisition.id} requestedItems={requestedItemsFullDetails} />
        </div>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsOpen(open)
            return
          }

          handleClose()
        }}
      >
        <DialogContent className='max-h-[85vh] overflow-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Add Item to Requisition</DialogTitle>
            <DialogDescription>Fill in the form to add an item to this requisition.</DialogDescription>
          </DialogHeader>

          <Card className='p-3'>
            {/* <FormDebug form={form} /> */}

            <Form {...form}>
              <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
                <div className='col-span-12 md:col-span-4'>
                  <ComboboxField data={itemsOptions} control={form.control} name='id' label='Item' isRequired />
                </div>

                <div className='col-span-12 md:col-span-4'>
                  <FormItem className='space-y-2'>
                    <FormLabel className='space-x-1'>MPN</FormLabel>
                    <FormControl>
                      <Input disabled value={form.watch("mpn") || ""} />
                    </FormControl>
                  </FormItem>
                </div>

                <div className='col-span-12 md:col-span-4'>
                  <FormItem className='space-y-2'>
                    <FormLabel className='space-x-1'>MFR</FormLabel>
                    <FormControl>
                      <Input disabled value={form.watch("mfr") || ""} />
                    </FormControl>
                  </FormItem>
                </div>

                <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
                  <Button type='button' variant='secondary' disabled={isExecuting} onClick={handleClose}>
                    Cancel
                  </Button>
                  <LoadingButton isLoading={isExecuting} type='submit'>
                    Save
                  </LoadingButton>
                </div>
              </form>
            </Form>
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
