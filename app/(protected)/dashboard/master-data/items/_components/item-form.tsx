"use client"

import { useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { getItemsByItemCode, upsertItem } from "@/actions/item-master"
import { type ItemForm, itemMasterFormSchema } from "@/schema/item-master"
import { useAction } from "next-safe-action/hooks"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import { ComboboxField } from "@/components/form/combobox-field"
import SwitchField from "@/components/form/switch-field"
import { FormDebug } from "@/components/form/form-debug"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"

type ItemFormProps = {
  item?: Awaited<ReturnType<typeof getItemsByItemCode>>
  itemGroups?: any
  manufacturers?: any
}

export default function ItemForm({ item, itemGroups, manufacturers }: ItemFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }

  //TODO: Add additinal fields for item new added by Chris
  const values = useMemo(() => {
    if (item)
      return {
        ...item,
        VATLiable: item.VATLiable === "Y",
        PrchseItem: item.PrchseItem === "Y",
        SellItem: item.SellItem === "Y",
        InvntItem: item.InvntItem === "Y",
        ManBtchNum: item.ManBtchNum === "Y",
      }

    if (code === "code" || !item) {
      return {
        id: "add",
        BuyUnitMsr: "",
        FirmCode: 0,
        FirmName: "",
        ItemCode: "",
        ItemName: "",
        ItmsGrpCod: 0,
        ItmsGrpNam: "",
        ManBtchNum: false,
        CstGrpCode: null,
        VATLiable: false,
        PrchseItem: false,
        SellItem: false,
        InvntItem: false,
        IncomeAcct: null,
        DfltWH: "",
        CountryOrg: "",
        CreateDate: format(new Date(), "yyyyMMdd"),
        UpdateDate: format(new Date(), "yyyyMMdd"),
        source: "portal",
        syncStatus: "pending",
      }
    }

    return undefined
  }, [JSON.stringify(item)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(itemMasterFormSchema),
  })

  const groupCode = useWatch({ control: form.control, name: "ItmsGrpCod" })
  const firmCode = useWatch({ control: form.control, name: "FirmCode" })

  const { executeAsync, isExecuting } = useAction(upsertItem)

  const itemGroupsOptions = useMemo(() => {
    if (!itemGroups) return []
    return itemGroups.map((group: any) => ({ label: group.GroupName, value: group.Number, group }))
  }, [JSON.stringify(itemGroups)])

  const manufacturersOptions = useMemo(() => {
    if (!manufacturers) return []
    return manufacturers.map((manufacturer: any) => ({ label: manufacturer.ManufacturerName, value: manufacturer.Code, manufacturer }))
  }, [JSON.stringify(manufacturers)])

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

      if (result?.data && result?.data?.item && "ItemCode" in result?.data?.item) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/master-data/items/${result.data.item.ItemCode}`)
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  //* set group name if group code is selected
  useEffect(() => {
    if (groupCode !== undefined && groupCode !== null && groupCode !== 0) {
      const selectedGroup = itemGroupsOptions.find((group: any) => group.value == groupCode)
      if (selectedGroup) form.setValue("ItmsGrpNam", selectedGroup?.label)
    }
  }, [groupCode, JSON.stringify(itemGroupsOptions)])

  //* set firm name if firm code is selected
  useEffect(() => {
    if (firmCode !== undefined && firmCode !== null && firmCode !== 0) {
      const selectedFirm = manufacturersOptions.find((firm: any) => firm.value == firmCode)
      if (selectedFirm) form.setValue("FirmName", selectedFirm?.label)
    }
  }, [firmCode, JSON.stringify(manufacturersOptions)])

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='ItemName' label='Name' extendedProps={{ inputProps: { placeholder: "Enter name" } }} />
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
            <ComboboxField data={itemGroupsOptions} control={form.control} name='ItmsGrpCod' label='Group' isRequired />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={manufacturersOptions} control={form.control} name='FirmCode' label='Manufacturer' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='BuyUnitMsr'
              label='Unit of Measure'
              extendedProps={{ inputProps: { placeholder: "Enter unit of measure" } }}
              isRequired
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='IncomeAcct'
              label='Revenue Account'
              extendedProps={{ inputProps: { placeholder: "Enter revenue account" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='DfltWH'
              label='Default Warehouse'
              extendedProps={{ inputProps: { placeholder: "Enter default warehouse" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='CountryOrg'
              label='Country of Origin'
              description='Coutry code of origin'
              extendedProps={{ inputProps: { placeholder: "Enter country of origin" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={[]} control={form.control} name='CstGrpCode' label='Customs Group' />
          </div>

          <Separator className='col-span-12' />

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
            <SwitchField
              control={form.control}
              layout='default'
              name='VATLiable'
              label='VAT Liable'
              description='Is the item VAT liable?'
            />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
            <SwitchField
              control={form.control}
              layout='default'
              name='PrchseItem'
              label='Purchase Item'
              description='Is the item a purchase item?'
            />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
            <SwitchField
              control={form.control}
              layout='default'
              name='SellItem'
              label='Sales Item'
              description='Is the item a sales item?'
            />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
            <SwitchField
              control={form.control}
              layout='default'
              name='InvntItem'
              label='Inventory Item'
              description='Is the item an inventory item?'
            />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-3'>
            <SwitchField
              control={form.control}
              layout='default'
              name='ManBtchNum'
              label='Manage Batch No.'
              description='Are you managing batch numbers?'
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
    </>
  )
}
