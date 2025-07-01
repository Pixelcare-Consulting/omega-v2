"use client"

import Link from "next/link"

import { deleteLeadAccount, getLeadById } from "@/actions/lead"
import { Icons } from "@/components/icons"
import ReadOnlyField from "@/components/read-only-field"
import ReadOnlyFieldHeader from "@/components/read-only-field-header"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { INDUSTRY_OPTIONS } from "@/schema/account"
import { useRouter } from "nextjs-toploader/app"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import AlertModal from "@/components/alert-modal"
import LoadingButton from "@/components/loading-button"

type LeadAccountTabProps = {
  lead: NonNullable<Awaited<ReturnType<typeof getLeadById>>>
}

export default function LeadAccountTab({ lead }: LeadAccountTabProps) {
  const router = useRouter()
  const account = lead.account

  const { executeAsync, isExecuting } = useAction(deleteLeadAccount)
  const [showConfirmation, setShowConfirmation] = useState(false)

  async function handleRemoveAccount({ leadId, accountId }: { leadId: string; accountId: string }) {
    setShowConfirmation(false)

    toast.promise(executeAsync({ leadId, accountId }), {
      loading: "Removing account...",
      success: (response) => {
        const result = response?.data

        if (!response || !result) throw { message: "Failed to remove account!", unExpectedError: true }

        if (!result.error) {
          setTimeout(() => {
            router.refresh()
          }, 1500)

          return result.message
        }

        throw { message: result.message, expectedError: true }
      },
      error: (err: Error & { expectedError: boolean }) => {
        return err?.expectedError ? err.message : "Something went wrong! Please try again later."
      },
    })
  }

  if (!account)
    return (
      <Card className='flex h-[400px] flex-col items-center justify-center gap-1 rounded-lg p-6 shadow-md'>
        <Icons.triangleAlert className='size-10' />

        <div className='flex flex-col items-center justify-center'>
          <h2 className='mb-0 text-center font-bold'>No Account Associated</h2>
          <p className='text-center text-sm text-muted-foreground'>This lead is not associated with any account.</p>
        </div>
      </Card>
    )

  const STATUS_CLASSES: Record<string, string> = {
    green: "bg-green-50 text-green-600 ring-green-500/10",
    red: "bg-red-50 text-red-600 ring-red-500/10",
  }

  return (
    <Card className='rounded-lg p-6 shadow-md'>
      <div className='grid grid-cols-12 gap-5'>
        <ReadOnlyFieldHeader
          className='col-span-12'
          title='Summary'
          description='Account summary details'
          actions={
            <div className='flex items-center gap-2'>
              <Link className={buttonVariants({ variant: "outline-primary" })} href={`/dashboard/crm/accounts/${account.id}/view`}>
                <Icons.eye className='size-4' /> Full Details
              </Link>

              {lead.accountId && (
                <LoadingButton isLoading={isExecuting} loadingText='Removing account' onClick={() => setShowConfirmation(true)}>
                  <Icons.trash className='mr-2 size-4' /> Remove Account
                </LoadingButton>
              )}
            </div>
          }
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Name' value={account?.name || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Email' value={account?.email || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Phone' value={account?.phone || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Status'
          value={
            <span
              className={cn(
                `inline-flex w-fit items-center rounded-md px-2 py-1 text-center text-xs font-medium ring-1`,
                account.isActive ? STATUS_CLASSES["green"] : STATUS_CLASSES["red"]
              )}
            >
              {account.isActive ? "Active" : "Inactive"}
            </span>
          }
        />

        <ReadOnlyField className='col-span-12 lg:col-span-6' title='Website' value={account?.website || ""} />

        <ReadOnlyField
          className='col-span-12 lg:col-span-6'
          title='Industry'
          value={
            <div className='flex flex-wrap items-center gap-1.5'>
              {account.industry.map((ind, i) => (
                <span
                  key={i}
                  className='inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-center text-xs font-medium text-red-600 ring-1 ring-red-500/10'
                >
                  {INDUSTRY_OPTIONS.find((item) => item.value === ind)?.label || ""}
                </span>
              ))}
            </div>
          }
        />

        <ReadOnlyFieldHeader className='col-span-12' title='Address' description='Account full address details' />

        <ReadOnlyField className='col-span-12' title='Street' value={account?.street || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Street No.' value={account?.streetNo || ""} />

        <ReadOnlyField
          className='col-span-12 md:col-span-6 lg:col-span-3'
          title='Building/Floor/Room'
          value={account?.buildingFloorRoom || ""}
        />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Block' value={account?.block || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='City' value={account?.city || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Zip Code' value={account?.zipCode || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='County' value={account?.county || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='State' value={account?.state || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='Country' value={account?.country || ""} />

        <ReadOnlyField className='col-span-12 md:col-span-6 lg:col-span-3' title='GLN' value={account?.gln || ""} />

        {lead.accountId && lead.account && (
          <AlertModal
            isOpen={showConfirmation}
            title='Are you sure?'
            description={`Are you sure you want to remove this account named "${lead.account.name}" from this lead?`}
            onConfirm={() => handleRemoveAccount({ accountId: lead.accountId!, leadId: lead.id })}
            onConfirmText='Remove'
            onCancel={() => setShowConfirmation(false)}
          />
        )}
      </div>
    </Card>
  )
}
