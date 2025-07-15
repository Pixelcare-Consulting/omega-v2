import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Badge } from "@/components/badge"
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import UnderDevelopment from "@/components/under-development"
import { getInitials } from "@/lib/utils"

import Link from "next/link"
import ItemSummaryTab from "./tabs/item-summary-tab"
import { getItemsByItemCode } from "@/actions/sap-item-master"

type ViewItemProps = {
  item: NonNullable<Awaited<ReturnType<typeof getItemsByItemCode>>>
}

export default function ViewItem({ item }: ViewItemProps) {
  return (
    <PageWrapper
      title='Item Details'
      description='View the comprehensive details of this item.'
      actions={
        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/master-data/items`}>
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
                <Link href={`/dashboard/master-data/items/${item.ItemCode}`}>
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
              {getInitials(item.ItemName)}
            </div>

            <div className='flex flex-col gap-y-2 md:gap-0'>
              <h1 className='mb-0 text-sm font-semibold'>{item.ItemName}</h1>

              <div className='flex flex-wrap items-center gap-2'>
                <p className='text-sm text-muted-foreground'>{item.ItemCode}</p>
                {item?.ItmsGrpNam && <Badge variant='soft-blue'>{item?.ItmsGrpNam}</Badge>}
                {item?.source === "portal" ? <Badge variant='soft-amber'>Portal</Badge> : <Badge variant='soft-green'>SAP</Badge>}
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue='1' className='w-full'>
          <TabsList className='mb-2 h-fit flex-wrap'>
            <TabsTrigger value='1'>Summary</TabsTrigger>
            <TabsTrigger value='2'>Requisitions</TabsTrigger>
            <TabsTrigger value='3'>Quotations</TabsTrigger>
          </TabsList>

          <TabsContent value='1'>
            <ItemSummaryTab item={item} />
          </TabsContent>

          <TabsContent value='2'>
            <Card className='rounded-lg p-6 shadow-md'>
              <div className='grid grid-cols-12 gap-5'>
                <UnderDevelopment className='col-span-12 h-[40vh]' />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value='3'>
            <Card className='rounded-lg p-6 shadow-md'>
              <div className='grid grid-cols-12 gap-5'>
                <UnderDevelopment className='col-span-12 h-[40vh]' />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
