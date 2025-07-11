"use client"

import Link from "next/link"

import { getLeadById, getLeads, updateLeadStatus } from "@/actions/lead"
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import PageWrapper from "@/app/(protected)/_components/page-wrapper"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { LEAD_STATUSES_COLORS, LEAD_STATUSES_OPTIONS } from "@/schema/lead"
import { cn, getInitials } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LeadStatusHeader from "../../../_components/lead-status-header"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "nextjs-toploader/app"
import LeadSummaryTab from "./tabs/lead-summary-tab"
import LeadAccountTab from "./tabs/lead-account-tab"
import LeadContactsTab from "./tabs/lead-contacts-tab"
import { getAccounts } from "@/actions/account"
import LeadActivitiesTab from "./tabs/lead-activities-tab"

type ViewLeadProps = {
  lead: NonNullable<Awaited<ReturnType<typeof getLeadById>>>
  accounts: Awaited<ReturnType<typeof getAccounts>>
  leads: Awaited<ReturnType<typeof getLeads>>
}

export default function ViewLead({ lead, accounts, leads }: ViewLeadProps) {
  const router = useRouter()

  const { executeAsync, isExecuting } = useAction(updateLeadStatus)
  const [statusIsLoading, setStatusIsLoading] = useState(false)

  const leadStatus = lead.status
  const isLoading = isExecuting || statusIsLoading

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setStatusIsLoading(true)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const response = await executeAsync({ id, status })
      const result = response?.data

      if (result?.error) {
        toast.error(result.message)
        return
      }

      setStatusIsLoading(false)
      toast.success(result?.message)

      if (result?.data && result?.data?.lead && "id" in result?.data?.lead) {
        setTimeout(() => {
          router.refresh()
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      setStatusIsLoading(false)
      toast.error("Something went wrong! Please try again later.")
    }
  }

  const getStatusBadge = (status: string) => {
    const label = LEAD_STATUSES_OPTIONS.find((item) => item.value === status)?.label ?? "New Lead"
    const color = LEAD_STATUSES_COLORS.find((item) => item.value === status)?.color ?? "slate"

    const STATUS_CLASSES: Record<string, string> = {
      slate: "bg-slate-50 text-slate-600 ring-slate-500/10",
      purple: "bg-purple-50 text-purple-600 ring-purple-500/10",
      amber: "bg-amber-50 text-amber-600 ring-amber-500/10",
      sky: "bg-sky-50 text-sky-600 ring-sky-500/10",
      green: "bg-green-50 text-green-600 ring-green-500/10",
      red: "bg-red-50 text-red-600 ring-red-500/10",
    }

    return (
      <div>
        <span className={cn(`inline-flex items-center rounded-md px-2 py-1 text-center text-xs font-medium ring-1`, STATUS_CLASSES[color])}>
          {label}
        </span>
      </div>
    )
  }

  return (
    <PageWrapper
      title='Lead Details'
      description='View the comprehensive details of this lead.'
      actions={
        <div className='flex items-center gap-2'>
          <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/leads`}>
            Back
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='default' size='icon'>
                <Icons.moreVertical className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem asChild disabled={isLoading}>
                <Link href={`/dashboard/crm/leads/${lead.id}`}>
                  {isLoading ? <Icons.spinner className='mr-2 size-4 animate-spin' /> : <Icons.pencil className='mr-2 size-4' />} Edit
                </Link>
              </DropdownMenuItem>

              {leadStatus === "qualified" || leadStatus === "unqualified" ? (
                <DropdownMenuItem disabled={isLoading} onClick={() => handleUpdateStatus(lead.id, "new-lead")}>
                  {isLoading ? <Icons.spinner className='mr-2 size-4 animate-spin' /> : <Icons.refreshCw className='mr-2 size-4' />} Reopen
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem disabled={isLoading} onClick={() => handleUpdateStatus(lead.id, "qualified")}>
                    {isLoading ? <Icons.spinner className='mr-2 size-4 animate-spin' /> : <Icons.thumbsUp className='mr-2 size-4' />}{" "}
                    Qualified
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={isLoading} onClick={() => handleUpdateStatus(lead.id, "unqualified")}>
                    {isLoading ? <Icons.spinner className='mr-2 size-4 animate-spin' /> : <Icons.thumbsDown className='mr-2 size-4' />}{" "}
                    Unqualified
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className='flex flex-col gap-4'>
        <Card className='rounded-lg p-6 shadow-md'>
          <LeadStatusHeader lead={lead} leadStatus={leadStatus} isLoading={isLoading} handleUpdateStatus={handleUpdateStatus} />
        </Card>

        <Card className='flex items-center rounded-lg p-6 shadow-md'>
          <div className='flex w-full items-center gap-3'>
            <div className='flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-muted font-bold'>
              {getInitials(lead.name)}
            </div>

            <div className='flex flex-col gap-y-2 md:gap-0'>
              <h1 className='mb-0 text-sm font-semibold'>{lead.name}</h1>

              <div className='flex w-fit flex-wrap items-center gap-2'>
                <div className='flex items-center gap-1'>
                  <Icons.mail className='size-4 text-muted-foreground/75' />
                  <Link href={`mailto:${lead.email}`} className='text-sm text-muted-foreground/75 decoration-1 hover:underline'>
                    {lead.email}
                  </Link>
                </div>

                <div className='flex items-center gap-1'>
                  <Icons.phone className='size-4 text-muted-foreground/75' />
                  <Link href={`tel:${lead.email}`} className='text-sm text-muted-foreground/75 decoration-1 hover:underline'>
                    {lead.phone}
                  </Link>
                </div>

                {lead.title && (
                  <span className='inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-center text-xs font-medium text-slate-600 ring-1 ring-slate-500/10'>
                    {lead.title}
                  </span>
                )}

                {getStatusBadge(lead.status)}
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue='1' className='w-full'>
          <TabsList className='mb-2 h-fit flex-wrap'>
            <TabsTrigger value='1'>Summary</TabsTrigger>
            <TabsTrigger value='2'>Account</TabsTrigger>
            <TabsTrigger value='3'>Contacts</TabsTrigger>
            <TabsTrigger value='4'>Activities</TabsTrigger>
            <TabsTrigger value='5'>Quotes</TabsTrigger>
          </TabsList>

          <TabsContent value='1'>
            <LeadSummaryTab lead={lead} />
          </TabsContent>

          <TabsContent value='2'>
            <LeadAccountTab lead={lead} />
          </TabsContent>

          <TabsContent value='3'>
            <LeadContactsTab lead={lead} leads={leads} accounts={accounts} />
          </TabsContent>

          <TabsContent value='4'>
            <LeadActivitiesTab lead={lead} />
          </TabsContent>

          <TabsContent value='5'></TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
