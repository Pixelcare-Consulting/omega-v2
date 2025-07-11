import Link from "next/link"

import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { Button, buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"
import { cn, getInitials } from "@/lib/utils"
import { getContactById } from "@/actions/contacts"
import ContactSummaryTab from "./tabs/contact-summary-tab"
import ContactAccountsTab from "./tabs/contact-accounts-tab"
import ContactLeadsTab from "./tabs/contact-leads-tab"

type ViewContactProps = {
  contact: NonNullable<Awaited<ReturnType<typeof getContactById>>>
}

export default function ViewContact({ contact }: ViewContactProps) {
  const STATUS_CLASSES: Record<string, string> = {
    green: "bg-green-50 text-green-600 ring-green-500/10",
    red: "bg-red-50 text-red-600 ring-red-500/10",
  }

  return (
    <PageWrapper
      title='Contact Details'
      description='View the comprehensive details of this contact.'
      actions={
        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/contacts`}>
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
                <Link href={`/dashboard/crm/contacts/${contact.id}`}>
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
              {getInitials(contact.name)}
            </div>

            <div className='flex flex-col gap-y-2 md:gap-0'>
              <h1 className='mb-0 text-sm font-semibold'>{contact.name}</h1>

              <div className='flex flex-wrap items-center gap-2'>
                <div className='flex items-center gap-1'>
                  <Icons.mail className='size-4 text-muted-foreground/75' />
                  <Link href={`mailto:${contact.email}`} className='text-sm text-muted-foreground/75 decoration-1 hover:underline'>
                    {contact.email}
                  </Link>
                </div>

                <div className='flex items-center gap-1'>
                  <Icons.phone className='size-4 text-muted-foreground/75' />
                  <Link href={`tel:${contact.email}`} className='text-sm text-muted-foreground/75 decoration-1 hover:underline'>
                    {contact.phone}
                  </Link>
                </div>

                <span
                  className={cn(
                    `inline-flex items-center rounded-md px-2 py-1 text-center text-xs font-medium ring-1`,
                    contact.isActive ? STATUS_CLASSES["green"] : STATUS_CLASSES["red"]
                  )}
                >
                  {contact.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue='1' className='w-full'>
          <TabsList className='mb-2 h-fit flex-wrap'>
            <TabsTrigger value='1'>Summary</TabsTrigger>
            <TabsTrigger value='2'>Accounts</TabsTrigger>
            <TabsTrigger value='3'>Leads</TabsTrigger>
          </TabsList>

          <TabsContent value='1'>
            <ContactSummaryTab contact={contact} />
          </TabsContent>

          <TabsContent value='2'>
            <ContactAccountsTab contact={contact} />
          </TabsContent>

          <TabsContent value='3'>
            <ContactLeadsTab contact={contact} />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
