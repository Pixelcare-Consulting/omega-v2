"use client"

import { useParams } from "next/navigation"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { getBpMasterByCardCode, getStatesClient } from "@/actions/master-bp"
import { useDialogStore } from "@/hooks/use-dialog"
import { ADDRESS_TYPE_OPTIONS, type AddressMasterForm, addressMasterFormSchema } from "@/schema/master-address"
import { format } from "date-fns"
import { useEffect, useMemo } from "react"
import { useAction } from "next-safe-action/hooks"
import { upsertAddressMaster } from "@/actions/master-address"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form"
import TextAreaField from "@/components/form/textarea-field"
import InputField from "@/components/form/input-field"
import { ComboboxField } from "@/components/form/combobox-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

type AddressFormProps = {
  countries?: any
  address?: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>["addresses"][number]
}

export default function AddressForm({ address, countries }: AddressFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }

  const { setIsOpen, setData } = useDialogStore(["setIsOpen", "setData"])

  const values = useMemo(() => {
    if (address) return address

    return {
      id: "add",
      CardCode: code,
      AddrType: "",
      Street: "",
      Block: "",
      City: "",
      ZipCode: "",
      County: "",
      State: null,
      Country: null,
      StreetNo: "",
      Building: "",
      GlblLocNum: "",
      Address2: "",
      Address3: "",
      CreateDate: format(new Date(), "yyyyMMdd"),
      source: "portal",
      syncStatus: "pending",
    }
  }, [JSON.stringify(address)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(addressMasterFormSchema),
  })

  const cardCode = useWatch({ control: form.control, name: "CardCode" })

  const { executeAsync, isExecuting } = useAction(upsertAddressMaster)

  const {
    execute: getStatesExecute,
    isExecuting: isStatesLoading,
    result: { data: states },
  } = useAction(getStatesClient)

  const countriesOptions = useMemo(() => {
    if (!countries) return []
    return countries.map((country: any) => ({ label: country.Name, value: country.Code }))
  }, [JSON.stringify(countries)])

  const statesOptions = useMemo(() => {
    const result = states?.value || []

    if (result.length < 1 || isStatesLoading) return []
    return result.map((state: any) => ({ label: state.Name, value: state.Code }))
  }, [JSON.stringify(states), isStatesLoading])

  const handleClose = () => {
    setIsOpen(false)
    setData(null)
    form.reset()
  }

  const onSubmit = async (formData: AddressMasterForm) => {
    try {
      const response = await executeAsync(formData)
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
  }

  //* set state if address data is exist
  useEffect(() => {
    if (address) {
      if (address.Country) {
        //* trigger fetching state
        getStatesExecute({ countryCode: address.Country })
      }
    }
  }, [JSON.stringify(address)])

  return (
    <>
      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 md:col-span-6'>
            <FormItem className='space-y-2'>
              <FormLabel className='space-x-1'>Code</FormLabel>
              <FormControl>
                <Input disabled value={cardCode || ""} />
              </FormControl>
            </FormItem>
          </div>

          <div className='col-span-12 md:col-span-6'>
            <ComboboxField data={ADDRESS_TYPE_OPTIONS} control={form.control} name='AddrType' label='Type' isRequired />
          </div>

          <Separator className='col-span-12' />

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='Street'
              label='Street 1'
              extendedProps={{ textAreaProps: { placeholder: "Enter street 1" } }}
            />
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='Address2'
              label='Street 2'
              extendedProps={{ textAreaProps: { placeholder: "Enter street 2" } }}
            />
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='Address3'
              label='Street 3'
              extendedProps={{ textAreaProps: { placeholder: "Enter street 3" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='StreetNo'
              label='Street No.'
              extendedProps={{ inputProps: { placeholder: "Enter street no." } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='Building'
              label='Building/Floor/ Room'
              extendedProps={{ inputProps: { placeholder: "Enter building/floor/room" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='Block' label='Block' extendedProps={{ inputProps: { placeholder: "Enter block" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='City' label='City' extendedProps={{ inputProps: { placeholder: "Enter city" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='ZipCode'
              label='Zip Code'
              extendedProps={{ inputProps: { placeholder: "Enter zip code" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='County'
              label='County'
              extendedProps={{ inputProps: { placeholder: "Enter county" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={countriesOptions}
              control={form.control}
              name='Country'
              label='Country'
              callback={(args) => {
                getStatesExecute({ countryCode: args.option.value })
                form.setValue("State", null)
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={statesOptions} control={form.control} name='State' label='State' isLoading={isStatesLoading} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField control={form.control} name='GlblLocNum' label='GLN' extendedProps={{ inputProps: { placeholder: "Enter gln" } }} />
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
    </>
  )
}
