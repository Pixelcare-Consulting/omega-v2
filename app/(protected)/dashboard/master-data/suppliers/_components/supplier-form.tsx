"use client"

import { useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { getBpMasterByCardCode, upsertBpMaster } from "@/actions/bp-master"
import {
  BP_MASTER_AVL_STATUS_OPTIONS,
  BpMasterForm,
  bpMasterFormSchema,
  BP_MASTER_SCOPE_OPTIONS,
  BP_MASTER_STATUS_OPTIONS,
  BP_MASTER_WARRANY_PERIOD_OPTIONS,
} from "@/schema/bp-master"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import { ComboboxField } from "@/components/form/combobox-field"
import { getUsers } from "@/actions/user"
import MultiSelectField from "@/components/form/multi-select-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { Separator } from "@/components/ui/separator"
import SwitchField from "@/components/form/switch-field"
import TextAreaField from "@/components/form/textarea-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"

type SupplierFormProps = {
  supplier?: Awaited<ReturnType<typeof getBpMasterByCardCode>>
  bpGroups?: any
  bpPaymentTerms?: any
  bpCurrencies?: any
  itemGroups?: any
  manufacturers?: any
  users: Awaited<ReturnType<typeof getUsers>>
}

export default function SupplierForm({
  supplier,
  bpGroups,
  bpCurrencies,
  bpPaymentTerms,
  itemGroups,
  manufacturers,
  users,
}: SupplierFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }

  const isCreate = code === "add" || !supplier

  const values = useMemo(() => {
    if (supplier) return supplier

    if (code === "add" || !supplier) {
      return {
        //* SAP fields
        CardCode: "",
        CardName: "",
        CardType: "S",
        CntctPrsn: null,
        Currency: "",
        GroupCode: 0,
        GroupName: null,
        Address: null,
        ZipCode: null,
        MailAddres: null,
        MailZipCod: null,
        Phone1: null,
        GroupNum: null,
        PymntGroup: null,
        U_OMEG_QBRelated: null,
        U_VendorCode: null,
        CreateDate: format(new Date(), "yyyyMMdd"),
        UpdateDate: format(new Date(), "yyyyMMdd"),

        //* QB fields
        id: "add",
        accountNo: "",
        assignedBuyer: null,
        website: "",
        commodityStrengths: [],
        mfrStrengths: [],
        avlStatus: "",
        status: "",
        scope: "",
        isCompliantToAs: false,
        isCompliantToItar: false,
        warranyPeriod: "",
        omegaReviews: "",
        qualificationNotes: "",
        source: "portal",
        syncStatus: "pending",

        //* address fields
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
  }, [code, JSON.stringify(supplier)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(bpMasterFormSchema),
  })

  const groupCode = useWatch({ control: form.control, name: "GroupCode" })
  const paymentTermCode = useWatch({ control: form.control, name: "GroupNum" })

  const { executeAsync, isExecuting } = useAction(upsertBpMaster)

  const bpGroupsOptions = useMemo(() => {
    if (!bpGroups) return []
    return bpGroups.map((group: any) => ({ label: group.Name, value: group.Code, group }))
  }, [JSON.stringify(bpGroups)])

  const bpPaymentTermsOptions = useMemo(() => {
    if (!bpPaymentTerms) return []
    return bpPaymentTerms.map((term: any) => ({ label: term.PymntGroup, value: term.GroupNum }))
  }, [JSON.stringify(bpPaymentTerms)])

  const bpCurrenciesOptions = useMemo(() => {
    if (!bpCurrencies) return []
    return bpCurrencies.map((currency: any) => ({ label: currency.CurrName, value: currency.CurrCode }))
  }, [JSON.stringify(bpCurrencies)])

  const itemGroupsOptions = useMemo(() => {
    if (!itemGroups) return []
    return itemGroups.map((group: any) => ({ label: group.GroupName, value: group.Number, group }))
  }, [JSON.stringify(itemGroups)])

  const manufacturersOptions = useMemo(() => {
    if (!manufacturers) return []
    return manufacturers.map((manufacturer: any) => ({ label: manufacturer.ManufacturerName, value: manufacturer.Code, manufacturer }))
  }, [JSON.stringify(manufacturers)])

  const usersOptions = useMemo(() => {
    if (!users) return []
    return users.map((user) => ({ label: user.name || user.email, value: user.id, user }))
  }, [JSON.stringify(users)])

  const onSubmit = async (formData: BpMasterForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data
      const cardTypeMap: Record<string, string> = { S: "suppliers", C: "customers" }
      const cardType = cardTypeMap[formData.CardType]

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.bpMaster && "CardCode" in result?.data?.bpMaster) {
        router.refresh()

        setTimeout(() => {
          router.push(`/dashboard/master-data/${cardType}/${result.data.bpMaster.CardCode}`)
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
      const selectedGroup = bpGroupsOptions.find((group: any) => group.value == groupCode)
      if (selectedGroup) {
        form.setValue("GroupName", selectedGroup?.label)
      }
    }
  }, [groupCode, JSON.stringify(bpGroupsOptions)])

  //* set pyment term name if  if payment term code is selected
  useEffect(() => {
    if (paymentTermCode !== undefined && paymentTermCode !== null && paymentTermCode !== 0) {
      const selectedPaymentTerm = bpPaymentTermsOptions.find((paymentTerm: any) => paymentTerm.value == paymentTermCode)
      if (selectedPaymentTerm) {
        form.setValue("PymntGroup", selectedPaymentTerm?.label)
      }
    }
  }, [paymentTermCode, JSON.stringify(bpPaymentTermsOptions)])

  return (
    <>
      {/* <FormDebug form={form} /> */}

      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='CardName'
              label='Company Name'
              extendedProps={{ inputProps: { placeholder: "Enter company" } }}
              isRequired
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='CardCode' label='Code' extendedProps={{ inputProps: { placeholder: "Enter code" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='accountNo'
              label='Account #'
              extendedProps={{ inputProps: { placeholder: "Enter account #" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={bpGroupsOptions}
              control={form.control}
              name='GroupCode'
              label='Group'
              isRequired
              renderItem={(item, selected) => {
                return (
                  <div className='flex flex-col justify-center'>
                    <span>{item.label}</span>
                    <span className='text-xs text-muted-foreground'>{item.group?.code}</span>
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={usersOptions}
              control={form.control}
              name='assignedBuyer'
              label='Assigned Byer'
              renderItem={(item, selected) => {
                return (
                  <div className='flex flex-col justify-center'>
                    <span>{item.label}</span>
                    {item.user?.email && <span className='text-xs text-muted-foreground'>{item.user?.email}</span>}
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='Phone1' label='Phone' extendedProps={{ inputProps: { placeholder: "Enter phone" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='website'
              label='Website'
              extendedProps={{ inputProps: { placeholder: "Enter website" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={bpCurrenciesOptions} control={form.control} name='Currency' label='Currency' />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <MultiSelectField
              data={itemGroupsOptions}
              control={form.control}
              name='commodityStrengths'
              label='Commodity Strengths'
              renderItem={(item, selected) => {
                return (
                  <div className='flex flex-col justify-center'>
                    <span>{item.label}</span>
                    <span className='text-xs text-muted-foreground'>{item.group?.Number}</span>
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <MultiSelectField
              data={manufacturersOptions}
              control={form.control}
              name='mfrStrengths'
              label='MFR Strengths'
              renderItem={(item, selected) => {
                return (
                  <div className='flex flex-col justify-center'>
                    <span>{item.label}</span>
                    <span className='text-xs text-muted-foreground'>{item.manufacturer?.Code}</span>
                  </div>
                )
              }}
            />
          </div>

          <div className='col-span-12 mt-2 space-y-4 lg:col-span-12'>
            <Separator />

            <ReadOnlyFieldHeader title='Qualification Data' description='Supplier qualification data' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField data={BP_MASTER_AVL_STATUS_OPTIONS} control={form.control} name='avlStatus' label='AVL Status' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField data={BP_MASTER_STATUS_OPTIONS} control={form.control} name='status' label='Status' isRequired />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField data={BP_MASTER_SCOPE_OPTIONS} control={form.control} name='scope' label='Scope' isRequired />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-5 lg:col-span-3'>
            <SwitchField
              control={form.control}
              layout='default'
              name='isCompliantToAs'
              label='Compliant to As'
              description='Is this supplier compliant to As?'
            />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-5 lg:col-span-3'>
            <SwitchField
              control={form.control}
              layout='default'
              name='isCompliantToItar'
              label='Compliant to ITAR'
              description='Is this supplier compliant to ITAR?'
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={bpPaymentTermsOptions} control={form.control} name='GroupNum' label='Terms' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={BP_MASTER_WARRANY_PERIOD_OPTIONS} control={form.control} name='warranyPeriod' label='Warranty Period' />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <TextAreaField
              control={form.control}
              name='omegaReviews'
              label='Omega Reviews'
              extendedProps={{ textAreaProps: { placeholder: "Enter omega reviews", rows: 5 } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6'>
            <TextAreaField
              control={form.control}
              name='qualificationNotes'
              label='Qualification Notes'
              extendedProps={{ textAreaProps: { placeholder: "Enter qualification notes", rows: 5 } }}
            />
          </div>

          <div className='col-span-12 mt-2 space-y-4 lg:col-span-12'>
            <Separator />

            <ReadOnlyFieldHeader title='Address Details' description='Supplier address details' />
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='street'
              label='Street'
              extendedProps={{ textAreaProps: { placeholder: "Enter street" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='streetNo'
              label='Street No.'
              extendedProps={{ inputProps: { placeholder: "Enter street no." } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='buildingFloorRoom'
              label='Building/Floor/ Room'
              extendedProps={{ inputProps: { placeholder: "Enter building/floor/room" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='block' label='Block' extendedProps={{ inputProps: { placeholder: "Enter block" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='city' label='City' extendedProps={{ inputProps: { placeholder: "Enter city" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='zipCode'
              label='Zip Code'
              extendedProps={{ inputProps: { placeholder: "Enter zip code" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='county'
              label='County'
              extendedProps={{ inputProps: { placeholder: "Enter county" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='state' label='State' extendedProps={{ inputProps: { placeholder: "Enter state" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='country'
              label='Country'
              extendedProps={{ inputProps: { placeholder: "Enter country" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='gln' label='GLN' extendedProps={{ inputProps: { placeholder: "Enter gln" } }} />
          </div>

          <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
            <Button type='button' variant='secondary' onClick={() => router.push(`/dashboard/mater-data/suppliers   `)}>
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
