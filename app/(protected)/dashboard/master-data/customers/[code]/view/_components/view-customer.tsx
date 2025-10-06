"use client"

import Link from "next/link"

import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Badge } from "@/components/badge"
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import UnderDevelopment from "@/components/under-development"
import { getInitials } from "@/lib/utils"
import CustomerSummaryTab from "./tabs/customer-summary-tab"
import { getBpMasterByCardCode } from "@/actions/master-bp"
import {
  BP_MASTER_CUSTOMER_ACCOUNT_TYPE_OPTIONS,
  BP_MASTER_CUSTOMER_STATUS_OPTIONS,
  BP_MASTER_CUSTOMER_TYPE_OPTIONS,
} from "@/schema/master-bp"
import CustomerAddressesTab from "./tabs/customer-addresses-tab"
import CustomerContactsTab from "./tabs/customer-contacts-tab"
import { useAction } from "next-safe-action/hooks"
import { getCustomerExcessesByCustomerCodeClient } from "@/actions/customer-excess"
import CustomerExcessListTab from "./tabs/customer-excess-list-tab"

type ViewCustomerProps = {
  customer: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
  countries?: any
}

export default function ViewCustomer({ customer, countries }: ViewCustomerProps) {
  const {
    execute: getCustomerExcessesByCustomerCodeExec,
    isExecuting: IsCustomerExcessesLoading,
    result: { data: customerExcesses },
  } = useAction(getCustomerExcessesByCustomerCodeClient)

  const accountType = BP_MASTER_CUSTOMER_ACCOUNT_TYPE_OPTIONS.find((item) => item.value === customer.accountType)?.label
  const type = BP_MASTER_CUSTOMER_TYPE_OPTIONS.find((item) => item.value === customer.type)?.label
  const status = BP_MASTER_CUSTOMER_STATUS_OPTIONS.find((item) => item.value === customer.status)?.label

  return (
    <PageWrapper
      title='Customer Details'
      description='View the comprehensive details of this customer.'
      actions={
        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/master-data/customers`}>
            Back
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='default' size='icon'>
                <Icons.moreVertical className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/master-data/customers/${customer.CardCode}`}>
                  <Icons.pencil className='mr-2 size-4' /> Edit
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className='flex flex-col gap-4'>
        <Card className='flex items-center rounded-lg p-6 shadow-md'>
          <div className='flex items-center gap-3'>
            <div className='flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-muted font-bold'>
              {getInitials(customer.CardName)}
            </div>

            <div className='flex flex-col gap-y-2 md:gap-0'>
              <h1 className='mb-0 text-sm font-semibold'>{customer.CardName}</h1>

              <div className='flex flex-wrap items-center gap-2'>
                <p className='text-sm text-muted-foreground'>{customer.CardCode}</p>
                {customer?.GroupName && <Badge variant='soft-blue'>{customer?.GroupName}</Badge>}

                {customer.Phone1 && (
                  <div className='flex items-center gap-1'>
                    <Icons.phone className='size-4 text-muted-foreground' />
                    <Link href={`tel:${customer.Phone1}`} className='text-sm text-muted-foreground decoration-1 hover:underline'>
                      {customer.Phone1}
                    </Link>
                  </div>
                )}

                {accountType && <Badge variant='soft-slate'>{accountType}</Badge>}

                {type && <Badge variant='soft-slate'>{type}</Badge>}

                {status && <Badge variant='soft-amber'>{status}</Badge>}

                {customer?.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue='1' className='w-full'>
          <TabsList className='mb-2 h-fit flex-wrap'>
            <TabsTrigger value='1'>Summary</TabsTrigger>
            <TabsTrigger value='2'>Addresses</TabsTrigger>
            <TabsTrigger value='3'>Contacts</TabsTrigger>
            <TabsTrigger value='4'>Excess List</TabsTrigger>
          </TabsList>

          <TabsContent value='1'>
            <CustomerSummaryTab customer={customer} />
          </TabsContent>

          <TabsContent value='2'>
            <CustomerAddressesTab customer={customer} countries={countries} />
          </TabsContent>

          <TabsContent value='3'>
            <CustomerContactsTab customer={customer} />
          </TabsContent>

          <TabsContent value='4'>
            <CustomerExcessListTab
              customer={customer}
              excesses={{
                data: customerExcesses || [],
                isLoading: IsCustomerExcessesLoading,
                callback: () => getCustomerExcessesByCustomerCodeExec({ customerCode: customer.CardCode }),
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
