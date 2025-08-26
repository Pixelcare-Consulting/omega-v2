"use client"

import { useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { getBpMasterByCardCode, getStatesClient, upsertBpMaster } from "@/actions/master-bp"
import { getUsers } from "@/actions/user"
import {
  BP_MASTER_CUSTOMER_ACCOUNT_TYPE_OPTIONS,
  BP_MASTER_CUSTOMER_STATUS_OPTIONS,
  BP_MASTER_CUSTOMER_TYPE_OPTIONS,
  BpMasterForm,
  bpMasterFormSchema,
} from "@/schema/master-bp"
import { Form } from "@/components/ui/form"
import InputField from "@/components/form/input-field"
import { ComboboxField } from "@/components/form/combobox-field"
import SwitchField from "@/components/form/switch-field"
import MultiSelectField from "@/components/form/multi-select-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { Separator } from "@/components/ui/separator"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import TextAreaField from "@/components/form/textarea-field"
import { FormDebug } from "@/components/form/form-debug"
import { getLeadById } from "@/actions/lead"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/badge"

type CustomerFormProps = {
  customer?: Awaited<ReturnType<typeof getBpMasterByCardCode>>
  bpGroups?: any
  paymentTerms?: any
  currencies?: any
  countries?: any
  users: Awaited<ReturnType<typeof getUsers>>
  lead?: Awaited<ReturnType<typeof getLeadById>>
}

export default function CustomerForm({ customer, bpGroups, currencies, countries, paymentTerms, users, lead }: CustomerFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }

  const isCreate = code === "add" || !customer

  const values = useMemo(() => {
    if (customer) {
      const { assignedExcessManagers, addresses, ...data } = customer

      const defaultBillingAddress = addresses.find((address) => address.id === customer.BillToDef) || null
      const defaultShippingAddress = addresses.find((address) => address.id === customer.ShipToDef) || null

      return {
        ...data,
        billingAddress: defaultBillingAddress,
        shippingAddress: defaultShippingAddress,
        assignedExcessManagers: [],
      }
    }

    if (code === "add" || !customer) {
      return {
        //* SAP fields
        CardCode: "",
        CardName: "",
        CardType: "C",
        CntctPrsn: null,
        CurrName: null,
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

        //* QB Customer fields
        accountType: "",
        type: "",
        industryType: "",
        isCreditHold: false,
        isWarehousingCustomer: false,
        assignedSalesEmployee: null,
        assignedBdrInsideSalesRep: null,
        assignedAccountExecutive: null,
        assignedAccountAssociate: null,
        assignedExcessManagers: [],

        //* common fields
        isActive: true,
        status: "",
        source: "portal",
        syncStatus: "pending",

        //* QB Supplier fields
        id: "add",
        accountNo: "",
        assignedBuyer: null,
        website: "",
        commodityStrengths: [],
        mfrStrengths: [],
        avlStatus: "",
        scope: "",
        isCompliantToAs: false,
        isCompliantToItar: false,
        warranyPeriod: "",
        omegaReviews: "",
        qualificationNotes: "",

        //* default billing and shipping address
        billingAddress: {
          id: "add",
          CardCode: "",
          AddrType: "B",
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
        },
        shippingAddress: {
          id: "add",
          CardCode: "",
          AddrType: "S",
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
        },
      }
    }

    return undefined
  }, [code, JSON.stringify(customer)])

  const form = useForm({
    mode: "onChange",
    values,
    resolver: zodResolver(bpMasterFormSchema),
  })

  const cardCode = useWatch({ control: form.control, name: "CardCode" })
  const groupCode = useWatch({ control: form.control, name: "GroupCode" })
  const paymentTermCode = useWatch({ control: form.control, name: "GroupNum" })
  const currencyCode = useWatch({ control: form.control, name: "Currency" })

  const { executeAsync, isExecuting } = useAction(upsertBpMaster)

  const {
    execute: getBillingStatesExecute,
    isExecuting: isBillingStatesLoading,
    result: { data: billingStates },
  } = useAction(getStatesClient)

  const {
    execute: getShippingStatesExecute,
    isExecuting: isShippingStatesLoading,
    result: { data: shippingStates },
  } = useAction(getStatesClient)

  const bpGroupsOptions = useMemo(() => {
    if (!bpGroups) return []
    return bpGroups.map((group: any) => ({ label: group.Name, value: group.Code, group }))
  }, [JSON.stringify(bpGroups)])

  const paymentTermsOptions = useMemo(() => {
    if (!paymentTerms) return []
    return paymentTerms.map((term: any) => ({ label: term.PymntGroup, value: term.GroupNum }))
  }, [JSON.stringify(paymentTerms)])

  const currenciesOptions = useMemo(() => {
    if (!currencies) return []
    return currencies.map((currency: any) => ({ label: currency.CurrName, value: currency.CurrCode }))
  }, [JSON.stringify(currencies)])

  const countriesOptions = useMemo(() => {
    if (!countries) return []
    return countries.map((country: any) => ({ label: country.Name, value: country.Code }))
  }, [JSON.stringify(countries)])

  const billingStatesOptions = useMemo(() => {
    const result = billingStates?.value || []

    if (result.length < 1 || isBillingStatesLoading) return []
    return result.map((state: any) => ({ label: state.Name, value: state.Code }))
  }, [JSON.stringify(billingStates), isBillingStatesLoading])

  const shippingStatesOptions = useMemo(() => {
    const result = shippingStates?.value || []

    if (result.length < 1 || isShippingStatesLoading) return []
    return result.map((state: any) => ({ label: state.Name, value: state.Code }))
  }, [JSON.stringify(shippingStates), isShippingStatesLoading])

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
        if (result.status === 401) {
          form.setError("CardCode", { type: "custom", message: result.message })
        }

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
      const selectedPaymentTerm = paymentTermsOptions.find((paymentTerm: any) => paymentTerm.value == paymentTermCode)
      if (selectedPaymentTerm) {
        form.setValue("PymntGroup", selectedPaymentTerm?.label)
      }
    }
  }, [paymentTermCode, JSON.stringify(paymentTermsOptions)])

  //* set currency name if currency is selected
  useEffect(() => {
    if (currencyCode !== undefined && currencyCode !== null && currencyCode) {
      const selectedCurrency = currenciesOptions.find((currency: any) => currency.value == currencyCode)
      if (selectedCurrency) {
        form.setValue("CurrName", selectedCurrency?.label)
      }
    }
  }, [currencyCode, JSON.stringify(currenciesOptions)])

  //* set excess manager if data customer exist
  useEffect(() => {
    if (customer && usersOptions.length > 0) {
      const selectedExcessManagers = customer.assignedExcessManagers?.map((excessManager) => excessManager?.userId) || []
      form.setValue("assignedExcessManagers", selectedExcessManagers)
    }
  }, [JSON.stringify(customer)])

  //* pupluate cardCode of default billing and shipping address
  useEffect(() => {
    if (cardCode) {
      form.setValue("billingAddress.CardCode", cardCode)
      form.setValue("shippingAddress.CardCode", cardCode)
    }
  }, [cardCode])

  //* set billing & shpping state if customer data exist
  useEffect(() => {
    if (customer) {
      const addresses = customer.addresses || []

      const defaultBillingAddress = addresses.find((address) => address.id === customer.BillToDef) || null
      const defaultShippingAddress = addresses.find((address) => address.id === customer.ShipToDef) || null

      if (defaultBillingAddress && defaultBillingAddress.Country) {
        //* trigger fetching billing state
        getBillingStatesExecute({ countryCode: defaultBillingAddress.Country })
      }

      if (defaultShippingAddress && defaultShippingAddress.Country) {
        //* trigger fetching shipping state
        getShippingStatesExecute({ countryCode: defaultShippingAddress.Country })
      }
    }
  }, [JSON.stringify(customer)])

  //* pre populate data based on lead
  useEffect(() => {
    if (lead) {
      form.setValue("CardName", lead.name)
      form.setValue("Phone1", lead.phone)

      //* pre populate billing address
      form.setValue("billingAddress.AddrType", "B")
      form.setValue("billingAddress.Street", lead.street1)
      form.setValue("billingAddress.Address2", lead.street2)
      form.setValue("billingAddress.Address3", lead.street3)
      form.setValue("billingAddress.Block", lead.block)
      form.setValue("billingAddress.City", lead.city)
      form.setValue("billingAddress.ZipCode", lead.zipCode)
      form.setValue("billingAddress.County", lead.county)
      form.setValue("billingAddress.State", lead.state)
      form.setValue("billingAddress.Country", lead.country)
      form.setValue("billingAddress.StreetNo", lead.streetNo)
      form.setValue("billingAddress.Building", lead.buildingFloorRoom)
      form.setValue("billingAddress.GlblLocNum", lead.gln)

      //* pre populate shipping address
      form.setValue("shippingAddress.AddrType", "S")
      form.setValue("shippingAddress.Street", lead.street1)
      form.setValue("shippingAddress.Address2", lead.street2)
      form.setValue("shippingAddress.Address3", lead.street3)
      form.setValue("shippingAddress.Block", lead.block)
      form.setValue("shippingAddress.City", lead.city)
      form.setValue("shippingAddress.ZipCode", lead.zipCode)
      form.setValue("shippingAddress.County", lead.county)
      form.setValue("shippingAddress.State", lead.state)
      form.setValue("shippingAddress.Country", lead.country)
      form.setValue("shippingAddress.StreetNo", lead.streetNo)
      form.setValue("shippingAddress.Building", lead.buildingFloorRoom)
      form.setValue("shippingAddress.GlblLocNum", lead.gln)
    }
  }, [JSON.stringify(lead)])

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
            <ComboboxField data={BP_MASTER_CUSTOMER_ACCOUNT_TYPE_OPTIONS} control={form.control} name='accountType' label='Account Type' />
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

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField data={BP_MASTER_CUSTOMER_TYPE_OPTIONS} control={form.control} name='type' label='Type' isRequired />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField data={BP_MASTER_CUSTOMER_STATUS_OPTIONS} control={form.control} name='status' label='Status' isRequired />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <InputField
              control={form.control}
              name='industryType'
              label='Industry Type'
              extendedProps={{ inputProps: { placeholder: "Enter industry type" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField data={paymentTermsOptions} control={form.control} name='GroupNum' label='Terms' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField data={currenciesOptions} control={form.control} name='Currency' label='Currency' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <InputField control={form.control} name='Phone1' label='Phone' extendedProps={{ inputProps: { placeholder: "Enter phone" } }} />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={usersOptions}
              control={form.control}
              name='assignedSalesEmployee'
              label='Sales Employee'
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
            <ComboboxField
              data={usersOptions}
              control={form.control}
              name='assignedBdrInsideSalesRep'
              label='BDR / Inside Sales Rep'
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
            <ComboboxField
              data={usersOptions}
              control={form.control}
              name='assignedAccountExecutive'
              label='Account Executive'
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
            <ComboboxField
              data={usersOptions}
              control={form.control}
              name='assignedAccountAssociate'
              label='Account Associate'
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

          <div className='col-span-12'>
            <MultiSelectField
              data={usersOptions}
              control={form.control}
              name='assignedExcessManagers'
              label='Excess Managers'
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

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-4'>
            <SwitchField
              control={form.control}
              layout='default'
              name='isActive'
              label='Active'
              extendedProps={{ switchProps: { disabled: isCreate } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-4'>
            <SwitchField control={form.control} layout='default' name='isCreditHold' label='Credit Hold' />
          </div>

          <div className='col-span-12 md:col-span-6 md:mt-3 lg:col-span-4'>
            <SwitchField control={form.control} layout='default' name='isWarehousingCustomer' label='Warehousing Customer' />
          </div>

          <Separator className='col-span-12' />
          <ReadOnlyFieldHeader
            className='col-span-12'
            title={
              <div className='flex items-center gap-3'>
                Address Details <Badge variant='soft-blue'>Default</Badge>
              </div>
            }
            description='Supplier address details'
          />

          <Tabs defaultValue='1' className='col-span-12'>
            <TabsList>
              <TabsTrigger value='1'>Billing</TabsTrigger>
              <TabsTrigger value='2'>Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value='1'>
              <div className='grid grid-cols-12 gap-4'>
                <div className='col-span-12'>
                  <TextAreaField
                    control={form.control}
                    name='billingAddress.Street'
                    label='Street 1'
                    extendedProps={{ textAreaProps: { placeholder: "Enter street 1" } }}
                  />
                </div>

                <div className='col-span-12'>
                  <TextAreaField
                    control={form.control}
                    name='billingAddress.Address2'
                    label='Street 2'
                    extendedProps={{ textAreaProps: { placeholder: "Enter street 2" } }}
                  />
                </div>

                <div className='col-span-12'>
                  <TextAreaField
                    control={form.control}
                    name='billingAddress.Address3'
                    label='Street 3'
                    extendedProps={{ textAreaProps: { placeholder: "Enter street 3" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='billingAddress.StreetNo'
                    label='Street No.'
                    extendedProps={{ inputProps: { placeholder: "Enter street no." } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='billingAddress.Building'
                    label='Building/Floor/ Room'
                    extendedProps={{ inputProps: { placeholder: "Enter building/floor/room" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='billingAddress.Block'
                    label='Block'
                    extendedProps={{ inputProps: { placeholder: "Enter block" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='billingAddress.City'
                    label='City'
                    extendedProps={{ inputProps: { placeholder: "Enter city" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='billingAddress.ZipCode'
                    label='Zip Code'
                    extendedProps={{ inputProps: { placeholder: "Enter zip code" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='billingAddress.County'
                    label='County'
                    extendedProps={{ inputProps: { placeholder: "Enter county" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <ComboboxField
                    data={countriesOptions}
                    control={form.control}
                    name='billingAddress.Country'
                    label='Country'
                    callback={(args) => getBillingStatesExecute({ countryCode: args.option.value })}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <ComboboxField
                    data={billingStatesOptions}
                    control={form.control}
                    name='billingAddress.State'
                    label='State'
                    isLoading={isBillingStatesLoading}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='billingAddress.GlblLocNum'
                    label='GLN'
                    extendedProps={{ inputProps: { placeholder: "Enter gln" } }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value='2'>
              <div className='grid grid-cols-12 gap-4'>
                <div className='col-span-12'>
                  <TextAreaField
                    control={form.control}
                    name='shippingAddress.Street'
                    label='Street 1'
                    extendedProps={{ textAreaProps: { placeholder: "Enter street 1" } }}
                  />
                </div>

                <div className='col-span-12'>
                  <TextAreaField
                    control={form.control}
                    name='shippingAddress.Address2'
                    label='Street 2'
                    extendedProps={{ textAreaProps: { placeholder: "Enter street 2" } }}
                  />
                </div>

                <div className='col-span-12'>
                  <TextAreaField
                    control={form.control}
                    name='shippingAddress.Address3'
                    label='Street 3'
                    extendedProps={{ textAreaProps: { placeholder: "Enter street 3" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='shippingAddress.StreetNo'
                    label='Street No.'
                    extendedProps={{ inputProps: { placeholder: "Enter street no." } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='shippingAddress.Building'
                    label='Building/Floor/ Room'
                    extendedProps={{ inputProps: { placeholder: "Enter building/floor/room" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='shippingAddress.Block'
                    label='Block'
                    extendedProps={{ inputProps: { placeholder: "Enter block" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='shippingAddress.City'
                    label='City'
                    extendedProps={{ inputProps: { placeholder: "Enter city" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='shippingAddress.ZipCode'
                    label='Zip Code'
                    extendedProps={{ inputProps: { placeholder: "Enter zip code" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='shippingAddress.County'
                    label='County'
                    extendedProps={{ inputProps: { placeholder: "Enter county" } }}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <ComboboxField
                    data={countriesOptions}
                    control={form.control}
                    name='shippingAddress.Country'
                    label='Country'
                    callback={(args) => getShippingStatesExecute({ countryCode: args.option.value })}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <ComboboxField
                    data={shippingStatesOptions}
                    control={form.control}
                    name='shippingAddress.State'
                    label='State'
                    isLoading={isShippingStatesLoading}
                  />
                </div>

                <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                  <InputField
                    control={form.control}
                    name='shippingAddress.GlblLocNum'
                    label='GLN'
                    extendedProps={{ inputProps: { placeholder: "Enter gln" } }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
            <Button type='button' variant='secondary' onClick={() => router.push(`/dashboard/mater-data/customers`)}>
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
