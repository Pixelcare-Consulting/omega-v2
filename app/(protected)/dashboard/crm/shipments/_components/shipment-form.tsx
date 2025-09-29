"use client"

import {
  SHIPMENT_SHIP_TO_LOCATION_OPTIONS,
  SHIPMENT_SHIPPING_ORDER_STATUS_OPTIONS,
  type ShipmentForm,
  shipmentFormSchema,
} from "@/schema/shipment"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import { useForm, useWatch } from "react-hook-form"

import { Separator } from "@/components/ui/separator"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { ComboboxField } from "@/components/form/combobox-field"
import { Form } from "@/components/ui/form"
import {} from "@/components/ui/input"
import InputField from "@/components/form/input-field"
import DatePickerField from "@/components/form/date-picker-field"
import TextAreaField from "@/components/form/textarea-field"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/loading-button"
import { useAction } from "next-safe-action/hooks"
import { getRequisitionsClient, RequestedItemsJSONData } from "@/actions/requisition"
import { getSupplierQuotesByReqCodeClient } from "@/actions/supplier-quote"
import { getShipmentByCode, upsertShipment } from "@/actions/shipment"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"
import ReadOnlyFormField from "@/components/read-only-form-field"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/badge"
import { REQUISITION_PO_STATUS_OPTIONS } from "@/schema/requisition"
import { format, isValid } from "date-fns"
import { getItemByItemCodeClient } from "@/actions/master-item"
import { formatNumber } from "@/lib/formatter"
import { useDialogStore } from "@/hooks/use-dialog"
import { BP_MASTER_SUPPLIER_STATUS_OPTIONS } from "@/schema/master-bp"
import { SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS, SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS } from "@/schema/supplier-quote"
import { getUsersClient } from "@/actions/user"
import { FormDebug } from "@/components/form/form-debug"

type ShipmentFormProps = {
  isModal?: boolean
  disableRequisitionField?: boolean
  disableSupplierQuoteField?: boolean
  shipment: Awaited<ReturnType<typeof getShipmentByCode>>
  reqCode?: number
  suppQuoteCode?: number
}

export default function ShipmentForm({
  isModal,
  disableRequisitionField,
  disableSupplierQuoteField,
  shipment,
  reqCode,
  suppQuoteCode,
}: ShipmentFormProps) {
  const router = useRouter()
  const { code } = useParams() as { code: string }
  const { setIsOpen, setData } = useDialogStore(["setIsOpen", "setData"])

  const values = useMemo(() => {
    if (shipment) {
      const { requisition, supplierQuote, qtyToShip, ...data } = shipment

      return {
        ...data,
        qtyToShip: qtyToShip as any,
      }
    }

    if (code === "add" || !shipment) {
      return {
        id: "add",
        requisitionCode: 0,
        poNumber: "",
        prNumber: "",
        soNumber: "",
        supplierQuoteCode: 0,
        qtyToShip: 0,
        shipToLocation: "",
        purchaserId: null,
        shippingOderStatus: "",
        datePoPlaced: null,
        dateShipped: null,
        orderUpdates: "",
      }
    }

    return undefined
  }, [JSON.stringify(shipment)])

  const form = useForm<ShipmentForm>({
    mode: "onChange",
    values,
    resolver: zodResolver(shipmentFormSchema),
  })

  const requisitionCode = useWatch({ control: form.control, name: "requisitionCode" })
  const supplierQuoteCode = useWatch({ control: form.control, name: "supplierQuoteCode" })

  const { executeAsync, isExecuting } = useAction(upsertShipment)

  const {
    execute: getRequisitionsExec,
    isExecuting: isRequisitionsLoading,
    result: { data: requisitions },
  } = useAction(getRequisitionsClient)

  const {
    execute: getSupplierQuotesByReqCodeExec,
    isExecuting: isSupplierQuotesLoading,
    result: { data: supplierQuotes },
  } = useAction(getSupplierQuotesByReqCodeClient)

  const {
    execute: getReqItemByItemCodeExec,
    isExecuting: isReqItemLoading,
    result: { data: reqItem },
  } = useAction(getItemByItemCodeClient)

  const {
    execute: getUsersExec,
    isExecuting: isUsersLoading,
    result: { data: users },
  } = useAction(getUsersClient)

  const requisition = useMemo(() => {
    return requisitions?.find((req) => req.code == requisitionCode)
  }, [JSON.stringify(requisitions), requisitionCode])

  const reqSalesPerson = useMemo(() => {
    const value = requisition?.salesPersons

    if (!value || value.length < 0) return []

    return value.map((person) => person?.user?.name || person?.user?.email).filter(Boolean) || []
  }, [JSON.stringify(requisition)])

  const reqSalesTeam = useMemo(() => {
    const value = requisition?.salesTeam

    if (!value || value.length < 0) return []

    return value.map((person) => person?.user?.name || person?.user?.email).filter(Boolean) || []
  }, [JSON.stringify(requisition)])

  const reqPoStatus = useMemo(() => {
    const value = requisition?.poStatus
    return REQUISITION_PO_STATUS_OPTIONS.find((item) => item.value === value)?.label
  }, [JSON.stringify(requisition)])

  const reqPoStatusLastUpdated = useMemo(() => {
    const value = requisition?.poStatusLastUpdated

    if (!value || !isValid(value)) return ""

    return format(value, "MM-dd-yyyy")
  }, [JSON.stringify(requisition)])

  const reqCustPoDockDate = useMemo(() => {
    const value = requisition?.custPoDockDate

    if (!value || !isValid(value)) return ""

    return format(value, "MM-dd-yyyy")
  }, [JSON.stringify(requisition)])

  const reqMpn = useMemo(() => {
    //* only get the mpn of the primary item
    const value = (requisition?.requestedItems as RequestedItemsJSONData) || []

    return value?.[0]?.code
  }, [JSON.stringify(requisition)])

  const reqQuantity = useMemo(() => {
    const value = parseFloat(String(requisition?.quantity))

    if (isNaN(value)) return ""

    return formatNumber({ amount: value, maxDecimal: 2 })
  }, [JSON.stringify(requisition)])

  const requisitionsOptions = useMemo(() => {
    if (!requisitions) return []
    return requisitions.map((req) => ({ label: String(req.code), value: String(req.code), requisition: req }))
  }, [JSON.stringify(requisitions)])

  const supplierQuote = useMemo(() => {
    return supplierQuotes?.find((quote) => quote.code == supplierQuoteCode)
  }, [JSON.stringify(supplierQuotes), supplierQuoteCode])

  const suppQuoteSupplierStatus = useMemo(() => {
    const value = supplierQuote?.supplier?.status
    return BP_MASTER_SUPPLIER_STATUS_OPTIONS.find((item) => item.value === value)?.label
  }, [JSON.stringify(supplierQuote)])

  const suppQuoteLtToSjcNumber = useMemo(() => {
    const value = supplierQuote?.ltToSjcNumber
    return SUPPLIER_QUOTE_LT_TO_SJC_NUMBER_OPTIONS.find((item) => item.value === value)?.label
  }, [JSON.stringify(supplierQuote)])

  const suppQuoteLtToSjcUom = useMemo(() => {
    const value = supplierQuote?.ltToSjcUom
    return SUPPLIER_QUOTE_LT_TO_SJC_UOM_OPTIONS.find((item) => item.value === value)?.label
  }, [JSON.stringify(supplierQuote)])

  const supplierQuotesOptions = useMemo(() => {
    if (!supplierQuotes) return []
    return supplierQuotes.map((quote) => ({ label: String(quote.code), value: String(quote.code), supplierQuote: quote }))
  }, [JSON.stringify(supplierQuotes)])

  const usersOptions = useMemo(() => {
    if (!users) return []
    return users.map((user) => ({ label: user.name || user.email, value: user.id, user }))
  }, [JSON.stringify(users), isUsersLoading])

  const onSubmit = async (formData: ShipmentForm) => {
    try {
      const response = await executeAsync(formData)
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      toast.success(result?.message)

      if (result?.data && result?.data?.shipment && "code" in result?.data?.shipment) {
        if (isModal) {
          setIsOpen(false)
          setData(null)

          setTimeout(() => {
            router.refresh()
          }, 1500)
          return
        }

        setTimeout(() => {
          router.push(`/dashboard/crm/shipments/${result.data.shipment.code}`)
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  const handleCancel = () => {
    if (isModal) {
      setIsOpen(false)
      return
    }

    router.push(`/dashboard/crm/shipments`)
  }

  const requisitionCodeCallback = (args: any) => {
    const value = parseInt(args?.option?.value)

    form.setValue("supplierQuoteCode", 0)
    getSupplierQuotesByReqCodeExec({ reqCode: !isNaN(value) ? value : 0 })
  }

  const onFirstLoad = () => {
    getRequisitionsExec()
    getUsersExec()
  }

  //* trigger fetching for supplier quote when shipment data exists
  useEffect(() => {
    if (shipment && shipment.requisitionCode) getSupplierQuotesByReqCodeExec({ reqCode: shipment.requisitionCode })
  }, [JSON.stringify(shipment)])

  //* trigger fetching for reqItem if reqMpn exist
  useEffect(() => {
    if (reqMpn) getReqItemByItemCodeExec({ code: reqMpn })
  }, [JSON.stringify(reqMpn)])

  //* set requisition code if reqCode exist
  useEffect(() => {
    if (reqCode && requisitionsOptions.length > 0) {
      form.setValue("requisitionCode", reqCode)
    }
  }, [reqCode, JSON.stringify(requisitionsOptions)])

  //* trigger fetching once on first load
  useEffect(() => {
    onFirstLoad()
  }, [])

  return (
    <>
      <FormDebug form={form} />

      <Form {...form}>
        <form className='grid grid-cols-12 gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField
              data={requisitionsOptions}
              control={form.control}
              name='requisitionCode'
              label='Requisition'
              isRequired
              isLoading={isRequisitionsLoading}
              extendedProps={{ buttonProps: { disabled: disableRequisitionField } }}
              callback={requisitionCodeCallback}
              renderItem={(item, selected) => (
                <div className={cn("flex w-full items-center justify-between", selected && "bg-accent")}>
                  <div className='flex w-[80%] flex-col justify-center'>
                    <span className={cn("truncate", selected && "text-accent-foreground")}>{item?.requisition?.customer?.CardName}</span>
                    {item?.requisition?.requestedItems?.length > 0 && (
                      <span className='text-xs text-muted-foreground'>{item.requisition.requestedItems[0].code}</span>
                    )}
                  </div>

                  <span className={cn("text-xs text-muted-foreground", selected && "text-accent-foreground")}>#{item?.value}</span>
                </div>
              )}
            />
          </div>

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-4'
            label='Requisition - Salesperson'
            value={
              <div className='flex flex-wrap items-center gap-1.5'>
                {reqSalesPerson.map((person, i) => (
                  <Badge key={`${i}-${person}-salesperson`} variant='soft-red'>
                    {person}
                  </Badge>
                ))}
              </div>
            }
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-4'
            label='Requisition - Sales Team'
            value={
              <div className='flex flex-wrap items-center gap-1.5'>
                {reqSalesTeam.map((person, i) => (
                  <Badge key={`${i}-${person}-salesteam`} variant='soft-red'>
                    {person}
                  </Badge>
                ))}
              </div>
            }
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Customer Name'
            value={requisition?.customer?.CardName || ""}
          />

          <ReadOnlyFormField className='col-span-12 md:col-span-6 lg:col-span-3' label='Cust. PO #' value={requisition?.custPoNum || ""} />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Requisition - PO Status'
            value={reqPoStatus || ""}
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Requisition - PO Status Last Updated'
            value={reqPoStatusLastUpdated}
          />

          {/* //TODO: Empty for now because it does not exist in QB */}
          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Requisition - Shipment Instructions (Sales)'
            value=''
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Requisition - Customer PO Dock Date'
            value={reqCustPoDockDate}
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='MPN'
            value={reqItem?.ItemCode || ""}
            isLoading={isReqItemLoading}
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Requisition - Quoted MPN'
            value={requisition?.quotedMpn || ""}
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='MFR'
            value={reqItem?.FirmName || ""}
            isLoading={isReqItemLoading}
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Customer PN'
            value={requisition?.customerPn || ""}
          />

          {/* //TODO: Empty for now because it does not exist in QB */}
          <ReadOnlyFormField className='col-span-12 md:col-span-6 lg:col-span-3' label='Requisition - DigiKey Datasheet' value='' />

          {/* //TODO: Empty for now because it does not exist in QB */}
          <ReadOnlyFormField className='col-span-12 md:col-span-6 lg:col-span-3' label='Requisition - DigiKey HTS Code' value='' />

          <ReadOnlyFormField className='col-span-12 md:col-span-6 lg:col-span-3' label='Requisition - Quantity' value={reqQuantity} />

          <Separator className='col-span-12' />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Date Created'
            value={shipment?.createdAt ? format(shipment.createdAt, "MM-dd-yyyy") : ""}
          />

          {/* //TODO: input field for now - changed to dropdown once SAP API is updated */}
          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='poNumber'
              label='PO Number'
              extendedProps={{ inputProps: { placeholder: "Enter PO number" } }}
            />
          </div>

          {/* //TODO: input field for now - changed to dropdown once SAP API is updated */}
          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='prNumber'
              label='PR Number'
              extendedProps={{ inputProps: { placeholder: "Enter PR number" } }}
            />
          </div>

          {/* //TODO: input field for now - changed to dropdown once SAP API is updated */}
          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='soNumber'
              label='SO Number'
              extendedProps={{ inputProps: { placeholder: "Enter SO number" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={supplierQuotesOptions}
              control={form.control}
              name='supplierQuoteCode'
              label='Supplier Quote'
              isRequired
              isLoading={isSupplierQuotesLoading}
              extendedProps={{ buttonProps: { disabled: disableSupplierQuoteField } }}
              renderItem={(item, selected) => {
                const sQuote = item?.supplierQuote

                return (
                  <div className={cn("flex w-full items-center justify-between", selected && "bg-accent")}>
                    <div className='flex w-[80%] flex-col justify-center'>
                      <span className={cn("truncate", selected && "text-accent-foreground")}>{sQuote?.supplier?.CardName}</span>
                      <span className='flex gap-x-1 text-xs text-muted-foreground'>
                        {sQuote?.isPreferredSource ? (
                          <Icons.check className='size-4 text-green-500' />
                        ) : (
                          <Icons.x className='size-4 text-red-500' />
                        )}
                        Preferred Source
                      </span>
                    </div>

                    <span className={cn("text-xs text-muted-foreground", selected && "text-accent-foreground")}>#{item?.value}</span>
                  </div>
                )
              }}
            />
          </div>

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Supplier Name'
            value={supplierQuote?.supplier?.CardName || ""}
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Supplier Quote - Supplier - Terms'
            value={supplierQuote?.supplier?.PymntGroup || ""}
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Supplier Quote - Supplier - Status'
            value={suppQuoteSupplierStatus || ""}
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Supplier Quote - LT to SJC (Number)'
            value={suppQuoteLtToSjcNumber || ""}
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Supplier Quote - LT to SJC (UoM)'
            value={suppQuoteLtToSjcUom || ""}
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Supplier Quote - Lead Time to SJC'
            value={supplierQuote?.ltToSjc || ""}
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Supplier Quote - Condition'
            value={supplierQuote?.condition || ""}
          />

          <ReadOnlyFormField
            className='col-span-12 md:col-span-6 lg:col-span-3'
            label='Supplier Quote - MPN'
            value={supplierQuote?.itemCode || ""}
          />

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <InputField
              control={form.control}
              name='qtyToShip'
              label='QTY to Ship'
              extendedProps={{ inputProps: { placeholder: "Enter qty to ship", type: "number" } }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField data={SHIPMENT_SHIP_TO_LOCATION_OPTIONS} control={form.control} name='shipToLocation' label='Ship to Location' />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-3'>
            <ComboboxField
              data={usersOptions}
              control={form.control}
              name='purchaserId'
              label='Purchaser'
              renderItem={(item, selected) => {
                return (
                  <div className={cn("flex flex-col justify-center", selected && "bg-accent")}>
                    <span>{item.label}</span>
                    {item.user?.email && <span className='text-xs text-muted-foreground'>{item.user?.email}</span>}
                  </div>
                )
              }}
            />
          </div>

          <Separator className='col-span-12' />

          <ReadOnlyFieldHeader className='col-span-12' title='Order Updates' description='Order updates related details' />

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <ComboboxField
              data={SHIPMENT_SHIPPING_ORDER_STATUS_OPTIONS}
              control={form.control}
              name='shippingOderStatus'
              label='Shipping Order Status'
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <DatePickerField
              control={form.control}
              name='datePoPlaced'
              label='Date PO Placed'
              extendedProps={{
                calendarProps: { mode: "single", fromYear: 1800, toYear: new Date().getFullYear(), captionLayout: "dropdown-buttons" },
              }}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <DatePickerField
              control={form.control}
              name='dateShipped'
              label='Date Shipped'
              extendedProps={{
                calendarProps: { mode: "single", fromYear: 1800, toYear: new Date().getFullYear(), captionLayout: "dropdown-buttons" },
              }}
            />
          </div>

          <div className='col-span-12'>
            <TextAreaField
              control={form.control}
              name='orderUpdates'
              label='Order Updates'
              extendedProps={{ textAreaProps: { placeholder: "Enter order updates", rows: 10 } }}
            />
          </div>

          <div className='col-span-12 mt-2 flex items-center justify-end gap-2'>
            <Button type='button' variant='secondary' disabled={isExecuting} onClick={handleCancel}>
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
