"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { getItemById, upsertItem } from "@/actions/item"
import { type ItemForm, itemMasterFormSchema } from "@/schema/item-master"
import { useAction } from "next-safe-action/hooks"
import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import { ComboboxField } from "@/components/form/combobox-field"
import SwitchField from "@/components/form/switch-field"
import { FormDebug } from "@/components/form/form-debug"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"

type ItemFormProps = {
  item?: Awaited<ReturnType<typeof getItemById>>
}

export default function ItemForm({ item }: ItemFormProps) {
  const router = useRouter()
  const { id } = useParams()

  const pageMetadata = useMemo(() => {
    if (!item || !item?.id || id === "add") return { title: "Add Item", description: "Fill in the form to create a new item." }
    return { title: "Edit Item", description: "Edit the form to update this item's information." }
  }, [item])

  const values = useMemo(() => {
    if (item)
      return {
        ...item,
        ManageBatchNumbers: item.ManageBatchNumbers === "Y",
        PurchaseItem: item.PurchaseItem === "Y",
        SalesItem: item.SalesItem === "Y",
        InventoryItem: item.InventoryItem === "Y",
        VatLiable: item.VatLiable === "Y",
      }

    if (id === "add" && !item) {
      return {
        id: "add",
        ItemCode: "",
        ItemName: "",
        ItemsGroupCode: "",
        CustomsGroupCode: "",
        Manufacturer: "",
        ManufacturerPn: "",
        ManageBatchNumbers: false,
        PurchaseUnit: "",
        PurchaseItem: false,
        SalesItem: false,
        InventoryItem: false,
        VatLiable: false,
        IncomeAccount: "",
        DefaultWarehouse: "",
        ItemCountryOrg: "",
      }
    }

    return undefined
  }, [item])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(itemMasterFormSchema),
  })

  const { executeAsync, isExecuting } = useAction(upsertItem)

  const onSubmit = async (formData: ItemForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        if (result.status === 401) {
          form.setError("ItemCode", { type: "custom", message: result.message })
        }

        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.item && "id" in result?.data?.item) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/global-procurement/items/${result.data.item.id}`)
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
        <Form {...form}>
          <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <InputField
                control={form.control}
                name='ItemName'
                label='Name'
                extendedProps={{ inputProps: { placeholder: "Enter name" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <InputField
                control={form.control}
                name='ItemCode'
                label='Code'
                extendedProps={{ inputProps: { placeholder: "Enter code" } }}
                isRequired
              />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <ComboboxField data={[]} control={form.control} name='ItemsGroupCode' label='Group' />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <ComboboxField data={[]} control={form.control} name='CustomsGroupCode' label='Customs Group' />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <InputField
                control={form.control}
                name='Manufacturer'
                label='Manufacturer'
                extendedProps={{ inputProps: { placeholder: "Enter manufacturer" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6'>
              <InputField
                control={form.control}
                name='ManufacturerPn'
                label='Manufacturer PN'
                extendedProps={{ inputProps: { placeholder: "Enter manufacturer part number" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <InputField
                control={form.control}
                name='PurchaseUnit'
                label='UOM'
                extendedProps={{ inputProps: { placeholder: "Enter UOM" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <InputField
                control={form.control}
                name='IncomeAccount'
                label='Revenue Account'
                extendedProps={{ inputProps: { placeholder: "Enter revenue account" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <InputField
                control={form.control}
                name='DefaultWarehouse'
                label='Default Warehouse'
                extendedProps={{ inputProps: { placeholder: "Enter default warehouse" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-3'>
              <InputField
                control={form.control}
                name='ItemCountryOrg'
                label='Country of Origin'
                description='Coutry code of origin'
                extendedProps={{ inputProps: { placeholder: "Enter country of origin" } }}
              />
            </div>

            <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
              <SwitchField
                control={form.control}
                layout='default'
                name='ManageBatchNumbers'
                label='Manage Batch No.'
                description='Are you managing batch numbers?'
              />
            </div>

            <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
              <SwitchField
                control={form.control}
                layout='default'
                name='VatLiable'
                label='VAT Liable'
                description='Is the item VAT liable?'
              />
            </div>

            <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
              <SwitchField
                control={form.control}
                layout='default'
                name='PurchaseItem'
                label='Purchase Item'
                description='Is the item a purchase item?'
              />
            </div>

            <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
              <SwitchField
                control={form.control}
                layout='default'
                name='SalesItem'
                label='Sales Item'
                description='Is the item a sales item?'
              />
            </div>

            <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
              <SwitchField
                control={form.control}
                layout='default'
                name='InventoryItem'
                label='Inventory Item'
                description='Is the item an inventory item?'
              />
            </div>

            <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
              <Button
                type='button'
                variant='secondary'
                disabled={isExecuting}
                onClick={() => router.push(`/dashboard/global-procurement/items`)}
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
