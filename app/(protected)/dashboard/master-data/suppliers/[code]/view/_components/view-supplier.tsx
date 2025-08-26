import Link from "next/link"

import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Badge } from "@/components/badge"
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getInitials } from "@/lib/utils"
import SupplierSummaryTab from "./tabs/supplier-summary-tab"
import { getBpMasterByCardCode } from "@/actions/master-bp"
import SupplierAddressesTab from "./tabs/supplier-addresses-tab"
import SupplierContactsTab from "./tabs/supplier-contacts-tab"

type ViewSupplierProps = {
  supplier: NonNullable<Awaited<ReturnType<typeof getBpMasterByCardCode>>>
  itemGroups?: any
  manufacturers?: any
  countries?: any
}

export default function ViewSupplier({ supplier, itemGroups, manufacturers, countries }: ViewSupplierProps) {
  return (
    <PageWrapper
      title='Supplier Details'
      description='View the comprehensive details of this supplier.'
      actions={
        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/master-data/suppliers`}>
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
                <Link href={`/dashboard/master-data/suppliers/${supplier.CardCode}`}>
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
              {getInitials(supplier.CardName)}
            </div>

            <div className='flex flex-col gap-y-2 md:gap-0'>
              <h1 className='mb-0 text-sm font-semibold'>{supplier.CardName}</h1>

              <div className='flex flex-wrap items-center gap-2'>
                <p className='text-sm text-muted-foreground'>{supplier.CardCode}</p>
                {supplier?.GroupName && <Badge variant='soft-blue'>{supplier?.GroupName}</Badge>}

                {supplier?.Phone1 && (
                  <div className='flex items-center gap-1'>
                    <Icons.phone className='size-4 text-muted-foreground' />
                    <Link href={`tel:${supplier.Phone1}`} className='text-sm text-muted-foreground decoration-1 hover:underline'>
                      {supplier.Phone1}
                    </Link>
                  </div>
                )}

                {supplier?.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue='1' className='w-full'>
          <TabsList className='mb-2 h-fit flex-wrap'>
            <TabsTrigger value='1'>Summary</TabsTrigger>
            <TabsTrigger value='2'>Addresses</TabsTrigger>
            <TabsTrigger value='3'>Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value='1'>
            <SupplierSummaryTab supplier={supplier} itemGroups={itemGroups} manufacturers={manufacturers} />
          </TabsContent>

          <TabsContent value='2'>
            <SupplierAddressesTab supplier={supplier} countries={countries} />
          </TabsContent>

          <TabsContent value='3'>
            <SupplierContactsTab supplier={supplier} />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
